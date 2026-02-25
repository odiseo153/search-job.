/**
 * Mock scraper plugin for verification
 */
const mockScraper = {
  async scrape(input) {
    return {
      jobs: [
        {
          id: 'plugin-mock-1',
          title: 'Plugin Mock Job',
          companyName: 'Plugin Corp',
          jobUrl: 'https://example.com/plugin-job-1',
          location: { city: 'Plugin City' },
          site: 'mock-plugin',
          datePosted: new Date().toISOString().split('T')[0]
        }
      ]
    };
  }
};

module.exports = {
  scraper: mockScraper
};
