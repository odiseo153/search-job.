/**
 * TypeScript interfaces for SmartRecruiters API responses.
 */

export interface SmartRecruitersLocation {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  remote?: boolean | null;
}

export interface SmartRecruitersDepartment {
  id?: string | null;
  label?: string | null;
}

export interface SmartRecruitersJob {
  id?: string | null;
  name?: string | null;
  uuid?: string | null;
  refNumber?: string | null;
  releasedDate?: string | null;
  location?: SmartRecruitersLocation | null;
  department?: SmartRecruitersDepartment | null;
  experienceLevel?: { id?: string; label?: string } | null;
  typeOfEmployment?: { id?: string; label?: string } | null;
  ref?: string | null;
  company?: { name?: string; identifier?: string } | null;
}

export interface SmartRecruitersResponse {
  content: SmartRecruitersJob[];
  totalFound?: number;
  offset?: number;
  limit?: number;
}
