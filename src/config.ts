export const SEARCH_CONFIG = {
  maxPrice: 340000,
  minSqm: 80,
  minRooms: 3, // 2 bedrooms + living
  minBathrooms: 2,
  requireClosedKitchen: true,
  areas: [
    "Tineretului",
    "Timpuri Noi",
    "Calea Calarasilor",
    "Bulevardul Corneliu Coposu",
    "Strada Delea Veche",
    "Strada Delea Noua",
    "Bulevardul Mihai Eminescu",
    "Strada Vatra Luminoasa",
    "Strada Campia Libertatii",
    "Bulevardul Liviu Rebreanu",
    "Bulevardul Decebal",
    "Bulevardul Burebista",
    "Calea Dudesti",
    "Bulevardul Dacia",
    "Strada Eufrosina Popescu",
    "Strada Racari",
    "Strada Diligentei",
    "Strada Dristorului",
    "Strada Traian Popovici",
    "Strada Popa Nan",
    "Dristor",
    "Titan",
    "Vitan",
    "Iancului",
    "Obor",
    "Unirii",
    "Nicolae Grigorescu",
    "1 Decembrie",
    "Pallady",
    "Nicolae Teclu",
    "Sector 3"
  ],
  prioritizePost2010: true,
  priorityYear: 2010
};

export const EMAIL_CONFIG = {
  minListings: 8,
  maxListings: 15
};

export const SCRAPER_URLS = {
  olx: "https://www.olx.ro/imobiliare/apartamente-garsoniere-de-vanzare/bucuresti/",
  imobiliare: "https://www.imobiliare.ro/vanzare-apartamente/bucuresti",
  storia: "https://www.storia.ro/ro/rezultate/apartamente/bucovina/bucuresti/bucuresti?limit=72&market=ALL&areaMin=80&priceMax=340000&by=DEFAULT&direction=DESC&viewType=listing",
  trimbitasu: "https://www.trimbitasu.ro/imobiliare/bucuresti/apartamente-vanzare"
};
  