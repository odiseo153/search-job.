// WIP: This source may need selector updates after live testing.
// Dice is a React SPA — cheerio may fail and Playwright is the primary fallback.
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  Site,
} from '@ever-jobs/models';
import {
  createHttpClient,
  randomSleep,
  extractSalary,
  extractEmails,
} from '@ever-jobs/common';
import { BrowserPool } from '@ever-jobs/common';
import {
  DICE_SEARCH_URL,
  DICE_HEADERS,
  DICE_DELAY_MIN,
  DICE_DELAY_MAX,
  DICE_PAGE_SIZE,
} from './dice.constants';

@Injectable()
export class DiceService implements IScraper, OnModuleDestroy {
  private readonly logger = new Logger(DiceService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const resultsWanted = input.resultsWanted ?? 15;

    // Try cheerio-based scraping first
    const cheerioJobs = await this.scrapeWithCheerio(input, resultsWanted);
    if (cheerioJobs.length > 0) {
      return new JobResponseDto(cheerioJobs);
    }

    // Fallback to Playwright if cheerio returned nothing
    this.logger.log('Dice: cheerio returned zero results, falling back to Playwright');
    const playwrightJobs = await this.scrapeWithPlaywright(input, resultsWanted);
    return new JobResponseDto(playwrightJobs);
  }

  private async scrapeWithCheerio(
    input: ScraperInputDto,
    resultsWanted: number,
  ): Promise<JobPostDto[]> {
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(DICE_HEADERS);

    const allJobs: JobPostDto[] = [];
    let page = 1;
    const maxPages = Math.ceil(resultsWanted / DICE_PAGE_SIZE) + 1;

    while (allJobs.length < resultsWanted && page <= maxPages) {
      try {
        const url = new URL(DICE_SEARCH_URL);
        if (input.searchTerm) url.searchParams.set('q', input.searchTerm);
        if (input.location) url.searchParams.set('location', input.location);
        url.searchParams.set('page', String(page));
        url.searchParams.set('pageSize', String(DICE_PAGE_SIZE));
        url.searchParams.set('countryCode', 'US');
        url.searchParams.set('language', 'en');

        this.logger.log(`Fetching Dice search page ${page}`);
        const response = await client.get<string>(url.toString());
        const html = response.data;

        const jobs = this.parseHtml(html);
        if (jobs.length === 0) break;

        allJobs.push(...jobs);
        page++;

        if (page <= maxPages && allJobs.length < resultsWanted) {
          await randomSleep(DICE_DELAY_MIN, DICE_DELAY_MAX);
        }
      } catch (err: any) {
        this.logger.error(`Dice cheerio scrape error page ${page}: ${err.message}`);
        break;
      }
    }

    return allJobs.slice(0, resultsWanted);
  }

  private async scrapeWithPlaywright(
    input: ScraperInputDto,
    resultsWanted: number,
  ): Promise<JobPostDto[]> {
    const proxy = input.proxies?.[0] ?? undefined;
    let page;

    try {
      page = await BrowserPool.getPage({ proxy });
      const timeoutMs = (input.requestTimeout ?? 30) * 1000;

      const url = new URL(DICE_SEARCH_URL);
      if (input.searchTerm) url.searchParams.set('q', input.searchTerm);
      if (input.location) url.searchParams.set('location', input.location);
      url.searchParams.set('countryCode', 'US');
      url.searchParams.set('language', 'en');

      this.logger.log(`Dice Playwright: navigating to ${url.toString()}`);
      await page.goto(url.toString(), {
        waitUntil: 'domcontentloaded',
        timeout: timeoutMs,
      });

      // Wait for JS hydration
      await this.delay(5000);

      const html = await page.content();
      const jobs = this.parseHtml(html);

      if (jobs.length === 0) {
        // TODO: Validate selectors against live Dice rendered DOM
        this.logger.warn('Dice Playwright: zero jobs extracted — selectors may need updating');
      }

      this.logger.log(`Dice Playwright: extracted ${jobs.length} jobs`);
      return jobs.slice(0, resultsWanted);
    } catch (err: any) {
      this.logger.error(`Dice Playwright scrape failed: ${err.message}`);
      return [];
    } finally {
      if (page) {
        const context = page.context();
        await page.close().catch(() => {});
        await context.close().catch(() => {});
      }
    }
  }

  private parseHtml(html: string): JobPostDto[] {
    const $ = cheerio.load(html);
    const jobs: JobPostDto[] = [];

    // TODO: Validate selectors against live Dice pages
    // Dice job cards are typically rendered with data attributes or search card classes
    const selectors = [
      '[data-cy="search-card"]',
      'dhi-search-card',
      '.search-card',
      'a[data-id]',
    ];

    let cards: cheerio.Cheerio<any> | null = null;
    for (const sel of selectors) {
      const found = $(sel);
      if (found.length > 0) {
        cards = found;
        break;
      }
    }

    if (!cards || cards.length === 0) {
      return [];
    }

    cards.each((_, el) => {
      try {
        const card = $(el);

        // Extract title from link or heading
        const titleEl = card.find('a.card-title-link, h5 a, [data-cy="card-title"]').first();
        const title = titleEl.text().trim() ||
          card.find('a').first().text().trim();
        if (!title) return;

        // Extract URL
        let href = titleEl.attr('href') ?? card.find('a').first().attr('href') ?? '';
        if (href && !href.startsWith('http')) {
          href = `https://www.dice.com${href}`;
        }
        if (!href) return;

        // Extract company
        const company = card.find('[data-cy="search-result-company-name"], .card-company').text().trim() || null;

        // Extract location
        const location = card.find('[data-cy="search-result-location"], .card-location').text().trim() || null;

        // Extract salary
        const salaryText = card.find('[data-cy="search-result-salary"], .card-salary').text().trim() || null;
        let compensation = null;
        if (salaryText) {
          const parsed = extractSalary(salaryText);
          if (parsed.minAmount != null) {
            compensation = {
              interval: parsed.interval,
              minAmount: parsed.minAmount,
              maxAmount: parsed.maxAmount,
              currency: parsed.currency ?? 'USD',
            };
          }
        }

        // Extract posted date
        const dateText = card.find('[data-cy="card-posted-date"], .card-posted-date').text().trim() || null;

        // Generate unique ID from URL
        const idMatch = href.match(/\/job-detail\/([^/?]+)/);
        const id = idMatch ? `dice-${idMatch[1]}` : `dice-${Math.abs(this.hashCode(href))}`;

        jobs.push(new JobPostDto({
          id,
          title,
          companyName: company,
          jobUrl: href,
          location: location ? new LocationDto({ city: location }) : null,
          compensation: compensation as any,
          datePosted: dateText,
          emails: null,
          site: Site.DICE,
        }));
      } catch (err: any) {
        // Skip individual card parse errors
      }
    });

    return jobs;
  }

  async onModuleDestroy(): Promise<void> {
    await BrowserPool.close();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  }
}
