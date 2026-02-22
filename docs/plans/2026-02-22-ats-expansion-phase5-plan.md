# Phase 5: ATS Platform Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 10 new ATS integrations + 3 company scrapers + company slug directory, expanding ever-jobs from 69 to 82+ sources.

**Architecture:** Each new source is an independent NestJS package under `packages/` implementing the `IScraper` interface. All sources use the shared `HttpClient` wrapper from `@ever-jobs/common` and map results to the unified `JobPostDto` schema. Registration happens in `jobs.module.ts` (import) and `jobs.service.ts` (scraper map + ATS/company site sets).

**Tech Stack:** NestJS 10.4, TypeScript 5.5, Axios (via HttpClient wrapper), Jest 30.2, Cheerio (HTML parsing where needed)

---

## Task 0: Shared Foundation - Site Enum + Path Mappings

**Files:**
- Modify: `packages/models/src/enums/site.enum.ts:55-69`
- Modify: `tsconfig.base.json:82-89`
- Modify: `jest.config.js` (moduleNameMapper section)

**Step 1: Add 13 new Site enum values**

In `packages/models/src/enums/site.enum.ts`, add before the closing brace of the enum (after line 68, before `DRIBBBLE`'s line):

```typescript
  // Phase 8: ATS Expansion
  MANATAL = 'manatal',
  PAYLOCITY = 'paylocity',
  FRESHTEAM = 'freshteam',
  BULLHORN = 'bullhorn',
  TRAKSTAR = 'trakstar',
  HIRINGTHING = 'hiringthing',
  LOXO = 'loxo',
  FOUNTAIN = 'fountain',
  DEEL = 'deel',
  PHENOM = 'phenom',
  // Phase 8: Company scrapers
  IBM = 'ibm',
  BOEING = 'boeing',
  ZOOM = 'zoom',
```

**Step 2: Add 13 TypeScript path aliases**

In `tsconfig.base.json`, add inside `paths` (after the `source-dribbble` entry):

```json
"@ever-jobs/source-ats-manatal": ["packages/source-ats-manatal/src/index.ts"],
"@ever-jobs/source-ats-paylocity": ["packages/source-ats-paylocity/src/index.ts"],
"@ever-jobs/source-ats-freshteam": ["packages/source-ats-freshteam/src/index.ts"],
"@ever-jobs/source-ats-bullhorn": ["packages/source-ats-bullhorn/src/index.ts"],
"@ever-jobs/source-ats-trakstar": ["packages/source-ats-trakstar/src/index.ts"],
"@ever-jobs/source-ats-hiringthing": ["packages/source-ats-hiringthing/src/index.ts"],
"@ever-jobs/source-ats-loxo": ["packages/source-ats-loxo/src/index.ts"],
"@ever-jobs/source-ats-fountain": ["packages/source-ats-fountain/src/index.ts"],
"@ever-jobs/source-ats-deel": ["packages/source-ats-deel/src/index.ts"],
"@ever-jobs/source-ats-phenom": ["packages/source-ats-phenom/src/index.ts"],
"@ever-jobs/source-company-ibm": ["packages/source-company-ibm/src/index.ts"],
"@ever-jobs/source-company-boeing": ["packages/source-company-boeing/src/index.ts"],
"@ever-jobs/source-company-zoom": ["packages/source-company-zoom/src/index.ts"]
```

**Step 3: Add 13 Jest moduleNameMapper entries**

In `jest.config.js`, add inside `moduleNameMapper` (after the `source-dribbble` entry):

```javascript
'^@ever-jobs/source-ats-manatal$': '<rootDir>/packages/source-ats-manatal/src/index.ts',
'^@ever-jobs/source-ats-paylocity$': '<rootDir>/packages/source-ats-paylocity/src/index.ts',
'^@ever-jobs/source-ats-freshteam$': '<rootDir>/packages/source-ats-freshteam/src/index.ts',
'^@ever-jobs/source-ats-bullhorn$': '<rootDir>/packages/source-ats-bullhorn/src/index.ts',
'^@ever-jobs/source-ats-trakstar$': '<rootDir>/packages/source-ats-trakstar/src/index.ts',
'^@ever-jobs/source-ats-hiringthing$': '<rootDir>/packages/source-ats-hiringthing/src/index.ts',
'^@ever-jobs/source-ats-loxo$': '<rootDir>/packages/source-ats-loxo/src/index.ts',
'^@ever-jobs/source-ats-fountain$': '<rootDir>/packages/source-ats-fountain/src/index.ts',
'^@ever-jobs/source-ats-deel$': '<rootDir>/packages/source-ats-deel/src/index.ts',
'^@ever-jobs/source-ats-phenom$': '<rootDir>/packages/source-ats-phenom/src/index.ts',
'^@ever-jobs/source-company-ibm$': '<rootDir>/packages/source-company-ibm/src/index.ts',
'^@ever-jobs/source-company-boeing$': '<rootDir>/packages/source-company-boeing/src/index.ts',
'^@ever-jobs/source-company-zoom$': '<rootDir>/packages/source-company-zoom/src/index.ts',
```

**Step 4: Run type-check**

Run: `npx tsc --noEmit -p tsconfig.base.json`
Expected: Should still pass (new paths point to not-yet-created files, but unused paths don't error in tsconfig)

**Step 5: Commit**

```bash
git add packages/models/src/enums/site.enum.ts tsconfig.base.json jest.config.js
git commit -m "feat(models): add 13 new Site enum values and path mappings for Phase 5 ATS expansion"
```

---

## Task 1: source-ats-manatal (No Auth, Slug-based)

**Files:**
- Create: `packages/source-ats-manatal/package.json`
- Create: `packages/source-ats-manatal/tsconfig.json`
- Create: `packages/source-ats-manatal/src/index.ts`
- Create: `packages/source-ats-manatal/src/manatal.module.ts`
- Create: `packages/source-ats-manatal/src/manatal.service.ts`
- Create: `packages/source-ats-manatal/src/manatal.constants.ts`
- Create: `packages/source-ats-manatal/src/manatal.types.ts`
- Create: `packages/source-ats-manatal/__tests__/manatal.e2e-spec.ts`

**API:** `GET https://api.manatal.com/open/v1/career-page/{slug}/jobs/`
**Auth:** None
**Response:** JSON `{ results: [...], count: N, next: url|null }`

**Step 1: Create package scaffolding**

`package.json`:
```json
{
  "name": "@ever-jobs/source-ats-manatal",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "MIT"
}
```

`tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/packages/source-ats-manatal",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

`src/index.ts`:
```typescript
export { ManatalModule } from './manatal.module';
export { ManatalService } from './manatal.service';
```

**Step 2: Write constants and types**

`src/manatal.constants.ts`:
```typescript
export const MANATAL_API_BASE = 'https://api.manatal.com/open/v1/career-page';

export const MANATAL_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36',
};
```

`src/manatal.types.ts`:
```typescript
export interface ManatalResponse {
  count: number;
  next: string | null;
  results: ManatalJob[];
}

export interface ManatalJob {
  id: number;
  position_name: string;
  description: string;
  requirement: string | null;
  department: string | null;
  location: ManatalLocation | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  created_at: string;
  updated_at: string;
  apply_url: string | null;
  career_page_url: string | null;
}

export interface ManatalLocation {
  city: string | null;
  state: string | null;
  country: string | null;
}
```

**Step 3: Write the module**

`src/manatal.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ManatalService } from './manatal.service';

@Module({
  providers: [ManatalService],
  exports: [ManatalService],
})
export class ManatalModule {}
```

**Step 4: Write the service**

`src/manatal.service.ts`:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper, ScraperInputDto, JobResponseDto, JobPostDto,
  LocationDto, CompensationDto, CompensationInterval,
  Site, DescriptionFormat,
} from '@ever-jobs/models';
import { createHttpClient, htmlToPlainText, markdownConverter, extractEmails } from '@ever-jobs/common';
import { MANATAL_API_BASE, MANATAL_HEADERS } from './manatal.constants';
import { ManatalJob, ManatalResponse } from './manatal.types';

@Injectable()
export class ManatalService implements IScraper {
  private readonly logger = new Logger(ManatalService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug) {
      this.logger.warn('No companySlug provided for Manatal scraper');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(MANATAL_HEADERS);

    const url = `${MANATAL_API_BASE}/${encodeURIComponent(companySlug)}/jobs/`;

    try {
      this.logger.log(`Fetching Manatal jobs for company: ${companySlug}`);
      const response = await client.get(url);
      const data: ManatalResponse = response.data ?? { results: [], count: 0, next: null };
      const jobs = data.results ?? [];

      this.logger.log(`Manatal: found ${jobs.length} raw jobs for ${companySlug}`);

      const resultsWanted = input.resultsWanted ?? 100;
      const jobPosts: JobPostDto[] = [];

      for (const job of jobs) {
        if (jobPosts.length >= resultsWanted) break;
        try {
          const post = this.processJob(job, companySlug, input.descriptionFormat);
          if (post) jobPosts.push(post);
        } catch (err: any) {
          this.logger.warn(`Error processing Manatal job ${job.id}: ${err.message}`);
        }
      }

      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`Manatal scrape error for ${companySlug}: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private processJob(job: ManatalJob, companySlug: string, format?: DescriptionFormat): JobPostDto | null {
    const title = job.position_name;
    if (!title) return null;

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

    const location = new LocationDto({
      city: job.location?.city ?? null,
      state: job.location?.state ?? null,
      country: job.location?.country ?? null,
    });

    const compensation = (job.salary_min != null || job.salary_max != null)
      ? new CompensationDto({
          interval: CompensationInterval.YEARLY,
          minAmount: job.salary_min ?? undefined,
          maxAmount: job.salary_max ?? undefined,
          currency: job.salary_currency ?? 'USD',
        })
      : null;

    const jobUrl = job.apply_url ?? job.career_page_url ?? `https://api.manatal.com/open/v1/career-page/${companySlug}/jobs/${job.id}`;
    const datePosted = job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : null;

    return new JobPostDto({
      id: `manatal-${job.id}`,
      title,
      companyName: companySlug,
      jobUrl,
      location,
      description,
      compensation,
      datePosted,
      emails: extractEmails(description),
      site: Site.MANATAL,
      atsId: String(job.id),
      atsType: 'manatal',
      department: job.department ?? null,
      jobType: job.employment_type ?? null,
    });
  }
}
```

**Step 5: Write the e2e test**

`__tests__/manatal.e2e-spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ManatalModule, ManatalService } from '@ever-jobs/source-ats-manatal';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

describe('ManatalService (E2E)', () => {
  let service: ManatalService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ManatalModule],
    }).compile();
    service = module.get<ManatalService>(ManatalService);
  });

  it('should return job results for a known company', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.MANATAL],
      companySlug: 'manatal',
      resultsWanted: 5,
      descriptionFormat: DescriptionFormat.MARKDOWN,
    });
    const response = await service.scrape(input);
    expect(response).toBeDefined();
    expect(response.jobs).toBeDefined();
    expect(Array.isArray(response.jobs)).toBe(true);
    if (response.jobs.length > 0) {
      const job = response.jobs[0];
      expect(job.title).toBeDefined();
      expect(job.site).toBe(Site.MANATAL);
      expect(job.atsType).toBe('manatal');
    }
  });

  it('should return empty results when no companySlug provided', async () => {
    const input = new ScraperInputDto({ siteType: [Site.MANATAL], resultsWanted: 5 });
    const response = await service.scrape(input);
    expect(response.jobs.length).toBe(0);
  });
});
```

**Step 6: Commit**

```bash
git add packages/source-ats-manatal/
git commit -m "feat(manatal): add Manatal ATS integration (160K+ orgs, no auth, slug-based)"
```

---

## Tasks 2-10: Remaining ATS Packages

Each follows the IDENTICAL structure as Task 1. The only differences are:

### Task 2: source-ats-paylocity
- **API:** `GET https://recruiting.paylocity.com/recruiting/api/feed/jobs/{guid}`
- **Auth:** None (GUID-based)
- **companySlug format:** GUID string (e.g., `a1b2c3d4-e5f6-...`)
- **Response:** JSON array of jobs
- **Test slug:** Use a known Paylocity GUID (discover from any Paylocity career page)

### Task 3: source-ats-freshteam
- **API:** `GET https://{companySlug}.freshteam.com/api/job_postings`
- **Auth:** Bearer token (`Authorization: Bearer {api_key}`) - env var `FRESHTEAM_API_KEY`
- **Per-request auth:** `input.auth?.freshteam?.apiKey`
- **Response:** JSON array of job postings
- **Test:** Skip if no API key (`process.env.FRESHTEAM_API_KEY ? describe : describe.skip`)

### Task 4: source-ats-bullhorn
- **API:** `GET https://public-rest{cls}.bullhornstaffing.com/rest-services/{corpToken}/search/JobOrder?query=(isOpen:1)&fields=id,title,publicDescription,address,dateAdded&count=100`
- **Auth:** Corp Token (static per-company) - env var `BULLHORN_CORP_TOKEN`
- **companySlug format:** `{cls}:{corpToken}` (e.g., `91:abc123`)
- **Response:** JSON `{ data: [...] }`
- **Test:** Skip if no corp token

### Task 5: source-ats-trakstar
- **API:** `GET https://{companySlug}.hire.trakstar.com/api/v1/openings`
- **Auth:** API Key (Basic Auth, key as username) - env var `TRAKSTAR_API_KEY`
- **Response:** JSON array
- **Test:** Skip if no API key

### Task 6: source-ats-hiringthing
- **API:** `GET https://api.hiringthing.com/api/v1/jobs`
- **Auth:** API Key (Basic Auth) - env var `HIRINGTHING_API_KEY`
- **Response:** JSON `{ jobs: [...] }`
- **Test:** Skip if no API key

### Task 7: source-ats-loxo
- **API:** `GET https://app.loxo.co/api/{companySlug}/jobs`
- **Auth:** None for public career board; API token for full API - env var `LOXO_API_TOKEN`
- **Response:** JSON array
- **Test:** Try public endpoint first

### Task 8: source-ats-fountain
- **API:** `GET https://api.fountain.com/v2/openings`
- **Auth:** Bearer token - env var `FOUNTAIN_API_KEY`
- **Response:** JSON `{ openings: [...] }`
- **Test:** Skip if no API key

### Task 9: source-ats-deel
- **API:** `GET https://api.letsdeel.com/rest/v2/ats/job-postings/`
- **Auth:** Bearer token - env var `DEEL_API_TOKEN`
- **Response:** JSON `{ data: [...] }`
- **Test:** Skip if no API token

### Task 10: source-ats-phenom
- **API:** `GET https://jobs.{companyDomain}/api/jobs` (per-company domain pattern)
- **Auth:** None (public per-company career site)
- **companySlug format:** company domain name (e.g., `boeing`, `hilton`)
- **Known companies:** boeing.com, hilton.com, nestle.com, comcast.com
- **Response:** JSON `{ jobs: [...], total: N }`
- **Test:** Use `boeing` as test slug

---

## Task 11: source-company-ibm

**Files:**
- Create: `packages/source-company-ibm/package.json`
- Create: `packages/source-company-ibm/tsconfig.json`
- Create: `packages/source-company-ibm/src/index.ts`
- Create: `packages/source-company-ibm/src/ibm.module.ts`
- Create: `packages/source-company-ibm/src/ibm.service.ts`
- Create: `packages/source-company-ibm/src/ibm.constants.ts`
- Create: `packages/source-company-ibm/src/ibm.types.ts`
- Create: `packages/source-company-ibm/__tests__/ibm.e2e-spec.ts`

**Pattern:** Same as existing `source-company-meta` (`__NEXT_DATA__` extraction)
**API:** `GET https://www.ibm.com/careers/search?field_keyword_18[0]={searchTerm}&field_keyword_05[0]={location}`
**Method:** Fetch HTML page, extract `__NEXT_DATA__` JSON, parse job listings
**Auth:** None

Follow the `meta.service.ts` pattern exactly. The service fetches the career page HTML, extracts the `<script id="__NEXT_DATA__">` tag using Cheerio, parses the JSON, and maps the job data to `JobPostDto`.

---

## Task 12: source-company-boeing

**Files:** Same structure as Task 11 but under `packages/source-company-boeing/`

**API:** `GET https://jobs.boeing.com/api/jobs?page=1&limit=25&keyword={searchTerm}&location={location}`
**Auth:** None
**Response:** JSON `{ jobs: [...], total: N }`

Simple REST GET endpoint with query params. No special handling needed.

---

## Task 13: source-company-zoom

**Files:** Same structure as Task 11 but under `packages/source-company-zoom/`

**Pattern:** IDENTICAL to existing `source-company-nvidia` (Eightfold PCSX API)
**API:** `GET https://zoom.eightfold.ai/api/pcsx/search`
**Auth:** None
**Params:** `?q={searchTerm}&location={location}&domain=zoom.eightfold.ai`

Copy the Nvidia service pattern exactly, changing only the domain from `nvidia.eightfold.ai` to `zoom.eightfold.ai`.

---

## Task 14: Wire All 13 Sources Into the API

**Files:**
- Modify: `apps/api/src/jobs/jobs.module.ts`
- Modify: `apps/api/src/jobs/jobs.service.ts`
- Modify: `apps/api/src/jobs/__tests__/jobs.service.spec.ts`

**Step 1: Add imports and module registration in `jobs.module.ts`**

Add 13 import lines (after the existing Phase 7 imports, before `AnalyticsModule`):

```typescript
// Phase 8: ATS Expansion
import { ManatalModule } from '@ever-jobs/source-ats-manatal';
import { PaylocityModule } from '@ever-jobs/source-ats-paylocity';
import { FreshteamModule } from '@ever-jobs/source-ats-freshteam';
import { BullhornModule } from '@ever-jobs/source-ats-bullhorn';
import { TrakstarModule } from '@ever-jobs/source-ats-trakstar';
import { HiringThingModule } from '@ever-jobs/source-ats-hiringthing';
import { LoxoModule } from '@ever-jobs/source-ats-loxo';
import { FountainModule } from '@ever-jobs/source-ats-fountain';
import { DeelModule } from '@ever-jobs/source-ats-deel';
import { PhenomModule } from '@ever-jobs/source-ats-phenom';
import { IbmModule } from '@ever-jobs/source-company-ibm';
import { BoeingModule } from '@ever-jobs/source-company-boeing';
import { ZoomModule } from '@ever-jobs/source-company-zoom';
```

Add to `imports` array (before `AnalyticsModule`):

```typescript
    // Phase 8: ATS Expansion
    ManatalModule,
    PaylocityModule,
    FreshteamModule,
    BullhornModule,
    TrakstarModule,
    HiringThingModule,
    LoxoModule,
    FountainModule,
    DeelModule,
    PhenomModule,
    IbmModule,
    BoeingModule,
    ZoomModule,
```

**Step 2: Add service imports, constructor params, and scraper map entries in `jobs.service.ts`**

Add 13 import lines:

```typescript
import { ManatalService } from '@ever-jobs/source-ats-manatal';
import { PaylocityService } from '@ever-jobs/source-ats-paylocity';
import { FreshteamService } from '@ever-jobs/source-ats-freshteam';
import { BullhornService } from '@ever-jobs/source-ats-bullhorn';
import { TrakstarService } from '@ever-jobs/source-ats-trakstar';
import { HiringThingService } from '@ever-jobs/source-ats-hiringthing';
import { LoxoService } from '@ever-jobs/source-ats-loxo';
import { FountainService } from '@ever-jobs/source-ats-fountain';
import { DeelService } from '@ever-jobs/source-ats-deel';
import { PhenomService } from '@ever-jobs/source-ats-phenom';
import { IbmService } from '@ever-jobs/source-company-ibm';
import { BoeingService } from '@ever-jobs/source-company-boeing';
import { ZoomService } from '@ever-jobs/source-company-zoom';
```

Add 13 constructor params (after `dribbbleService`):

```typescript
    private readonly manatalService: ManatalService,
    private readonly paylocityService: PaylocityService,
    private readonly freshteamService: FreshteamService,
    private readonly bullhornService: BullhornService,
    private readonly trakstarService: TrakstarService,
    private readonly hiringThingService: HiringThingService,
    private readonly loxoService: LoxoService,
    private readonly fountainService: FountainService,
    private readonly deelService: DeelService,
    private readonly phenomService: PhenomService,
    private readonly ibmService: IbmService,
    private readonly boeingService: BoeingService,
    private readonly zoomService: ZoomService,
```

Add 13 scraper map entries (after `[Site.DRIBBBLE, this.dribbbleService]`):

```typescript
      // Phase 8: ATS Expansion
      [Site.MANATAL, this.manatalService],
      [Site.PAYLOCITY, this.paylocityService],
      [Site.FRESHTEAM, this.freshteamService],
      [Site.BULLHORN, this.bullhornService],
      [Site.TRAKSTAR, this.trakstarService],
      [Site.HIRINGTHING, this.hiringThingService],
      [Site.LOXO, this.loxoService],
      [Site.FOUNTAIN, this.fountainService],
      [Site.DEEL, this.deelService],
      [Site.PHENOM, this.phenomService],
      [Site.IBM, this.ibmService],
      [Site.BOEING, this.boeingService],
      [Site.ZOOM, this.zoomService],
```

Add 10 ATS sites to `ATS_SITES` set (after `Site.PINPOINT`):

```typescript
    Site.MANATAL,
    Site.PAYLOCITY,
    Site.FRESHTEAM,
    Site.BULLHORN,
    Site.TRAKSTAR,
    Site.HIRINGTHING,
    Site.LOXO,
    Site.FOUNTAIN,
    Site.DEEL,
    Site.PHENOM,
```

Add 3 company sites to `COMPANY_SITES` set (after `Site.OPENAI`):

```typescript
    Site.IBM,
    Site.BOEING,
    Site.ZOOM,
```

**Step 3: Add 13 mock entries in `jobs.service.spec.ts`**

Add after the `source-dribbble` mock line:

```typescript
jest.mock('@ever-jobs/source-ats-manatal', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-paylocity', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-freshteam', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-bullhorn', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-trakstar', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-hiringthing', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-loxo', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-fountain', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-deel', () => mockSourceFactory());
jest.mock('@ever-jobs/source-ats-phenom', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-ibm', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-boeing', () => mockSourceFactory());
jest.mock('@ever-jobs/source-company-zoom', () => mockSourceFactory());
```

**Step 4: Run tests**

Run: `npm run test:api`
Expected: All existing tests pass with new mocks

**Step 5: Commit**

```bash
git add apps/api/src/jobs/jobs.module.ts apps/api/src/jobs/jobs.service.ts apps/api/src/jobs/__tests__/jobs.service.spec.ts
git commit -m "feat(api): wire 13 new Phase 5 sources into jobs module and service"
```

---

## Task 15: Update .env.example

**Files:**
- Modify: `.env.example`

Add after existing API key section:

```env
# Phase 5: New ATS integrations
FRESHTEAM_API_KEY=
BULLHORN_CORP_TOKEN=
TRAKSTAR_API_KEY=
HIRINGTHING_API_KEY=
LOXO_API_TOKEN=
FOUNTAIN_API_KEY=
DEEL_API_TOKEN=
```

**Commit:**

```bash
git add .env.example
git commit -m "chore: add Phase 5 ATS API key env vars to .env.example"
```

---

## Task 16: Company Slug Directory Documentation

**Files:**
- Create: `docs/COMPANY_SLUG_DIRECTORY.md`

Create a comprehensive markdown file listing 50+ verified company slugs organized by ATS platform. Include usage examples showing how to use `companySlug` with each ATS type.

**Commit:**

```bash
git add docs/COMPANY_SLUG_DIRECTORY.md
git commit -m "docs: add Company Slug Directory with 50+ verified slugs for existing ATS integrations"
```

---

## Task 17: Update README and Documentation

**Files:**
- Modify: `README.md` (ATS and Company source tables)
- Modify: `docs/ATS_INTEGRATIONS.md`
- Modify: `docs/PRD_NEW_JOB_SOURCES.md` (add Phase 5 status)
- Modify: `docs/ROADMAP.md`

Update source count from 69 to 82+. Add new ATS and company sources to relevant tables.

**Commit:**

```bash
git add README.md docs/ATS_INTEGRATIONS.md docs/PRD_NEW_JOB_SOURCES.md docs/ROADMAP.md
git commit -m "docs: update README and docs for Phase 5 - 82+ sources"
```

---

## Task 18: Run Full Test Suite and Type-Check

**Step 1:** Run: `npx tsc --noEmit`
Expected: No TypeScript errors

**Step 2:** Run: `npm test`
Expected: All tests pass

**Step 3:** Fix any issues discovered

**Step 4:** Final commit if any fixes needed

---

## Execution Notes

- **Tasks 1-13 are independent** and can be parallelized via subagent-driven-development
- **Task 0 must complete first** (shared enum/paths)
- **Task 14 depends on Tasks 1-13** (wiring requires all packages to exist)
- **Tasks 15-17 are independent** (documentation)
- **Task 18 is final** (verification)

### Parallelization Strategy

```
Task 0 (foundation)
  └─→ Tasks 1-13 (all 13 packages, fully parallel)
        └─→ Task 14 (wiring)
              └─→ Task 18 (verification)

Tasks 15-17 (docs, can run anytime after Task 0)
```
