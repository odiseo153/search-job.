/**
 * TypeScript interfaces for BambooHR public careers API responses.
 */

export interface BambooHRResponse {
  result: BambooHRJob[];
}

export interface BambooHRJob {
  id: number;
  jobOpeningName: string;
  departmentLabel: string | null;
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  employmentStatusLabel: string | null;
  minimumExperience: string | null;
  compensation: string | null;
  description: string | null;
}
