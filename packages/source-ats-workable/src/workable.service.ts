import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  Site,
  DescriptionFormat,
  getJobTypeFromString,
} from '@ever-jobs/models';
import { createHttpClient, extractEmails } from '@ever-jobs/common';
import { WORKABLE_API_URL, WORKABLE_HEADERS } from './workable.constants';
import { WorkableJob, WorkableResponse } from './workable.types';

@Injectable()
export class WorkableService implements IScraper {
  private readonly logger = new Logger(WorkableService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for Workable scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(WORKABLE_HEADERS);

    const url = `${WORKABLE_API_URL}/${encodeURIComponent(companySlug)}`;

    try {
      this.logger.log(`Fetching Workable jobs for company: ${companySlug}`);
      const response = await client.get(url);
      const data: WorkableResponse = response.data ?? { jobs: [] };
      const jobs = data.jobs ?? [];

      this.logger.log(`Workable: found ${jobs.length} raw jobs for ${companySlug}`);

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
          this.logger.warn(`Error processing Workable job ${job.shortcode}: ${err.message}`);
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`Workable scrape error for ${companySlug}: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private processJob(
    job: WorkableJob,
    companySlug: string,
    _format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.title;
    if (!title) return null;

    // Location
    const primaryLoc = job.locations?.[0];
    const location = new LocationDto({
      city: primaryLoc?.city ?? job.city ?? null,
      state: primaryLoc?.region ?? job.state ?? null,
      country: primaryLoc?.country ?? job.country ?? null,
    });

    // Remote detection
    const isRemote = job.telecommuting ?? false;

    // Job type
    const jobType = job.employment_type
      ? (() => {
          const mapped = getJobTypeFromString(job.employment_type!);
          return mapped ? [mapped] : null;
        })()
      : null;

    // Date
    const datePosted = job.published_on ?? job.created_at ?? null;

    return new JobPostDto({
      id: `workable-${job.shortcode}`,
      title,
      companyName: companySlug,
      jobUrl: job.url ?? job.shortlink ?? `https://apply.workable.com/${companySlug}/j/${job.shortcode}`,
      location,
      datePosted: datePosted
        ? new Date(datePosted).toISOString().split('T')[0]
        : null,
      isRemote,
      jobType,
      site: Site.WORKABLE,
      // ATS-specific fields
      atsId: job.shortcode ?? null,
      atsType: 'workable',
      department: job.department ?? null,
      employmentType: job.employment_type ?? null,
      applyUrl: job.application_url ?? null,
    });
  }
}
