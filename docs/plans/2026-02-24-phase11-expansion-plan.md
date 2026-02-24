# Phase 11: Niche Boards & Developer API Expansion Plan

**Author:** AI Assistant
**Date:** 2026-02-24
**Status:** Complete
**Epic:** Source Expansion - Phase 11

---

## 1. Overview

Expand ever-jobs from **94+ sources** to **98+ sources** by adding developer-focused job boards and aggregator APIs with free/public access. Focus on no-auth and free-tier APIs with well-documented endpoints.

---

## 2. New Sources

### 2.1 Hacker News Jobs (Y Combinator)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-hackernews` |
| **Site Enum** | `HACKERNEWS` |
| **API**       | `GET https://hacker-news.firebaseio.com/v0/jobstories.json` → item IDs, then `GET /v0/item/{id}.json` |
| **Auth**      | None (completely free, no rate limit) |
| **Format**    | JSON |
| **Coverage**  | Up to 200 latest YC startup job postings |
| **Notes**     | Official Firebase API. Job items have: title, text (HTML), url, by, time, score. Search by filtering title/text locally. |

### 2.2 Landing.jobs (European Tech Jobs)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-landingjobs` |
| **Site Enum** | `LANDINGJOBS` |
| **API**       | `GET https://landing.jobs/api/v1/jobs` |
| **Auth**      | None (public endpoint for job listings) |
| **Format**    | JSON, paginated (offset/limit, max 50 per page) |
| **Coverage**  | European tech jobs with relocation support |
| **Notes**     | Rich data: salary_low/salary_high, currency_code, remote flag, relocation_paid, tags. GitHub-documented API. |

### 2.3 FindWork.dev (Developer Jobs)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-findwork` |
| **Site Enum** | `FINDWORK` |
| **API**       | `GET https://findwork.dev/api/jobs/` |
| **Auth**      | Token header (`Token xxxx`) — free API key |
| **Format**    | JSON |
| **Coverage**  | Developer/tech jobs aggregated from multiple sources |
| **Notes**     | Supports search query params. Token-based auth (similar to existing USAJobs pattern). |

### 2.4 JobDataAPI (Global Jobs Aggregator)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-jobdataapi` |
| **Site Enum** | `JOBDATAAPI` |
| **API**       | `GET https://jobdataapi.com/api/jobs/` |
| **Auth**      | API key (optional, 10 req/hour free without key) |
| **Format**    | JSON, OpenAPI 3.0 documented |
| **Coverage**  | Thousands of companies globally, all industries |
| **Notes**     | Rich filtering: title, location, company. Full job post data including description, application link, company info. |

---

## 3. Integration Approach

Same established pattern as Phase 9/10:
1. Create package directory under `packages/source-{name}/`
2. Implement IScraper interface
3. Add Site enum value
4. Add tsconfig + jest path mappings
5. Wire into jobs.module.ts, jobs.service.ts, cli.module.ts, MCP tools.ts
6. Add E2E test

---

## 4. Implementation Priority

1. **Hacker News Jobs** — Completely free, no auth, iconic tech job source
2. **Landing.jobs** — Free public API, rich European tech data with salary info
3. **FindWork.dev** — Developer-focused, API key required
4. **JobDataAPI** — Global aggregator, free tier available

---

## 5. Success Criteria

- [x] All new sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated
