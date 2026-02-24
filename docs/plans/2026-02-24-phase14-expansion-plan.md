# Phase 14: API-Key Sources & ATS Expansion Plan

**Author:** AI Assistant
**Date:** 2026-02-24
**Status:** Complete
**Epic:** Source Expansion - Phase 14

---

## 1. Overview

Expand ever-jobs from **111+ sources** to **116+ sources** by adding 1 major job aggregator, 1 European market board, and 3 ATS platforms — all with free API-key registration.

---

## 2. New Sources

### 2.1 Talroo / Jobs2Careers (Job Aggregator)

| Field | Value |
|-------|-------|
| **Package** | `source-talroo` |
| **Site Enum** | `TALROO` |
| **API** | `GET https://api.jobs2careers.com/api/search.php` |
| **Auth** | Publisher ID + Password (free registration at talroo.com/publisher/) |
| **Format** | JSON |
| **Params** | `id`, `pass`, `q`, `l`, `ip`, `limit` (0-200), `start`, `format=json`, `full_desc`, `logo` |
| **Coverage** | Millions of jobs globally |
| **Notes** | IP parameter required. ML-optimized ranking. CPC monetization available. |

### 2.2 InfoJobs (European Market)

| Field | Value |
|-------|-------|
| **Package** | `source-infojobs` |
| **Site Enum** | `INFOJOBS` |
| **API** | `GET https://api.infojobs.net/api/7/offer` |
| **Auth** | Basic Auth (client_id:client_secret from developer.infojobs.net) |
| **Format** | JSON |
| **Params** | `q`, `province`, `companyName` |
| **Coverage** | Spain & Italy (largest job site in Southern Europe) |
| **Notes** | Free app registration. Public offer search endpoint uses Basic Auth with app credentials. |

### 2.3 Crelate (ATS Platform)

| Field | Value |
|-------|-------|
| **Package** | `source-ats-crelate` |
| **Site Enum** | `CRELATE` |
| **API** | `GET https://app.crelate.com/api3/jobs` |
| **Auth** | `X-Api-Key` header or `api_key` query param |
| **Format** | JSON |
| **Params** | `published=true`, `offset`, `limit` |
| **Coverage** | Thousands of companies |
| **Notes** | Full OpenAPI spec. Rate limit ~120 req/min. companySlug = API key. |

### 2.4 iSmartRecruit (ATS Platform)

| Field | Value |
|-------|-------|
| **Package** | `source-ats-ismartrecruit` |
| **Site Enum** | `ISMARTRECRUIT` |
| **API** | `GET https://app.ismartrecruit.com/WebsiteJSONAPI` |
| **Auth** | `apiKey` query parameter |
| **Format** | JSON |
| **Params** | `apiKey`, `jobTitle`, `city`, `country`, `jobCategory`, `start`, `numOfRecords` |
| **Coverage** | Per-customer ATS |
| **Notes** | Simple JSON API. companySlug = API key. |

### 2.5 Recruiterflow (ATS Platform)

| Field | Value |
|-------|-------|
| **Package** | `source-ats-recruiterflow` |
| **Site Enum** | `RECRUITERFLOW` |
| **API** | `GET https://api.recruiterflow.com/api/external/job/list` |
| **Auth** | `RF-Api-Key` header |
| **Format** | JSON |
| **Params** | Pagination |
| **Coverage** | Per-customer ATS |
| **Notes** | Swagger/OpenAPI documented. companySlug = API key. |

---

## 3. Success Criteria

- [x] All 5 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated
