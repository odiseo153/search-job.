# API Changelog

## [0.1.0] — 2026-02-08

### New Endpoints

- `POST /api/jobs/search` — search for jobs across multiple boards
  - JSON body input with `ScraperInputDto`
  - Wrapped response: `{ count, jobs, cached }`
  - CSV export via `?format=csv`
  - Pagination via `?paginate=true&page=1&page_size=10`
  - Response caching with configurable TTL
- `POST /api/jobs/analyze` — search and analyze jobs with summary statistics
- `GET /health` — service health with uptime, version, and memory usage
- `GET /ping` — simple liveness check

### Security

- API key authentication via configurable header (default: `x-api-key`)
- Per-client request throttling with configurable limits

### Response Headers

- `X-Request-Id` — unique request identifier for tracing
- `X-Process-Time` — request processing duration in ms
