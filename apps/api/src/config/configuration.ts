/**
 * Central configuration factory.
 * Maps every environment variable to a typed config object.
 */
export default () => {
  const parseBool = (val: string | undefined, fallback: boolean): boolean => {
    if (val === undefined || val === '') return fallback;
    return ['true', '1', 'yes', 'on'].includes(val.toLowerCase());
  };

  const parseList = (val: string | undefined): string[] => {
    if (!val || val.trim() === '') return [];
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  };

  const parseInt = (val: string | undefined, fallback: number): number => {
    if (val === undefined || val === '') return fallback;
    const n = Number(val);
    return Number.isNaN(n) ? fallback : n;
  };

  return {
    port: parseInt(process.env.PORT, 3000),

    // API Security
    auth: {
      enabled: parseBool(process.env.ENABLE_API_KEY_AUTH, false),
      apiKeys: parseList(process.env.API_KEYS),
      headerName: process.env.API_KEY_HEADER_NAME || 'x-api-key',
    },

    // Rate Limiting
    rateLimit: {
      enabled: parseBool(process.env.RATE_LIMIT_ENABLED, false),
      maxRequests: parseInt(process.env.RATE_LIMIT_REQUESTS, 100),
      timeframeSec: parseInt(process.env.RATE_LIMIT_TIMEFRAME, 3600),
    },

    // Proxy
    proxy: {
      defaults: parseList(process.env.DEFAULT_PROXIES),
      caCertPath: process.env.CA_CERT_PATH || null,
    },

    // Search Defaults
    defaults: {
      siteNames: parseList(
        process.env.DEFAULT_SITE_NAMES ||
          'linkedin,indeed,zip_recruiter,glassdoor,google,bayt,naukri,bdjobs,internshala,exa,upwork',
      ),
      resultsWanted: parseInt(process.env.DEFAULT_RESULTS_WANTED, 20),
      distance: parseInt(process.env.DEFAULT_DISTANCE, 50),
      descriptionFormat: process.env.DEFAULT_DESCRIPTION_FORMAT || 'markdown',
      country: process.env.DEFAULT_COUNTRY || 'USA',
    },

    // Caching
    cache: {
      enabled: parseBool(process.env.ENABLE_CACHE, false),
      expirySec: parseInt(process.env.CACHE_EXPIRY, 3600),
    },

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    environment: process.env.NODE_ENV || 'development',

    // CORS
    cors: {
      origins: parseList(process.env.CORS_ORIGINS || '*'),
    },

    // Swagger
    swagger: {
      enabled: parseBool(process.env.ENABLE_SWAGGER, true),
      path: process.env.SWAGGER_PATH || 'api/docs',
    },
  };
};
