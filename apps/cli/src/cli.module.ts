import { Module } from '@nestjs/common';
import { LinkedInModule } from '@ever-jobs/source-linkedin';
import { IndeedModule } from '@ever-jobs/source-indeed';
import { GlassdoorModule } from '@ever-jobs/source-glassdoor';
import { ZipRecruiterModule } from '@ever-jobs/source-ziprecruiter';
import { GoogleModule } from '@ever-jobs/source-google';
import { BaytModule } from '@ever-jobs/source-bayt';
import { NaukriModule } from '@ever-jobs/source-naukri';
import { BDJobsModule } from '@ever-jobs/source-bdjobs';
import { InternshalaModule } from '@ever-jobs/source-internshala';
import { ExaModule } from '@ever-jobs/source-exa';
import { UpworkModule } from '@ever-jobs/source-upwork';
import { AnalyticsModule } from '@ever-jobs/analytics';
import { JobsService } from '../../api/src/jobs/jobs.service';
import { SearchCommand } from './commands/search.command';
import { CompareCommand } from './commands/compare.command';

@Module({
  imports: [
    LinkedInModule,
    IndeedModule,
    GlassdoorModule,
    ZipRecruiterModule,
    GoogleModule,
    BaytModule,
    NaukriModule,
    BDJobsModule,
    InternshalaModule,
    ExaModule,
    UpworkModule,
    AnalyticsModule,
  ],
  providers: [JobsService, SearchCommand, CompareCommand],
})
export class CliModule {}
