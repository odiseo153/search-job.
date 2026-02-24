# Phase 9: Job Board & Source Expansion Plan

**Author:** AI Assistant
**Date:** 2026-02-23
**Status:** Complete
**Epic:** Source Expansion - Phase 9

---

## 1. Overview

Expand ever-jobs from **82+ sources** to **90+ sources** by adding new job boards with public APIs, additional company scrapers, and international job aggregators. Focus on sources with well-documented, free, public APIs for maximum reliability.

---

## 2. New Job Board Sources

### 2.1 The Muse (Public API, No Auth)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-themuse` |
| **Site Enum** | `THEMUSE` |
| **API**       | `GET https://www.themuse.com/api/public/jobs?page={n}&category={cat}&location={loc}` |
| **Auth**      | None (public API) |
| **Format**    | JSON `{ results: [...], page: N, page_count: N, total: N }` |
| **Coverage**  | Thousands of tech/business jobs, popular with career seekers |
| **Notes**     | Pagination via `page` param. Filter by `category`, `level`, `location`, `company`. |

### 2.2 Working Nomads (Public API, No Auth)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-workingnomads` |
| **Site Enum** | `WORKINGNOMADS` |
| **API**       | `GET https://www.workingnomads.co/api/exposed_jobs/` |
| **Auth**      | None |
| **Format**    | JSON array |
| **Coverage**  | Remote jobs worldwide, curated listings |
| **Notes**     | Simple JSON array. Fields: `company_name`, `title`, `description`, `url`, `category_name`, `pub_date`, `tags`, `location`. |

### 2.3 4DayWeek.io (Public API, No Auth)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-4dayweek` |
| **Site Enum** | `FOURDAYWEEK` |
| **API**       | `GET https://4dayweek.io/api/jobs` |
| **Auth**      | None |
| **Format**    | JSON |
| **Coverage**  | 4-day work week jobs, growing niche |
| **Notes**     | Modern work-life balance focused board. |

### 2.4 Startup.jobs (Public, No Auth)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-startupjobs` |
| **Site Enum** | `STARTUPJOBS` |
| **API**       | `GET https://startup.jobs/api/jobs` or `GET https://startup.jobs/feed.json` |
| **Auth**      | None |
| **Format**    | JSON |
| **Coverage**  | Startup jobs worldwide |
| **Notes**     | JSON feed of startup job listings. |

### 2.5 NoDesk (Public API, No Auth)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-nodesk` |
| **Site Enum** | `NODESK` |
| **API**       | `GET https://nodesk.co/api/jobs/` |
| **Auth**      | None |
| **Format**    | JSON |
| **Coverage**  | Remote and flexible jobs |
| **Notes**     | Remote-first job board with simple API. |

### 2.6 Web3 Career (Public, No Auth)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-web3career` |
| **Site Enum** | `WEB3CAREER` |
| **API**       | `GET https://web3.career/api/v1?token=public` |
| **Auth**      | None (public token) |
| **Format**    | JSON |
| **Coverage**  | Web3/crypto/blockchain jobs |
| **Notes**     | Niche but growing fast. |

### 2.7 Echojobs (Public, No Auth)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-echojobs` |
| **Site Enum** | `ECHOJOBS` |
| **API**       | `GET https://echojobs.io/api/jobs` |
| **Auth**      | None |
| **Format**    | JSON |
| **Coverage**  | Tech jobs from top companies |
| **Notes**     | Curated tech job listings. |

### 2.8 Jobstreet (SEEK API)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-jobstreet` |
| **Site Enum** | `JOBSTREET` |
| **API**       | `GET https://www.jobstreet.com/api/chalice-search/v4/search` |
| **Auth**      | None |
| **Format**    | JSON |
| **Coverage**  | Major Southeast Asian job board (Malaysia, Singapore, Indonesia, Philippines) |
| **Notes**     | Owned by SEEK. GraphQL/REST search API. |

---

## 3. Integration Approach

Each new source follows the established pattern:
1. Create package directory under `packages/source-{name}/`
2. Implement IScraper interface
3. Add Site enum value
4. Add tsconfig + jest path mappings
5. Wire into jobs.module.ts, jobs.service.ts
6. Add E2E test

---

## 4. Implementation Priority

1. **The Muse** — Most established, well-documented API
2. **Working Nomads** — Simple API, remote job niche
3. **4DayWeek** — Growing niche, unique value
4. **Startup.jobs** — Complements existing boards
5. **NoDesk** — Remote jobs niche
6. **Web3 Career** — Web3/crypto niche
7. **Echojobs** — Curated tech jobs
8. **Jobstreet** — Major SEA market coverage

---

## 5. Success Criteria

- [x] All new sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated
