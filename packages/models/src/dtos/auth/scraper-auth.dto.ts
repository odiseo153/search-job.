import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpworkAuthDto } from './upwork-auth.dto';

/**
 * Per-request authentication credentials for individual sources.
 *
 * When provided in `ScraperInputDto.auth`, these values override
 * the corresponding environment-variable configuration for that source.
 *
 * Each property is keyed by source name and is independently optional —
 * only include credentials for the source(s) you want to override.
 */
export class ScraperAuthDto {
  @ApiPropertyOptional({
    type: () => UpworkAuthDto,
    description: 'Upwork OAuth2 credentials (overrides UPWORK_* env vars)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpworkAuthDto)
  upwork?: UpworkAuthDto;

  // Future sources:
  // linkedin?: LinkedInAuthDto;
  // exa?: ExaAuthDto;

  constructor(partial?: Partial<ScraperAuthDto>) {
    if (partial) Object.assign(this, partial);
  }
}
