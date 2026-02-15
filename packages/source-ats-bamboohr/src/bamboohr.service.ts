import { Injectable, Logger } from '@nestjs/common';
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
import { BAMBOOHR_HEADERS } from './bamboohr.constants';
import { BambooHRResponse, BambooHRJob } from './bamboohr.types';

@Injectable()
export class BambooHRService implements IScraper {
  private readonly logger = new Logger(BambooHRService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for BambooHR scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(BAMBOOHR_HEADERS);

    const url = `https://${encodeURIComponent(companySlug)}.bamboohr.com/careers/list`;

    try {
      this.logger.log(`Fetching BambooHR jobs for company: ${companySlug}`);
      const response = await client.get(url);
      const data: BambooHRResponse = response.data ?? { result: [] };
      const jobs = data.result ?? [];

      this.logger.log(`BambooHR: found ${jobs.length} raw jobs for ${companySlug}`);

      const resultsWanted = input.resultsWanted ?? 100;
      const jobPosts: JobPostDto[] = [];

      for (const job of jobs) {
        if (jobPosts.length >= resultsWanted) break;

        try {
          const post = this.mapJob(job, companySlug, input.descriptionFormat);
          if (post) {
            jobPosts.push(post);
          }
        } catch (err: any) {
          this.logger.warn(`Error processing BambooHR job ${job.id}: ${err.message}`);
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`BambooHR scrape error for ${companySlug}: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private mapJob(
    job: BambooHRJob,
    companySlug: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.jobOpeningName;
    if (!title) return null;

    // Description is HTML
    let description: string | null = null;
    if (job.description) {
      if (format === DescriptionFormat.HTML) {
        description = job.description;
      } else if (format === DescriptionFormat.MARKDOWN) {
        description = markdownConverter(job.description) ?? job.description;
      } else {
        description = htmlToPlainText(job.description);
      }
    }

    // Location
    const location = new LocationDto({
      city: job.location?.city ?? null,
      state: job.location?.state ?? null,
      country: job.location?.country ?? null,
    });

    // Job URL
    const jobUrl = `https://${encodeURIComponent(companySlug)}.bamboohr.com/careers/${job.id}`;

    return new JobPostDto({
      id: `bamboohr-${job.id}`,
      title,
      companyName: companySlug,
      jobUrl,
      location,
      description,
      isRemote: false,
      emails: extractEmails(description),
      site: Site.BAMBOOHR,
      atsId: String(job.id),
      atsType: 'bamboohr',
      department: job.departmentLabel ?? null,
    });
  }
}
