# Edge Functions - API Key Handler

## Overview

This directory contains Netlify Edge Functions for the TanStack Template application. The primary edge function handles secure API key management for the Anthropic AI integration.

## API Key Handler

The `api-key-handler.ts` edge function provides a secure proxy for managing and using Anthropic API keys without exposing them to the client.

### Features

- **Secure Key Storage**: API keys are stored as environment variables on Netlify, never exposed to the browser
- **Key Validation**: Validate that API keys are properly configured
- **API Testing**: Test API keys to ensure they work with Anthropic's API
- **Request Proxying**: Proxy requests to Anthropic API, keeping the API key secure on the server side
- **Custom Keys**: Support for custom API keys via headers (useful for development/testing)
- **CORS Support**: Properly configured CORS headers for browser requests

### Endpoints

The edge function is accessible at:
```
https://your-site.netlify.app/api/key/*
```

### Actions

#### 1. Validate API Key

Check if an API key is configured and get basic information about it.

**Request:**
```bash
POST /api/key/validate
Content-Type: application/json

{
  "action": "validate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key is configured",
  "data": {
    "keySource": "environment",
    "keyPrefix": "sk-ant-a..."
  }
}
```

#### 2. Test API Key

Test the API key by making a minimal request to Anthropic's API.

**Request:**
```bash
POST /api/key/test
Content-Type: application/json

{
  "action": "test"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key is valid and working"
}
```

#### 3. Proxy Request

Proxy a full request to Anthropic's API, keeping your API key secure.

**Request:**
```bash
POST /api/key/proxy
Content-Type: application/json

{
  "action": "proxy",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 4096,
  "system": "You are a helpful assistant."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg_...",
    "type": "message",
    "role": "assistant",
    "content": [...],
    ...
  }
}
```

### Using Custom API Keys

You can provide a custom API key via the `X-API-Key` header:

```bash
POST /api/key/test
Content-Type: application/json
X-API-Key: sk-ant-api03-your-custom-key

{
  "action": "test"
}
```

This is useful for:
- Testing different API keys
- Per-user API key management
- Development and debugging

### Configuration

#### Environment Variables

Set these in your Netlify site configuration:

```bash
# Primary API key (recommended)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Alternative key name (for compatibility)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

#### netlify.toml Configuration

The edge function is configured in `netlify.toml`:

```toml
[[edge_functions]]
  function = "api-key-handler"
  path = "/api/key/*"
```

### Local Development

To test the edge function locally, use the Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev
```

The edge function will be available at:
```
http://localhost:8888/api/key/*
```

### Security Considerations

1. **Never expose API keys in client-side code**: Always use this edge function to proxy requests
2. **Use environment variables**: Store API keys in Netlify's environment variables, not in code
3. **Monitor usage**: Keep track of API usage to detect potential abuse
4. **Rate limiting**: Consider implementing rate limiting for production use
5. **Authentication**: For production, consider adding authentication to prevent unauthorized access

### Error Handling

The edge function provides detailed error responses:

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad request (missing parameters, invalid action, etc.) |
| 401 | Authentication failed (invalid API key) |
| 405 | Method not allowed |
| 500 | Internal server error |

### Example Usage in Application

Here's how to use the edge function in your application:

```typescript
// Test if API key is configured
async function testApiKey() {
  const response = await fetch('/api/key/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'test' }),
  });
  
  const result = await response.json();
  return result.success;
}

// Send a message to Claude via the proxy
async function sendMessage(messages: Array<{role: string, content: string}>) {
  const response = await fetch('/api/key/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'proxy',
      messages,
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
    }),
  });
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
```

### Customization

You can modify the edge function to add:

- Rate limiting per IP or user
- Request logging and analytics
- Custom authentication mechanisms
- Request caching
- Additional API providers
- Custom error messages and responses

### Troubleshooting

**Problem**: "No API key configured" error

**Solution**: Ensure `ANTHROPIC_API_KEY` or `VITE_ANTHROPIC_API_KEY` is set in Netlify environment variables.

---

**Problem**: "API key validation failed" error

**Solution**: Verify that your API key is valid and has sufficient credits in your Anthropic account.

---

**Problem**: Edge function not accessible

**Solution**: Check that the function is properly deployed and the path matches the configuration in `netlify.toml`.

---

**Problem**: CORS errors in browser

**Solution**: The edge function includes CORS headers. If you still see errors, check that you're making requests from an allowed origin.

## Additional Resources

- [Netlify Edge Functions Documentation](https://docs.netlify.com/edge-functions/overview/)
- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/)
- [Deno Runtime Documentation](https://deno.land/manual)
