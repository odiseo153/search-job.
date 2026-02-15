/** Dice search URL */
export const DICE_SEARCH_URL = 'https://www.dice.com/jobs';

/** Default delay between page requests (ms) */
export const DICE_DELAY_MIN = 3000;
export const DICE_DELAY_MAX = 6000;

/** Default headers for Dice requests */
export const DICE_HEADERS: Record<string, string> = {
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

/** Page size per request */
export const DICE_PAGE_SIZE = 20;
