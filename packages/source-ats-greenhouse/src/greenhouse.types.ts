/**
 * TypeScript interfaces for Greenhouse API responses.
 * Ported from ats-scrapers/models/gh.py
 */

export interface GreenhouseLocation {
  name?: string | null;
}

export interface GreenhouseDepartment {
  id?: number | null;
  name?: string | null;
  child_ids?: number[] | null;
  parent_id?: number | null;
}

export interface GreenhouseOffice {
  id?: number | null;
  name?: string | null;
  location?: string | null;
  child_ids?: number[] | null;
  parent_id?: number | null;
}

export interface GreenhouseMetadataItem {
  id?: number | null;
  name?: string | null;
  value?: string | string[] | Record<string, unknown> | boolean | null;
  value_type?: string | null;
}

export interface GreenhouseJob {
  absolute_url?: string | null;
  internal_job_id?: number | null;
  location?: GreenhouseLocation | null;
  metadata?: GreenhouseMetadataItem[] | null;
  id?: number | null;
  updated_at?: string | null;
  requisition_id?: string | null;
  title?: string | null;
  company_name?: string | null;
  first_published?: string | null;
  content?: string | null;
  departments?: GreenhouseDepartment[] | null;
  offices?: GreenhouseOffice[] | null;
}

export interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}
