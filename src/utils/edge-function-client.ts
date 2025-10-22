/**
 * Client utility for interacting with the API Key Edge Function
 * 
 * This module provides a convenient wrapper for calling the edge function
 * endpoints from your frontend code.
 * 
 * @example
 * ```typescript
 * import { validateApiKey, testApiKey, proxyToAnthropic } from './utils/edge-function-client';
 * 
 * // Check if API key is configured
 * const isValid = await validateApiKey();
 * 
 * // Test the API key
 * const isWorking = await testApiKey();
 * 
 * // Send a message via the proxy
 * const response = await proxyToAnthropic([
 *   { role: 'user', content: 'Hello!' }
 * ]);
 * ```
 */

const EDGE_FUNCTION_BASE_URL = '/api/key';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProxyOptions {
  messages: Message[];
  model?: string;
  max_tokens?: number;
  system?: string;
  customApiKey?: string;
}

export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Make a request to the edge function
 */
async function makeEdgeFunctionRequest(
  action: string,
  body?: any,
  customApiKey?: string
): Promise<EdgeFunctionResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (customApiKey) {
    headers['X-API-Key'] = customApiKey;
  }

  try {
    const response = await fetch(EDGE_FUNCTION_BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...body }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate that an API key is configured
 * 
 * @param customApiKey - Optional custom API key to validate
 * @returns Promise resolving to validation result
 * 
 * @example
 * ```typescript
 * const result = await validateApiKey();
 * if (result.success) {
 *   console.log('API key is configured:', result.data);
 * }
 * ```
 */
export async function validateApiKey(
  customApiKey?: string
): Promise<EdgeFunctionResponse> {
  return makeEdgeFunctionRequest('validate', undefined, customApiKey);
}

/**
 * Test if the configured API key works with Anthropic's API
 * 
 * @param customApiKey - Optional custom API key to test
 * @returns Promise resolving to test result
 * 
 * @example
 * ```typescript
 * const result = await testApiKey();
 * if (result.success) {
 *   console.log('API key is working!');
 * } else {
 *   console.error('API key test failed:', result.error);
 * }
 * ```
 */
export async function testApiKey(
  customApiKey?: string
): Promise<EdgeFunctionResponse> {
  return makeEdgeFunctionRequest('test', undefined, customApiKey);
}

/**
 * Proxy a request to Anthropic's API via the edge function
 * This keeps your API key secure on the server side
 * 
 * @param options - Proxy request options
 * @returns Promise resolving to Anthropic API response
 * 
 * @example
 * ```typescript
 * const response = await proxyToAnthropic({
 *   messages: [
 *     { role: 'user', content: 'Tell me a joke' }
 *   ],
 *   model: 'claude-3-5-sonnet-20241022',
 *   max_tokens: 1024
 * });
 * 
 * if (response.success) {
 *   console.log('Claude says:', response.data.content);
 * }
 * ```
 */
export async function proxyToAnthropic(
  options: ProxyOptions
): Promise<EdgeFunctionResponse> {
  const { messages, model, max_tokens, system, customApiKey } = options;

  if (!messages || messages.length === 0) {
    return {
      success: false,
      error: 'Messages array is required and must not be empty',
    };
  }

  return makeEdgeFunctionRequest(
    'proxy',
    {
      messages,
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: max_tokens || 4096,
      system,
    },
    customApiKey
  );
}

/**
 * Check if the edge function is available and working
 * 
 * @returns Promise resolving to availability status
 * 
 * @example
 * ```typescript
 * const isAvailable = await isEdgeFunctionAvailable();
 * if (isAvailable) {
 *   console.log('Edge function is ready to use');
 * }
 * ```
 */
export async function isEdgeFunctionAvailable(): Promise<boolean> {
  try {
    const result = await validateApiKey();
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Hook-style wrapper for React components
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const [isAvailable, setIsAvailable] = useState(false);
 *   
 *   useEffect(() => {
 *     checkEdgeFunctionAvailability().then(setIsAvailable);
 *   }, []);
 *   
 *   // ...
 * }
 * ```
 */
export async function checkEdgeFunctionAvailability(): Promise<boolean> {
  return isEdgeFunctionAvailable();
}
