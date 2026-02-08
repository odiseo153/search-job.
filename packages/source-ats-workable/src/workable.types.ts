/**
 * TypeScript interfaces for Workable API responses.
 * Ported from ats-scrapers/models/workable.py
 */

export interface WorkableLocation {
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  region?: string | null;
  hidden?: boolean | null;
}

export interface WorkableJob {
  title?: string | null;
  shortcode?: string | null;
  code?: string | null;
  employment_type?: string | null;
  telecommuting?: boolean | null;
  department?: string | null;
  url?: string | null;
  shortlink?: string | null;
  application_url?: string | null;
  published_on?: string | null;
  created_at?: string | null;
  country?: string | null;
  city?: string | null;
  state?: string | null;
  education?: string | null;
  experience?: string | null;
  function?: string | null;
  industry?: string | null;
  locations?: WorkableLocation[] | null;
}

export interface WorkableResponse {
  jobs: WorkableJob[];
}
