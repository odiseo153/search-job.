# Phase 17: Niche & International Expansion Plan

**Status:** Complete

**Goal:** Expand ever-jobs from 125+ to 128+ sources by adding 3 niche/international job boards with free public APIs (no auth required).

## New Sources

| Source | Category | API | Auth | Volume |
|--------|----------|-----|------|--------|
| ReliefWeb | NGO/Humanitarian | `api.reliefweb.int/v1/jobs` | None (appname) | 195+ countries |
| UNDP Jobs | UN/International | `jobs.undp.org/rss_feeds/rss.xml` | None | Global |
| DevITjobs | IT/Developer | `devitjobs.com/job_feed.xml` | None | ~3.8MB feed |

## Success Criteria

- [x] All 3 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors (0 errors)
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated (README, ROADMAP, PRD, .env.example)
- [x] Unit tests pass: 90/90 suites, 307/307 tests
