import "dotenv/config";
import { scrapeOLX } from "./scrapers/olx";
import { scrapeImobiliare } from "./scrapers/imobiliare";
import { scrapeStoria } from "./scrapers/storia";
import { scrapeTrimbitasu } from "./scrapers/trimbitasu";
import { summarize } from "./ai/summarize";
import { sendEmail } from "./email/sendEmail";
import { loadSeen, saveSeen } from "./state/seenListings";
import { RawListing } from "./types";
import { SCRAPER_URLS } from "./config";

async function run() {
  console.log("=== Housing Agent Started ===");
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const seen = loadSeen();
  console.log(`Loaded ${seen.size} previously seen listings`);

  // Run all scrapers in parallel with error handling
  const scraperPromises = [
    scrapeOLX(SCRAPER_URLS.olx).catch((err) => {
      console.error("OLX scraper failed:", err.message);
      return [] as RawListing[];
    }),
    scrapeImobiliare(SCRAPER_URLS.imobiliare).catch((err) => {
      console.error("Imobiliare scraper failed:", err.message);
      return [] as RawListing[];
    }),
    scrapeStoria(SCRAPER_URLS.storia).catch((err) => {
      console.error("Storia scraper failed:", err.message);
      return [] as RawListing[];
    }),
    scrapeTrimbitasu(SCRAPER_URLS.trimbitasu).catch((err) => {
      console.error("Trimbitasu scraper failed:", err.message);
      return [] as RawListing[];
    })
  ];

  const results = await Promise.all(scraperPromises);
  const allListings = results.flat();

  console.log(`Total listings scraped: ${allListings.length}`);

  // Filter out already seen listings
  const fresh = allListings.filter(l => !seen.has(l.url));

  console.log(`New listings: ${fresh.length}`);

  if (fresh.length === 0) {
    console.log("No new listings found. Exiting.");
    return;
  }

  // Generate AI-powered digest
  console.log("Generating digest with OpenAI...");
  const digest = await summarize(fresh);

  // Send email
  console.log("Sending email...");
  await sendEmail(digest);

  // Save newly seen listings
  saveSeen(fresh.map(l => l.url));

  console.log("=== Housing Agent Completed Successfully ===");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
