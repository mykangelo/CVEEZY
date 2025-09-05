# Spell Check Deployment Guide

## Environment Variables

Add these to your `.env` file for production deployment:

### Required for Production

```bash
# Enable SSL verification for security (default: true)
LANGUAGETOOL_VERIFY_SSL=true

# API timeout in seconds (default: 10)
LANGUAGETOOL_TIMEOUT=10

# Optional: Custom LanguageTool endpoint (default: https://api.languagetool.org/v2/check)
LANGUAGETOOL_ENDPOINT=https://api.languagetool.org/v2/check
```

### Optional: Custom CA Bundle

If you're behind a corporate firewall or have SSL issues:

```bash
# Path to custom CA bundle file (if needed)
LANGUAGETOOL_CA_BUNDLE=/path/to/cacert.pem
```

## Development vs Production

### Development (Local)

```bash
# For local development with SSL issues
LANGUAGETOOL_VERIFY_SSL=false
```

### Production (Deployed)

```bash
# For production deployment (secure)
LANGUAGETOOL_VERIFY_SSL=true
```

## Troubleshooting

### SSL Certificate Issues

1. **Development**: Set `LANGUAGETOOL_VERIFY_SSL=false`
2. **Production**: Ensure your server has updated CA certificates
3. **Corporate Environment**: Use `LANGUAGETOOL_CA_BUNDLE` with your company's CA bundle

### Timeout Issues

-   Increase `LANGUAGETOOL_TIMEOUT` if requests are timing out
-   Default is 10 seconds, increase to 15-30 for slower connections

### Self-Hosted LanguageTool

-   Set `LANGUAGETOOL_ENDPOINT` to your self-hosted instance
-   Example: `LANGUAGETOOL_ENDPOINT=https://your-languagetool-server.com`

## Security Notes

-   **Never** set `LANGUAGETOOL_VERIFY_SSL=false` in production
-   Always use HTTPS endpoints
-   Consider using a self-hosted LanguageTool instance for sensitive data
-   Monitor API usage and implement rate limiting if needed

## Testing

Test your configuration:

```bash
# Test with SSL verification enabled
LANGUAGETOOL_VERIFY_SSL=true php artisan tinker
```

The spell check should work automatically on the Final Check page.
