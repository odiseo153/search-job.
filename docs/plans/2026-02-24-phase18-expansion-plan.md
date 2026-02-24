# Phase 18: Niche RSS Expansion Plan

**Status:** Complete

**Goal:** Expand ever-jobs from 128+ to 133+ sources by adding 5 niche RSS job boards covering Python, Vue.js, conservation, design, and Berlin startup ecosystems.

## New Sources

| Source | Category | RSS Feed | Auth | Volume |
|--------|----------|----------|------|--------|
| PyJobs | Python Developer | `pyjobs.com/rss` | None | ~100 items |
| VueJobs | Vue.js Frontend | `vuejobs.com/feed` | None | ~100 items |
| Conservation Job Board | Environmental | `conservationjobboard.com/rss` | None | ~100 items |
| Coroflot | Design/Creative | `coroflot.com/jobs/rss` | None | ~30 items |
| Berlin Startup Jobs | Berlin Tech | `berlinstartupjobs.com/feed/` | None | ~12 items |

## Success Criteria

- [x] All 5 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors (0 errors)
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated (README, ROADMAP, PRD)
- [x] Unit tests pass: 6/6 core suites, 74/74 tests
