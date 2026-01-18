import OpenAI from "openai";
import { RawListing } from "../types";
import { SEARCH_CONFIG, EMAIL_CONFIG } from "../config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function summarize(listings: RawListing[]): Promise<string> {
  const systemPrompt = `You are a precise real estate analyst helping find the perfect apartment in Bucharest.

Your task is to:
1. NORMALIZE each listing by extracting structured data
2. FILTER listings based on strict criteria
3. RANK listings by quality and match score
4. GENERATE an email-ready digest with the best ${EMAIL_CONFIG.minListings}-${EMAIL_CONFIG.maxListings} listings

NORMALIZATION RULES:
- Extract price in EUR (convert RON using ~5 RON = 1 EUR if needed)
- Extract if individual house or apartment
- Extract square meters (sqm)
- Extract number of rooms (total, not just bedrooms)
- Extract number of bathrooms
- Extract year built (if mentioned in title/description)
- Determine kitchen type (closed/open) if possible
- Identify the neighborhood/area
- Mark as "verify" if data is missing or unclear

FILTERING CRITERIA (STRICT):
✓ BUY listings only (no rent)
✓ Price: Max €${SEARCH_CONFIG.maxPrice}
✓ Size: Min ${SEARCH_CONFIG.minSqm} sqm
✓ Rooms: Min ${SEARCH_CONFIG.minRooms} rooms (2 bedrooms + living)
✓ Bathrooms: Min ${SEARCH_CONFIG.minBathrooms}
✓ Kitchen: Closed kitchen required
✓ Areas: ${SEARCH_CONFIG.areas.join(", ")}
✓ STRONG preference for buildings built after ${SEARCH_CONFIG.priorityYear}

RANKING SCORE (0-100):
+30 points: Built after ${SEARCH_CONFIG.priorityYear}
+30 points: Individual house (not apartment)
+20 points: Price under €300,000
+15 points: 3+ bathrooms
+10 points: 100+ sqm
+10 points: Premium areas (Tineretului, Unirii, Oraselul Copiilor)
+5 points: 4+ rooms
+10 points: Complete data (no "verify" flags)

DIGEST FORMAT:
Subject: 🏠 Bucharest Housing Digest - [Date]

Hi,

Found [X] new listings matching your criteria!

[For each listing:]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 [TITLE]
💰 Price: €[price] ([note if excellent value])
📐 Size: [sqm] sqm
🚪 Rooms: [rooms] | 🚿 Bathrooms: [bathrooms]
🍳 Kitchen: [closed/open/verify]
🏗️ Built: [year] [HIGHLIGHT if post-2010]
📌 Area: [neighborhood]
🔗 [URL]
⭐ Score: [X]/100
📝 Notes: [any important details or flags]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Summary at end]
Total new listings screened: [X]
Passed filters: [X]
Top listings shown: [X]

Next digest: [in 3 days]

---
Housing Agent 🤖`;

  const userPrompt = `Analyze these ${listings.length} new listings and generate the digest:

${JSON.stringify(listings, null, 2)}

Remember:
- Only include listings that meet ALL filtering criteria
- If data is missing/unclear, mark as "verify" but still evaluate if other criteria are strong
- Prioritize post-2010 buildings
- Be concise but informative
- Include warnings about "verify" fields so I can double-check`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    return response.choices[0].message.content ?? "Failed to generate digest.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate digest with OpenAI");
  }
}
