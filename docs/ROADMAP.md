# Roadmap

## Current (v0.1.x)

- ✅ Multi-source job searching (11 boards)
- ✅ API key authentication
- ✅ Rate limiting
- ✅ In-memory caching
- ✅ CSV export and pagination
- ✅ Health check endpoints
- ✅ Docker deployment
- ✅ Swagger / OpenAPI docs
- ✅ CLI application

## Planned (v0.2.0)

- Redis-backed caching (scalable, persistent)
- WebSocket / SSE support for real-time search progress
- Job deduplication across sources
- Configurable retry policies per source
- Prometheus metrics endpoint (`/metrics`)

## Future Considerations

- GraphQL API alongside REST
- OAuth2 authentication
- Frontend dashboard for job search results
- Plugin architecture for community-contributed source modules
- Job alerts / notifications (email, webhook)
- Enterprise features (multi-tenant, audit logs)
