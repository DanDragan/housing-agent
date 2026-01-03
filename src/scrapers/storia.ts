import { chromium } from "playwright";
import { RawListing } from "../types";

export async function scrapeStoria(searchUrl: string): Promise<RawListing[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(searchUrl, { timeout: 60000, waitUntil: "domcontentloaded" });
    
    // Wait for listings to load
    await page.waitForSelector('[data-cy="listing-item"]', { timeout: 10000 }).catch(() => {
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
    return [];
  } finally {
    await browser.close();
  }
}

