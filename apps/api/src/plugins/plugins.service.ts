import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsService } from '../jobs/jobs.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PluginsService implements OnModuleInit {
  private readonly logger = new Logger(PluginsService.name);
  private readonly pluginsDir: string;

  constructor(
    private readonly config: ConfigService,
    private readonly jobsService: JobsService,
  ) {
    this.pluginsDir = this.config.get<string>('plugins.dir') || path.join(process.cwd(), 'plugins');
  }

  onModuleInit() {
    if (!this.config.get<boolean>('plugins.enabled', false)) {
      this.logger.log('Plugins system disabled');
      return;
    }

    this.loadPlugins();
  }

  private loadPlugins() {
    if (!fs.existsSync(this.pluginsDir)) {
      this.logger.warn(`Plugins directory not found: ${this.pluginsDir}`);
      try {
        fs.mkdirSync(this.pluginsDir, { recursive: true });
        this.logger.log(`Created plugins directory: ${this.pluginsDir}`);
      } catch (err: any) {
        this.logger.error(`Failed to create plugins directory: ${err.message}`);
        return;
      }
    }

    const files = fs.readdirSync(this.pluginsDir);
    const pluginFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.ts'));

    this.logger.log(`Found ${pluginFiles.length} potential plugins in ${this.pluginsDir}`);

    for (const file of pluginFiles) {
      this.loadPlugin(file);
    }
  }

  private loadPlugin(file: string) {
    const fullPath = path.join(this.pluginsDir, file);
    try {
      // Clear cache for hot reloading if needed (not strictly required for NestJS bootstrap)
      // delete require.cache[require.resolve(fullPath)];
      
      const absolutePath = path.resolve(fullPath);
      if (!fs.existsSync(absolutePath)) {
        this.logger.error(`Plugin file not found at resolve time: ${absolutePath}`);
        return;
      }
      
      // Use eval('require') to bypass Webpack's requirement bundling
      // This allows us to load external files at runtime
      const plugin = eval('require')(absolutePath);
      
      // We expect the plugin to export a 'scraper' object or a class we can instantiate
      const scraper = plugin.scraper || (plugin.default && plugin.default.scraper) || plugin.default;
      
      if (scraper && typeof scraper.scrape === 'function') {
        const siteName = path.basename(file, path.extname(file));
        this.jobsService.registerScraper(siteName, scraper);
        this.logger.log(`Successfully loaded plugin: ${siteName} from ${file}`);
      } else {
        this.logger.warn(`Plugin ${file} does not export a valid IScraper (missing scrape method)`);
      }
    } catch (err: any) {
      this.logger.error(`Error loading plugin ${file}: ${err.message}`);
      if (err.code === 'MODULE_NOT_FOUND') {
        this.logger.error(`Node cannot find the plugin module at: ${path.resolve(fullPath)}`);
      }
    }
  }
}
