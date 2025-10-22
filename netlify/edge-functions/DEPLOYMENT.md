# Edge Function Deployment Checklist

## Pre-Deployment

- [ ] API key is set in Netlify environment variables
  - Variable name: `ANTHROPIC_API_KEY`
  - Format: `sk-ant-api03-...`
- [ ] Edge function file exists at `netlify/edge-functions/api-key-handler.ts`
- [ ] Configuration in `netlify.toml` is correct
- [ ] Project builds successfully: `npm run build`
- [ ] No security vulnerabilities in code

## Local Testing

- [ ] Environment variables set in `.env` file
- [ ] Netlify CLI installed: `npm install -g netlify-cli`
- [ ] Local dev server running: `netlify dev`
- [ ] Edge function accessible at `http://localhost:8888/api/key`
- [ ] Test page loads: `http://localhost:8888/netlify/edge-functions/test-api-key.html`
- [ ] Validate endpoint works
- [ ] Test endpoint works
- [ ] Proxy endpoint works

## Deployment

### Option 1: Netlify CLI

```bash
# Build the project
npm run build

# Deploy to production
netlify deploy --prod

# Or deploy to a branch deploy for testing
netlify deploy
```

### Option 2: GitHub Integration

```bash
# Commit changes
git add .
git commit -m "Add edge function for API key management"

# Push to GitHub
git push origin main

# Netlify will automatically deploy
```

## Post-Deployment Verification

- [ ] Site deployed successfully
- [ ] Check Netlify deploy logs for edge function deployment
- [ ] Edge function appears in Netlify Dashboard → Edge Functions
- [ ] Test production endpoint:
  ```bash
  curl -X POST https://your-site.netlify.app/api/key \
    -H "Content-Type: application/json" \
    -d '{"action":"test"}'
  ```
- [ ] Test via web interface (test-api-key.html)
- [ ] Monitor Netlify Analytics for edge function usage
- [ ] Check Anthropic dashboard for API usage

## Production Configuration

### Environment Variables

Set these in Netlify Dashboard → Site Configuration → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `VITE_ANTHROPIC_API_KEY` | Optional | Alternative key name (for compatibility) |

### Security Settings

- [ ] Enable HTTPS only (enabled by default)
- [ ] Review CORS settings if needed
- [ ] Consider adding rate limiting for production
- [ ] Consider adding authentication
- [ ] Monitor for unusual usage patterns

### netlify.toml Configuration

Ensure this configuration is present:

```toml
[[edge_functions]]
  function = "api-key-handler"
  path = "/api/key/*"
```

## Monitoring

### Netlify Dashboard

- Edge Functions → View logs and metrics
- Analytics → Monitor request patterns
- Build & Deploy → Check deployment history

### Anthropic Dashboard

- Monitor API usage and credits
- Check for rate limit issues
- Review usage patterns

### Error Tracking

If using Sentry or similar:
- Monitor edge function errors
- Set up alerts for high error rates
- Track response times

## Troubleshooting

### Edge Function Not Deploying

1. Check deploy logs in Netlify
2. Verify file path: `netlify/edge-functions/api-key-handler.ts`
3. Verify netlify.toml syntax
4. Try redeploying: `netlify deploy --prod`

### 404 Errors

1. Verify path in netlify.toml matches request path
2. Check edge function deployed successfully
3. Clear CDN cache if needed

### API Key Errors

1. Verify environment variable is set correctly
2. Check key hasn't been revoked
3. Verify sufficient API credits
4. Test key directly with Anthropic API

### Performance Issues

1. Check Netlify edge function logs
2. Monitor response times in Analytics
3. Consider adding caching for repeated requests
4. Review Anthropic API rate limits

## Rollback

If issues occur after deployment:

### Quick Rollback via Netlify

1. Go to Netlify Dashboard → Deploys
2. Find previous working deployment
3. Click "Publish deploy" to rollback

### Manual Rollback via Git

```bash
# Find the commit before edge function changes
git log --oneline

# Revert to that commit
git revert <commit-hash>

# Push changes
git push origin main
```

## Updating the Edge Function

When making changes:

1. Test locally first with `netlify dev`
2. Deploy to a preview branch first
3. Test preview deployment thoroughly
4. Deploy to production
5. Monitor for any issues

## Best Practices

- [ ] Test edge function thoroughly before production
- [ ] Keep API keys secure and rotate periodically
- [ ] Monitor usage and set up alerts
- [ ] Document any custom modifications
- [ ] Keep dependencies updated
- [ ] Review logs regularly
- [ ] Have a rollback plan ready

## Support Resources

- [Netlify Edge Functions Documentation](https://docs.netlify.com/edge-functions/overview/)
- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Edge Function Guide](../../EDGE_FUNCTION_GUIDE.md)
- [Edge Function README](README.md)

## Success Criteria

Deployment is successful when:

- ✅ Edge function deploys without errors
- ✅ API key validation works
- ✅ API key test succeeds
- ✅ Proxy requests work correctly
- ✅ No security vulnerabilities
- ✅ Performance is acceptable
- ✅ Monitoring is in place

---

**Last Updated**: 2024-10-22  
**Version**: 1.0.0
