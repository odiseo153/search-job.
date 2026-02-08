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
  extractEmails,
} from '@ever-jobs/common';
import { GREENHOUSE_API_URL, GREENHOUSE_HEADERS } from './greenhouse.constants';
import { GreenhouseJob, GreenhouseResponse } from './greenhouse.types';

@Injectable()
export class GreenhouseService implements IScraper {
  private readonly logger = new Logger(GreenhouseService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for Greenhouse scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(GREENHOUSE_HEADERS);

    const url = `${GREENHOUSE_API_URL}/${encodeURIComponent(companySlug)}/jobs?content=true`;

    try {
      this.logger.log(`Fetching Greenhouse jobs for company: ${companySlug}`);
      const response = await client.get(url);
      const data: GreenhouseResponse = response.data ?? { jobs: [] };
      const jobs = data.jobs ?? [];

      this.logger.log(`Greenhouse: found ${jobs.length} raw jobs for ${companySlug}`);

      const resultsWanted = input.resultsWanted ?? 100;
      const jobPosts: JobPostDto[] = [];

      for (const job of jobs) {
        if (jobPosts.length >= resultsWanted) break;

        try {
          const post = this.processJob(job, companySlug, input.descriptionFormat);
          if (post) {
            jobPosts.push(post);
          }
        } catch (err: any) {
          this.logger.warn(`Error processing Greenhouse job ${job.id}: ${err.message}`);
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`Greenhouse scrape error for ${companySlug}: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private processJob(
    job: GreenhouseJob,
    companySlug: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.title;
    if (!title) return null;

    // Description is HTML content
    let description: string | null = null;
    if (job.content) {
      if (format === DescriptionFormat.HTML) {
        description = job.content;
      } else {
        description = htmlToPlainText(job.content);
      }
    }

    // Location from location object or offices
    const locationName = job.location?.name ?? null;
    const officeName = job.offices?.[0]?.name ?? null;
    const locationStr = locationName ?? officeName;
    const location = locationStr
      ? new LocationDto({ city: locationStr })
      : null;

    // Remote detection
    const isRemote =
      locationStr?.toLowerCase().includes('remote') ?? false;

    // Department
    const department = job.departments?.[0]?.name ?? null;

    // Date posted
    const datePosted = job.first_published ?? job.updated_at ?? null;

    return new JobPostDto({
      id: `gh-${job.id}`,
      title,
      companyName: job.company_name ?? companySlug,
      jobUrl: job.absolute_url ?? `https://boards.greenhouse.io/${companySlug}/jobs/${job.id}`,
      location,
      description,
      datePosted: datePosted
        ? new Date(datePosted).toISOString().split('T')[0]
        : null,
      isRemote,
      emails: extractEmails(description),
      site: Site.GREENHOUSE,
      // ATS-specific fields
      atsId: job.id?.toString() ?? null,
      atsType: 'greenhouse',
      department,
    });
  }
}
