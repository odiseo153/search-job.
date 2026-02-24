# Roadmap

## Current (v0.5.x)

- ✅ Multi-source job searching (94+ sources)
- ✅ API key authentication
- ✅ Rate limiting
- ✅ In-memory caching
- ✅ CSV export and pagination
- ✅ Health check endpoints
- ✅ Docker deployment
- ✅ Swagger / OpenAPI docs
- ✅ CLI application
- ✅ MCP server for AI assistants (ChatGPT, Claude, Copilot)
- ✅ ATS integrations (30 platforms: Ashby, Greenhouse, Lever, Workable, SmartRecruiters, Rippling, Workday, Recruitee, Teamtailor, BambooHR, Personio, JazzHR, iCIMS, Taleo, SuccessFactors, Jobvite, ADP, UKG, BreezyHR, Comeet, Pinpoint, Manatal, Paylocity, Freshteam, Bullhorn, Trakstar, HiringThing, Loxo, Fountain, Deel, Phenom, Jobylon, Homerun)
- ✅ Company-specific scrapers (15: Amazon, Apple, Microsoft, Nvidia, TikTok, Uber, Cursor, Google, Meta, Netflix, Stripe, OpenAI, IBM, Boeing, Zoom)
- ✅ Remote job boards (RemoteOK, Remotive, Jobicy, Himalayas, Arbeitnow, We Work Remotely)
- ✅ API-key sources (USAJobs, Adzuna, Reed, Jooble, CareerJet)
- ✅ Client IP forwarding for proxy rotation strategies
- ✅ Tier 2 HTML scrapers (BambooHR, Personio, JazzHR, Dice, SimplyHired, Wellfound, StepStone)
- ✅ Tier 3 anti-bot sources (Taleo, iCIMS, SuccessFactors, CareerBuilder, Monster)
- ✅ BrowserPool stealth mode (UA rotation, viewport randomization, anti-fingerprinting JS injection)
- ✅ Additional job boards (BuiltIn, Snagajob, Dribbble)
- ✅ Phase 9 job board expansion (The Muse, Working Nomads, 4 Day Week, Startup.jobs, NoDesk, Web3 Career, Echojobs, Jobstreet)
- ✅ Phase 10 government boards & ATS (CareerOneStop, Arbeitsagentur, Jobylon, Homerun)

## Planned (v0.6.0)

- Redis-backed caching (scalable, persistent)
- WebSocket / SSE support for real-time search progress
- Job deduplication across sources
- Configurable retry policies per source
- Prometheus metrics endpoint (`/metrics`)
- Additional ATS/company integrations (Phase 10+)

## Future Considerations (v0.7.0+)

- GraphQL API alongside REST
- OAuth2 authentication
- Frontend dashboard for job search results
- Plugin architecture for community-contributed source modules
- Job alerts / notifications (email, webhook)
- Enterprise features (multi-tenant, audit logs)
- Government job boards from additional countries (EU, UK, Canada, Australia)
- Industry-specific job board integrations (healthcare, finance, education)
