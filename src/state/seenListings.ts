import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "seen_listings.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadSeen(): Set<string> {
  if (!fs.existsSync(FILE)) return new Set();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return new Set(Object.keys(raw));
  } catch (error) {
    console.error("Error loading seen listings:", error);
    return new Set();
  }
}

export function saveSeen(urls: string[]) {
  const existing = loadSeen();
  urls.forEach(u => existing.add(u));

  const obj: Record<string, string> = {};
  existing.forEach(u => (obj[u] = new Date().toISOString()));

  try {
    fs.writeFileSync(FILE, JSON.stringify(obj, null, 2));
    console.log(`Saved ${urls.length} new listings to state (total: ${existing.size})`);
  } catch (error) {
    console.error("Error saving seen listings:", error);
  }
}
