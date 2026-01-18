# 🏠 Housing Agent - Bucharest Real Estate Digest

Automated real estate scraper and digest generator for finding apartments in Bucharest. Runs every 3 days on GitHub Actions, scrapes OLX, Imobiliare.ro, Storia.ro, and Trimbitasu.ro, uses OpenAI for intelligent filtering and ranking, and sends email digests.

## Features

- **Multi-source scraping**: OLX, Imobiliare.ro, Storia.ro, and Trimbitasu.ro
- **Intelligent filtering**: AI-powered normalization and filtering using OpenAI GPT-4o-mini
- **Smart ranking**: Prioritizes buildings built after 2010 and other quality factors
- **Automated scheduling**: Runs every 3 days via GitHub Actions
- **Stateful deduplication**: Tracks seen listings in JSON file committed to repo
- **Email digests**: Sends formatted digest with 8-15 top listings
- **Graceful error handling**: Continues if one scraper fails

## Requirements

- Node.js 20+
- OpenAI API key
- Gmail account with App Password (or other SMTP)
- GitHub account (for Actions)

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd housing-agent
npm install
npx playwright install chromium
```

### 2. Environment Variables

Create a `.env` file (for local testing):

```env
OPENAI_API_KEY=sk-...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=recipient@example.com  # Optional, defaults to EMAIL_USER
```

**For Gmail:**
1. Enable 2FA on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular password)

### 3. Configure Search Criteria

Edit `src/config.ts` to adjust:
- Price range
- Square meters
- Number of rooms/bathrooms
- Target neighborhoods
- Priority year for buildings

### 4. GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `OPENAI_API_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_TO` (optional)

### 5. Run Locally

```bash
npm run build
npm start
```

Or for development:

```bash
npm run dev
```

### 6. GitHub Actions

The workflow runs automatically every 3 days at 6 AM UTC. You can also trigger it manually:

1. Go to Actions tab
2. Select "Housing Digest" workflow
3. Click "Run workflow"

## Project Structure

```
housing-agent/
├── .github/
│   └── workflows/
│       └── digest.yml          # GitHub Actions workflow
├── src/
│   ├── ai/
│   │   └── summarize.ts        # OpenAI integration
│   ├── email/
│   │   └── sendEmail.ts        # Email sending
│   ├── scrapers/
│   │   ├── olx.ts              # OLX scraper
│   │   ├── imobiliare.ts       # Imobiliare.ro scraper
│   │   └── storia.ts           # Storia.ro scraper
│   ├── state/
│   │   └── seenListings.ts     # State management
│   ├── config.ts               # Search configuration
│   ├── types.ts                # TypeScript interfaces
│   └── main.ts                 # Main orchestrator
├── data/
│   └── seen_listings.json      # Tracked listings (auto-generated)
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Scraping**: Playwright scrapes search result pages from all three sites in parallel
2. **Deduplication**: Filters out previously seen URLs
3. **AI Processing**: OpenAI normalizes, filters, and ranks listings based on criteria
4. **Digest Generation**: Creates email-ready digest with top 8-15 listings
5. **Email**: Sends formatted digest via SMTP
6. **State Update**: Commits seen listings back to repository

## Filter Criteria

Current filters (configurable in `src/config.ts`):

- **Type**: Buy only (no rent)
- **Price**: Max €340,000
- **Size**: Min 80 sqm
- **Rooms**: Min 3 (2 bedrooms + living)
- **Bathrooms**: Min 2
- **Kitchen**: Closed kitchen required
- **Neighborhoods**: Tineretului, Timpuri Noi, Dristor, Titan, Vitan, Iancului, Obor, Oraselul Copiilor, Unirii, Nicolae Grigorescu, 1 Decembrie, Pallady, Nicolae Teclu
- **Priority**: Buildings built after 2010

## Ranking System

Listings are scored on a 0-100 scale:

- +30 points: Built after 2010
- +20 points: Price under €300,000
- +15 points: 3+ bathrooms
- +10 points: 100+ sqm
- +10 points: Premium areas
- +5 points: 4+ rooms
- +10 points: Complete data

## Troubleshooting

### Scrapers Failing

Real estate sites change their HTML structure frequently. If scrapers fail:

1. Check the site's current HTML structure
2. Update CSS selectors in `src/scrapers/*.ts`
3. Run locally to test: `npm run dev`

### No Email Received

- Check spam folder
- Verify EMAIL_USER and EMAIL_PASS are correct
- For Gmail, ensure you're using an App Password, not regular password
- Check GitHub Actions logs for errors

### No New Listings

- The agent only processes new listings (not previously seen)
- Check `data/seen_listings.json` to see tracked URLs
- Try deleting the state file to force reprocessing (for testing)

## Development

### Type Checking

```bash
npm run lint
```

### Add New Scraper

1. Create `src/scrapers/newsite.ts`
2. Implement `scrapeNewSite(url: string): Promise<RawListing[]>`
3. Add URL to `SCRAPER_URLS` in `src/config.ts`
4. Add to `main.ts` scraper promises array

### Modify AI Prompt

Edit `src/ai/summarize.ts` to change:
- Normalization rules
- Filtering logic
- Ranking weights
- Digest format

## Cost Estimates

- **OpenAI**: ~$0.001-0.01 per run (depends on listing count)
- **GitHub Actions**: Free tier (2000 minutes/month)
- **Email**: Free (using Gmail SMTP)

**Estimated total**: < $1/month

## Security Notes

- Never commit `.env` file
- Use GitHub Secrets for credentials
- Use App Passwords, not main passwords
- Scrapers run in headless mode (no GUI)

## License

MIT

## Contributing

Contributions welcome! Please:
1. Test locally before submitting PR
2. Update README if adding features
3. Follow existing code style

---

**Note**: This tool is for personal use. Respect websites' Terms of Service and robots.txt. Some sites may block automated access.

