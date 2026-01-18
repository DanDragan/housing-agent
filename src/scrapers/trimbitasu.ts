import { RawListing } from "../types";
import { launchBrowser } from "./browserConfig";

export async function scrapeTrimbitasu(searchUrl: string): Promise<RawListing[]> {
  const { browser, context } = await launchBrowser();
  const page = await context.newPage();
  
  try {
    console.log(`Trimbitasu: Navigating to ${searchUrl}`);
    await page.goto(searchUrl, { timeout: 60000, waitUntil: "networkidle" });
    
    // Wait for JavaScript to render
    await page.waitForTimeout(3000);
    
    // Try multiple possible selectors for listing containers
    await page.waitForSelector('.listing-item, .property-card, .ad-card, article, [data-testid="listing"]', { timeout: 15000 }).catch(() => {
      console.log("Trimbitasu: No listings found with primary selectors");
    });

    const listings: RawListing[] = [];

    // Try multiple selector strategies
    let cards = await page.$$('.listing-item');
    
    if (cards.length === 0) {
      cards = await page.$$('.property-card');
    }
    
    if (cards.length === 0) {
      cards = await page.$$('.ad-card');
    }
    
    if (cards.length === 0) {
      cards = await page.$$('article');
    }

    if (cards.length === 0) {
      cards = await page.$$('[class*="listing"]');
    }

    console.log(`Trimbitasu: Found ${cards.length} potential listing cards`);

    for (const card of cards) {
      try {
        // Extract title - try multiple selectors
        let title = "";
        const titleSelectors = [
          'h2', 'h3', '.title', '.listing-title', 
          '[class*="title"]', 'a[href*="apartament"]'
        ];
        
        for (const selector of titleSelectors) {
          const el = await card.$(selector);
          if (el) {
            const text = await el.textContent();
            if (text && text.trim().length > 5) {
              title = text;
              break;
            }
          }
        }

        // Extract price - try multiple selectors
        let price = "";
        const priceSelectors = [
          '.price', '.listing-price', '[class*="price"]',
          'span[class*="price"]', 'div[class*="price"]'
        ];
        
        for (const selector of priceSelectors) {
          const el = await card.$(selector);
          if (el) {
            const text = await el.textContent();
            if (text && (text.includes('€') || text.includes('EUR') || text.includes('lei') || /\d/.test(text))) {
              price = text;
              break;
            }
          }
        }

        // Extract URL
        let url = "";
        const linkEl = await card.$('a[href*="/imobiliare/"], a[href*="/apartament"], a');
        if (linkEl) {
          const href = await linkEl.getAttribute("href");
          if (href) {
            url = href.startsWith('http') ? href : `https://www.trimbitasu.ro${href}`;
          }
        }

        // Extract location/area
        let area = "";
        const locationSelectors = [
          '.location', '.area', '[class*="location"]', 
          '[class*="address"]', 'span[class*="area"]'
        ];
        
        for (const selector of locationSelectors) {
          const el = await card.$(selector);
          if (el) {
            const text = await el.textContent();
            if (text && text.trim().length > 2) {
              area = text;
              break;
            }
          }
        }

        // Extract size
        let size = "";
        const sizeSelectors = [
          '[class*="surface"]', '[class*="size"]', 
          '[class*="sqm"]', '[class*="mp"]'
        ];
        
        for (const selector of sizeSelectors) {
          const el = await card.$(selector);
          if (el) {
            const text = await el.textContent();
            if (text && (text.includes('mp') || text.includes('m²') || text.includes('sqm'))) {
              size = text;
              break;
            }
          }
        }

        // Extract rooms
        let rooms = "";
        const roomsSelectors = [
          '[class*="room"]', '[class*="camere"]',
          'span:has-text("camere")', 'span:has-text("cam")'
        ];
        
        for (const selector of roomsSelectors) {
          const el = await card.$(selector);
          if (el) {
            const text = await el.textContent();
            if (text && (text.includes('cam') || /\d\s*room/.test(text))) {
              rooms = text;
              break;
            }
          }
        }

        // Only add if we have at least title and URL
        if (url && title && title.trim().length > 5) {
          listings.push({
            source: "trimbitasu",
            title: title.trim(),
            price: price?.trim() || "",
            url: url.trim(),
            area: area?.trim() || "",
            size: size?.trim() || "",
            rooms: rooms?.trim() || ""
          });
        }
      } catch (err) {
        console.error("Trimbitasu: Error parsing card:", err);
        continue;
      }
    }

    console.log(`Trimbitasu: Scraped ${listings.length} listings`);
    return listings;
  } catch (error) {
    console.error("Trimbitasu scraper failed:", error);
    // Take screenshot for debugging
    try {
      await page.screenshot({ path: 'trimbitasu-error.png', fullPage: true });
      console.log("Trimbitasu: Saved error screenshot");
    } catch (e) {
      // Ignore screenshot errors
    }
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}

