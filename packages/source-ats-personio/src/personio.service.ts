import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  Site,
  DescriptionFormat,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
} from '@ever-jobs/common';
import {
  PERSONIO_XML_URL_DE,
  PERSONIO_XML_URL_COM,
  PERSONIO_JOB_URL_DE,
  PERSONIO_HEADERS,
} from './personio.constants';
import { PersonioPosition, PersonioDescription } from './personio.types';

@Injectable()
export class PersonioService implements IScraper {
  private readonly logger = new Logger(PersonioService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for Personio scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(PERSONIO_HEADERS);

    // Try .de domain first, then .com fallback
    const urlDe = PERSONIO_XML_URL_DE.replace('{slug}', encodeURIComponent(companySlug))
      + '?language=en';
    const urlCom = PERSONIO_XML_URL_COM.replace('{slug}', encodeURIComponent(companySlug))
      + '?language=en';

    let xmlData: string | null = null;
    let usedDomain: 'de' | 'com' = 'de';

    try {
      this.logger.log(`Fetching Personio XML feed (.de) for: ${companySlug}`);
      const response = await client.get<string>(urlDe);
      xmlData = response.data;
    } catch {
      this.logger.log(`Personio .de failed, trying .com for: ${companySlug}`);
      try {
        const response = await client.get<string>(urlCom);
        xmlData = response.data;
        usedDomain = 'com';
      } catch (err: any) {
        this.logger.error(`Personio scrape error for ${companySlug}: ${err.message}`);
        return new JobResponseDto([]);
      }
    }

    if (!xmlData) {
      return new JobResponseDto([]);
    }

    try {
      const positions = this.parseXml(xmlData);
      this.logger.log(`Personio: found ${positions.length} positions for ${companySlug}`);

      const resultsWanted = input.resultsWanted ?? 100;
      const jobPosts: JobPostDto[] = [];

      for (const pos of positions) {
        if (jobPosts.length >= resultsWanted) break;

        try {
          const post = this.mapPosition(pos, companySlug, usedDomain, input.descriptionFormat);
          if (post) {
            jobPosts.push(post);
          }
        } catch (err: any) {
          this.logger.warn(`Error processing Personio position ${pos.id}: ${err.message}`);
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`Personio XML parse error for ${companySlug}: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private parseXml(xml: string): PersonioPosition[] {
    const $ = cheerio.load(xml, { xmlMode: true });
    const positions: PersonioPosition[] = [];

    $('position').each((_, el) => {
      const pos = $(el);
      const descriptions: PersonioDescription[] = [];

      pos.find('jobDescriptions jobDescription').each((__, descEl) => {
        const d = $(descEl);
        descriptions.push({
          name: d.find('name').text().trim(),
          value: d.find('value').text().trim(),
        });
      });

      positions.push({
        id: pos.find('id').first().text().trim(),
        name: pos.find('name').first().text().trim(),
        office: pos.find('office').text().trim() || null,
        department: pos.find('department').text().trim() || null,
        recruitingCategory: pos.find('recruitingCategory').text().trim() || null,
        employmentType: pos.find('employmentType').text().trim() || null,
        seniority: pos.find('seniority').text().trim() || null,
        schedule: pos.find('schedule').text().trim() || null,
        keywords: pos.find('keywords').text().trim() || null,
        createdAt: pos.find('createdAt').text().trim() || null,
        descriptions,
      });
    });

    return positions;
  }

  private mapPosition(
    pos: PersonioPosition,
    companySlug: string,
    domain: 'de' | 'com',
    format?: DescriptionFormat,
  ): JobPostDto | null {
    if (!pos.name || !pos.id) return null;

    // Combine all description sections
    const rawHtml = pos.descriptions
      .map((d) => d.value)
      .filter(Boolean)
      .join('\n');

    let description: string | null = null;
    if (rawHtml) {
      if (format === DescriptionFormat.HTML) {
        description = rawHtml;
      } else if (format === DescriptionFormat.MARKDOWN) {
        description = markdownConverter(rawHtml) ?? rawHtml;
      } else {
        description = htmlToPlainText(rawHtml);
      }
    }

    const location = new LocationDto({
      city: pos.office,
    });

    const tld = domain === 'de' ? 'de' : 'com';
    const jobUrl = `https://${encodeURIComponent(companySlug)}.jobs.personio.${tld}/job/${pos.id}`;

    const datePosted = pos.createdAt
      ? new Date(pos.createdAt).toISOString().split('T')[0]
      : null;

    const skills = pos.keywords
      ? pos.keywords.split(',').map((s) => s.trim()).filter(Boolean)
      : null;

    return new JobPostDto({
      id: `personio-${pos.id}`,
      title: pos.name,
      companyName: companySlug,
      jobUrl,
      location,
      description,
      datePosted,
      isRemote: false,
      emails: extractEmails(description),
      site: Site.PERSONIO,
      atsId: pos.id,
      atsType: 'personio',
      department: pos.department,
      skills,
    });
  }
}
