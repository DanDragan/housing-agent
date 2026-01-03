import { chromium } from "playwright";
import { RawListing } from "../types";

export async function scrapeImobiliare(searchUrl: string): Promise<RawListing[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(searchUrl, { timeout: 60000, waitUntil: "domcontentloaded" });
    
    // Wait for listings to load
    await page.waitForSelector('[data-cy="ad-card"]', { timeout: 10000 }).catch(() => {
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
    return [];
  } finally {
    await browser.close();
  }
}

