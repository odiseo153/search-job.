# Phase 22: Eastern European, CIS & Singapore Expansion Plan

**Status:** Complete

**Goal:** Expand ever-jobs from 148+ to 152+ sources by adding 4 job boards covering Ukrainian, Russian/CIS tech, and Singapore ecosystems.

## New Sources

| Source | Category | Feed/API | Auth | Volume |
|--------|----------|----------|------|--------|
| Djinni | Ukrainian Tech | `djinni.co/jobs` (JSON) | None | ~1000+ items |
| HeadHunter | Russian/CIS | `api.hh.ru/vacancies` (JSON) | None | ~140K+ vacancies |
| Habr Career | Russian Tech | `career.habr.com/api/frontend/vacancies` (JSON) | None | ~1000+ items |
| MyCareersFuture | Singapore | `api.mycareersfuture.gov.sg` (JSON) | None | ~77K+ jobs |

## Notes

- Djinni is a Ukrainian developer-focused job board with structured salary and skills data
- HeadHunter (hh.ru) is the largest CIS job board with REST API
- Habr Career targets the Habr tech community with structured salary (RUR by default)
- MyCareersFuture is a Singapore government employment portal

## Success Criteria

- [x] All 4 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors (0 errors)
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated (README, ROADMAP, PRD)
- [x] Unit tests pass
