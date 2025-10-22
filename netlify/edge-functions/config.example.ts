/**
 * Edge Function Configuration Example
 * 
 * Copy this file to `config.ts` to customize your edge function behavior.
 * This file is ignored by git to keep your configuration private.
 * 
 * Note: Most settings can be configured via environment variables in Netlify.
 * This file is useful for more advanced customization.
 */

export interface EdgeFunctionConfig {
  // API Configuration
  api: {
    // Default model to use if not specified in request
    defaultModel: string;
    
    // Default max tokens if not specified in request
    defaultMaxTokens: number;
    
    // Timeout for Anthropic API requests (milliseconds)
    requestTimeout: number;
    
    // Enable verbose logging (only for development)
    verboseLogging: boolean;
  };
  
  // Security Configuration
  security: {
    // Enable rate limiting
    enableRateLimiting: boolean;
    
    // Rate limit: requests per minute per IP
    rateLimitPerMinute: number;
    
    // Allowed origins for CORS (empty array allows all)
    allowedOrigins: string[];
    
    // Require authentication via custom header
    requireAuth: boolean;
    
    // Custom auth header name (if requireAuth is true)
    authHeaderName: string;
  };
  
  // Features Configuration
  features: {
    // Enable API key validation endpoint
    enableValidation: boolean;
    
    // Enable API key testing endpoint
    enableTesting: boolean;
    
    // Enable proxy endpoint
    enableProxy: boolean;
    
    // Allow custom API keys via X-API-Key header
    allowCustomKeys: boolean;
  };
  
  // Response Configuration
  response: {
    // Include request ID in responses
    includeRequestId: boolean;
    
    // Include timing information in responses
    includeTimings: boolean;
    
    // Custom error messages
    errorMessages: {
      noApiKey: string;
      invalidApiKey: string;
      rateLimitExceeded: string;
      invalidRequest: string;
    };
  };
}

// Default configuration
export const defaultConfig: EdgeFunctionConfig = {
  api: {
    defaultModel: "claude-3-5-sonnet-20241022",
    defaultMaxTokens: 4096,
    requestTimeout: 30000, // 30 seconds
    verboseLogging: false,
  },
  
  security: {
    enableRateLimiting: false, // Enable in production
    rateLimitPerMinute: 10,
    allowedOrigins: [], // Empty = allow all (configure in production)
    requireAuth: false, // Enable for additional security
    authHeaderName: "X-Auth-Token",
  },
  
  features: {
    enableValidation: true,
    enableTesting: true,
    enableProxy: true,
    allowCustomKeys: true,
  },
  
  response: {
    includeRequestId: true,
    includeTimings: false,
    errorMessages: {
      noApiKey: "No API key configured. Set ANTHROPIC_API_KEY in environment or pass X-API-Key header.",
      invalidApiKey: "API key validation failed. Please check your API key and try again.",
      rateLimitExceeded: "Rate limit exceeded. Please try again later.",
      invalidRequest: "Invalid request. Please check your request parameters and try again.",
    },
  },
};

// Production configuration example
export const productionConfig: EdgeFunctionConfig = {
  ...defaultConfig,
  security: {
    enableRateLimiting: true,
    rateLimitPerMinute: 20,
    allowedOrigins: [
      "https://your-domain.com",
      "https://www.your-domain.com",
    ],
    requireAuth: false,
    authHeaderName: "X-Auth-Token",
  },
  features: {
    ...defaultConfig.features,
    allowCustomKeys: false, // Disable in production for security
  },
};

// Development configuration example
export const developmentConfig: EdgeFunctionConfig = {
  ...defaultConfig,
  api: {
    ...defaultConfig.api,
    verboseLogging: true,
  },
  security: {
    ...defaultConfig.security,
    enableRateLimiting: false,
    allowedOrigins: [], // Allow all in development
  },
};

/**
 * Get configuration based on environment
 */
export function getConfig(environment?: string): EdgeFunctionConfig {
  const env = environment || Deno.env.get("NETLIFY_CONTEXT") || "development";
  
  switch (env) {
    case "production":
      return productionConfig;
    case "development":
    case "dev-preview":
    case "branch-deploy":
      return developmentConfig;
    default:
      return defaultConfig;
  }
}
