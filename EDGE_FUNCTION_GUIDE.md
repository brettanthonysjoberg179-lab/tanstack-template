# Edge Function Quick Start Guide

## What is the API Key Edge Function?

The API Key Edge Function is a secure server-side handler that manages your Anthropic API key and proxies requests to the Claude API. This keeps your API key safe and never exposed to client-side code.

## Why Use an Edge Function?

1. **Security**: API keys are stored securely on Netlify's servers, never exposed to browsers
2. **Control**: Centralized request handling allows for rate limiting, logging, and monitoring
3. **Flexibility**: Easy to add authentication, caching, or custom business logic
4. **Performance**: Edge functions run close to your users for low latency

## Quick Start

### 1. Set Up Your API Key

Add your Anthropic API key to Netlify:

**Via Netlify UI:**
1. Go to your site in Netlify Dashboard
2. Navigate to Site Configuration → Environment Variables
3. Add `ANTHROPIC_API_KEY` with your API key value

**Via Netlify CLI:**
```bash
netlify env:set ANTHROPIC_API_KEY "your-api-key-here"
```

**For Local Development:**
Create a `.env` file:
```bash
ANTHROPIC_API_KEY=your-api-key-here
```

### 2. Test the Edge Function

**Using the Test Page:**

Open `netlify/edge-functions/test-api-key.html` in your browser and test:
- Validate: Check if API key is configured
- Test: Verify the key works with Anthropic
- Proxy: Send a test message to Claude

**Using curl:**

```bash
# Validate API key configuration
curl -X POST http://localhost:8888/api/key \
  -H "Content-Type: application/json" \
  -d '{"action":"validate"}'

# Test API key
curl -X POST http://localhost:8888/api/key \
  -H "Content-Type: application/json" \
  -d '{"action":"test"}'

# Proxy a message
curl -X POST http://localhost:8888/api/key \
  -H "Content-Type: application/json" \
  -d '{
    "action":"proxy",
    "messages":[{"role":"user","content":"Hello!"}],
    "model":"claude-3-5-sonnet-20241022",
    "max_tokens":1024
  }'
```

### 3. Use in Your Application

**TypeScript/JavaScript:**

```typescript
import { 
  validateApiKey, 
  testApiKey, 
  proxyToAnthropic 
} from './utils/edge-function-client';

// Check if API key is configured
async function checkSetup() {
  const result = await validateApiKey();
  if (result.success) {
    console.log('✓ API key configured');
  } else {
    console.error('✗ No API key:', result.error);
  }
}

// Send a message to Claude
async function askClaude(question: string) {
  const response = await proxyToAnthropic({
    messages: [
      { role: 'user', content: question }
    ],
    max_tokens: 2048
  });
  
  if (response.success) {
    return response.data.content[0].text;
  } else {
    throw new Error(response.error);
  }
}

// Example usage
const answer = await askClaude('What is the meaning of life?');
console.log(answer);
```

**React Component:**

```tsx
import { useState, useEffect } from 'react';
import { testApiKey, proxyToAnthropic } from '../utils/edge-function-client';

function ChatComponent() {
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    // Check if edge function is working
    testApiKey().then(result => {
      setIsReady(result.success);
    });
  }, []);

  const sendMessage = async () => {
    const result = await proxyToAnthropic({
      messages: [{ role: 'user', content: message }],
    });
    
    if (result.success) {
      setResponse(result.data.content[0].text);
    }
  };

  if (!isReady) {
    return <div>Setting up...</div>;
  }

  return (
    <div>
      <input 
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Ask Claude anything..."
      />
      <button onClick={sendMessage}>Send</button>
      {response && <div>{response}</div>}
    </div>
  );
}
```

## Customization

### Configure the Edge Function

Copy the example config:
```bash
cp netlify/edge-functions/config.example.ts netlify/edge-functions/config.ts
```

Edit `config.ts` to customize:
- Default model and token limits
- Rate limiting settings
- CORS origins
- Custom error messages
- Authentication requirements

### Modify the Edge Function

The edge function source is at `netlify/edge-functions/api-key-handler.ts`.

You can add:
- Request logging
- User authentication
- Rate limiting per user
- Custom caching logic
- Request/response transformations
- Multi-model support

Example - Add logging:
```typescript
export default async (request: Request, context: Context): Promise<Response> => {
  // Log all requests
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  
  // ... existing code ...
}
```

## Advanced Features

### Using Custom API Keys

Pass a custom API key for specific requests:

```typescript
const response = await proxyToAnthropic({
  messages: [{ role: 'user', content: 'Hello' }],
  customApiKey: 'sk-ant-api03-custom-key'
});
```

Or via HTTP header:
```bash
curl -X POST /api/key \
  -H "X-API-Key: your-custom-key" \
  -H "Content-Type: application/json" \
  -d '{"action":"test"}'
```

### Add Authentication

Modify the edge function to check for auth tokens:

```typescript
export default async (request: Request, context: Context): Promise<Response> => {
  const authToken = request.headers.get('Authorization');
  
  if (!authToken || authToken !== Deno.env.get('EXPECTED_TOKEN')) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401 }
    );
  }
  
  // ... rest of the handler ...
}
```

### Add Rate Limiting

Track requests by IP address:

```typescript
const requestCounts = new Map<string, number[]>();

export default async (request: Request, context: Context): Promise<Response> => {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Get recent requests for this IP
  const recentRequests = (requestCounts.get(clientIP) || [])
    .filter(time => time > oneMinuteAgo);
  
  if (recentRequests.length >= 10) {
    return new Response(
      JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
      { status: 429 }
    );
  }
  
  // Record this request
  recentRequests.push(now);
  requestCounts.set(clientIP, recentRequests);
  
  // ... rest of the handler ...
}
```

## Troubleshooting

### "No API key configured" Error

**Solution:** Ensure `ANTHROPIC_API_KEY` is set in Netlify environment variables or `.env` file.

```bash
# Check local environment
cat .env | grep ANTHROPIC_API_KEY

# Check Netlify environment
netlify env:list
```

### Edge Function Not Found (404)

**Solution:** Verify the edge function is deployed:

1. Check `netlify.toml` has the edge function config
2. Redeploy your site: `netlify deploy --prod`
3. Check Netlify deploy logs for edge function deployment

### "API key validation failed"

**Solution:** Your API key may be invalid or expired:

1. Verify the key in Anthropic Console
2. Check you have sufficient credits
3. Ensure the key hasn't been revoked

### CORS Errors

**Solution:** The edge function includes CORS headers. If issues persist:

1. Check browser console for specific error
2. Verify request is going to correct endpoint
3. Check network tab for OPTIONS preflight request

## Deployment

### Deploy to Netlify

The edge function automatically deploys with your site:

```bash
# Build and deploy
npm run build
netlify deploy --prod

# Or use GitHub integration for automatic deploys
git push origin main
```

### Verify Deployment

After deployment, test the production edge function:

```bash
curl -X POST https://your-site.netlify.app/api/key \
  -H "Content-Type: application/json" \
  -d '{"action":"test"}'
```

## Security Best Practices

1. **Never commit API keys** - Always use environment variables
2. **Use HTTPS only** - Edge functions use HTTPS by default on Netlify
3. **Add authentication** - For production, add auth to prevent abuse
4. **Monitor usage** - Check Netlify Analytics and Anthropic usage
5. **Rotate keys** - Periodically rotate your API keys
6. **Rate limit** - Implement rate limiting to prevent abuse
7. **Validate input** - Always validate and sanitize user inputs

## Resources

- [Full Edge Function Documentation](netlify/edge-functions/README.md)
- [Netlify Edge Functions Docs](https://docs.netlify.com/edge-functions/overview/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [TanStack Start Documentation](https://tanstack.com/start)

## Need Help?

- Check the [main README](README.md) for general setup
- See [edge function README](netlify/edge-functions/README.md) for detailed API docs
- Open an issue on GitHub for bugs or feature requests
