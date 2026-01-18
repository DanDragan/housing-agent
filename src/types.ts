export interface RawListing {
  source: "imobiliare" | "storia" | "olx" | "trimbitasu";
  title: string;
  price: string;
  url: string;
  area: string;
  size?: string;
  rooms?: string;
  description?: string;
}

export interface NormalizedListing {
  source: string;
  title: string;
  price_eur: number | "verify";
  sqm: number | "verify";
  rooms: number | "verify";
  bathrooms: number | "verify";
  year_built: number | "verify";
  kitchen_type: "closed" | "open" | "verify";
  area: string;
  url: string;
  score?: number;
  notes?: string;
}

export interface FilterCriteria {
  maxPrice: number;
  minSqm: number;
  minRooms: number;
  minBathrooms: number;
  requireClosedKitchen: boolean;
  areas: string[];
  prioritizePost2010: boolean;
  priorityYear: number;
}
  