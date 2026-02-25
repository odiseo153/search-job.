import { Module } from '@nestjs/common';
import { PluginsService } from './plugins.service';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule],
  providers: [PluginsService],
  exports: [PluginsService],
})
export class PluginsModule {}
