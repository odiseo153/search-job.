# Design: Phase 5 - ATS Platform Expansion + Company Sources

**Author:** AI Assistant
**Date:** 2026-02-22
**Status:** Approved
**Epic:** Source Expansion - Phase 5

---

## 1. Overview

Expand ever-jobs from **69 sources** (61 active + 8 experimental/new) to **82+ sources** by adding 10 new ATS platform integrations, 3 custom company scrapers, and a comprehensive company slug directory. Each new ATS platform unlocks hundreds to thousands of companies.

### Goal

Maximize the number of companies whose jobs can be fetched via public APIs, without scraping aggregator sites.

### Current State

| Category                | Count | Examples                                         |
| ----------------------- | ----- | ------------------------------------------------ |
| **Search Boards**       | 31    | LinkedIn, Indeed, Glassdoor, RemoteOK, Dice, ... |
| **ATS Integrations**    | 18+3  | Greenhouse, Workday, Lever, Ashby, iCIMS, ...    |
| **Company Scrapers**    | 12    | Amazon, Apple, Google, Meta, Netflix, OpenAI, ... |

### Key Finding

42 of 52 researched major companies (Spotify, Tesla, Disney, SpaceX, etc.) already work through existing ATS integrations with the right `companySlug`. The real value-add is new ATS platforms + documentation.

---

## 2. New ATS Platforms (10 packages)

Each package follows the established pattern: `packages/source-ats-{name}/` with module, service, constants, types, tests.

### 2.1 Manatal (No Auth - Public Endpoint)

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| **Package**   | `source-ats-manatal`                                    |
| **Site Enum** | `MANATAL`                                               |
| **API**       | `GET https://api.manatal.com/open/v1/career-page/{slug}/jobs/` |
| **Auth**      | None (public career page endpoint)                      |
| **Format**    | JSON                                                    |
| **Coverage**  | 160,000+ organizations (Asia-Pacific, global SMB)       |
| **Notes**     | Slug-based, similar to Greenhouse/Lever pattern         |

### 2.2 Paylocity (No Auth - GUID-based)

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Package**   | `source-ats-paylocity`                                       |
| **Site Enum** | `PAYLOCITY`                                                  |
| **API**       | `GET https://recruiting.paylocity.com/recruiting/api/feed/jobs/{guid}` |
| **Auth**      | None (company GUID acts as public identifier)                |
| **Format**    | JSON or XML (Accept header)                                  |
| **Coverage**  | 30,000+ US mid-market companies                              |
| **Notes**     | GUID discovered from company career page URL                 |

### 2.3 Freshteam (API Key)

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| **Package**   | `source-ats-freshteam`                                  |
| **Site Enum** | `FRESHTEAM`                                             |
| **API**       | `GET https://{company}.freshteam.com/api/job_postings`  |
| **Auth**      | API Key (`Authorization: Bearer {api_key}`)             |
| **Format**    | JSON                                                    |
| **Coverage**  | 1,000-5,000 companies globally                          |
| **Notes**     | Subdomain-based per-company pattern                     |

### 2.4 Bullhorn (Corp Token)

| Field         | Value                                                                          |
| ------------- | ------------------------------------------------------------------------------ |
| **Package**   | `source-ats-bullhorn`                                                          |
| **Site Enum** | `BULLHORN`                                                                     |
| **API**       | `GET https://public-rest{cls}.bullhornstaffing.com/rest-services/{token}/search/JobOrder` |
| **Auth**      | Corp Token (static per-company, public identifier)                             |
| **Format**    | JSON                                                                           |
| **Coverage**  | 10,000+ staffing agencies (#1 ATS for staffing)                                |
| **Notes**     | Corp token extracted from career portal JavaScript                             |

### 2.5 Trakstar Hire (API Key)

| Field         | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| **Package**   | `source-ats-trakstar`                                           |
| **Site Enum** | `TRAKSTAR`                                                      |
| **API**       | `GET https://{slug}.hire.trakstar.com/api/v1/openings`          |
| **Auth**      | API Key (Basic Auth, key as username, empty password)            |
| **Format**    | JSON                                                            |
| **Coverage**  | 5,000+ companies                                                |
| **Notes**     | Formerly RecruiterBox                                            |

### 2.6 HiringThing (API Key)

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| **Package**   | `source-ats-hiringthing`                                |
| **Site Enum** | `HIRINGTHING`                                           |
| **API**       | `GET https://api.hiringthing.com/api/v1/jobs`           |
| **Auth**      | API Key (Basic Auth)                                    |
| **Format**    | JSON                                                    |
| **Coverage**  | 500+ companies (white-label ATS)                        |
| **Notes**     | Also branded as ATS Anywhere                            |

### 2.7 Loxo (Slug-based)

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| **Package**   | `source-ats-loxo`                                       |
| **Site Enum** | `LOXO`                                                  |
| **API**       | `GET https://app.loxo.co/api/{slug}/jobs`               |
| **Auth**      | API Token (for full API); public for career board        |
| **Format**    | JSON                                                    |
| **Coverage**  | 1,000-3,000 recruiting firms                            |
| **Notes**     | Similar to Lever slug pattern                           |

### 2.8 Fountain (Bearer Token)

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| **Package**   | `source-ats-fountain`                                   |
| **Site Enum** | `FOUNTAIN`                                              |
| **API**       | `GET https://api.fountain.com/v2/openings`              |
| **Auth**      | Bearer Token (`Authorization: Bearer {api_key}`)        |
| **Format**    | JSON                                                    |
| **Coverage**  | 300+ enterprise companies (high-volume hourly hiring)   |
| **Notes**     | Used by Uber, Amazon for frontline hiring               |

### 2.9 Deel (Bearer Token)

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Package**   | `source-ats-deel`                                            |
| **Site Enum** | `DEEL`                                                       |
| **API**       | `GET https://api.letsdeel.com/rest/v2/ats/job-postings/`     |
| **Auth**      | Bearer Token (`Authorization: Bearer {api_token}`)           |
| **Format**    | JSON                                                         |
| **Coverage**  | 35,000+ customers (ATS module subset)                        |
| **Notes**     | Global hiring/EOR platform with ATS module                   |

### 2.10 Phenom People (Per-Company Public Endpoints)

| Field         | Value                                                       |
| ------------- | ----------------------------------------------------------- |
| **Package**   | `source-ats-phenom`                                         |
| **Site Enum** | `PHENOM`                                                    |
| **API**       | `GET https://jobs.{company}.com/api/jobs` or similar        |
| **Auth**      | None (per-company public career site API)                   |
| **Format**    | JSON                                                        |
| **Coverage**  | 900+ enterprises (Boeing, Hilton, Nestle, Comcast, Verizon) |
| **Notes**     | Each company has a Phenom-powered career site with REST API |

---

## 3. Custom Company Scrapers (3 packages)

For companies with unique APIs not covered by any ATS.

### 3.1 IBM

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| **Package**   | `source-company-ibm`                                    |
| **Site Enum** | `IBM`                                                   |
| **API**       | `__NEXT_DATA__` JSON extraction from `careers.ibm.com`  |
| **Method**    | GET + parse embedded JSON (same as Meta scraper)        |
| **Auth**      | None                                                    |
| **Notes**     | Custom Watson-AI career platform                        |

### 3.2 Boeing

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| **Package**   | `source-company-boeing`                                 |
| **Site Enum** | `BOEING`                                                |
| **API**       | `GET https://jobs.boeing.com/api/jobs`                  |
| **Method**    | REST GET with query params                              |
| **Auth**      | None                                                    |
| **Notes**     | Phenom-powered but unique endpoint pattern              |

### 3.3 Zoom

| Field         | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| **Package**   | `source-company-zoom`                                           |
| **Site Enum** | `ZOOM`                                                          |
| **API**       | `GET https://zoom.eightfold.ai/api/pcsx/search`                |
| **Method**    | REST GET (same as Microsoft/Nvidia pattern)                     |
| **Auth**      | None                                                            |
| **Notes**     | Eightfold PCSX API, identical pattern to existing Nvidia source |

---

## 4. Company Slug Directory

A new documentation file `docs/COMPANY_SLUG_DIRECTORY.md` listing 50+ verified company slugs organized by ATS platform. This is pure documentation - no code changes needed - but dramatically increases the project's usability.

### Greenhouse Companies (25+)

spotify, airbnb, discord, spacex, cloudflare, twilio, databricks, datadog, mongodb, elastic, snowflake, roblox, unity, shopify, atlassian, canva, pinterest, lyft, doordash, instacart, snap, rivian, lucidmotors, block (Square/CashApp), twitter

### Workday Companies (16+)

salesforce:12:External, intel:1:External, cisco:5:Cisco_External, adobe:5:External, epicgames:5:EpicExternalSite, warnerbros:5:WarnerBros, disney:5:disneycareer, deloitte:5:DeloitteUSCareers, mckinsey:5:External, tesla:5:Tesla, qualcomm:5:External, amd:5:External, broadcom:5:External, samsung:3:Global, siemens:3:External, lmco:5:LMCareers

### Lever Companies (5+)

palantir, ...

### Taleo Companies (3+)

oracle:ORACLEEXT, jpmorganchase:ExternalCareerSite, ...

### iCIMS Companies (5+)

ea, take2games, goldmansachs, ...

### SuccessFactors Companies (3+)

sap:SAP, ...

---

## 5. Integration Touchpoints

### 5.1 Models Package

- Add 13 new values to `Site` enum: MANATAL, PAYLOCITY, FRESHTEAM, BULLHORN, TRAKSTAR, HIRINGTHING, LOXO, FOUNTAIN, DEEL, PHENOM, IBM, BOEING, ZOOM
- Add auth DTOs for sources requiring API keys: FreshteamAuthDto, BullhornAuthDto, TrakstarAuthDto, HiringThingAuthDto, FountainAuthDto, DeelAuthDto
- Add new auth fields to `AuthDto` parent class

### 5.2 Jobs Module (apps/api)

- Import all 13 new modules in `jobs.module.ts`
- Register all 13 scrapers in `jobs.service.ts` scraper map

### 5.3 Environment Variables (.env.example)

```
# Phase 5: New ATS integrations
FRESHTEAM_API_KEY=
BULLHORN_CORP_TOKEN=
TRAKSTAR_API_KEY=
HIRINGTHING_API_KEY=
FOUNTAIN_API_KEY=
DEEL_API_TOKEN=
LOXO_API_TOKEN=
```

### 5.4 TypeScript Path Mappings (tsconfig.base.json)

Add 13 new path aliases:
```json
"@ever-jobs/source-ats-manatal": ["packages/source-ats-manatal/src"],
"@ever-jobs/source-ats-paylocity": ["packages/source-ats-paylocity/src"],
...
```

### 5.5 Test Updates

- Add 13 new mock entries in `jobs.service.spec.ts`
- Each new package gets its own `__tests__/*.e2e-spec.ts`

### 5.6 Documentation Updates

- Update README.md source tables (ATS and Company sections)
- Update `docs/ATS_INTEGRATIONS.md`
- Create `docs/COMPANY_SLUG_DIRECTORY.md`
- Update `docs/PRD_NEW_JOB_SOURCES.md` with Phase 5 status
- Update `docs/ROADMAP.md`

---

## 6. Package Structure Template

Each new ATS package follows this structure:

```
packages/source-ats-{name}/
├── src/
│   ├── index.ts                 # Export module + service
│   ├── {name}.module.ts         # NestJS module
│   ├── {name}.service.ts        # IScraper implementation
│   ├── {name}.constants.ts      # API URLs, headers
│   └── {name}.types.ts          # TypeScript interfaces for API responses
├── __tests__/
│   └── {name}.e2e-spec.ts       # Live API integration test
├── package.json                  # @ever-jobs/source-ats-{name}
└── tsconfig.json                 # Extends ../../tsconfig.base.json
```

Each company scraper follows:

```
packages/source-company-{name}/
├── src/
│   ├── index.ts
│   ├── {name}.module.ts
│   ├── {name}.service.ts
│   ├── {name}.constants.ts
│   └── {name}.types.ts
├── __tests__/
│   └── {name}.e2e-spec.ts
├── package.json
└── tsconfig.json
```

---

## 7. Testing Strategy

- **E2E tests**: Each source gets a live API test (120s timeout) with a known company slug
- **Conditional execution**: Sources requiring API keys use `process.env.X ? describe : describe.skip`
- **No-auth sources**: Always run (Manatal, Paylocity, Phenom, Boeing, IBM, Zoom)
- **Unit test mocks**: All 13 sources added to `jobs.service.spec.ts` mock map
- **Test commands**: All sources run via `npm run test:sources`

---

## 8. Priority Order

1. **No-auth ATS first** (can be tested immediately):
   - Manatal, Paylocity, Phenom
2. **Company scrapers** (unique APIs, no auth):
   - IBM, Boeing, Zoom
3. **API-key ATS** (need credentials for live testing):
   - Freshteam, Bullhorn, Trakstar, HiringThing, Loxo, Fountain, Deel
4. **Documentation**:
   - Company Slug Directory
   - README updates
   - ATS integration docs

---

## 9. Success Criteria

- [ ] 10 new ATS packages created, each with working IScraper implementation
- [ ] 3 new company scraper packages created
- [ ] All no-auth sources pass e2e tests
- [ ] API-key sources have conditional tests that pass when credentials provided
- [ ] All 13 sources registered in jobs.module.ts and jobs.service.ts
- [ ] Site enum updated with 13 new values
- [ ] README source tables updated (total count: 82+)
- [ ] Company Slug Directory created with 50+ verified slugs
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] Existing tests still pass (`npm test`)
