# GitHub Actions Fix - Anti-Detection for Web Scraping

## 🔧 What Was Fixed

The scrapers were failing on GitHub Actions because websites detect automated browsers in CI environments. I've implemented anti-detection measures.

## ✅ Changes Made

### 1. **New Browser Configuration** (`src/scrapers/browserConfig.ts`)

Added a shared browser setup with:
- **Custom User-Agent**: Mimics Chrome on Windows
- **Viewport**: 1920x1080 (standard desktop)
- **Locale**: Romanian (ro-RO) with Bucharest timezone
- **HTTP Headers**: Proper Accept-Language, Connection, etc.
- **Stealth Scripts**: Hides `navigator.webdriver` flag
- **Browser Args**: Disables automation features

### 2. **Updated All Scrapers**

Modified `olx.ts`, `imobiliare.ts`, and `storia.ts`:
- ✅ Use shared browser configuration
- ✅ Wait for `networkidle` instead of `domcontentloaded`
- ✅ Added 3-second delay for JavaScript rendering
- ✅ Increased timeout from 10s to 15s
- ✅ Take screenshots on errors for debugging
- ✅ Better error logging

### 3. **Enhanced GitHub Workflow**

Updated `.github/workflows/digest.yml`:
- ✅ Upload error screenshots as artifacts
- ✅ Continue on error for better debugging

## 🚀 How to Deploy

### Step 1: Commit and Push

```bash
cd /Users/dandragan/housing-agent
git add .
git commit -m "Add anti-detection measures for GitHub Actions"
git push
```

### Step 2: Test on GitHub Actions

1. Go to: https://github.com/DanDragan/housing-agent/actions
2. Click "Housing Digest" workflow
3. Click "Run workflow" → Run workflow
4. Wait 3-5 minutes
5. Check the logs

### Step 3: Check Results

**If successful:**
- ✅ You'll see listing counts in logs
- ✅ Email received
- ✅ State file updated

**If still failing:**
- 📷 Download error screenshots from workflow artifacts
- 📋 Check logs for specific errors
- 🔍 Selectors may need updating

## 🎯 What to Expect

### Before (Old Behavior):
```
OLX: No listings found or timeout
Storia: No listings found or timeout
Imobiliare: No listings found or timeout
Total listings: 0
```

### After (Expected):
```
OLX: Navigating to https://www.olx.ro/...
OLX: Scraped 45 listings
Storia: Navigating to https://www.storia.ro/...
Storia: Scraped 23 listings
Imobiliare: Navigating to https://www.imobiliare.ro/...
Imobiliare: Scraped 31 listings
Total listings: 99
```

## 🔍 Debugging Tips

### If a scraper still fails:

1. **Check screenshots:**
   - Go to workflow run
   - Scroll to "Artifacts" section at bottom
   - Download "error-screenshots"
   - Open PNG files to see what the page looks like

2. **Check logs:**
   - Look for specific error messages
   - Note which scraper is failing
   - Check if it's a timeout or selector issue

3. **Test locally:**
   ```bash
   npm run build
   npm start
   ```
   If it works locally but not on GitHub Actions:
   - The site may be blocking CI IPs
   - May need additional headers or delays

### Update Selectors

If screenshots show the page loaded but no data extracted:

1. Visit the website manually
2. Right-click → Inspect
3. Find the correct selectors
4. Update in `src/scrapers/*.ts`
5. Rebuild and push

## 📊 Key Improvements

| Feature | Before | After |
|---------|--------|-------|
| User-Agent | Default Playwright | Chrome 120 Windows |
| Viewport | Default (800x600) | 1920x1080 |
| Locale | en-US | ro-RO (Romanian) |
| Timezone | UTC | Europe/Bucharest |
| Wait Strategy | domcontentloaded | networkidle + 3s |
| Timeout | 10s | 15s |
| Detection | Visible as bot | Hidden automation |
| Error Debug | None | Screenshots saved |

## 🛡️ Anti-Detection Features

The new configuration makes the browser look like a real user:

✅ No `navigator.webdriver` flag  
✅ Romanian language and timezone  
✅ Proper browser plugins  
✅ Real-looking HTTP headers  
✅ Standard viewport size  
✅ Chrome user agent  
✅ Disabled automation features  

## ⚡ Performance

- **Slightly slower** due to `networkidle` wait
- **More reliable** in CI environments
- **Better error handling** with screenshots
- **Runs in parallel** so still fast overall

## 🔄 Next Steps

1. **Push the changes** (see Step 1 above)
2. **Test on GitHub Actions**
3. **Check your email** for the digest
4. **Monitor for a few runs** to ensure stability

If it still doesn't work after these changes, we may need to:
- Add proxy support
- Use residential IPs
- Add more stealth techniques
- Update website selectors

## 📝 Notes

- Screenshots are only saved on errors
- They're stored as GitHub Actions artifacts for 90 days
- The workflow will continue even if one scraper fails
- Email is sent as long as at least one scraper works

---

**Ready to test?** Run:
```bash
git add . && git commit -m "Fix GitHub Actions scraping" && git push
```

Then trigger the workflow manually and watch the magic happen! ✨

