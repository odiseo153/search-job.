import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // ── Global validation pipe ─────────────
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ── CORS ───────────────────────────────
  const corsOrigins = config.get<string[]>('cors.origins', ['*']);
  app.enableCors({
    origin: corsOrigins.includes('*') ? '*' : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      config.get<string>('auth.headerName', 'x-api-key'),
    ],
  });
  logger.log(`CORS enabled for origins: ${corsOrigins.join(', ')}`);

  // ── Swagger ────────────────────────────
  const swaggerEnabled = config.get<boolean>('swagger.enabled', true);
  const swaggerPath = config.get<string>('swagger.path', 'api/docs');

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Ever Jobs API')
      .setDescription(
        `# Ever Jobs API

Multi-source job scraping API. Aggregates job listings from LinkedIn, Indeed, Glassdoor, ZipRecruiter, Google, Bayt, Naukri, BDJobs, Internshala, Exa, and Upwork.

## Authentication

When API key authentication is enabled, include your key in the \`x-api-key\` header.

## Rate Limiting

Requests are limited based on your API key or IP address. Default: 100 requests per hour.

## Caching

Results are cached (when enabled) to improve performance and reduce load on job board sites.`,
      )
      .setVersion('0.1.0')
      .addApiKey(
        {
          type: 'apiKey',
          name: config.get<string>('auth.headerName', 'x-api-key'),
          in: 'header',
          description: 'API key for authentication',
        },
        'api-key',
      )
      .addTag('Jobs', 'Job search and analysis endpoints')
      .addTag('Health', 'Health check and monitoring endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document);
    logger.log(`Swagger docs: http://localhost:${config.get('port', 3000)}/${swaggerPath}`);
  }

  // ── Start ──────────────────────────────
  const port = config.get<number>('port', 3000);
  await app.listen(port);

  const authEnabled = config.get<boolean>('auth.enabled', false);
  const rateLimitEnabled = config.get<boolean>('rateLimit.enabled', false);
  const cacheEnabled = config.get<boolean>('cache.enabled', false);

  logger.log(`🚀 Ever Jobs API is running on: http://localhost:${port}`);
  logger.log(`🔑 API key auth: ${authEnabled ? 'ENABLED' : 'disabled'}`);
  logger.log(`⏱️  Rate limiting: ${rateLimitEnabled ? 'ENABLED' : 'disabled'}`);
  logger.log(`📦 Caching: ${cacheEnabled ? 'ENABLED' : 'disabled'}`);
}

bootstrap();
