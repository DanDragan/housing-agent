# Quick Setup Guide

## Prerequisites

- Node.js 20+ installed
- OpenAI API key
- Gmail account with App Password

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Set Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-your-openai-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_TO=recipient@example.com  # Optional
```

### 3. Test Locally

```bash
npm run build
npm start
```

### 4. Setup GitHub Actions

1. Go to your GitHub repository Settings
2. Navigate to: Settings → Secrets and variables → Actions
3. Add these secrets:
   - `OPENAI_API_KEY`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_TO` (optional)

4. The workflow will run automatically every 3 days at 6 AM UTC
5. You can also trigger it manually from the Actions tab

### 5. Verify It Works

Check that:
- ✅ Build completes: `npm run build`
- ✅ `dist/` folder is created with JavaScript files
- ✅ `data/seen_listings.json` exists
- ✅ Environment variables are set
- ✅ Email is sent successfully

## Gmail App Password Setup

1. Go to https://myaccount.google.com/
2. Enable 2-Factor Authentication
3. Go to https://myaccount.google.com/apppasswords
4. Create a new App Password for "Mail"
5. Use this 16-character password in your `.env` file

## Customization

Edit `src/config.ts` to change:
- Price limits
- Square meter requirements
- Number of rooms/bathrooms
- Target neighborhoods
- Priority year for buildings

## Troubleshooting

**Build fails:** Make sure you're using Node.js 20+
```bash
node --version  # Should be v20.x.x
```

**Scrapers fail:** Real estate sites change frequently. Update selectors in `src/scrapers/*.ts`

**No email received:** 
- Check spam folder
- Verify Gmail App Password (not regular password)
- Check GitHub Actions logs for errors

## File Structure

```
housing-agent/
├── src/              # TypeScript source files
├── dist/             # Compiled JavaScript (auto-generated)
├── data/             # State persistence
├── .github/workflows/ # GitHub Actions
└── node_modules/     # Dependencies
```

## What Happens on Each Run

1. **Scrape** → Fetch listings from OLX, Imobiliare, Storia
2. **Filter** → Remove duplicates and previously seen listings
3. **AI Processing** → Normalize, filter, and rank with OpenAI
4. **Email** → Send digest with top 8-15 listings
5. **Save State** → Commit seen listings back to repo

## Cost

- **OpenAI**: ~$0.001-0.01 per run
- **GitHub Actions**: Free (2000 minutes/month)
- **Email**: Free

**Total: < $1/month**

---

For detailed documentation, see [README.md](README.md)

