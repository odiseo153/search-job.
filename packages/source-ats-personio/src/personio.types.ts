/**
 * TypeScript interfaces for Personio XML feed positions.
 * The XML is parsed into these structures via cheerio xmlMode.
 */

export interface PersonioPosition {
  id: string;
  name: string;
  office: string | null;
  department: string | null;
  recruitingCategory: string | null;
  employmentType: string | null;
  seniority: string | null;
  schedule: string | null;
  keywords: string | null;
  createdAt: string | null;
  descriptions: PersonioDescription[];
}

export interface PersonioDescription {
  name: string;
  value: string;
}
