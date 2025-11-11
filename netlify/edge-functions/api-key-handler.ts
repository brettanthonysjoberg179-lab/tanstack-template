/**
 * Netlify Edge Function for API Key Management
 * 
 * This edge function provides secure API key handling with the following features:
 * - Validates API keys before forwarding requests
 * - Supports custom API key configuration
 * - Provides a proxy to Anthropic API to keep keys secure
 * - Configurable via environment variables or request headers
 * 
 * Usage:
 * 1. Set ANTHROPIC_API_KEY in Netlify environment variables
 * 2. Or pass X-API-Key header with your custom key
 * 3. Call this edge function instead of directly calling Anthropic API
 * 
 * Example request:
 * POST /.netlify/edge-functions/api-key-handler
 * Headers:
 *   Content-Type: application/json
 *   X-API-Key: your-custom-key (optional)
 * Body:
 *   {
 *     "action": "validate" | "proxy" | "test",
 *     "messages": [...], // For proxy action
 *     "model": "claude-3-5-sonnet-20241022",
 *     "max_tokens": 4096
 *   }
 */

import type { Context } from "https://edge.netlify.com";

interface APIKeyRequest {
  action: "validate" | "proxy" | "test";
  messages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  model?: string;
  max_tokens?: number;
  system?: string;
}

interface APIKeyResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export default async (request: Request, context: Context): Promise<Response> => {
  // CORS headers for browser requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Only allow GET and POST methods
  if (request.method !== "GET" && request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed. Use GET or POST.",
      }),
      { status: 405, headers }
    );
  }

  try {
    // Get API key from environment or custom header
    const customApiKey = request.headers.get("X-API-Key");
    const envApiKey = Deno.env.get("ANTHROPIC_API_KEY") || 
                      Deno.env.get("VITE_ANTHROPIC_API_KEY");
    const apiKey = customApiKey || envApiKey;

    // Parse request body for POST requests
    let body: APIKeyRequest | null = null;
    if (request.method === "POST") {
      try {
        body = await request.json();
      } catch (e) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid JSON in request body",
          }),
          { status: 400, headers }
        );
      }
    }

    const action = body?.action || "test";

    // Handle different actions
    switch (action) {
      case "validate": {
        // Validate that an API key is configured
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "No API key configured",
              message: "Set ANTHROPIC_API_KEY in environment or pass X-API-Key header",
            }),
            { status: 400, headers }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "API key is configured",
            data: {
              keySource: customApiKey ? "custom header" : "environment",
              keyPrefix: apiKey.substring(0, 8) + "...",
            },
          }),
          { status: 200, headers }
        );
      }

      case "test": {
        // Test API key by making a minimal request to Anthropic
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "No API key configured",
            }),
            { status: 400, headers }
          );
        }

        try {
          const testResponse = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 10,
                messages: [
                  {
                    role: "user",
                    content: "Hi",
                  },
                ],
              }),
            }
          );

          if (testResponse.ok) {
            return new Response(
              JSON.stringify({
                success: true,
                message: "API key is valid and working",
              }),
              { status: 200, headers }
            );
          } else {
            const errorData = await testResponse.json();
            return new Response(
              JSON.stringify({
                success: false,
                error: "API key validation failed",
                message: errorData.error?.message || "Unknown error",
              }),
              { status: testResponse.status, headers }
            );
          }
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Failed to test API key",
              message: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers }
          );
        }
      }

      case "proxy": {
        // Proxy requests to Anthropic API
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "No API key configured",
            }),
            { status: 400, headers }
          );
        }

        if (!body?.messages || body.messages.length === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Messages array is required for proxy action",
            }),
            { status: 400, headers }
          );
        }

        try {
          const anthropicResponse = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: body.model || "claude-3-5-sonnet-20241022",
                max_tokens: body.max_tokens || 4096,
                messages: body.messages,
                system: body.system,
                stream: false,
              }),
            }
          );

          if (!anthropicResponse.ok) {
            const errorData = await anthropicResponse.json();
            return new Response(
              JSON.stringify({
                success: false,
                error: "Anthropic API request failed",
                message: errorData.error?.message || "Unknown error",
              }),
              { status: anthropicResponse.status, headers }
            );
          }

          const data = await anthropicResponse.json();
          return new Response(
            JSON.stringify({
              success: true,
              data,
            }),
            { status: 200, headers }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Failed to proxy request",
              message: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers }
          );
        }
      }

      default: {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unknown action: ${action}`,
            message: "Valid actions are: validate, test, proxy",
          }),
          { status: 400, headers }
        );
      }
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers }
    );
  }
};

export const config = {
  path: "/api/key/*",
};
