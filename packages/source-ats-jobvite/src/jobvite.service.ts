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
import { JOBVITE_API_URL, JOBVITE_HEADERS } from './jobvite.constants';
import { JobviteResponse, JobviteJob } from './jobvite.types';

@Injectable()
export class JobviteService implements IScraper {
  private readonly logger = new Logger(JobviteService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for Jobvite scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(JOBVITE_HEADERS);

    const url = `${JOBVITE_API_URL}/${encodeURIComponent(companySlug)}`;

    try {
      this.logger.log(`Fetching Jobvite jobs for company: ${companySlug}`);
      const response = await client.get(url);
      const data: JobviteResponse = response.data ?? { requisitions: [] };
      const jobs = data.requisitions ?? [];

      this.logger.log(
        `Jobvite: found ${jobs.length} raw jobs for ${companySlug}`,
      );

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
          this.logger.warn(
            `Error processing Jobvite job ${job.eId}: ${err.message}`,
          );
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(
        `Jobvite scrape error for ${companySlug}: ${err.message}`,
      );
      return new JobResponseDto([]);
    }
  }

  private mapJob(
    job: JobviteJob,
    companySlug: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.title;
    if (!title) return null;

    // Description
    let description: string | null = null;
    const rawDesc = job.description ?? job.briefDescription ?? null;
    if (rawDesc) {
      if (format === DescriptionFormat.HTML) {
        description = rawDesc;
      } else if (format === DescriptionFormat.MARKDOWN) {
        description = markdownConverter(rawDesc) ?? rawDesc;
      } else {
        description = htmlToPlainText(rawDesc);
      }
    }

    // Location
    const location = new LocationDto({
      city: job.city ?? null,
      state: job.state ?? null,
      country: job.country ?? null,
    });

    // Remote detection
    const locationStr = job.location ?? '';
    const isRemote = locationStr.toLowerCase().includes('remote');

    // Job URL
    const jobUrl =
      job.detailUrl ??
      job.applyUrl ??
      `https://jobs.jobvite.com/${encodeURIComponent(companySlug)}/job/${job.eId ?? ''}`;

    return new JobPostDto({
      id: `jobvite-${job.eId ?? job.requisitionId ?? ''}`,
      title,
      companyName: companySlug,
      jobUrl,
      location,
      description,
      datePosted: job.date
        ? new Date(job.date).toISOString().split('T')[0]
        : null,
      isRemote,
      emails: extractEmails(description),
      site: Site.JOBVITE,
      atsId: job.eId ?? job.requisitionId ?? null,
      atsType: 'jobvite',
      department: job.department ?? job.category ?? null,
      employmentType: job.type ?? null,
      applyUrl: job.applyUrl ?? null,
    });
  }
}
