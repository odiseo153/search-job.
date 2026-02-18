# Architecture Overview

## Data Flow

```
Client Request
    │
    ▼
┌──────────────────────┐
│   NestJS Application │
│                      │
│  ┌────────────────┐  │
│  │  API Key Guard │  │   ← validates x-api-key header
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Throttler Guard│  │   ← rate limit per key/IP
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Logging        │  │   ← request ID, timing
│  │ Interceptor    │  │
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Cache Service  │──┼── ← check in-memory TTL cache
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Jobs Service   │  │   ← orchestrate searching
│  │  (allSettled)  │  │
│  └───────┬────────┘  │
│          ▼           │
│  ┌────────────────┐  │
│  │ Source Modules │  │   ← LinkedIn, Indeed, Glassdoor, etc.
│  │  (65+ sources) │  │   ← search (31) + ATS (18) + company (12) + analytics
│  └────────────────┘  │
└──────────────────────┘
           │
           ▼
    External Job APIs
```

## Key Components

| Component             | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `AppConfigModule`     | Loads `.env` and provides typed config         |
| `ApiKeyGuard`         | Header-based API key authentication            |
| `ThrottlerGuard`      | Configurable request rate limiting             |
| `LoggingInterceptor`  | Request logging with IDs and timing            |
| `HttpExceptionFilter` | Structured JSON error responses                |
| `CacheService`        | In-memory TTL cache (MD5-keyed)                |
| `HealthController`    | `/health` and `/ping` endpoints                |
| `JobsService`         | Orchestrates concurrent multi-source searching |
| `JobsController`      | `POST /api/jobs/search` and `/analyze`         |
| Source Modules (×53)  | Search (×28) + ATS (×18) + Company (×7)        |
| `AnalyticsModule`     | Job data analysis and aggregation              |

## Project Structure

```
ever-jobs/
├── apps/
│   ├── api/src/             # NestJS API server
│   │   ├── auth/            #   API key guard
│   │   ├── cache/           #   In-memory cache
│   │   ├── config/          #   Configuration module
│   │   ├── filters/         #   Exception filters
│   │   ├── health/          #   Health endpoints
│   │   ├── interceptors/    #   Logging interceptor
│   │   └── jobs/            #   Job controllers & service
│   └── cli/                 # CLI application (nest-commander)
├── packages/
│   ├── analytics/           # Job data analytics
│   ├── common/              # Shared HTTP client, utilities
│   ├── models/              # TypeScript interfaces & DTOs
│   ├── source-*/            # Search source modules (×28)
│   ├── source-ats-*/        # ATS source modules (×18)
│   └── source-company-*/    # Company-specific source modules (×7)
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Production deployment
├── docker-compose.dev.yml   # Development with hot-reload
└── Makefile                 # Dev & Docker shortcuts
```
