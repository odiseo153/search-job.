# Phase 12: ATS & Niche Board Expansion Plan

**Author:** AI Assistant
**Date:** 2026-02-24
**Status:** Complete
**Epic:** Source Expansion - Phase 12

---

## 1. Overview

Expand ever-jobs from **98+ sources** to **101+ sources** by adding a creative job board API and two more ATS platform integrations.

---

## 2. New Sources

### 2.1 Authentic Jobs (Creative/Dev Job Board)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-authenticjobs` |
| **Site Enum** | `AUTHENTICJOBS` |
| **API**       | `GET https://authenticjobs.com/api/?method=aj.jobs.search&api_key=XXX&format=json` |
| **Auth**      | API key via `api_key` query parameter |
| **Format**    | JSON (default XML, must specify `format=json`) |
| **Coverage**  | Design & development job listings |
| **Notes**     | Parameters: keyword, category, type, sort, city, state, telecommuting, page, count (max 100). Also has `aj.jobs.getRecent` method. |

### 2.2 JobScore (ATS Platform)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-ats-jobscore` |
| **Site Enum** | `JOBSCORE` |
| **API**       | `GET https://careers.jobscore.com/jobs/{companySlug}/feed.json` |
| **Auth**      | None (public per-company feed) |
| **Format**    | JSON |
| **Coverage**  | Thousands of companies using JobScore ATS |
| **Notes**     | Similar to Greenhouse/Lever pattern. URL params: sort=date, limit=N. companySlug required. |

### 2.3 TalentLyft (ATS Platform)

| Field         | Value |
| ------------- | ----- |
| **Package**   | `source-ats-talentlyft` |
| **Site Enum** | `TALENTLYFT` |
| **API**       | `GET https://api.talentlyft.com/v2/public/{subdomain}/jobs` |
| **Auth**      | Bearer token (API key) |
| **Format**    | JSON, paginated (page, perPage) |
| **Coverage**  | European companies using TalentLyft ATS |
| **Notes**     | OpenAPI/Swagger documented. Supports department and location filtering. companySlug = subdomain. |

---

## 3. Success Criteria

- [x] All new sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated
