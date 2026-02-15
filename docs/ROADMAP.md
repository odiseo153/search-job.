# Roadmap

## Current (v0.4.x)

- ✅ Multi-source job searching (51 sources)
- ✅ API key authentication
- ✅ Rate limiting
- ✅ In-memory caching
- ✅ CSV export and pagination
- ✅ Health check endpoints
- ✅ Docker deployment
- ✅ Swagger / OpenAPI docs
- ✅ CLI application
- ✅ ATS integrations (Ashby, Greenhouse, Lever, Workable, SmartRecruiters, Rippling, Workday, Recruitee, Teamtailor, BambooHR, Personio, JazzHR, iCIMS, Taleo, SuccessFactors)
- ✅ Company-specific scrapers (Amazon, Apple, Microsoft, Nvidia, TikTok, Uber, Cursor)
- ✅ Remote job boards (RemoteOK, Remotive, Jobicy, Himalayas, Arbeitnow, We Work Remotely)
- ✅ API-key sources (USAJobs, Adzuna, Reed, Jooble, CareerJet — Tier 1.5)
- ✅ Client IP forwarding for proxy rotation strategies
- ✅ Tier 2 HTML scrapers (BambooHR, Personio, JazzHR, Dice, SimplyHired, Wellfound, StepStone)
- 🚧 Tier 3 anti-bot sources — Taleo ✅, iCIMS 🚧, SuccessFactors 🚧, CareerBuilder 🚧, Monster 🚧
- ✅ BrowserPool stealth mode (UA rotation, viewport randomization, anti-fingerprinting JS injection)

## Planned (v0.5.0)

- Redis-backed caching (scalable, persistent)
- WebSocket / SSE support for real-time search progress
- Job deduplication across sources
- Configurable retry policies per source
- Prometheus metrics endpoint (`/metrics`)

## Future Considerations (v0.6.0+)

- GraphQL API alongside REST
- OAuth2 authentication
- Frontend dashboard for job search results
- Plugin architecture for community-contributed source modules
- Job alerts / notifications (email, webhook)
- Enterprise features (multi-tenant, audit logs)
