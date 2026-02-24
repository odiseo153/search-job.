# Phase 15: European Government & Regional Board Expansion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Status:** Complete

**Goal:** Expand ever-jobs from 116+ to 121+ sources by adding 5 European government/regional job boards with free JSON/RSS APIs.

**Architecture:** Each source follows the IScraper pattern: 8 files per package (package.json, tsconfig.json, src/index.ts, constants, types, module, service, e2e test). Sources 1-3 use JSON APIs with API keys/OAuth. Sources 4-5 use RSS feeds with regex parsing (same pattern as Phase 13 RSS sources). All 5 are regular job boards (NOT ATS — no companySlug required).

**Tech Stack:** NestJS, TypeScript, @ever-jobs/common (createHttpClient, htmlToPlainText, markdownConverter, extractEmails)

---

## Critical Patterns (read before coding)

- **HTTP client**: Use `createHttpClient()` from `@ever-jobs/common`. **NEVER** use generic type args: `client.get(url)` NOT `client.get<Type>(url)` — cast result as `response.data as SomeType`
- **extractEmails**: Accepts `string | null`, NOT `string | undefined`. Always pass `description ?? null`
- **JobPostDto fields**: `string | null` for optional fields, not `string | undefined`
- **RSS parsing**: Split by `<item>`, use `extractTag()` with CDATA+plain regex — no XML library
- **Description format**: Support HTML/PLAIN/MARKDOWN via `htmlToPlainText()` and `markdownConverter()` from `@ever-jobs/common`

---

## New Sources

### 1. JobTech Dev (Swedish Employment Service)
| Field | Value |
|-------|-------|
| **Package** | `source-jobtechdev` |
| **Site Enum** | `JOBTECHDEV` |
| **API** | `GET https://jobsearch.api.jobtechdev.se/search` |
| **Auth** | Free API key (register at apirequest.jobtechdev.se) — env var `JOBTECHDEV_API_KEY` |
| **Format** | JSON |
| **Params** | `q`, `municipality`, `region`, `country`, `remote`, `limit` (0-100), `offset` (0-2000) |
| **Volume** | 50-80K active listings |

### 2. France Travail (French National Employment Service)
| Field | Value |
|-------|-------|
| **Package** | `source-francetravail` |
| **Site Enum** | `FRANCETRAVAIL` |
| **API** | `GET https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search` |
| **Auth** | OAuth2 client_credentials (free registration at francetravail.io) — env vars `FRANCETRAVAIL_CLIENT_ID`, `FRANCETRAVAIL_CLIENT_SECRET` |
| **Token URL** | `POST https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire` with `grant_type=client_credentials&scope=api_offresdemploiv2 o2dsoffre` |
| **Format** | JSON |
| **Params** | `motsCles` (keywords), `commune`, `rayon` (radius km), `range` (e.g. `0-49`) |
| **Volume** | 800K+ active offers |

### 3. NAV Arbeidsplassen (Norwegian Employment)
| Field | Value |
|-------|-------|
| **Package** | `source-navjobs` |
| **Site Enum** | `NAVJOBS` |
| **API** | `GET https://pam-stilling-feed.nav.no/api/v1/feed` |
| **Auth** | Bearer token (free — get public token from `GET https://pam-stilling-feed.nav.no/api/publicToken`) — env var `NAVJOBS_TOKEN` (optional, auto-fetches if not set) |
| **Format** | JSON (JSON Feed spec) |
| **Params** | Pagination via `next_url` from response |
| **Volume** | All publicly advertised Norwegian jobs |

### 4. jobs.ac.uk (UK Academic Jobs)
| Field | Value |
|-------|-------|
| **Package** | `source-jobsacuk` |
| **Site Enum** | `JOBSACUK` |
| **API** | `GET https://www.jobs.ac.uk/jobs/{category}?format=rss` |
| **Auth** | None |
| **Format** | RSS 2.0 (XML) |
| **Categories** | computer-science, software-engineering, artificial-intelligence, engineering-and-technology, health-and-medical, etc. |
| **Volume** | Thousands (UK's largest academic job board) |

### 5. Jobindex (Denmark's Largest Job Board)
| Field | Value |
|-------|-------|
| **Package** | `source-jobindex` |
| **Site Enum** | `JOBINDEX` |
| **API** | `GET https://www.jobindex.dk/jobsoegning/{area}?q={keyword}&format=rss` |
| **Auth** | None |
| **Format** | RSS 2.0 (XML) |
| **Params** | `q` (keyword), area slug in URL path |
| **Volume** | Tens of thousands (Denmark's #1 job board) |

---

## Task 1: Add Site Enum Values

**Files:**
- Modify: `packages/models/src/enums/site.enum.ts`

**Step 1: Add Phase 15 enum entries**

After the Phase 14 block (line ~123, after `RECRUITERFLOW = 'recruiterflow',`), add:

```typescript
  // Phase 15: European government & regional boards
  JOBTECHDEV = 'jobtechdev',
  FRANCETRAVAIL = 'francetravail',
  NAVJOBS = 'navjobs',
  JOBSACUK = 'jobsacuk',
  JOBINDEX = 'jobindex',
```

**Step 2: Verify** — Run `npx tsc --noEmit` — Expected: 0 errors

---

## Task 2: Add tsconfig.base.json Path Aliases

**Files:**
- Modify: `tsconfig.base.json`

**Step 1: Add path aliases**

After the `source-ats-recruiterflow` entry (last entry before closing `}`), add a comma and these:

```json
      "@ever-jobs/source-jobtechdev": ["packages/source-jobtechdev/src/index.ts"],
      "@ever-jobs/source-francetravail": ["packages/source-francetravail/src/index.ts"],
      "@ever-jobs/source-navjobs": ["packages/source-navjobs/src/index.ts"],
      "@ever-jobs/source-jobsacuk": ["packages/source-jobsacuk/src/index.ts"],
      "@ever-jobs/source-jobindex": ["packages/source-jobindex/src/index.ts"]
```

---

## Task 3: Add jest.config.js Module Mappings

**Files:**
- Modify: `jest.config.js`

**Step 1: Add mappings**

After the `source-ats-recruiterflow` entry (last entry before closing `},`), add a comma and these:

```javascript
    '^@ever-jobs/source-jobtechdev$': '<rootDir>/packages/source-jobtechdev/src/index.ts',
    '^@ever-jobs/source-francetravail$': '<rootDir>/packages/source-francetravail/src/index.ts',
    '^@ever-jobs/source-navjobs$': '<rootDir>/packages/source-navjobs/src/index.ts',
    '^@ever-jobs/source-jobsacuk$': '<rootDir>/packages/source-jobsacuk/src/index.ts',
    '^@ever-jobs/source-jobindex$': '<rootDir>/packages/source-jobindex/src/index.ts',
```

---

## Task 4: Create Package — source-jobtechdev (Sweden)

**Files to create:**
- `packages/source-jobtechdev/package.json`
- `packages/source-jobtechdev/tsconfig.json`
- `packages/source-jobtechdev/src/index.ts`
- `packages/source-jobtechdev/src/jobtechdev.constants.ts`
- `packages/source-jobtechdev/src/jobtechdev.types.ts`
- `packages/source-jobtechdev/src/jobtechdev.module.ts`
- `packages/source-jobtechdev/src/jobtechdev.service.ts`
- `packages/source-jobtechdev/__tests__/jobtechdev.e2e-spec.ts`

### package.json
```json
{
  "name": "@ever-jobs/source-jobtechdev",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "MIT"
}
```

### tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/packages/source-jobtechdev",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### src/index.ts
```typescript
export { JobTechDevModule } from './jobtechdev.module';
export { JobTechDevService } from './jobtechdev.service';
```

### src/jobtechdev.constants.ts
```typescript
export const JOBTECHDEV_API_URL = 'https://jobsearch.api.jobtechdev.se/search';
export const JOBTECHDEV_DEFAULT_RESULTS = 25;
export const JOBTECHDEV_MAX_RESULTS = 100;
export const JOBTECHDEV_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent': 'EverJobs/1.0',
};
```

### src/jobtechdev.types.ts
```typescript
export interface JobTechDevResponse {
  total: { value: number };
  hits: JobTechDevHit[];
}

export interface JobTechDevHit {
  id: string;
  headline: string;
  description: { text: string } | null;
  employment_type: { label: string } | null;
  working_hours_type: { label: string } | null;
  employer: { name: string; url: string | null } | null;
  workplace_address: {
    municipality: string | null;
    region: string | null;
    country: string | null;
  } | null;
  application_details: { url: string | null; email: string | null } | null;
  publication_date: string | null;
  last_publication_date: string | null;
  webpage_url: string | null;
  logo_url: string | null;
  salary_description: string | null;
  scope_of_work: { min: number | null; max: number | null } | null;
}
```

### src/jobtechdev.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JobTechDevService } from './jobtechdev.service';

@Module({
  providers: [JobTechDevService],
  exports: [JobTechDevService],
})
export class JobTechDevModule {}
```

### src/jobtechdev.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  DescriptionFormat,
  Site,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
} from '@ever-jobs/common';
import { JOBTECHDEV_API_URL, JOBTECHDEV_HEADERS, JOBTECHDEV_DEFAULT_RESULTS, JOBTECHDEV_MAX_RESULTS } from './jobtechdev.constants';
import { JobTechDevResponse, JobTechDevHit } from './jobtechdev.types';

@Injectable()
export class JobTechDevService implements IScraper {
  private readonly logger = new Logger(JobTechDevService.name);
  private readonly apiKey: string | null;

  constructor() {
    this.apiKey = process.env.JOBTECHDEV_API_KEY ?? null;
    if (!this.apiKey) {
      this.logger.warn(
        'JOBTECHDEV_API_KEY is not set. JobTech Dev searches will return empty results. ' +
          'Get a free API key at https://apirequest.jobtechdev.se/',
      );
    }
  }

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    if (!this.apiKey) {
      this.logger.warn('Skipping JobTech Dev search — API key not configured');
      return new JobResponseDto([]);
    }

    const resultsWanted = Math.min(
      input.resultsWanted ?? JOBTECHDEV_DEFAULT_RESULTS,
      JOBTECHDEV_MAX_RESULTS,
    );

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders({ ...JOBTECHDEV_HEADERS, 'api-key': this.apiKey });

    const params: Record<string, string> = {
      limit: String(resultsWanted),
      offset: '0',
    };

    if (input.searchTerm) {
      params.q = input.searchTerm;
    }
    if (input.location) {
      params.q = params.q ? `${params.q} ${input.location}` : input.location;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${JOBTECHDEV_API_URL}?${queryString}`;

    this.logger.log(`Fetching JobTech Dev jobs: ${JOBTECHDEV_API_URL}?...`);

    try {
      const response = await client.get(url);
      const data = response.data as JobTechDevResponse;

      const hits = data?.hits ?? [];
      if (hits.length === 0) {
        this.logger.log('No JobTech Dev jobs available');
        return new JobResponseDto([]);
      }

      this.logger.log(
        `JobTech Dev returned ${hits.length} hits (total: ${data?.total?.value ?? 'unknown'})`,
      );

      const jobs: JobPostDto[] = [];

      for (const hit of hits) {
        if (jobs.length >= resultsWanted) break;

        try {
          const job = this.mapJob(hit, input.descriptionFormat);
          if (job) jobs.push(job);
        } catch (err: any) {
          this.logger.warn(`Error mapping JobTech Dev job ${hit.id}: ${err.message}`);
        }
      }

      this.logger.log(`JobTech Dev returned ${jobs.length} jobs`);
      return new JobResponseDto(jobs);
    } catch (err: any) {
      this.logger.error(`JobTech Dev scrape error: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private mapJob(hit: JobTechDevHit, descriptionFormat?: DescriptionFormat): JobPostDto | null {
    if (!hit.headline) return null;

    const jobUrl = hit.webpage_url ?? hit.application_details?.url ?? null;
    if (!jobUrl) return null;

    let description: string | null = hit.description?.text ?? null;
    if (description) {
      if (descriptionFormat === DescriptionFormat.PLAIN) {
        description = htmlToPlainText(description);
      } else if (descriptionFormat === DescriptionFormat.MARKDOWN) {
        if (/<[^>]+>/.test(description)) {
          description = markdownConverter(description) ?? description;
        }
      }
    }

    const location = new LocationDto({
      city: hit.workplace_address?.municipality ?? null,
      state: hit.workplace_address?.region ?? null,
      country: hit.workplace_address?.country ?? 'Sweden',
    });

    let datePosted: string | null = null;
    if (hit.publication_date) {
      try {
        datePosted = new Date(hit.publication_date).toISOString().split('T')[0];
      } catch {
        datePosted = null;
      }
    }

    return new JobPostDto({
      id: `jobtechdev-${hit.id}`,
      title: hit.headline,
      companyName: hit.employer?.name ?? null,
      companyLogo: hit.logo_url ?? null,
      jobUrl,
      location,
      description,
      compensation: null,
      datePosted,
      jobType: hit.employment_type?.label ?? null,
      isRemote: false,
      emails: extractEmails(description),
      site: Site.JOBTECHDEV,
    });
  }
}
```

### __tests__/jobtechdev.e2e-spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JobTechDevModule, JobTechDevService } from '@ever-jobs/source-jobtechdev';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

describe('JobTechDevService (E2E)', () => {
  let service: JobTechDevService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JobTechDevModule],
    }).compile();

    service = module.get<JobTechDevService>(JobTechDevService);
  });

  it('should return job results', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.JOBTECHDEV],
      searchTerm: 'software',
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
      expect(typeof job.title).toBe('string');
      expect(job.site).toBe(Site.JOBTECHDEV);
      expect(job.id).toMatch(/^jobtechdev-/);
    }
  }, 30000);

  it('should respect resultsWanted limit', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.JOBTECHDEV],
      resultsWanted: 3,
      descriptionFormat: DescriptionFormat.PLAIN,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs.length).toBeLessThanOrEqual(3);
  }, 30000);
});
```

---

## Task 5: Create Package — source-francetravail (France)

**Files to create:**
- `packages/source-francetravail/package.json`
- `packages/source-francetravail/tsconfig.json`
- `packages/source-francetravail/src/index.ts`
- `packages/source-francetravail/src/francetravail.constants.ts`
- `packages/source-francetravail/src/francetravail.types.ts`
- `packages/source-francetravail/src/francetravail.module.ts`
- `packages/source-francetravail/src/francetravail.service.ts`
- `packages/source-francetravail/__tests__/francetravail.e2e-spec.ts`

### package.json
```json
{
  "name": "@ever-jobs/source-francetravail",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "MIT"
}
```

### tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/packages/source-francetravail",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### src/index.ts
```typescript
export { FranceTravailModule } from './francetravail.module';
export { FranceTravailService } from './francetravail.service';
```

### src/francetravail.constants.ts
```typescript
export const FRANCETRAVAIL_API_URL = 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search';
export const FRANCETRAVAIL_TOKEN_URL = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire';
export const FRANCETRAVAIL_DEFAULT_RESULTS = 25;
export const FRANCETRAVAIL_MAX_RESULTS = 50;
export const FRANCETRAVAIL_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent': 'EverJobs/1.0',
};
```

### src/francetravail.types.ts
```typescript
export interface FranceTravailTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface FranceTravailSearchResponse {
  resultats: FranceTravailOffer[];
  filtresPossibles?: unknown[];
  contentRange?: { minRange: number; maxRange: number; maxContentRange: number };
}

export interface FranceTravailOffer {
  id: string;
  intitule: string;
  description: string | null;
  dateCreation: string | null;
  dateActualisation: string | null;
  lieuTravail: {
    libelle: string | null;
    latitude: number | null;
    longitude: number | null;
    codePostal: string | null;
    commune: string | null;
  } | null;
  entreprise: {
    nom: string | null;
    description: string | null;
    logo: string | null;
    url: string | null;
  } | null;
  typeContrat: string | null;
  typeContratLibelle: string | null;
  natureContrat: string | null;
  experienceExige: string | null;
  salaire: {
    libelle: string | null;
    commentaire: string | null;
  } | null;
  origineOffre: {
    origine: string | null;
    urlOrigine: string | null;
  } | null;
  qualitesProfessionnelles?: { libelle: string; description: string }[];
}
```

### src/francetravail.module.ts
```typescript
import { Module } from '@nestjs/common';
import { FranceTravailService } from './francetravail.service';

@Module({
  providers: [FranceTravailService],
  exports: [FranceTravailService],
})
export class FranceTravailModule {}
```

### src/francetravail.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  DescriptionFormat,
  Site,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
} from '@ever-jobs/common';
import {
  FRANCETRAVAIL_API_URL,
  FRANCETRAVAIL_TOKEN_URL,
  FRANCETRAVAIL_HEADERS,
  FRANCETRAVAIL_DEFAULT_RESULTS,
  FRANCETRAVAIL_MAX_RESULTS,
} from './francetravail.constants';
import { FranceTravailTokenResponse, FranceTravailSearchResponse, FranceTravailOffer } from './francetravail.types';

@Injectable()
export class FranceTravailService implements IScraper {
  private readonly logger = new Logger(FranceTravailService.name);
  private readonly clientId: string | null;
  private readonly clientSecret: string | null;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor() {
    this.clientId = process.env.FRANCETRAVAIL_CLIENT_ID ?? null;
    this.clientSecret = process.env.FRANCETRAVAIL_CLIENT_SECRET ?? null;
    if (!this.clientId || !this.clientSecret) {
      this.logger.warn(
        'FRANCETRAVAIL_CLIENT_ID or FRANCETRAVAIL_CLIENT_SECRET is not set. ' +
          'France Travail searches will return empty results. ' +
          'Register free at https://francetravail.io/',
      );
    }
  }

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('Skipping France Travail search — OAuth credentials not configured');
      return new JobResponseDto([]);
    }

    const resultsWanted = Math.min(
      input.resultsWanted ?? FRANCETRAVAIL_DEFAULT_RESULTS,
      FRANCETRAVAIL_MAX_RESULTS,
    );

    const token = await this.getAccessToken();
    if (!token) {
      this.logger.error('Failed to obtain France Travail access token');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders({
      ...FRANCETRAVAIL_HEADERS,
      Authorization: `Bearer ${token}`,
    });

    const params: Record<string, string> = {
      range: `0-${resultsWanted - 1}`,
    };

    if (input.searchTerm) {
      params.motsCles = input.searchTerm;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${FRANCETRAVAIL_API_URL}?${queryString}`;

    this.logger.log(`Fetching France Travail jobs: ${FRANCETRAVAIL_API_URL}?...`);

    try {
      const response = await client.get(url);
      const data = response.data as FranceTravailSearchResponse;

      const results = data?.resultats ?? [];
      if (results.length === 0) {
        this.logger.log('No France Travail jobs available');
        return new JobResponseDto([]);
      }

      this.logger.log(`France Travail returned ${results.length} offers`);

      const jobs: JobPostDto[] = [];

      for (const offer of results) {
        if (jobs.length >= resultsWanted) break;

        try {
          const job = this.mapJob(offer, input.descriptionFormat);
          if (job) jobs.push(job);
        } catch (err: any) {
          this.logger.warn(`Error mapping France Travail offer ${offer.id}: ${err.message}`);
        }
      }

      this.logger.log(`France Travail returned ${jobs.length} jobs`);
      return new JobResponseDto(jobs);
    } catch (err: any) {
      this.logger.error(`France Travail scrape error: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const client = createHttpClient({ timeout: 10000 });
      client.setHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId!,
        client_secret: this.clientSecret!,
        scope: 'api_offresdemploiv2 o2dsoffre',
      }).toString();

      const response = await client.post(FRANCETRAVAIL_TOKEN_URL, body);
      const data = response.data as FranceTravailTokenResponse;

      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

      this.logger.log('France Travail OAuth token obtained');
      return this.accessToken;
    } catch (err: any) {
      this.logger.error(`France Travail token error: ${err.message}`);
      return null;
    }
  }

  private mapJob(offer: FranceTravailOffer, descriptionFormat?: DescriptionFormat): JobPostDto | null {
    if (!offer.intitule || !offer.id) return null;

    const jobUrl = offer.origineOffre?.urlOrigine
      ?? `https://candidat.francetravail.fr/offres/recherche/detail/${offer.id}`;

    let description: string | null = offer.description ?? null;
    if (description) {
      if (descriptionFormat === DescriptionFormat.PLAIN) {
        description = htmlToPlainText(description);
      } else if (descriptionFormat === DescriptionFormat.MARKDOWN) {
        if (/<[^>]+>/.test(description)) {
          description = markdownConverter(description) ?? description;
        }
      }
    }

    const location = new LocationDto({
      city: offer.lieuTravail?.libelle ?? null,
      country: 'France',
    });

    let datePosted: string | null = null;
    if (offer.dateCreation) {
      try {
        datePosted = new Date(offer.dateCreation).toISOString().split('T')[0];
      } catch {
        datePosted = null;
      }
    }

    return new JobPostDto({
      id: `francetravail-${offer.id}`,
      title: offer.intitule,
      companyName: offer.entreprise?.nom ?? null,
      companyLogo: offer.entreprise?.logo ?? null,
      jobUrl,
      location,
      description,
      compensation: null,
      datePosted,
      jobType: offer.typeContratLibelle ?? null,
      isRemote: false,
      emails: extractEmails(description),
      site: Site.FRANCETRAVAIL,
    });
  }
}
```

### __tests__/francetravail.e2e-spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FranceTravailModule, FranceTravailService } from '@ever-jobs/source-francetravail';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

describe('FranceTravailService (E2E)', () => {
  let service: FranceTravailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FranceTravailModule],
    }).compile();

    service = module.get<FranceTravailService>(FranceTravailService);
  });

  it('should return job results', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.FRANCETRAVAIL],
      searchTerm: 'développeur',
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
      expect(typeof job.title).toBe('string');
      expect(job.site).toBe(Site.FRANCETRAVAIL);
      expect(job.id).toMatch(/^francetravail-/);
    }
  }, 30000);

  it('should respect resultsWanted limit', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.FRANCETRAVAIL],
      resultsWanted: 3,
      descriptionFormat: DescriptionFormat.PLAIN,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs.length).toBeLessThanOrEqual(3);
  }, 30000);
});
```

---

## Task 6: Create Package — source-navjobs (Norway)

**Files to create:**
- `packages/source-navjobs/package.json`
- `packages/source-navjobs/tsconfig.json`
- `packages/source-navjobs/src/index.ts`
- `packages/source-navjobs/src/navjobs.constants.ts`
- `packages/source-navjobs/src/navjobs.types.ts`
- `packages/source-navjobs/src/navjobs.module.ts`
- `packages/source-navjobs/src/navjobs.service.ts`
- `packages/source-navjobs/__tests__/navjobs.e2e-spec.ts`

### package.json
```json
{
  "name": "@ever-jobs/source-navjobs",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "MIT"
}
```

### tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/packages/source-navjobs",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### src/index.ts
```typescript
export { NavJobsModule } from './navjobs.module';
export { NavJobsService } from './navjobs.service';
```

### src/navjobs.constants.ts
```typescript
export const NAVJOBS_FEED_URL = 'https://pam-stilling-feed.nav.no/api/v1/feed';
export const NAVJOBS_PUBLIC_TOKEN_URL = 'https://pam-stilling-feed.nav.no/api/publicToken';
export const NAVJOBS_DEFAULT_RESULTS = 25;
export const NAVJOBS_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent': 'EverJobs/1.0',
};
```

### src/navjobs.types.ts
```typescript
export interface NavJobsFeedResponse {
  version: string;
  title: string;
  items: NavJobsFeedItem[];
  next_url?: string;
}

export interface NavJobsFeedItem {
  id: string;
  url: string;
  title: string;
  date_modified: string;
  _feed_entry: {
    uuid: string;
    status: string;
    title: string;
    businessName: string | null;
    municipal: string | null;
    county?: string | null;
    description?: string | null;
    sourceurl?: string | null;
    applicationUrl?: string | null;
    published?: string | null;
    expires?: string | null;
  };
}
```

### src/navjobs.module.ts
```typescript
import { Module } from '@nestjs/common';
import { NavJobsService } from './navjobs.service';

@Module({
  providers: [NavJobsService],
  exports: [NavJobsService],
})
export class NavJobsModule {}
```

### src/navjobs.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  DescriptionFormat,
  Site,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
} from '@ever-jobs/common';
import { NAVJOBS_FEED_URL, NAVJOBS_PUBLIC_TOKEN_URL, NAVJOBS_HEADERS, NAVJOBS_DEFAULT_RESULTS } from './navjobs.constants';
import { NavJobsFeedResponse, NavJobsFeedItem } from './navjobs.types';

@Injectable()
export class NavJobsService implements IScraper {
  private readonly logger = new Logger(NavJobsService.name);
  private readonly configuredToken: string | null;
  private cachedPublicToken: string | null = null;

  constructor() {
    this.configuredToken = process.env.NAVJOBS_TOKEN ?? null;
  }

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const resultsWanted = input.resultsWanted ?? NAVJOBS_DEFAULT_RESULTS;

    const token = this.configuredToken ?? await this.fetchPublicToken();
    if (!token) {
      this.logger.error('Failed to obtain NAV Jobs token');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders({
      ...NAVJOBS_HEADERS,
      Authorization: `Bearer ${token}`,
    });

    this.logger.log(`Fetching NAV Jobs feed (resultsWanted=${resultsWanted})`);

    try {
      const response = await client.get(NAVJOBS_FEED_URL);
      const data = response.data as NavJobsFeedResponse;

      const items = data?.items ?? [];
      if (items.length === 0) {
        this.logger.log('No NAV Jobs available');
        return new JobResponseDto([]);
      }

      this.logger.log(`NAV Jobs feed returned ${items.length} items`);

      const jobs: JobPostDto[] = [];

      for (const item of items) {
        if (jobs.length >= resultsWanted) break;

        try {
          if (input.searchTerm && !this.matchesSearch(item, input.searchTerm)) {
            continue;
          }

          const job = this.mapJob(item, input.descriptionFormat);
          if (job) jobs.push(job);
        } catch (err: any) {
          this.logger.warn(`Error mapping NAV job ${item.id}: ${err.message}`);
        }
      }

      this.logger.log(`NAV Jobs returned ${jobs.length} jobs`);
      return new JobResponseDto(jobs);
    } catch (err: any) {
      this.logger.error(`NAV Jobs scrape error: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private async fetchPublicToken(): Promise<string | null> {
    if (this.cachedPublicToken) return this.cachedPublicToken;

    try {
      const client = createHttpClient({ timeout: 10000 });
      const response = await client.get(NAVJOBS_PUBLIC_TOKEN_URL);
      this.cachedPublicToken = response.data as string;
      this.logger.log('NAV Jobs public token obtained');
      return this.cachedPublicToken;
    } catch (err: any) {
      this.logger.error(`NAV Jobs public token error: ${err.message}`);
      return null;
    }
  }

  private matchesSearch(item: NavJobsFeedItem, searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    const title = (item.title ?? '').toLowerCase();
    const business = (item._feed_entry?.businessName ?? '').toLowerCase();
    const description = (item._feed_entry?.description ?? '').toLowerCase();
    return title.includes(term) || business.includes(term) || description.includes(term);
  }

  private mapJob(item: NavJobsFeedItem, descriptionFormat?: DescriptionFormat): JobPostDto | null {
    if (!item.title || !item.url) return null;

    const entry = item._feed_entry;

    let description: string | null = entry?.description ?? null;
    if (description) {
      if (descriptionFormat === DescriptionFormat.PLAIN) {
        description = htmlToPlainText(description);
      } else if (descriptionFormat === DescriptionFormat.MARKDOWN) {
        if (/<[^>]+>/.test(description)) {
          description = markdownConverter(description) ?? description;
        }
      }
    }

    const location = new LocationDto({
      city: entry?.municipal ?? null,
      state: entry?.county ?? null,
      country: 'Norway',
    });

    let datePosted: string | null = null;
    if (entry?.published) {
      try {
        datePosted = new Date(entry.published).toISOString().split('T')[0];
      } catch {
        datePosted = null;
      }
    }

    const jobUrl = entry?.applicationUrl ?? entry?.sourceurl ?? item.url;

    return new JobPostDto({
      id: `navjobs-${entry?.uuid ?? item.id}`,
      title: item.title,
      companyName: entry?.businessName ?? null,
      jobUrl,
      location,
      description,
      compensation: null,
      datePosted,
      isRemote: false,
      emails: extractEmails(description),
      site: Site.NAVJOBS,
    });
  }
}
```

### __tests__/navjobs.e2e-spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NavJobsModule, NavJobsService } from '@ever-jobs/source-navjobs';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

describe('NavJobsService (E2E)', () => {
  let service: NavJobsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NavJobsModule],
    }).compile();

    service = module.get<NavJobsService>(NavJobsService);
  });

  it('should return job results', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.NAVJOBS],
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
      expect(typeof job.title).toBe('string');
      expect(job.site).toBe(Site.NAVJOBS);
      expect(job.id).toMatch(/^navjobs-/);
    }
  }, 30000);

  it('should respect resultsWanted limit', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.NAVJOBS],
      resultsWanted: 3,
      descriptionFormat: DescriptionFormat.PLAIN,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs.length).toBeLessThanOrEqual(3);
  }, 30000);
});
```

---

## Task 7: Create Package — source-jobsacuk (UK Academic Jobs, RSS)

**Files to create:**
- `packages/source-jobsacuk/package.json`
- `packages/source-jobsacuk/tsconfig.json`
- `packages/source-jobsacuk/src/index.ts`
- `packages/source-jobsacuk/src/jobsacuk.constants.ts`
- `packages/source-jobsacuk/src/jobsacuk.types.ts`
- `packages/source-jobsacuk/src/jobsacuk.module.ts`
- `packages/source-jobsacuk/src/jobsacuk.service.ts`
- `packages/source-jobsacuk/__tests__/jobsacuk.e2e-spec.ts`

### package.json
```json
{
  "name": "@ever-jobs/source-jobsacuk",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "MIT"
}
```

### tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/packages/source-jobsacuk",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### src/index.ts
```typescript
export { JobsAcUkModule } from './jobsacuk.module';
export { JobsAcUkService } from './jobsacuk.service';
```

### src/jobsacuk.constants.ts
```typescript
export const JOBSACUK_BASE_URL = 'https://www.jobs.ac.uk/jobs';
export const JOBSACUK_DEFAULT_CATEGORY = 'computer-science';
export const JOBSACUK_CATEGORIES = [
  'computer-science',
  'software-engineering',
  'artificial-intelligence',
  'engineering-and-technology',
  'health-and-medical',
  'cyber-security',
  'information-systems',
];
export const JOBSACUK_HEADERS: Record<string, string> = {
  Accept: 'application/rss+xml, application/xml, text/xml',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36',
};
```

### src/jobsacuk.types.ts
```typescript
export interface JobsAcUkRssItem {
  title: string | null;
  link: string | null;
  guid: string | null;
  description: string | null;
  pubDate: string | null;
}
```

### src/jobsacuk.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JobsAcUkService } from './jobsacuk.service';

@Module({
  providers: [JobsAcUkService],
  exports: [JobsAcUkService],
})
export class JobsAcUkModule {}
```

### src/jobsacuk.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  DescriptionFormat,
  Site,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
} from '@ever-jobs/common';
import { JOBSACUK_BASE_URL, JOBSACUK_DEFAULT_CATEGORY, JOBSACUK_HEADERS } from './jobsacuk.constants';
import { JobsAcUkRssItem } from './jobsacuk.types';

@Injectable()
export class JobsAcUkService implements IScraper {
  private readonly logger = new Logger(JobsAcUkService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const resultsWanted = input.resultsWanted ?? 25;

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(JOBSACUK_HEADERS);

    const category = JOBSACUK_DEFAULT_CATEGORY;
    const url = `${JOBSACUK_BASE_URL}/${category}?format=rss`;

    this.logger.log(`Fetching jobs.ac.uk RSS feed: ${url}`);

    try {
      const response = await client.get(url);
      const xml = response.data;

      if (!xml || typeof xml !== 'string') {
        this.logger.warn('Empty or invalid RSS response from jobs.ac.uk');
        return new JobResponseDto([]);
      }

      const items = this.parseRssItems(xml);
      this.logger.log(`Parsed ${items.length} items from jobs.ac.uk RSS feed`);

      const jobs: JobPostDto[] = [];

      for (const item of items) {
        if (jobs.length >= resultsWanted) break;

        try {
          if (input.searchTerm && !this.matchesSearch(item, input.searchTerm)) {
            continue;
          }

          const job = this.mapJob(item, input.descriptionFormat);
          if (job) jobs.push(job);
        } catch (err: any) {
          this.logger.warn(`Error mapping jobs.ac.uk job ${item.link}: ${err.message}`);
        }
      }

      this.logger.log(`jobs.ac.uk returned ${jobs.length} jobs`);
      return new JobResponseDto(jobs);
    } catch (err: any) {
      this.logger.error(`jobs.ac.uk scrape error: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private parseRssItems(xml: string): JobsAcUkRssItem[] {
    const items: JobsAcUkRssItem[] = [];
    const itemBlocks = xml.split(/<item>/i).slice(1);

    for (const block of itemBlocks) {
      const itemContent = block.split(/<\/item>/i)[0] ?? block;

      items.push({
        title: this.extractTag(itemContent, 'title'),
        link: this.extractTag(itemContent, 'link'),
        guid: this.extractTag(itemContent, 'guid'),
        description: this.extractTag(itemContent, 'description'),
        pubDate: this.extractTag(itemContent, 'pubDate'),
      });
    }

    return items;
  }

  private extractTag(xml: string, tagName: string): string | null {
    const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const cdataRegex = new RegExp(
      `<${escaped}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escaped}>`,
      'i',
    );
    const cdataMatch = cdataRegex.exec(xml);
    if (cdataMatch) return cdataMatch[1].trim();

    const plainRegex = new RegExp(
      `<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`,
      'i',
    );
    const plainMatch = plainRegex.exec(xml);
    if (plainMatch) return plainMatch[1].trim();

    return null;
  }

  private matchesSearch(item: JobsAcUkRssItem, searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    const title = (item.title ?? '').toLowerCase();
    const description = (item.description ?? '').toLowerCase();
    return title.includes(term) || description.includes(term);
  }

  private mapJob(item: JobsAcUkRssItem, descriptionFormat?: DescriptionFormat): JobPostDto | null {
    if (!item.title || !item.link) return null;

    let description: string | undefined = item.description ?? undefined;
    if (description) {
      if (descriptionFormat === DescriptionFormat.PLAIN) {
        description = htmlToPlainText(description);
      } else if (descriptionFormat === DescriptionFormat.MARKDOWN) {
        description = markdownConverter(description) ?? description;
      }
    }

    const location = new LocationDto({
      country: 'United Kingdom',
    });

    let datePosted: string | undefined;
    if (item.pubDate) {
      try {
        datePosted = new Date(item.pubDate).toISOString().split('T')[0];
      } catch {
        datePosted = undefined;
      }
    }

    const jobId = this.extractIdFromUrl(item.guid ?? item.link);

    return new JobPostDto({
      id: `jobsacuk-${jobId}`,
      title: item.title,
      jobUrl: item.link,
      location,
      description,
      compensation: undefined,
      datePosted,
      isRemote: false,
      emails: extractEmails(description ?? null),
      site: Site.JOBSACUK,
    });
  }

  private extractIdFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      return segments[segments.length - 1] ?? this.hashString(url);
    } catch {
      return this.hashString(url);
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash).toString(36);
  }
}
```

### __tests__/jobsacuk.e2e-spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JobsAcUkModule, JobsAcUkService } from '@ever-jobs/source-jobsacuk';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

describe('JobsAcUkService (E2E)', () => {
  let service: JobsAcUkService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JobsAcUkModule],
    }).compile();

    service = module.get<JobsAcUkService>(JobsAcUkService);
  });

  it('should return job results', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.JOBSACUK],
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
      expect(typeof job.title).toBe('string');
      expect(job.site).toBe(Site.JOBSACUK);
      expect(job.id).toMatch(/^jobsacuk-/);
    }
  }, 30000);

  it('should respect resultsWanted limit', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.JOBSACUK],
      resultsWanted: 3,
      descriptionFormat: DescriptionFormat.PLAIN,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs.length).toBeLessThanOrEqual(3);
  }, 30000);
});
```

---

## Task 8: Create Package — source-jobindex (Denmark, RSS)

**Files to create:**
- `packages/source-jobindex/package.json`
- `packages/source-jobindex/tsconfig.json`
- `packages/source-jobindex/src/index.ts`
- `packages/source-jobindex/src/jobindex.constants.ts`
- `packages/source-jobindex/src/jobindex.types.ts`
- `packages/source-jobindex/src/jobindex.module.ts`
- `packages/source-jobindex/src/jobindex.service.ts`
- `packages/source-jobindex/__tests__/jobindex.e2e-spec.ts`

### package.json
```json
{
  "name": "@ever-jobs/source-jobindex",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "MIT"
}
```

### tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/packages/source-jobindex",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### src/index.ts
```typescript
export { JobindexModule } from './jobindex.module';
export { JobindexService } from './jobindex.service';
```

### src/jobindex.constants.ts
```typescript
export const JOBINDEX_BASE_URL = 'https://www.jobindex.dk/jobsoegning';
export const JOBINDEX_HEADERS: Record<string, string> = {
  Accept: 'application/rss+xml, application/xml, text/xml',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36',
};
```

### src/jobindex.types.ts
```typescript
export interface JobindexRssItem {
  title: string | null;
  link: string | null;
  guid: string | null;
  description: string | null;
  pubDate: string | null;
  author: string | null;
}
```

### src/jobindex.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JobindexService } from './jobindex.service';

@Module({
  providers: [JobindexService],
  exports: [JobindexService],
})
export class JobindexModule {}
```

### src/jobindex.service.ts
```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  DescriptionFormat,
  Site,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
} from '@ever-jobs/common';
import { JOBINDEX_BASE_URL, JOBINDEX_HEADERS } from './jobindex.constants';
import { JobindexRssItem } from './jobindex.types';

@Injectable()
export class JobindexService implements IScraper {
  private readonly logger = new Logger(JobindexService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const resultsWanted = input.resultsWanted ?? 25;

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(JOBINDEX_HEADERS);

    const params = new URLSearchParams({ format: 'rss' });
    if (input.searchTerm) {
      params.set('q', input.searchTerm);
    }

    const url = `${JOBINDEX_BASE_URL}?${params.toString()}`;

    this.logger.log(`Fetching Jobindex RSS feed: ${url}`);

    try {
      const response = await client.get(url);
      const xml = response.data;

      if (!xml || typeof xml !== 'string') {
        this.logger.warn('Empty or invalid RSS response from Jobindex');
        return new JobResponseDto([]);
      }

      const items = this.parseRssItems(xml);
      this.logger.log(`Parsed ${items.length} items from Jobindex RSS feed`);

      const jobs: JobPostDto[] = [];

      for (const item of items) {
        if (jobs.length >= resultsWanted) break;

        try {
          const job = this.mapJob(item, input.descriptionFormat);
          if (job) jobs.push(job);
        } catch (err: any) {
          this.logger.warn(`Error mapping Jobindex job ${item.link}: ${err.message}`);
        }
      }

      this.logger.log(`Jobindex returned ${jobs.length} jobs`);
      return new JobResponseDto(jobs);
    } catch (err: any) {
      this.logger.error(`Jobindex scrape error: ${err.message}`);
      return new JobResponseDto([]);
    }
  }

  private parseRssItems(xml: string): JobindexRssItem[] {
    const items: JobindexRssItem[] = [];
    const itemBlocks = xml.split(/<item>/i).slice(1);

    for (const block of itemBlocks) {
      const itemContent = block.split(/<\/item>/i)[0] ?? block;

      items.push({
        title: this.extractTag(itemContent, 'title'),
        link: this.extractTag(itemContent, 'link'),
        guid: this.extractTag(itemContent, 'guid'),
        description: this.extractTag(itemContent, 'description'),
        pubDate: this.extractTag(itemContent, 'pubDate'),
        author: this.extractTag(itemContent, 'author') ?? this.extractTag(itemContent, 'dc:creator'),
      });
    }

    return items;
  }

  private extractTag(xml: string, tagName: string): string | null {
    const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const cdataRegex = new RegExp(
      `<${escaped}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escaped}>`,
      'i',
    );
    const cdataMatch = cdataRegex.exec(xml);
    if (cdataMatch) return cdataMatch[1].trim();

    const plainRegex = new RegExp(
      `<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`,
      'i',
    );
    const plainMatch = plainRegex.exec(xml);
    if (plainMatch) return plainMatch[1].trim();

    return null;
  }

  private mapJob(item: JobindexRssItem, descriptionFormat?: DescriptionFormat): JobPostDto | null {
    if (!item.title || !item.link) return null;

    let description: string | undefined = item.description ?? undefined;
    if (description) {
      if (descriptionFormat === DescriptionFormat.PLAIN) {
        description = htmlToPlainText(description);
      } else if (descriptionFormat === DescriptionFormat.MARKDOWN) {
        description = markdownConverter(description) ?? description;
      }
    }

    const location = new LocationDto({
      country: 'Denmark',
    });

    let datePosted: string | undefined;
    if (item.pubDate) {
      try {
        datePosted = new Date(item.pubDate).toISOString().split('T')[0];
      } catch {
        datePosted = undefined;
      }
    }

    const jobId = this.extractIdFromUrl(item.guid ?? item.link);

    return new JobPostDto({
      id: `jobindex-${jobId}`,
      title: item.title,
      companyName: item.author ?? undefined,
      jobUrl: item.link,
      location,
      description,
      compensation: undefined,
      datePosted,
      isRemote: false,
      emails: extractEmails(description ?? null),
      site: Site.JOBINDEX,
    });
  }

  private extractIdFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      return segments[segments.length - 1] ?? this.hashString(url);
    } catch {
      return this.hashString(url);
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash).toString(36);
  }
}
```

### __tests__/jobindex.e2e-spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JobindexModule, JobindexService } from '@ever-jobs/source-jobindex';
import { ScraperInputDto, Site, DescriptionFormat } from '@ever-jobs/models';

describe('JobindexService (E2E)', () => {
  let service: JobindexService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JobindexModule],
    }).compile();

    service = module.get<JobindexService>(JobindexService);
  });

  it('should return job results', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.JOBINDEX],
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
      expect(typeof job.title).toBe('string');
      expect(job.site).toBe(Site.JOBINDEX);
      expect(job.id).toMatch(/^jobindex-/);
    }
  }, 30000);

  it('should respect resultsWanted limit', async () => {
    const input = new ScraperInputDto({
      siteType: [Site.JOBINDEX],
      resultsWanted: 3,
      descriptionFormat: DescriptionFormat.PLAIN,
    });

    const response = await service.scrape(input);

    expect(response).toBeDefined();
    expect(response.jobs.length).toBeLessThanOrEqual(3);
  }, 30000);
});
```

---

## Task 9: Wire All 5 Sources into API, CLI, MCP

**Step 1: Wire jobs.module.ts**

Add imports after Phase 14 block:
```typescript
// Phase 15: European government & regional boards
import { JobTechDevModule } from '@ever-jobs/source-jobtechdev';
import { FranceTravailModule } from '@ever-jobs/source-francetravail';
import { NavJobsModule } from '@ever-jobs/source-navjobs';
import { JobsAcUkModule } from '@ever-jobs/source-jobsacuk';
import { JobindexModule } from '@ever-jobs/source-jobindex';
```

Add to imports array before `AnalyticsModule`:
```typescript
    // Phase 15: European government & regional boards
    JobTechDevModule,
    FranceTravailModule,
    NavJobsModule,
    JobsAcUkModule,
    JobindexModule,
```

**Step 2: Wire jobs.service.ts**

Add service imports after Phase 14 block:
```typescript
// Phase 15: European government & regional boards
import { JobTechDevService } from '@ever-jobs/source-jobtechdev';
import { FranceTravailService } from '@ever-jobs/source-francetravail';
import { NavJobsService } from '@ever-jobs/source-navjobs';
import { JobsAcUkService } from '@ever-jobs/source-jobsacuk';
import { JobindexService } from '@ever-jobs/source-jobindex';
```

Add constructor params after `recruiterflowService`:
```typescript
    // Phase 15: European government & regional boards
    private readonly jobTechDevService: JobTechDevService,
    private readonly franceTravailService: FranceTravailService,
    private readonly navJobsService: NavJobsService,
    private readonly jobsAcUkService: JobsAcUkService,
    private readonly jobindexService: JobindexService,
```

Add scraperMap entries after `RECRUITERFLOW` entry:
```typescript
      // Phase 15: European government & regional boards
      [Site.JOBTECHDEV, this.jobTechDevService],
      [Site.FRANCETRAVAIL, this.franceTravailService],
      [Site.NAVJOBS, this.navJobsService],
      [Site.JOBSACUK, this.jobsAcUkService],
      [Site.JOBINDEX, this.jobindexService],
```

**None of these are ATS — do NOT add to ATS_SITES set.**

**Step 3: Wire jobs.service.spec.ts**

Add 5 new `jest.mock()` calls after the Phase 14 mocks:
```typescript
jest.mock('@ever-jobs/source-jobtechdev', () => mockSourceFactory());
jest.mock('@ever-jobs/source-francetravail', () => mockSourceFactory());
jest.mock('@ever-jobs/source-navjobs', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobsacuk', () => mockSourceFactory());
jest.mock('@ever-jobs/source-jobindex', () => mockSourceFactory());
```

**Step 4: Wire cli.module.ts**

Add imports after Phase 14 block:
```typescript
// Phase 15: European government & regional boards
import { JobTechDevModule } from '@ever-jobs/source-jobtechdev';
import { FranceTravailModule } from '@ever-jobs/source-francetravail';
import { NavJobsModule } from '@ever-jobs/source-navjobs';
import { JobsAcUkModule } from '@ever-jobs/source-jobsacuk';
import { JobindexModule } from '@ever-jobs/source-jobindex';
```

Add to imports array before `AnalyticsModule`:
```typescript
    // Phase 15: European government & regional boards
    JobTechDevModule,
    FranceTravailModule,
    NavJobsModule,
    JobsAcUkModule,
    JobindexModule,
```

**Step 5: Wire MCP tools.ts**

Add 5 entries to SOURCES array after Phase 14 entries:
```typescript
  // Phase 15: European government & regional boards
  { name: 'JobTech Dev', id: 'jobtechdev', type: 'job_board', requires_company_slug: false, description: 'Swedish Employment Service (50-80K jobs)' },
  { name: 'France Travail', id: 'francetravail', type: 'job_board', requires_company_slug: false, description: 'French National Employment Service (800K+ jobs)' },
  { name: 'NAV Arbeidsplassen', id: 'navjobs', type: 'job_board', requires_company_slug: false, description: 'Norwegian Labour and Welfare Administration' },
  { name: 'jobs.ac.uk', id: 'jobsacuk', type: 'job_board', requires_company_slug: false, description: 'UK academic/higher education jobs' },
  { name: 'Jobindex', id: 'jobindex', type: 'job_board', requires_company_slug: false, description: 'Denmark\'s largest job board' },
```

Update source count from "116+" to "121+" in tools.ts comment and MCP index.ts descriptions.

**Step 6: Wire MCP index.ts search guide**

Add to Job Boards list: `jobtechdev, francetravail, navjobs, jobsacuk, jobindex`

Update "116+" to "121+" in all descriptions.

---

## Task 10: Update Documentation

**Step 1: Update .env.example**

Add after Phase 14 section:
```
# ── Phase 15: European Government & Regional Boards ──
# JOBTECHDEV_API_KEY=                   # Swedish Employment Service API key (free at apirequest.jobtechdev.se)
# FRANCETRAVAIL_CLIENT_ID=              # France Travail OAuth2 client ID (free at francetravail.io)
# FRANCETRAVAIL_CLIENT_SECRET=          # France Travail OAuth2 client secret
# NAVJOBS_TOKEN=                        # Norwegian NAV bearer token (optional, auto-fetches public token)
```

**Step 2: Update README.md**

- Update source count from "116+" to "121+"
- Add 5 new sources to search boards table
- Add `jobtechdev`, `francetravail`, `navjobs`, `jobsacuk`, `jobindex` to siteType parameter

**Step 3: Update ROADMAP.md**

- Add Phase 15 to Current section
- Update source count to "121+"

**Step 4: Update PRD_NEW_JOB_SOURCES.md**

Add Phase 15 row to rollout table.

---

## Task 11: TypeScript Compile Check

Run: `npx tsc --noEmit`
Expected: 0 errors

---

## Task 12: Run Unit Tests

Run: `npx jest --forceExit`
Expected: 22/22 pass (or more, all green)

---

## Success Criteria

- [x] All 5 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated (.env.example, README, ROADMAP, PRD)
