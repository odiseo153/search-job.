# Phase 16: Global Expansion Plan

**Status:** Complete

**Goal:** Expand ever-jobs from 121+ to 125+ sources by adding 4 global job boards with free public JSON APIs (no auth required).

## New Sources

| Source | Category | API | Auth | Volume |
|--------|----------|-----|------|--------|
| Get on Board | Latin America Tech | `getonbrd.com/api/v0/search/jobs` | None | ~6K+ |
| Freelancer.com | Freelance/Gig | `freelancer.com/api/projects/0.1/projects/active` | None | ~8K+ |
| JoinRise | Tech Startups | `api.joinrise.io/api/v1/jobs/public` | None | ~10K+ |
| Canada Job Bank | Government (Canada) | `open.canada.ca/data/api/3/action/datastore_search` | None | ~51K+ |

## Success Criteria

- [x] All 4 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors (0 errors)
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated (README, ROADMAP, PRD, .env.example)
- [x] Unit tests pass: 87/87 suites, 304/304 tests
