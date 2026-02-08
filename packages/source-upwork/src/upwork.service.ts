import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  DescriptionFormat,
  JobType,
  Site,
} from '@ever-jobs/models';
import {
  markdownConverter,
  plainConverter,
  extractEmails,
} from '@ever-jobs/common';
import {
  JOB_SEARCH_QUERY,
  DEFAULT_NUM_RESULTS,
  DEFAULT_SORT_FIELD,
} from './upwork.constants';

// The SDK uses CommonJS exports; import the constructor and Graphql router
// eslint-disable-next-line @typescript-eslint/no-var-requires
const UpworkApi = require('@upwork/node-upwork-oauth2');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Graphql } = require('@upwork/node-upwork-oauth2/lib/routers/graphql');

/**
 * Upwork job search service using the official Upwork Node.js SDK.
 *
 * Requires the following environment variables:
 *   - UPWORK_CLIENT_ID       — OAuth2 application client ID
 *   - UPWORK_CLIENT_SECRET   — OAuth2 application client secret
 *   - UPWORK_ACCESS_TOKEN    — Pre-obtained OAuth2 access token
 *   - UPWORK_REFRESH_TOKEN   — Pre-obtained OAuth2 refresh token
 *
 * If any of the credentials are missing, the scraper logs a warning
 * and returns empty results (graceful degradation).
 */
@Injectable()
export class UpworkService implements IScraper {
  private readonly logger = new Logger(UpworkService.name);
  private api: any;
  private isConfigured = false;

  constructor() {
    const clientId = process.env.UPWORK_CLIENT_ID;
    const clientSecret = process.env.UPWORK_CLIENT_SECRET;
    const accessToken = process.env.UPWORK_ACCESS_TOKEN;
    const refreshToken = process.env.UPWORK_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !accessToken || !refreshToken) {
      this.logger.warn(
        'Upwork credentials not fully configured. Set UPWORK_CLIENT_ID, ' +
          'UPWORK_CLIENT_SECRET, UPWORK_ACCESS_TOKEN, and UPWORK_REFRESH_TOKEN. ' +
          'Upwork searches will return empty results. ' +
          'Get your API keys at https://developers.upwork.com',
      );
      return;
    }

    const config = {
      clientId,
      clientSecret,
      accessToken,
      refreshToken,
    };

    this.api = new UpworkApi(config);
    this.isConfigured = true;
  }

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    if (!this.isConfigured || !this.api) {
      this.logger.warn('Skipping Upwork scrape — credentials not configured');
      return new JobResponseDto([]);
    }

    const numResults = input.resultsWanted ?? DEFAULT_NUM_RESULTS;
    const searchTerm = input.searchTerm ?? '';

    this.logger.log(
      `Upwork search: "${searchTerm}" (${numResults} results)`,
    );

    try {
      // Set up access token (handles refresh automatically)
      await this.setAccessToken();

      const graphql = new Graphql(this.api);

      const variables = {
        searchTerm: searchTerm || '',
        first: numResults,
        sortField: DEFAULT_SORT_FIELD,
      };

      const data = await this.executeGraphql(graphql, {
        query: JOB_SEARCH_QUERY,
        variables: JSON.stringify(variables),
      });

      const edges =
        data?.data?.marketplaceJobPostings?.edges ?? [];
      this.logger.log(`Upwork returned ${edges.length} results`);

      const jobs: JobPostDto[] = [];

      for (const edge of edges) {
        try {
          const job = this.processNode(edge.node, input.descriptionFormat);
          if (job) jobs.push(job);
        } catch (err: any) {
          this.logger.warn(`Error processing Upwork result: ${err.message}`);
        }
      }

      return new JobResponseDto(jobs);
    } catch (err: any) {
      this.logger.error(`Upwork scrape error: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  /**
   * Set up access token on the API instance.
   * The SDK automatically refreshes expired tokens.
   */
  private setAccessToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.setAccessToken((error: any, tokenPair: any) => {
        if (error) {
          reject(new Error(`Upwork token setup failed: ${error}`));
        } else {
          resolve(tokenPair);
        }
      });
    });
  }

  /**
   * Execute a GraphQL request via the Upwork SDK.
   */
  private executeGraphql(graphql: any, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      graphql.execute(params, (error: any, httpStatus: number, data: any) => {
        if (error) {
          reject(new Error(`Upwork GraphQL error: ${error}`));
        } else if (httpStatus >= 400) {
          reject(
            new Error(
              `Upwork API returned HTTP ${httpStatus}: ${JSON.stringify(data)}`,
            ),
          );
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * Convert an Upwork GraphQL job posting node into a JobPostDto.
   */
  private processNode(
    node: any,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    if (!node || !node.id) return null;

    const title = node.title ?? null;
    if (!title) return null;

    // Build the Upwork job URL from the ciphertext
    const jobUrl = node.ciphertext
      ? `https://www.upwork.com/jobs/${node.ciphertext}`
      : `https://www.upwork.com/jobs/${node.id}`;

    // Process description
    let description: string | null = node.description ?? null;
    if (description && format === DescriptionFormat.MARKDOWN) {
      if (/<[^>]+>/.test(description)) {
        description = markdownConverter(description) ?? description;
      }
    } else if (description && format === DescriptionFormat.PLAIN) {
      if (/<[^>]+>/.test(description)) {
        description = plainConverter(description) ?? description;
      }
    }

    // Parse compensation from budget fields
    let compensation = null;
    if (node.amount?.amount) {
      compensation = {
        minAmount: parseFloat(node.amount.amount),
        maxAmount: parseFloat(node.amount.amount),
        currency: node.amount.currencyCode ?? 'USD',
        interval: 'fixed' as any,
      };
    } else if (node.weeklyBudget?.amount) {
      compensation = {
        minAmount: parseFloat(node.weeklyBudget.amount),
        maxAmount: parseFloat(node.weeklyBudget.amount),
        currency: node.weeklyBudget.currencyCode ?? 'USD',
        interval: 'weekly' as any,
      };
    }

    // Parse date
    const datePosted = node.createdDateTime
      ? new Date(node.createdDateTime).toISOString().split('T')[0]
      : null;

    // Detect remote from title or description
    const titleAndDesc = `${title} ${description ?? ''}`.toLowerCase();
    const isRemote =
      titleAndDesc.includes('remote') ||
      titleAndDesc.includes('work from home') ||
      titleAndDesc.includes('wfh');

    // Map engagement/duration to job type
    let jobType: JobType[] | null = null;
    if (node.engagement) {
      const eng = node.engagement.toLowerCase();
      if (eng.includes('full')) jobType = [JobType.FULL_TIME];
      else if (eng.includes('part')) jobType = [JobType.PART_TIME];
      else if (eng.includes('contract') || eng.includes('hourly'))
        jobType = [JobType.CONTRACT];
    }

    // Extract skills as a comma-separated string appended to description
    const skills = node.skills?.map((s: any) => s.name).filter(Boolean) ?? [];
    const category = node.category?.name ?? null;

    // Build a richer description with metadata
    let enrichedDescription = description ?? '';
    const meta: string[] = [];
    if (category) meta.push(`Category: ${category}`);
    if (node.subcategory?.name) meta.push(`Subcategory: ${node.subcategory.name}`);
    if (skills.length > 0) meta.push(`Skills: ${skills.join(', ')}`);
    if (node.contractorTier) meta.push(`Experience Level: ${this.humanizeTier(node.contractorTier)}`);
    if (node.duration) meta.push(`Duration: ${node.duration}`);
    if (node.client) {
      const clientMeta: string[] = [];
      if (node.client.totalPostedJobs != null) clientMeta.push(`${node.client.totalPostedJobs} jobs posted`);
      if (node.client.totalHires != null) clientMeta.push(`${node.client.totalHires} hires`);
      if (clientMeta.length > 0) meta.push(`Client: ${clientMeta.join(', ')}`);
    }

    if (meta.length > 0) {
      enrichedDescription = enrichedDescription
        ? `${enrichedDescription}\n\n---\n${meta.join('\n')}`
        : meta.join('\n');
    }

    return new JobPostDto({
      id: `upwork-${node.id}`,
      title,
      companyName: 'Upwork Client', // Upwork doesn't expose client company names in search
      companyUrl: null,
      jobUrl,
      location: new LocationDto({}),
      description: enrichedDescription || null,
      compensation,
      datePosted,
      jobType,
      isRemote,
      emails: extractEmails(enrichedDescription),
      site: Site.UPWORK,
    });
  }

  /**
   * Humanize the contractor tier enum value.
   */
  private humanizeTier(tier: string): string {
    switch (tier) {
      case 'ENTRY':
        return 'Entry Level';
      case 'INTERMEDIATE':
        return 'Intermediate';
      case 'EXPERT':
        return 'Expert';
      default:
        return tier;
    }
  }
}
