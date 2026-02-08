/**
 * E2E test for the API (JobsController).
 *
 * Uses NestJS TestingModule to spin up a full app context and test
 * the POST /api/jobs/scrape and POST /api/jobs/analyze endpoints.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JobsModule } from '../src/jobs/jobs.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

describe('JobsController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JobsModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/jobs/scrape should return an array of jobs', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/jobs/scrape')
      .send({
        searchTerm: 'developer',
        siteType: ['indeed'],
        resultsWanted: 3,
      })
      .expect(201);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/jobs/analyze should return analysis with summary', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/jobs/analyze')
      .send({
        searchTerm: 'developer',
        siteType: ['indeed'],
        resultsWanted: 3,
      })
      .expect(201);

    expect(res.body).toBeDefined();
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalJobs).toBeDefined();
    expect(res.body.companies).toBeDefined();
    expect(Array.isArray(res.body.companies)).toBe(true);
  });
});
