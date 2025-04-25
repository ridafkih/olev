# olev

## Prerequisites

In order to compare the hash of the current job postings with that which is stored in the Redis store, you need to instantiate a Redis store, then set the `REDIS_URL` environment variable to the url which points to the Redis store. If you're part of the Vercel organization which is linked to a Redis storage, you can run the following command.

```bash
vercel env pull .env.development.local
```

## Recruiter Platform Scraping Tool

This is a tool that allows you to scrape data from recruitment platforms.

### Supported Platforms

- [x] Lever
- [ ] Ashby

```bash
bun install
```

To run:

```bash
bun lever https://jobs.lever.co/company-lever-link
```
