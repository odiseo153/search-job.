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
import { createHttpClient, randomSleep } from '@ever-jobs/common';
import {
  SMARTRECRUITERS_API_URL,
  SMARTRECRUITERS_HEADERS,
  SMARTRECRUITERS_PAGE_SIZE,
} from './smartrecruiters.constants';
import { SmartRecruitersJob, SmartRecruitersResponse } from './smartrecruiters.types';

@Injectable()
export class SmartRecruitersService implements IScraper {
  private readonly logger = new Logger(SmartRecruitersService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for SmartRecruiters scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(SMARTRECRUITERS_HEADERS);

    const resultsWanted = input.resultsWanted ?? 100;
    const jobPosts: JobPostDto[] = [];
    let offset = 0;

    try {
      this.logger.log(`Fetching SmartRecruiters jobs for company: ${companySlug}`);

      while (jobPosts.length < resultsWanted) {
        const url =
          `${SMARTRECRUITERS_API_URL}/${encodeURIComponent(companySlug)}/postings` +
          `?offset=${offset}&limit=${SMARTRECRUITERS_PAGE_SIZE}`;

        const response = await client.get(url);
        const data: SmartRecruitersResponse = response.data ?? { content: [] };
        const jobs = data.content ?? [];

        if (jobs.length === 0) break;

        this.logger.log(
          `SmartRecruiters: fetched ${jobs.length} jobs at offset ${offset} for ${companySlug}`,
        );

        for (const job of jobs) {
          if (jobPosts.length >= resultsWanted) break;

          try {
            const post = this.processJob(job, companySlug, input.descriptionFormat);
            if (post) {
              jobPosts.push(post);
            }
          } catch (err: any) {
            this.logger.warn(
              `Error processing SmartRecruiters job ${job.id}: ${err.message}`,
            );
          }
        }

        offset += jobs.length;

        // If we got less than page size, there are no more results
        if (jobs.length < SMARTRECRUITERS_PAGE_SIZE) break;

        // Delay between pagination requests
        await randomSleep(500, 1500);
      }

      this.logger.log(`SmartRecruiters total: ${jobPosts.length} jobs for ${companySlug}`);
      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`SmartRecruiters scrape error for ${companySlug}: ${err.message}`);
      return new JobResponseDto(jobPosts); // Return what we have so far
    }
  }

  private processJob(
    job: SmartRecruitersJob,
    companySlug: string,
    _format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.name;
    if (!title) return null;

    // Location
    const loc = job.location;
    const location = loc
      ? new LocationDto({
          city: loc.city ?? null,
          state: loc.region ?? null,
          country: loc.country ?? null,
        })
      : null;

    const isRemote = loc?.remote ?? false;

    // Date
    const datePosted = job.releasedDate ?? null;

    // Job URL
    const jobUrl =
      job.ref ?? `https://jobs.smartrecruiters.com/${companySlug}/${job.id}`;

    return new JobPostDto({
      id: `sr-${job.id}`,
      title,
      companyName: job.company?.name ?? companySlug,
      jobUrl,
      location,
      datePosted: datePosted
        ? new Date(datePosted).toISOString().split('T')[0]
        : null,
      isRemote,
      site: Site.SMARTRECRUITERS,
      // ATS-specific fields
      atsId: job.id ?? null,
      atsType: 'smartrecruiters',
      department: job.department?.label ?? null,
      employmentType: job.typeOfEmployment?.label ?? null,
    });
  }
}
