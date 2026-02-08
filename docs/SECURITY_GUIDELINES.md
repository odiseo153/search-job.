# Security Guidelines

## API Authentication

- Store API keys in environment variables, never in source code
- Use unique keys per client or application
- Rotate keys periodically and revoke compromised keys
- Use `ENABLE_API_KEY_AUTH=true` in production

## Secrets Management

- Use `.env` files for local development (never commit them)
- Use Docker secrets or a vault (HashiCorp Vault, AWS Secrets Manager) in production
- Never log API keys or sensitive parameters

## Dependency Security

- Run `npm audit` regularly to check for vulnerabilities
- Keep dependencies up to date with `npm update`
- Review changelogs before major upgrades

## Network Security

- Deploy behind a reverse proxy (nginx, Caddy) with TLS/HTTPS
- Restrict `CORS_ORIGINS` to trusted domains in production
- Use firewall rules to limit access to the API port

## Vulnerability Reporting

See [SECURITY.md](../.github/SECURITY.md) for details on how to report vulnerabilities.
