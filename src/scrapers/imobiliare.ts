import { RawListing } from "../types";
import { launchBrowser } from "./browserConfig";

export async function scrapeImobiliare(searchUrl: string): Promise<RawListing[]> {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();
  
  try {
    console.log(`Imobiliare: Navigating to ${searchUrl}`);
    await page.goto(searchUrl, { timeout: 60000, waitUntil: "networkidle" });
    
    // Wait for JavaScript to render
    await page.waitForTimeout(3000);
    
    // Wait for listings to load
    await page.waitForSelector('[data-cy="ad-card"]', { timeout: 15000 }).catch(() => {
      console.log("Imobiliare: No listings found or timeout");
    });

    const listings: RawListing[] = [];

    // Extract listing cards
    const cards = await page.$$('[data-cy="ad-card"]');

    for (const card of cards) {
      try {
        // Extract title
        const titleEl = await card.$('[data-cy="ad-card-title"]');
        const title = titleEl ? await titleEl.textContent() : "";

        // Extract price
        const priceEl = await card.$('[data-cy="ad-price"]');
        const price = priceEl ? await priceEl.textContent() : "";

        // Extract URL
        const linkEl = await card.$('a[href*="/vanzare-apartamente/"]');
        const relativeUrl = linkEl ? await linkEl.getAttribute("href") : "";
        const url = relativeUrl ? `https://www.imobiliare.ro${relativeUrl}` : "";

        // Extract area/location
        const locationEl = await card.$('[data-cy="ad-location"]');
        const area = locationEl ? await locationEl.textContent() : "";

        // Extract size
        const sizeEl = await card.$('[data-cy="ad-size"]');
        const size = sizeEl ? await sizeEl.textContent() : "";

        if (url && title) {
          listings.push({
            source: "imobiliare",
            title: title.trim(),
            price: price?.trim() || "",
            url: url.trim(),
            area: area?.trim() || "",
            size: size?.trim() || ""
          });
        }
      } catch (err) {
        console.error("Imobiliare: Error parsing card:", err);
        continue;
      }
    }

    console.log(`Imobiliare: Scraped ${listings.length} listings`);
    return listings;
  } catch (error) {
    console.error("Imobiliare scraper failed:", error);
    // Take screenshot for debugging
    try {
      await page.screenshot({ path: 'imobiliare-error.png', fullPage: true });
      console.log("Imobiliare: Saved error screenshot");
    } catch (e) {
      // Ignore screenshot errors
    }
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}

