# Olev

Olev is a job board monitoring service that uses Vercel Cron to check for changes on your top-pick company's job boards and sends notifications directly to your mobile device using [LogSnag](https://logsnag.com/) when changes to the listings are detected.

<img src="https://github.com/user-attachments/assets/2f9158fc-0812-44b5-91fb-62b0d116bf39" width="420" />

## Supported Platforms

- [ ] Ashby
- [x] Lever
- [ ] Greenhouse

## Features

- Automated monitoring of job boards
- Scheduled checks using Vercel Cron Jobs
- Real-time notifications via LogSnag when changes are detected
- Efficient change detection using XXHash and Redis
- Rate limiting to prevent excessive API calls (15-minute cooldown per URL)
- URL whitelist support to restrict which job boards can be monitored

## How It Works

1. Vercel Cron Jobs periodically call the recruiting software platform endpoint with a job board URL on the `url` query parameter.
2. URL is checked against the whitelist, if configured (403 Forbidden if not allowed)
3. Rate limiting check ensures the URL hasn't been processed in the last 15 minutes (429 Too Many Requests if rate limited)
4. Implementation of `JobBoardPlatform` scrapes the job listings from the specified URL
5. Implementation of `XXHashGenerator` creates a hash of information extracted from the job listings
6. Implementation of `JobBoardHashStore` compares the new hash with the stored hash
7. If changes are detected, implementation of `JobListingNotificationService` sends a notification
8. The hash is updated in Redis for future comparisons

## Environment Variables

The following environment variables are required:

```
REDIS_URL=
LOGSNAG_PROJECT_NAME=
LOGSNAG_API_KEY=
```

Optional environment variables:

```
WHITELIST_URLS=https://jobs.lever.co/company1,https://jobs.lever.co/company2
```

If you have one configured, these can be pulled by the connected Vercel project using the following command.

```
vercel env pull .env.development.local
```

## Getting Started

```bash
git clone git@github.com:ridafkih/olev.git
```

## Commands

```bash
# Purges the entire remote Redis key-value store.
bun purge
```

## Deployment

Olev uses Vercel's Cron Jobs feature to schedule regular checks of job boards. The current configuration checks specified job boards every 15 minutes:

```json
{
  "crons": [
    {
      "path": "/lever?url=https://jobs.lever.co/your-top-pick-here",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

## Adding New Job Boards

To monitor additional Lever job boards, add new cron job configurations to the `vercel.json` file.

## License

Olev is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Created by Rida F'kih.
