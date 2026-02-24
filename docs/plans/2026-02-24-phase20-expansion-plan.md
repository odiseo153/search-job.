# Phase 20: European Regional & Niche Expansion Plan

**Status:** Complete

**Goal:** Expand ever-jobs from 138+ to 143+ sources by adding 5 job boards covering data science, Swiss tech, German tech, remote work, and Polish/CEE tech ecosystems.

## New Sources

| Source | Category | Feed/API | Auth | Volume |
|--------|----------|----------|------|--------|
| iCrunchData | Data Science/Analytics | `icrunchdata.com/rss/` (RSS) | None | ~15 items |
| SwissDevJobs | Swiss IT/Tech | `swissdevjobs.ch/rss` (RSS) | None | ~229 items |
| GermanTechJobs | German IT/Tech | `germantechjobs.de/rss` (RSS) | None | ~1,574 items |
| VirtualVocations | Remote/WFH | `virtualvocations.com/jobs/rss` (RSS) | None | ~10/page |
| NoFluffJobs | Polish/CEE Tech | `nofluffjobs.com/api/posting` (JSON) | None | ~1,000+ items |

## Notes

- SwissDevJobs and GermanTechJobs share the same platform — salary is embedded in RSS title (`[CHF/EUR min - max]`)
- NoFluffJobs is a JSON API returning all active postings in a single response with structured salary data
- VirtualVocations focuses on screened remote/work-from-home positions

## Success Criteria

- [x] All 5 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors (0 errors)
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated (README, ROADMAP, PRD)
- [x] Unit tests pass
