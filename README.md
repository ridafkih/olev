# Olev

Olev is a personal job board monitoring service that uses Vercel Cron to check for changes on selected company job boards and sends notifications directly to your mobile device using [LogSnag](https://logsnag.com/) when changes to the listings are detected.

## Supported Platforms

- [ ] Ashby
- [x] Lever
- [ ] Greenhouse

## Structure

The project is organized as follows:

- `src/app/` - Contains API routes for each supported job board platform
- `src/modules/` - Core functionality modules (redis, notifications, hash generation, etc.)
- `src/interfaces/` - TypeScript interfaces for the project
- `scripts/` - Utility scripts for maintenance

## Features

- Automated monitoring of job boards
- Scheduled checks using Vercel Cron Jobs
- Real-time notifications via LogSnag when changes are detected
- Efficient change detection using XXHash and Redis
- Rate limiting to prevent excessive API calls (15-minute cooldown per URL)
- URL whitelist support to restrict which job boards can be monitored

## How It Works

1. Vercel Cron Jobs periodically call the recruiting platform endpoint with a job board URL (e.g., `/lever?url=https://jobs.lever.co/company`)
2. URL is checked against the whitelist, if configured (403 Forbidden if not allowed)
3. Rate limiting ensures the URL hasn't been processed in the last 15 minutes (429 Too Many Requests if rate limited)
4. The appropriate module scrapes the job listings from the specified URL
5. XXHash generates a hash of information extracted from the job listings
6. The system compares the new hash with the previously stored hash in Redis
7. If changes are detected, a notification is sent via LogSnag
8. The hash is updated in Redis for future comparisons

## Environment Variables

Required:

```
REDIS_URL=
LOGSNAG_PROJECT_NAME=
LOGSNAG_API_KEY=
```

Optional:

```
WHITELIST_URLS=https://jobs.lever.co/company1,https://jobs.lever.co/company2
```

## Local Development

```bash
# Clone the repository
git clone git@github.com:ridafkih/olev.git

# Install dependencies
bun install

# For local development
vercel env pull .env.development.local
```

## Commands

```bash
# Purges the entire remote Redis key-value store
bun purge
```

## Deployment

Olev uses Vercel's Cron Jobs feature to schedule regular checks of job boards. The current configuration in `vercel.json` checks specified job boards every 15 minutes.

## Adding New Job Boards

To monitor additional Lever job boards, add new cron job configurations to the `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/lever?url=https://jobs.lever.co/your-company",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

## License

Olev is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Created by Rida F'kih.
