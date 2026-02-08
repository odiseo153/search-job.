import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper, ScraperInputDto, JobResponseDto, JobPostDto, Site,
  LocationDto, CompensationDto, CompensationInterval,
} from '@ever-jobs/models';
import { createHttpClient } from '@ever-jobs/common';

const API_URL = 'https://api.lifeattiktok.com/api/v1/public/supplier/search/job/posts';
const PAGE_SIZE = 20;
const DELAY_MS = 300;

const TIKTOK_HEADERS: Record<string, string> = {
  Accept: '*/*',
  'Accept-Language': 'en-US',
  'Content-Type': 'application/json',
  Referer: 'https://lifeattiktok.com/',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

interface TikTokJob {
  id?: string;
  title?: string;
  job_post_info?: {
    description?: string;
    city_info?: { name?: string }[];
    country_info?: { name?: string }[];
    department?: string;
    job_category?: string;
    employment_type_info?: { name?: string };
    salary_range?: { min?: number; max?: number; currency?: string };
  };
  create_time?: number;
  detail_url?: string;
}

@Injectable()
export class TikTokService implements IScraper {
  private readonly logger = new Logger(TikTokService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const jobs: JobPostDto[] = [];
    const maxResults = input.resultsWanted ?? 100;
    let offset = 0;

    try {
      const client = createHttpClient({
        proxies: input.proxies,
        timeout: input.requestTimeout ?? 30,
      });
      client.setHeaders(TIKTOK_HEADERS);

      while (jobs.length < maxResults) {
        const { data } = await client.post<{
          data?: { job_post_list?: TikTokJob[]; count?: number };
        }>(API_URL, {
          keyword: input.searchTerm ?? '',
          offset,
          limit: PAGE_SIZE,
          category_id_list: [],
          location_code_list: [],
          sub_team_id_list: [],
        });

        const list = data?.data?.job_post_list ?? [];
        if (!list.length) break;

        for (const j of list) {
          if (jobs.length >= maxResults) break;
          const job = this.mapToJobPost(j);
          if (job) jobs.push(job);
        }

        offset += PAGE_SIZE;
        const total = data?.data?.count ?? 0;
        if (offset >= total) break;
        await this.delay(DELAY_MS);
      }

      this.logger.log(`TikTok: scraped ${jobs.length} jobs`);
    } catch (err: any) {
      this.logger.error(`TikTok scrape failed: ${err.message}`);
    }

    return { jobs };
  }

  private mapToJobPost(j: TikTokJob): JobPostDto | null {
    if (!j.title) return null;
    const info = j.job_post_info;
    const city = info?.city_info?.[0]?.name ?? null;
    const country = info?.country_info?.[0]?.name ?? null;
    const sal = info?.salary_range;

    return new JobPostDto({
      id: j.id ?? undefined,
      site: Site.TIKTOK,
      title: j.title,
      companyName: 'TikTok',
      jobUrl: j.detail_url ?? undefined,
      location: new LocationDto({ city, country }),
      description: info?.description ?? null,
      department: info?.department ?? info?.job_category ?? undefined,
      employmentType: info?.employment_type_info?.name ?? undefined,
      datePosted: j.create_time
        ? new Date(j.create_time * 1000).toISOString().split('T')[0]
        : undefined,
      compensation: sal?.min != null
        ? new CompensationDto({
            interval: CompensationInterval.YEARLY,
            minAmount: sal.min,
            maxAmount: sal.max ?? undefined,
            currency: sal.currency ?? 'USD',
          })
        : undefined,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
