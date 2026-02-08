# Ever Jobs

> A modular, extensible NestJS monorepo for aggregating job postings from multiple job boards.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-e0234e.svg)](https://nestjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

**Ever Jobs** searches job postings from **11 major job boards** concurrently and returns aggregated, normalized results through a single REST API **or CLI**. Each job board is implemented as an independent, reusable NestJS package — making it easy to add new sources, consume individual packages in other projects, or deploy the full API.

### Supported Job Boards

| Source           | Method                 | Region                      |
| ---------------- | ---------------------- | --------------------------- |
| **LinkedIn**     | HTML parsing (Cheerio) | Global                      |
| **Indeed**       | GraphQL API            | 65+ countries               |
| **Glassdoor**    | GraphQL API + CSRF     | 25+ countries               |
| **ZipRecruiter** | REST API               | US / Canada                 |
| **Google Jobs**  | Search page parsing    | Global                      |
| **Bayt**         | HTML parsing (Cheerio) | Middle East / International |
| **Naukri**       | REST API               | India                       |
| **BDJobs**       | HTML parsing (Cheerio) | Bangladesh                  |
| **Internshala**  | HTML parsing (Cheerio) | India (internships & jobs)  |
| **Exa**          | Exa AI search API      | Global                      |
| **Upwork**       | GraphQL API (OAuth2)   | Global (freelance)          |

---

## Features

- 🔍 **Multi-source aggregation** — Search 1 or all 11 job boards concurrently
- 🖥️ **CLI & API** — Use via REST API or command-line with JSON, CSV, table, or summary output
- 🌐 **Country-aware** — Indeed & Glassdoor support 65+ countries with automatic domain resolution
- 🔄 **Proxy rotation** — Built-in rotating proxy support (HTTP, HTTPS, SOCKS5)
- ⏱️ **Rate limiting** — Configurable min/max delay between requests to avoid detection
- 📊 **Salary enrichment** — Extracts salary from descriptions when not provided directly
- 💰 **Annual salary normalization** — Convert hourly/monthly/weekly wages to annual equivalents
- 📝 **Description formats** — Returns descriptions as Markdown, HTML, or plain text
- 🏗️ **Modular architecture** — Each source is an independent NestJS package
- 📖 **Swagger docs** — Full OpenAPI documentation out of the box
- ⚡ **Concurrent execution** — All sources run in parallel via `Promise.allSettled`
- 🔐 **API key authentication** — Optional header-based auth with configurable keys
- 🚦 **Request throttling** — Per-client throttling with configurable limits
- 📦 **Response caching** — In-memory TTL cache with MD5 key generation
- 🏥 **Health checks** — `/health` and `/ping` endpoints with uptime & memory stats
- 🌐 **CORS support** — Environment-driven origin configuration
- 📋 **Request logging** — Per-request IDs, timing, and structured logs
- 🐳 **Docker ready** — Multi-stage Dockerfile, production & dev docker-compose
- 📄 **CSV export** — `POST /api/jobs/search?format=csv` with pagination

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
cd ever-jobs
npm install
cp .env.example .env   # configure environment variables
```

### Run in Development

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### Docker

```bash
# Production
docker compose up -d

# Development (hot-reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Swagger Documentation

Open `http://localhost:3000/api/docs` in your browser for the interactive API explorer.

---

## CLI Usage

The CLI lets you run search jobs directly from the terminal without starting the API server.

```bash
# Basic search
npm run cli -- search --search-term "software engineer" --location "NYC"

# Multiple sites, CSV output to file
npm run cli -- search -s linkedin -s indeed -f csv -o jobs.csv

# Remote TypeScript jobs, table output
npm run cli -- search -q "typescript" --remote -f table

# With rate limiting (1-3 second delay between requests)
npm run cli -- search -q "engineer" --rate-delay-min 1 --rate-delay-max 3

# Get help
npm run cli -- search --help
```

### CLI Options

| Flag                      | Short | Description                                      |
| ------------------------- | ----- | ------------------------------------------------ |
| `--site [sites...]`       | `-s`  | Sites to search (default: all)                   |
| `--search-term <term>`    | `-q`  | Job search keywords                              |
| `--location <loc>`        | `-l`  | Location to search                               |
| `--remote`                | `-r`  | Remote jobs only                                 |
| `--results <n>`           | `-n`  | Results per site (default: 15)                   |
| `--format <fmt>`          | `-f`  | Output: `json`, `csv`, `table`, `summary`        |
| `--output <file>`         | `-o`  | Write to file instead of stdout                  |
| `--country <code>`        | `-c`  | Country (default: USA)                           |
| `--job-type <type>`       |       | `fulltime`, `parttime`, `internship`, `contract` |
| `--hours-old <h>`         |       | Max job age in hours                             |
| `--enforce-annual-salary` |       | Convert wages to annual                          |
| `--rate-delay-min <s>`    |       | Min delay between requests (seconds)             |
| `--rate-delay-max <s>`    |       | Max delay between requests (seconds)             |
| `--stdin`                 |       | Read JSON input from stdin (for LLMs)            |
| `--no-description`        |       | Omit descriptions from output (reduces tokens)   |
| `--proxy [urls...]`       | `-p`  | Proxy URLs for rotation                          |
| `--verbose`               | `-v`  | Debug output                                     |

### JSON Stdin Mode (for LLMs)

Accept a full JSON object via stdin — ideal for ChatGPT Code Interpreter and programmatic use:

```bash
# Pipe JSON input directly
echo '{"searchTerm": "engineer", "siteType": ["indeed"], "resultsWanted": 5}' | npm run cli -- search --stdin

# From a file
cat search_params.json | npm run cli -- search --stdin --format csv
```

---

## Configuration

All settings are configurable via environment variables. Copy `.env.example` to `.env` and adjust as needed.

| Variable               | Default     | Description                    |
| ---------------------- | ----------- | ------------------------------ |
| `ENABLE_API_KEY_AUTH`  | `false`     | Enable API key authentication  |
| `API_KEYS`             | (empty)     | Comma-separated valid API keys |
| `API_KEY_HEADER_NAME`  | `x-api-key` | Header name for API key        |
| `RATE_LIMIT_ENABLED`   | `false`     | Enable request throttling      |
| `RATE_LIMIT_REQUESTS`  | `100`       | Max requests per window        |
| `RATE_LIMIT_TIMEFRAME` | `3600`      | Window size in seconds         |
| `ENABLE_CACHE`         | `false`     | Enable response caching        |
| `CACHE_EXPIRY`         | `3600`      | Cache TTL in seconds           |
| `CORS_ORIGINS`         | `*`         | Allowed CORS origins           |
| `LOG_LEVEL`            | `info`      | Logging level                  |
| `ENABLE_SWAGGER`       | `true`      | Enable Swagger UI              |
| `PORT`                 | `3000`      | Server port                    |

See [`.env.example`](.env.example) for the full list.

---

## API Usage

### `POST /api/jobs/search`

Search for jobs across one or more job boards. Returns a wrapped response with caching, CSV export (`?format=csv`), and pagination support (`?paginate=true`).

#### Request Body

```json
{
  "searchTerm": "software engineer",
  "siteType": ["linkedin", "indeed"],
  "location": "San Francisco, CA",
  "resultsWanted": 20,
  "country": "USA",
  "hoursOld": 72,
  "descriptionFormat": "markdown",
  "linkedinFetchDescription": true
}
```

#### Response

```json
{
  "count": 20,
  "cached": false,
  "jobs": [
    {
      "id": "li-3693012711",
      "site": "linkedin",
      "title": "Software Engineer - Early Career",
      "companyName": "Lockheed Martin",
      "jobUrl": "https://www.linkedin.com/jobs/view/3693012711",
      "location": {
        "city": "Sunnyvale",
        "state": "CA",
        "country": "USA"
      },
      "datePosted": "2025-02-07",
      "isRemote": false,
      "jobType": ["fulltime"],
      "compensation": {
        "interval": "yearly",
        "minAmount": 85000,
        "maxAmount": 130000,
        "currency": "USD"
      },
      "description": "By bringing together people that use..."
    }
  ]
}
```

#### CSV Export

```bash
curl -X POST http://localhost:3000/api/jobs/search?format=csv \
  -H 'Content-Type: application/json' \
  -d '{"searchTerm": "developer", "siteType": ["indeed"]}' -o jobs.csv
```

#### Pagination

```bash
curl -X POST "http://localhost:3000/api/jobs/search?paginate=true&page=1&page_size=10" \
  -H 'Content-Type: application/json' \
  -d '{"searchTerm": "developer"}'
```

#### Paginated Response

```json
{
  "count": 50,
  "total_pages": 5,
  "current_page": 1,
  "page_size": 10,
  "jobs": [...],
  "cached": false,
  "next_page": 2,
  "previous_page": null
}
```

### `POST /api/jobs/analyze`

Search and analyze jobs — returns summary statistics, company intelligence, and per-site comparison.

```bash
curl -X POST http://localhost:3000/api/jobs/analyze \
  -H 'Content-Type: application/json' \
  -d '{"searchTerm": "fullstack", "siteType": ["indeed"], "resultsWanted": 10}'
```

---

## Request Parameters

All parameters are optional. When `siteType` is omitted, all 11 boards are searched.

| Parameter                  | Type       | Default    | Description                                                                                                                               |
| -------------------------- | ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `siteType`                 | `string[]` | all        | Sites to search: `linkedin`, `indeed`, `zip_recruiter`, `glassdoor`, `google`, `bayt`, `naukri`, `bdjobs`, `internshala`, `exa`, `upwork` |
| `searchTerm`               | `string`   | —          | Job search keywords                                                                                                                       |
| `googleSearchTerm`         | `string`   | —          | Google-specific search query override                                                                                                     |
| `location`                 | `string`   | —          | Location to search near                                                                                                                   |
| `distance`                 | `number`   | `50`       | Search radius in miles                                                                                                                    |
| `isRemote`                 | `boolean`  | `false`    | Filter for remote jobs only                                                                                                               |
| `jobType`                  | `string`   | —          | `fulltime`, `parttime`, `internship`, `contract`                                                                                          |
| `easyApply`                | `boolean`  | —          | Filter for easy-apply / hosted jobs                                                                                                       |
| `resultsWanted`            | `number`   | `15`       | Number of results per site                                                                                                                |
| `offset`                   | `number`   | `0`        | Skip first N results                                                                                                                      |
| `hoursOld`                 | `number`   | —          | Max job age in hours                                                                                                                      |
| `country`                  | `string`   | `USA`      | Country for Indeed/Glassdoor domain                                                                                                       |
| `descriptionFormat`        | `string`   | `markdown` | `markdown`, `html`, or `plain`                                                                                                            |
| `linkedinFetchDescription` | `boolean`  | `false`    | Fetch full LinkedIn descriptions (slower)                                                                                                 |
| `linkedinCompanyIds`       | `number[]` | —          | Filter LinkedIn by company IDs                                                                                                            |
| `enforceAnnualSalary`      | `boolean`  | `false`    | Convert all wages to annual equivalent                                                                                                    |
| `rateDelayMin`             | `number`   | —          | Minimum delay between requests in seconds                                                                                                 |
| `rateDelayMax`             | `number`   | —          | Maximum delay between requests in seconds                                                                                                 |
| `requestTimeout`           | `number`   | `60`       | Request timeout in seconds                                                                                                                |
| `proxies`                  | `string[]` | —          | Proxy URLs for rotation (`host:port` or `user:pass@host:port`)                                                                            |
| `caCert`                   | `string`   | —          | Path to CA certificate for proxies                                                                                                        |
| `userAgent`                | `string`   | —          | Custom User-Agent string                                                                                                                  |

---

## Response Schema

```
JobPost
├── id
├── site
├── title
├── companyName
├── companyUrl
├── jobUrl
├── jobUrlDirect
├── location
│   ├── city
│   ├── state
│   └── country
├── description
├── datePosted
├── isRemote
├── jobType[]                    fulltime, parttime, internship, contract
├── compensation
│   ├── interval                 yearly, monthly, weekly, daily, hourly
│   ├── minAmount
│   ├── maxAmount
│   └── currency
├── emails[]
├── listingType
│
├── jobLevel                     (LinkedIn)
├── jobFunction                  (LinkedIn)
├── companyIndustry              (LinkedIn, Indeed)
│
├── companyAddresses             (Indeed)
├── companyNumEmployees          (Indeed)
├── companyRevenue               (Indeed)
├── companyDescription           (Indeed)
├── companyLogo                  (Indeed)
├── bannerPhotoUrl               (Indeed)
│
├── skills[]                     (Naukri)
├── experienceRange              (Naukri)
├── companyRating                (Naukri)
├── companyReviewsCount          (Naukri)
├── vacancyCount                 (Naukri)
└── workFromHomeType             (Naukri)
```

---

## Project Structure

```
ever-jobs/
├── apps/
│   ├── api/                          NestJS REST API
│   │   └── src/
│   │       ├── main.ts               Bootstrap + Swagger + CORS
│   │       ├── app.module.ts         Root module (config, guards, interceptors)
│   │       ├── auth/                 API key authentication guard
│   │       ├── cache/                In-memory TTL cache service
│   │       ├── config/               Configuration module (env vars)
│   │       ├── filters/              Global exception filter
│   │       ├── health/               Health check endpoints
│   │       ├── interceptors/         Request logging interceptor
│   │       └── jobs/
│   │           ├── jobs.controller.ts    POST /api/jobs/search + /analyze
│   │           ├── jobs.service.ts       Concurrent aggregation + post-processing
│   │           └── jobs.module.ts        Imports all source + analytics modules
│   │
│   └── cli/                          nest-commander CLI application
│       └── src/
│           ├── main.ts               CLI bootstrap (CommandFactory)
│           ├── cli.module.ts         Imports all source + analytics modules
│           └── commands/
│               ├── search.command.ts    CLI search with --analyze, --bd, 30+ options
│               └── compare.command.ts   Multi-site comparison with table output
│
├── packages/
│   ├── models/                       @ever-jobs/models
│   ├── common/                       @ever-jobs/common (HttpClient, converters, utils)
│   ├── analytics/                    @ever-jobs/analytics
│   └── source-*/                     Per-site source modules (×11)
│
├── .github/
│   ├── workflows/ci.yml              CI pipeline (build, type-check, Docker)
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   └── SUPPORT.md
│
├── docs/                             Project documentation
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── API_CHANGELOG.md
│   ├── DEPLOYMENT.md
│   ├── FAQ.md
│   ├── GLOSSARY.md
│   ├── PERFORMANCE_TUNING.md
│   ├── ROADMAP.md
│   ├── SECURITY_GUIDELINES.md
│   └── UPGRADE_GUIDE.md
│
├── Dockerfile                        Multi-stage Docker build
├── docker-compose.yml                Production deployment
├── docker-compose.dev.yml            Development with hot-reload
├── Makefile                          Dev & Docker shortcuts
├── .env.example                      Environment variable template
├── tool_manifest.json                Machine-readable tool metadata for MCP/LLMs
├── package.json
├── tsconfig.base.json
├── nx.json
└── nest-cli.json
```

---

## Architecture

### Modular Design

Each job board source is an independent NestJS package that implements the `IScraper` interface:

```typescript
interface IScraper {
  scrape(input: ScraperInputDto): Promise<JobResponseDto>;
}
```

This means you can:

- **Import individual packages** into your own NestJS application
- **Add new sources** by creating a new package that implements `IScraper`
- **Test sources independently** without the API layer

### Concurrent Execution

The `JobsService` orchestrator runs all selected sources concurrently using `Promise.allSettled`. Individual source failures don't affect other sources — results from successful sources are still returned.

### Post-Processing Pipeline

After searching, the orchestrator applies post-processing:

1. **Tag jobs with source** — Each job is tagged with its originating site
2. **Salary enrichment** — For USA jobs without direct compensation, salary is extracted from the description text
3. **Annual salary normalization** — When `enforceAnnualSalary` is enabled, hourly/monthly/weekly wages are converted to annual equivalents
4. **Sorting** — Results are sorted by site name, then by date posted (newest first)

### HTTP Client

A custom `HttpClient` wraps Axios with:

- **Rotating proxy support** — Round-robin through HTTP/HTTPS/SOCKS5 proxies
- **Rate limiting** — Configurable min/max delay between requests
- **Automatic retries** — Configurable retry logic with exponential backoff
- **Custom CA certificates** — For enterprise proxy setups
- **Configurable timeouts** — Per-request and global timeout settings

---

## Supported Countries

### LinkedIn & Google

Search globally using the `location` parameter.

### ZipRecruiter

Searches US and Canada using the `location` parameter.

### Indeed & Glassdoor

Support 65+ countries via the `country` parameter. Use `location` to narrow within a country.

|                |               |               |             |
| -------------- | ------------- | ------------- | ----------- |
| Argentina      | Australia\*   | Austria\*     | Bahrain     |
| Bangladesh     | Belgium\*     | Brazil\*      | Canada\*    |
| Chile          | China         | Colombia      | Costa Rica  |
| Czech Republic | Denmark       | Ecuador       | Egypt       |
| Finland        | France\*      | Germany\*     | Greece      |
| Hong Kong\*    | Hungary       | India\*       | Indonesia   |
| Ireland\*      | Israel        | Italy\*       | Japan       |
| Kuwait         | Luxembourg    | Malaysia      | Mexico\*    |
| Morocco        | Netherlands\* | New Zealand\* | Nigeria     |
| Norway         | Oman          | Pakistan      | Panama      |
| Peru           | Philippines   | Poland        | Portugal    |
| Qatar          | Romania       | Saudi Arabia  | Singapore\* |
| South Africa   | South Korea   | Spain\*       | Sweden      |
| Switzerland\*  | Taiwan        | Thailand      | Turkey      |
| Ukraine        | UAE           | UK\*          | USA\*       |
| Uruguay        | Venezuela     | Vietnam\*     |             |

_\* indicates Glassdoor support_

### Bayt

Searches internationally using `searchTerm` only.

### Naukri

India-specific. Supports INR salary parsing (Lakhs/Crores).

### BDJobs

Bangladesh-specific.

### Internshala

India-specific. Supports both internships and full-time jobs. Extracts stipend, duration, and apply-by dates.

### Exa

Global AI-powered job search via the [Exa API](https://exa.ai). Requires `EXA_API_KEY` environment variable.

### Upwork

Global freelance marketplace. Uses the official [Upwork SDK](https://github.com/upwork/node-upwork-oauth2) with GraphQL API (`marketplaceJobPostings` query). Requires the following environment variables:

| Variable               | Description                       |
| ---------------------- | --------------------------------- |
| `UPWORK_CLIENT_ID`     | OAuth2 application client ID      |
| `UPWORK_CLIENT_SECRET` | OAuth2 application client secret  |
| `UPWORK_ACCESS_TOKEN`  | Pre-obtained OAuth2 access token  |
| `UPWORK_REFRESH_TOKEN` | Pre-obtained OAuth2 refresh token |

Get API credentials at [developers.upwork.com](https://developers.upwork.com). Without credentials, Upwork searches gracefully return empty results.

---

## Using Individual Packages

Each source package can be used independently in your own NestJS application:

```typescript
import { Module } from "@nestjs/common";
import { LinkedInModule, LinkedInService } from "@ever-jobs/source-linkedin";
import { ScraperInputDto } from "@ever-jobs/models";

@Module({
  imports: [LinkedInModule],
})
export class MyModule {
  constructor(private readonly linkedin: LinkedInService) {}

  async searchLinkedIn() {
    const input = new ScraperInputDto({
      searchTerm: "TypeScript developer",
      location: "Remote",
      resultsWanted: 10,
      linkedinFetchDescription: true,
    });

    const response = await this.linkedin.scrape(input);
    console.log(`Found ${response.jobs.length} LinkedIn jobs`);
  }
}
```

---

## Tips & Limitations

> **Indeed** is generally the most reliable source with minimal rate limiting.

> **LinkedIn** is the most restrictive — it typically rate-limits around the 10th page from a single IP. Using proxies is strongly recommended.

> **Google Jobs** requires specific search syntax. For best results, search for Google Jobs in your browser, apply filters, and use the resulting search query as `googleSearchTerm`.

> **All job boards** cap results at approximately 1,000 jobs per search query.

### Indeed Limitations

Only **one** of these filters can be active per search:

- `hoursOld`
- `jobType` + `isRemote`
- `easyApply`

### LinkedIn Limitations

Only **one** of these filters can be active per search:

- `hoursOld`
- `easyApply`

---

## FAQ

**Q: Indeed is returning unrelated jobs?**
Indeed searches job descriptions too. Use `-` to exclude terms and `""` for exact match:

```
"engineering intern" software summer (java OR python OR c++) 2025 -tax -marketing
```

**Q: Getting 429 (Too Many Requests)?**
You've been rate-limited. Solutions:

- Use `rateDelayMin` and `rateDelayMax` to add configurable delay between requests
- Use the `proxies` parameter to rotate IPs
- Reduce `resultsWanted`

**Q: No results from Google?**
Google requires very specific query syntax. Search for jobs on Google in your browser, then copy the exact search box text into `googleSearchTerm`.

---

## Development

### Build

```bash
npm run build
```

### Type Check

```bash
npx tsc --project tsconfig.base.json --noEmit
```

### Production Start

```bash
npm run start:prod
```

---

## ChatGPT & LLM Integration

Ever Jobs is designed to be used as a tool by ChatGPT, Claude, and other LLMs.

### Quick Start

```bash
# Basic search via JSON stdin
echo '{"searchTerm": "data scientist", "siteType": ["indeed"], "resultsWanted": 5}' | npm run cli -- search --stdin

# Search with analysis
npm run cli -- search --search-term "devops" --site indeed --analyze

# BD intelligence mode
npm run cli -- search --search-term "machine learning" --site linkedin --bd

# Multi-site comparison
npm run cli -- compare --search-term "backend developer" --results 10

# API endpoint for analysis
curl -X POST http://localhost:3000/api/jobs/analyze \
  -H 'Content-Type: application/json' \
  -d '{"searchTerm": "fullstack", "siteType": ["indeed"], "resultsWanted": 10}'
```

### Analytics Features

| Feature         | CLI Flag          | API Endpoint             | Description                           |
| --------------- | ----------------- | ------------------------ | ------------------------------------- |
| Summary stats   | `--analyze`       | `POST /api/jobs/analyze` | Remote %, salary range, top companies |
| BD intelligence | `--bd`            | —                        | Company analysis with hiring velocity |
| Site comparison | `compare` command | —                        | Cross-board metrics comparison table  |

### Prompt Templates

**Job Market Research:**

```
Search for "senior react developer" jobs in San Francisco on Indeed and LinkedIn.
Use the analyze flag to get summary statistics.

Input: {"searchTerm": "senior react developer", "location": "San Francisco, CA", "siteType": ["indeed", "linkedin"], "resultsWanted": 20}
```

**BD Intelligence:**

```
Find companies hiring AI/ML engineers. Identify which companies have the most
open positions and what locations they're hiring in.

Input: {"searchTerm": "AI ML engineer", "siteType": ["indeed", "linkedin"], "resultsWanted": 50}
Use --bd flag for company-level analysis.
```

**Multi-Site Comparison:**

```
Compare results for "data engineer" across all job boards.
Which board has the most listings? Best salary coverage?

Run: npm run cli -- compare --search-term "data engineer" --results 15
```

### Resources

| File                                       | Description                                    |
| ------------------------------------------ | ---------------------------------------------- |
| [`tool_manifest.json`](tool_manifest.json) | Machine-readable tool metadata for MCP servers |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-source`)
3. Implement your source package in `packages/source-<name>/`
4. Ensure it implements the `IScraper` interface
5. Add the module to `apps/api/src/jobs/jobs.module.ts`
6. Submit a pull request

## ⚠️ Legal Disclaimer

**This software is provided for educational and research purposes only.**

### No Warranty

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, CONTRIBUTORS, OR COPYRIGHT HOLDERS (INCLUDING EVER CO) BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### Data Collection & Unofficial API Risks

Several source modules in this project interact with third-party websites using **unofficial, undocumented APIs** or **HTML parsing techniques**. By using these modules, you acknowledge and accept the following risks:

- **Account suspension or ban** — Your user accounts on job boards (LinkedIn, Indeed, Glassdoor, etc.) may be temporarily or permanently suspended if the platform detects automated access that violates their Terms of Service.
- **IP blocking** — Your IP address may be rate-limited or blocked by target websites.
- **Terms of Service violations** — Automated data collection may violate the Terms of Service of the target platforms. It is **your responsibility** to review and comply with each platform's ToS before using the corresponding source module.
- **Data usage restrictions** — Job listing data obtained through this software may be subject to copyright or other legal protections. You are solely responsible for ensuring your use of the data complies with all applicable laws and regulations.

### Limitation of Liability

Ever Co and the contributors to this project:

- **Do not endorse or encourage** the violation of any website's Terms of Service.
- **Are not responsible** for any consequences resulting from the use of this software, including but not limited to account bans, legal action, data loss, or financial damages.
- **Make no guarantees** about the accuracy, completeness, or reliability of the collected data.
- **Accept no liability** for how this software is used by third parties.

**Use at your own risk.** If you are unsure about the legality of automated data collection from a particular website in your jurisdiction, consult a legal professional before proceeding.

---

## License

MIT © [Ever Co](https://github.com/ever-co)

---

## Credits

This project is a TypeScript/NestJS port of the original Python [JobSpy](https://github.com/speedyapply/JobSpy) library by Cullen Watson, re-architected as a modular monorepo for server-side deployment and package reuse. In addition, it also implements features from [JobSpy-api](https://github.com/rainmanjam/jobspy-api) in TypeScript/NestJS.
