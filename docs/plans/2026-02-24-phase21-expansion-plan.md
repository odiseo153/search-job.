# Phase 21: Niche & Academic Expansion Plan

**Status:** Complete

**Goal:** Expand ever-jobs from 143+ to 148+ sources by adding 5 job boards covering environmental, European, open source design, academic, and remote-first ecosystems.

## New Sources

| Source | Category | Feed/API | Auth | Volume |
|--------|----------|----------|------|--------|
| Green Jobs Board | Environmental/Sustainability | `greenjobs.greenjobsearch.org/rss` (RSS) | None | ~11 items |
| EuroJobs | European Multi-Country | `www.eurojobs.com/rss` (RSS) | None | ~12 items |
| Open Source Design Jobs | Open Source Design | `opensourcedesign.net/jobs/feed.xml` (RSS) | None | ~17 items |
| Academic Careers | Higher Education/Academic | `www.academiccareers.com/rss` (RSS) | None | ~10 items |
| RemoteFirstJobs | Remote-First | `remotefirstjobs.com/remote-jobs.rss` (RSS) | None | ~15 items |

## Notes

- Green Jobs Board uses `dc:creator` for organization name and `content:encoded` for full job details
- Academic Careers uses `dc:creator` extension for university/organization name
- RemoteFirstJobs has 16 category-specific feeds; we use the main all-jobs feed
- All 5 sources are standard RSS 2.0 feeds requiring no authentication

## Success Criteria

- [x] All 5 sources return valid JobPostDto[]
- [x] Each source has E2E test
- [x] TypeScript compiles without errors (0 errors)
- [x] Site enum, tsconfig, jest config updated
- [x] All sources wired in API, CLI, MCP
- [x] Documentation updated (README, ROADMAP, PRD)
- [x] Unit tests pass
