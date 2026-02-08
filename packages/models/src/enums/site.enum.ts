export enum Site {
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  ZIP_RECRUITER = 'zip_recruiter',
  GLASSDOOR = 'glassdoor',
  GOOGLE = 'google',
  BAYT = 'bayt',
  NAUKRI = 'naukri',
  BDJOBS = 'bdjobs',
  INTERNSHALA = 'internshala',
  EXA = 'exa',
  UPWORK = 'upwork',
}

/**
 * Map a raw string (case-insensitive) to a Site enum value.
 */
export function mapStringToSite(siteName: string): Site {
  const key = siteName.toUpperCase() as keyof typeof Site;
  if (Site[key] !== undefined) {
    return Site[key];
  }
  throw new Error(`Invalid site name: ${siteName}`);
}
