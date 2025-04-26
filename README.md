# Olev

Olev is a job board monitoring service that checks for changes in Lever-based job boards and sends notifications when changes to the listings are detected.

## Supported Platforms

- [ ] Ashby
- [x] Lever
- [ ] Greenhouse

## Features

- Automated monitoring of job boards
- Scheduled checks using Vercel Cron Jobs
- Real-time notifications via LogSnag when changes are detected
- Efficient change detection using XXHash and Redis

## How It Works

1. Vercel Cron Jobs periodically call the `/lever` endpoint with a Lever job board URL
2. Implementations of `JobBoardPlatform` scrapes the job listings from the specified URL
3. `XXHashGenerator` creates a hash of information extracted from the job listings
4. `RedisJobBoardHashStore` compares the new hash with the stored hash
5. If changes are detected, `LogSnagJobListingNotificationService` sends a notification
6. The hash is updated in Redis for future comparisons

## Environment Variables

The following environment variables are required:

```
REDIS_URL=
LOGSNAG_PROJECT_NAME=
LOGSNAG_API_KEY=
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
