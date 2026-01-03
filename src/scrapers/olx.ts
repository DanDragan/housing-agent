import { RawListing } from "../types";
import { launchBrowser } from "./browserConfig";

export async function scrapeOLX(searchUrl: string): Promise<RawListing[]> {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();
  
  try {
    console.log(`OLX: Navigating to ${searchUrl}`);
    await page.goto(searchUrl, { timeout: 60000, waitUntil: "networkidle" });

    // Wait a bit for JavaScript to render
    await page.waitForTimeout(3000);

    // Wait for listings to load
    await page.waitForSelector('[data-cy="l-card"]', { timeout: 15000 }).catch(() => {
      console.log("OLX: Primary selector not found, trying alternatives...");
    });

    const listings: RawListing[] = [];

    // Try multiple possible selectors as OLX changes them frequently
    let cards = await page.$$('[data-cy="l-card"]');
    
    if (cards.length === 0) {
      cards = await page.$$('.css-1sw7q4x');
    }
    
    if (cards.length === 0) {
      cards = await page.$$('[data-testid="l-card"]');
    }

    for (const card of cards) {
      try {
        // Extract title
        let title = "";
        const titleSelectors = ["h6", '[data-cy="ad-card-title"]', ".css-16v5mdi"];
        for (const selector of titleSelectors) {
          const el = await card.$(selector);
          if (el) {
            title = (await el.textContent()) ?? "";
            if (title) break;
          }
        }

        // Extract price
        let price = "";
        const priceSelectors = ['.css-8kqr5l', '[data-testid="ad-price"]', 'p[data-testid="ad-price"]'];
        for (const selector of priceSelectors) {
          const el = await card.$(selector);
          if (el) {
            price = (await el.textContent()) ?? "";
            if (price) break;
          }
        }

        // Extract URL
        const linkEl = await card.$("a");
        const url = linkEl ? await linkEl.getAttribute("href") : "";

        // Extract location from title or description
        const descEl = await card.$("p");
        const description = descEl ? await descEl.textContent() : "";

        if (url && title) {
          listings.push({
            source: "olx",
            title: title.trim(),
            price: price.trim(),
            url: url.trim(),
            area: "verify", // OLX often embeds area in title
            description: description?.trim()
          });
        }
      } catch (err) {
        console.error("OLX: Error parsing card:", err);
        continue;
      }
    }

    console.log(`OLX: Scraped ${listings.length} listings`);
    return listings;
  } catch (error) {
    console.error("OLX scraper failed:", error);
    // Take screenshot for debugging in CI
    try {
      await page.screenshot({ path: 'olx-error.png', fullPage: true });
      console.log("OLX: Saved error screenshot");
    } catch (e) {
      // Ignore screenshot errors
    }
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}
