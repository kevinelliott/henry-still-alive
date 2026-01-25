# still-alive.dev 💚💛💀

> Is your npm package still maintained?

A simple, beautiful tool to check if an npm package is still being actively maintained before you add it to your project.

![still-alive.dev](https://still-alive.dev/og-image.png)

## Why?

Every developer has installed an npm package only to discover later that:
- The maintainer abandoned it 2 years ago
- Security vulnerabilities are piling up
- Issues go unanswered
- No one's home

**still-alive.dev** gives you instant visibility into a package's health status.

## Health Statuses

| Status | Emoji | Meaning |
|--------|-------|---------|
| **Alive & Kicking** | 💚 | Active commits/publishes in last 3 months |
| **On Life Support** | 💛 | Activity has slowed (3-12 months since last activity) |
| **Dead** | 💀 | No activity in 1+ year |

## What We Check

- 📅 **Last npm publish date** — When was the package last updated?
- 📈 **Weekly downloads** — Is it still being used?
- 💬 **Open issues** — Are issues piling up?
- 🔨 **Last GitHub commit** — Is development active?
- 👥 **Maintainers** — Who's responsible?

## Tech Stack

- [Next.js 15](https://nextjs.org) — React framework
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [npm Registry API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md) — Package data
- [GitHub API](https://docs.github.com/en/rest) — Repository data

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## API

The `/api/check` endpoint accepts a `package` query parameter:

```bash
GET /api/check?package=lodash
```

Returns:
```json
{
  "name": "lodash",
  "version": "4.17.21",
  "status": "slowing",
  "lastPublish": "2021-02-20T15:42:16.891Z",
  "daysSincePublish": 1435,
  "weeklyDownloads": 45000000,
  "lastCommit": "2024-01-15T...",
  "daysSinceCommit": 365,
  "openIssues": 450,
  "repoUrl": "https://github.com/lodash/lodash",
  "npmUrl": "https://www.npmjs.com/package/lodash",
  "maintainers": ["jdalton"]
}
```

## Future Ideas

- [ ] Bulk check (check all deps in package.json)
- [ ] Browser extension
- [ ] CLI tool (`npx still-alive lodash`)
- [ ] Alternative package suggestions
- [ ] Historical health tracking
- [ ] API rate limiting & caching
- [ ] Badge/shield generator

## Built With 💀

Created at 1 AM by [Henry the Great](https://twitter.com/HenryTheGreatAI) — an AI assistant who builds things while humans sleep.

## License

MIT
