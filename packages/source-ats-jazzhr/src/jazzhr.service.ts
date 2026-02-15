// WIP: This source may need selector updates after live testing.
// JazzHR career pages use different themes so selectors may vary per company.
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  Site,
} from '@ever-jobs/models';
import { createHttpClient } from '@ever-jobs/common';
import { JAZZHR_HEADERS } from './jazzhr.constants';

@Injectable()
export class JazzHRService implements IScraper {
  private readonly logger = new Logger(JazzHRService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for JazzHR scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(JAZZHR_HEADERS);

    const url = `https://${encodeURIComponent(companySlug)}.applytojob.com/apply/jobs/`;

    try {
      this.logger.log(`Fetching JazzHR career page for company: ${companySlug}`);
      const response = await client.get<string>(url);
      const html = response.data;

      if (!html) {
        this.logger.warn(`JazzHR: empty response for ${companySlug}`);
        return new JobResponseDto([]);
      }

      const jobs = this.parseHtml(html, companySlug);

      if (jobs.length === 0) {
        // TODO: Validate selectors against live JazzHR career pages
        this.logger.warn(
          `JazzHR: zero jobs extracted for ${companySlug} — selectors may need updating`,
        );
      }

      this.logger.log(`JazzHR: found ${jobs.length} jobs for ${companySlug}`);

      const resultsWanted = input.resultsWanted ?? 100;
      return new JobResponseDto(jobs.slice(0, resultsWanted));
    } catch (err: any) {
      this.logger.error(`JazzHR scrape error for ${companySlug}: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private parseHtml(html: string, companySlug: string): JobPostDto[] {
    const $ = cheerio.load(html);
    const jobs: JobPostDto[] = [];

    // TODO: Validate selectors against live site — JazzHR themes vary
    // Common patterns: <a> links inside job listing containers
    // Selector strategy: try multiple known JazzHR DOM structures
    const selectors = [
      'li.list-group-item a[href*="/apply/"]',
      'div.job-listing a[href*="/apply/"]',
      'a.job-title[href*="/apply/"]',
      '.resumator-jobs-list a[href*="/apply/"]',
      'table.resumator-jobs-table tr a',
    ];

    let links: cheerio.Cheerio<any> | null = null;
    for (const sel of selectors) {
      const found = $(sel);
      if (found.length > 0) {
        links = found;
        break;
      }
    }

    // Fallback: find any link that looks like a JazzHR job link
    if (!links || links.length === 0) {
      links = $('a[href*="/apply/"]').filter((_, el) => {
        const href = $(el).attr('href') ?? '';
        return href.includes('/apply/') && !href.endsWith('/apply/jobs/');
      });
    }

    if (!links || links.length === 0) {
      return [];
    }

    links.each((_, el) => {
      try {
        const a = $(el);
        const title = a.text().trim();
        if (!title) return;

        let href = a.attr('href') ?? '';
        if (!href) return;

        // Make URL absolute if relative
        if (href.startsWith('/')) {
          href = `https://${encodeURIComponent(companySlug)}.applytojob.com${href}`;
        }

        // Try to extract location from sibling/parent elements
        const parent = a.closest('li, tr, div.job-listing');
        const locationText = parent.find('.location, .job-location, td:nth-child(2)').text().trim() || null;
        const deptText = parent.find('.department, .job-department, td:nth-child(3)').text().trim() || null;

        const jobId = `jazzhr-${Math.abs(this.hashCode(href))}`;

        jobs.push(new JobPostDto({
          id: jobId,
          title,
          companyName: companySlug,
          jobUrl: href,
          location: locationText ? new LocationDto({ city: locationText }) : null,
          site: Site.JAZZHR,
          atsId: jobId,
          atsType: 'jazzhr',
          department: deptText,
        }));
      } catch (err: any) {
        this.logger.debug(`JazzHR: failed to parse job card: ${err.message}`);
      }
    });

    return jobs;
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
