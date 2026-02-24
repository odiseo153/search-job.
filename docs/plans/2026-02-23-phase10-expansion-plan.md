# Phase 10: Government Boards & ATS Expansion Plan

**Author:** AI Assistant
**Date:** 2026-02-23
**Status:** Complete
**Epic:** Source Expansion - Phase 10

---

## 1. Overview

Expand ever-jobs from **90+ sources** to **94+ sources** by adding government job boards with free APIs and simple ATS integrations. Focus on high-value, well-documented APIs that unlock large job databases.

---

## 2. New Sources

### 2.1 CareerOneStop (US Department of Labor)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-careeronestop` |
| **Site Enum** | `CAREERONESTOP` |
| **API**       | `GET https://api.careeronestop.org/v2/jobsearch/{userId}/{keyword}/{location}/{radius}/{sortColumns}/{sortOrder}/{startRecord}/{pageSize}/{days}` |
| **Auth**      | Bearer token (free registration at careeronestop.org) |
| **Format**    | JSON |
| **Coverage**  | Millions of US jobs via National Labor Exchange (NLx) |
| **Notes**     | Government-quality structured data. Complements existing USAJobs with private sector data. |

### 2.2 Arbeitsagentur (German Federal Employment Agency)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-arbeitsagentur` |
| **Site Enum** | `ARBEITSAGENTUR` |
| **API**       | `GET https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs` |
| **Auth**      | X-API-Key header |
| **Format**    | JSON |
| **Coverage**  | Largest job database in Germany |
| **Notes**     | Well-documented by bundesAPI GitHub organization. |

### 2.3 Jobylon (Scandinavian ATS)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-ats-jobylon` |
| **Site Enum** | `JOBYLON` |
| **API**       | `GET https://feed.jobylon.com/feeds/{hash}/?format=json` |
| **Auth**      | None (hash-based, per-client feed URL) |
| **Format**    | JSON (rich data: title, description, location with coordinates, skills, benefits) |
| **Coverage**  | Hundreds of Nordic companies |
| **Notes**     | Public feed per company. Very rich data model. companySlug = feed hash. |

### 2.4 Homerun (European ATS)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-ats-homerun` |
| **Site Enum** | `HOMERUN` |
| **API**       | `GET https://app.homerun.co/api/v2/jobs` |
| **Auth**      | Bearer token (API key from Homerun Integrations page) |
| **Format**    | JSON, paginated |
| **Coverage**  | Thousands of European SMBs |
| **Notes**     | Well-documented at developers.homerun.co. Rate limit: 60 req/min. |

---

## 3. Integration Approach

Same established pattern as Phase 9:
1. Create package directory under `packages/source-{name}/`
2. Implement IScraper interface
3. Add Site enum value
4. Add tsconfig + jest path mappings
5. Wire into jobs.module.ts, jobs.service.ts, cli.module.ts, MCP tools.ts
6. Add E2E test

---

## 4. Implementation Priority

1. **CareerOneStop** — Millions of US private-sector jobs, free API
2. **Arbeitsagentur** — Largest German job DB, opens European coverage
3. **Jobylon** — Simple public feed, rich data, Nordic market
4. **Homerun** — Well-documented API, European SMB market

---

## 5. Future Phases (from research)

### High-Value ATS Targets (Phase 11+)
- **Dayforce/Ceridian** — 6K+ orgs, Basic Auth/OAuth
- **Sage HR** — 10K+ companies, API key auth
- **Factorial HR** — 10K+ companies, OAuth 2.0
- **Zoho Recruit** — 10K+ companies, OAuth 2.0
- **TalentLyft** — OpenAPI/Swagger spec available
- **Cornerstone OnDemand** — 7K+ orgs, enterprise
- **Oracle Recruiting Cloud** — F500 coverage (JPMorgan, etc.)
- **Eightfold AI** — 1K+ enterprises, AI-driven
- **Paycor** — 30K+ companies, mid-market

### Government Boards (Phase 11+)
- **EURES** — 2M+ EU/EEA jobs, 27 countries
- **Switzerland Job-Room** — Official Swiss government board
- **NHS Jobs (UK)** — All NHS vacancies
- **India NCS** — Government of India jobs

### Key Architectural Insight
Many Fortune 500 companies (Intel, Adobe, Cisco, Disney, Samsung, J&J) use Workday. The existing Workday scraper could be enhanced with pre-configured company slugs to unlock hundreds of F500 integrations at once. See COMPANY_SLUG_DIRECTORY.md for existing Workday slugs.

---

## 6. Success Criteria

- [x] All new sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated
