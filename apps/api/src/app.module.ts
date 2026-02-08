import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { AppCacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';
import { JobsModule } from './jobs/jobs.module';
import { ApiKeyGuard } from './auth/api-key.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Module({
  imports: [
    // Global config (loads .env)
    AppConfigModule,

    // Rate limiting (configurable via env vars)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get<number>('rateLimit.timeframeSec', 3600)) * 1000,
            limit: config.get<number>('rateLimit.maxRequests', 100),
          },
        ],
        // Skip throttling when disabled
        skipIf: () => !config.get<boolean>('rateLimit.enabled', false),
      }),
    }),

    // Global cache
    AppCacheModule,

    // Health endpoints
    HealthModule,

    // Job scraping
    JobsModule,
  ],
  providers: [
    // Global API key guard
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    // Global rate limit guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global request logging
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
