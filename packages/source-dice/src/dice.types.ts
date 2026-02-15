/**
 * TypeScript interfaces for Dice job cards parsed from HTML.
 */

export interface DiceJobCard {
  title: string;
  url: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  postedDate: string | null;
  employmentType: string | null;
}
