import { Injectable, Logger } from '@nestjs/common';
import {
  ScraperInputDto, JobPostDto, JobResponseDto, Site, IScraper,
  Country, SalarySource,
} from '@ever-jobs/models';
import { extractSalary, convertToAnnual } from '@ever-jobs/common';
import { LinkedInService } from '@ever-jobs/source-linkedin';
import { IndeedService } from '@ever-jobs/source-indeed';
import { GlassdoorService } from '@ever-jobs/source-glassdoor';
import { ZipRecruiterService } from '@ever-jobs/source-ziprecruiter';
import { GoogleService } from '@ever-jobs/source-google';
import { BaytService } from '@ever-jobs/source-bayt';
import { NaukriService } from '@ever-jobs/source-naukri';
import { BDJobsService } from '@ever-jobs/source-bdjobs';
import { InternshalaService } from '@ever-jobs/source-internshala';
import { ExaService } from '@ever-jobs/source-exa';
import { UpworkService } from '@ever-jobs/source-upwork';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly scraperMap: Map<Site, IScraper>;

  constructor(
    private readonly linkedInService: LinkedInService,
    private readonly indeedService: IndeedService,
    private readonly glassdoorService: GlassdoorService,
    private readonly zipRecruiterService: ZipRecruiterService,
    private readonly googleService: GoogleService,
    private readonly baytService: BaytService,
    private readonly naukriService: NaukriService,
    private readonly bdJobsService: BDJobsService,
    private readonly internshalaService: InternshalaService,
    private readonly exaService: ExaService,
    private readonly upworkService: UpworkService,
  ) {
    this.scraperMap = new Map<Site, IScraper>([
      [Site.LINKEDIN, this.linkedInService],
      [Site.INDEED, this.indeedService],
      [Site.GLASSDOOR, this.glassdoorService],
      [Site.ZIP_RECRUITER, this.zipRecruiterService],
      [Site.GOOGLE, this.googleService],
      [Site.BAYT, this.baytService],
      [Site.NAUKRI, this.naukriService],
      [Site.BDJOBS, this.bdJobsService],
      [Site.INTERNSHALA, this.internshalaService],
      [Site.EXA, this.exaService],
      [Site.UPWORK, this.upworkService],
    ]);
  }

  /**
   * Orchestrates concurrent searching across selected sites.
   * Runs all selected source modules in parallel via Promise.allSettled.
   */
  async searchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const sites = input.siteType ?? Object.values(Site);
    const selectedScrapers: { site: Site; scraper: IScraper }[] = [];

    for (const site of sites) {
      const scraper = this.scraperMap.get(site);
      if (scraper) {
        selectedScrapers.push({ site, scraper });
      } else {
        this.logger.warn(`Unknown site: ${site}`);
      }
    }

    if (selectedScrapers.length === 0) {
      this.logger.warn('No valid scrapers selected');
      return [];
    }

    this.logger.log(`Running ${selectedScrapers.length} scrapers concurrently: ${selectedScrapers.map((s) => s.site).join(', ')}`);

    // Run all scrapers concurrently using Promise.allSettled
    const results = await Promise.allSettled(
      selectedScrapers.map(async ({ site, scraper }) => {
      this.logger.log(`Starting search for ${site}`);
        try {
          const response = await scraper.scrape(input);
          // Tag each job with the site it came from
          for (const job of response.jobs) {
            job.site = site;
          }
          this.logger.log(`${site}: found ${response.jobs.length} jobs`);
          return response;
        } catch (err: any) {
          this.logger.error(`${site} search failed: ${err.message}`);
          throw err;
        }
      }),
    );

    // Aggregate results from fulfilled searches
    const allJobs: JobPostDto[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value.jobs);
      }
    }

    // Post-processing: salary enrichment (mirrors Python __init__.py logic)
    for (const job of allJobs) {
      this.postProcessSalary(job, input);
    }

    // Sort by site name then by date (most recent first)
    allJobs.sort((a, b) => {
      const siteCompare = (a.site ?? '').localeCompare(b.site ?? '');
      if (siteCompare !== 0) return siteCompare;

      const dateA = a.datePosted ? new Date(a.datePosted as string).getTime() : 0;
      const dateB = b.datePosted ? new Date(b.datePosted as string).getTime() : 0;
      return dateB - dateA;
    });

    this.logger.log(`Total aggregated jobs: ${allJobs.length}`);
    return allJobs;
  }

  /**
   * Post-processes a single job's salary data.
   * If the scraper provided direct compensation, optionally convert to annual.
   * If no compensation was returned and the country is USA, try to parse salary from the description.
   * This mirrors the orchestrator logic for salary post-processing.
   */
  private postProcessSalary(job: JobPostDto, input: ScraperInputDto): void {
    const enforceAnnual = input.enforceAnnualSalary ?? false;
    const country = input.country ?? Country.USA;

    if (job.compensation) {
      // Direct compensation from scraper
      (job as any).salarySource = SalarySource.DIRECT_DATA;

      if (
        enforceAnnual &&
        job.compensation.interval &&
        job.compensation.interval !== 'yearly' &&
        job.compensation.minAmount != null &&
        job.compensation.maxAmount != null
      ) {
        const data = {
          interval: job.compensation.interval,
          minAmount: job.compensation.minAmount,
          maxAmount: job.compensation.maxAmount,
        };
        convertToAnnual(data);
        job.compensation.interval = data.interval as any;
        job.compensation.minAmount = data.minAmount;
        job.compensation.maxAmount = data.maxAmount;
      }
    } else if (country === Country.USA && job.description) {
      // Fallback: extract salary from description text (USA only)
      const extracted = extractSalary(job.description, {
        enforceAnnualSalary: enforceAnnual,
      });
      if (extracted.minAmount != null) {
        (job as any).salarySource = SalarySource.DESCRIPTION;
        (job as any).interval = extracted.interval;
        (job as any).minAmount = extracted.minAmount;
        (job as any).maxAmount = extracted.maxAmount;
        (job as any).currency = extracted.currency;
      }
    }

    // Clear salary source if no salary data
    if (!(job as any).minAmount && !job.compensation?.minAmount) {
      (job as any).salarySource = undefined;
    }
  }
}

