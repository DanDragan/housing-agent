import { RawListing } from "../types";
import { launchBrowser } from "./browserConfig";

export async function scrapeStoria(searchUrl: string): Promise<RawListing[]> {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();
  
  try {
    console.log(`Storia: Navigating to ${searchUrl}`);
    await page.goto(searchUrl, { timeout: 60000, waitUntil: "networkidle" });
    
    // Wait for JavaScript to render
    await page.waitForTimeout(3000);
    
    // Wait for listings to load
    await page.waitForSelector('[data-cy="listing-item"]', { timeout: 15000 }).catch(() => {
      console.log("Storia: No listings found or timeout");
    });

    const listings: RawListing[] = [];

    // Extract listing items
    const items = await page.$$('[data-cy="listing-item"]');

    for (const item of items) {
      try {
        // Extract title
        const titleEl = await item.$('[data-cy="listing-item-title"]');
        const title = titleEl ? await titleEl.textContent() : "";

        // Extract price
        const priceEl = await item.$('[data-cy="listing-item-price"]');
        const price = priceEl ? await priceEl.textContent() : "";

        // Extract URL
        const linkEl = await item.$('a[href*="/oferta/"]');
        const url = linkEl ? await linkEl.getAttribute("href") : "";

        // Extract location
        const locationEl = await item.$('[data-cy="listing-item-location"]');
        const area = locationEl ? await locationEl.textContent() : "";

        // Extract surface area
        const surfaceEl = await item.$('[data-cy="listing-item-area"]');
        const size = surfaceEl ? await surfaceEl.textContent() : "";

        // Extract rooms
        const roomsEl = await item.$('[data-cy="listing-item-rooms"]');
        const rooms = roomsEl ? await roomsEl.textContent() : "";

        if (url && title) {
          listings.push({
            source: "storia",
            title: title.trim(),
            price: price?.trim() || "",
            url: url.trim(),
            area: area?.trim() || "",
            size: size?.trim() || "",
            rooms: rooms?.trim() || ""
          });
        }
      } catch (err) {
        console.error("Storia: Error parsing item:", err);
        continue;
      }
    }

    console.log(`Storia: Scraped ${listings.length} listings`);
    return listings;
  } catch (error) {
    console.error("Storia scraper failed:", error);
    // Take screenshot for debugging
    try {
      await page.screenshot({ path: 'storia-error.png', fullPage: true });
      console.log("Storia: Saved error screenshot");
    } catch (e) {
      // Ignore screenshot errors
    }
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}

