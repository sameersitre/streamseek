import type { Genre } from "./media";

export interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  tagline?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: Genre[];
  imdb_id?: string;
  vote_average: number;
  vote_count: number;
  overview: string;
  seasons?: Season[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface CastMember {
  id: number;
  actor: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  size: number;
  site: string;
}

// Watchmode API supported regions (51 countries)
// Docs: https://api.watchmode.com — full list via /v1/regions/ endpoint
export type RegionCode =
  // North America
  | "US" | "CA" | "MX"
  // South America
  | "BR" | "AR" | "CO" | "CL" | "EC" | "PE" | "PA"
  // Europe
  | "GB" | "IE" | "FR" | "DE" | "AT" | "CH" | "IT" | "ES" | "PT"
  | "NL" | "BE" | "DK" | "FI" | "NO" | "SE" | "IS" | "PL" | "CZ"
  | "HU" | "RO" | "BG" | "HR" | "RS" | "UA" | "GR" | "EE" | "LT"
  // Asia-Pacific
  | "AU" | "NZ" | "JP" | "KR" | "SG" | "HK" | "IN" | "ID" | "MY"
  | "PH" | "TH" | "VN"
  // Middle East / Africa
  | "AE" | "IL" | "ZA" | "TR";

export const REGION_MAP: Record<RegionCode, string> = {
  // North America
  US: "USA", CA: "Canada", MX: "Mexico",
  // South America
  BR: "Brazil", AR: "Argentina", CO: "Colombia", CL: "Chile",
  EC: "Ecuador", PE: "Peru", PA: "Panama",
  // Europe
  GB: "United Kingdom", IE: "Ireland", FR: "France", DE: "Germany",
  AT: "Austria", CH: "Switzerland", IT: "Italy", ES: "Spain", PT: "Portugal",
  NL: "Netherlands", BE: "Belgium", DK: "Denmark", FI: "Finland",
  NO: "Norway", SE: "Sweden", IS: "Iceland", PL: "Poland", CZ: "Czech Republic",
  HU: "Hungary", RO: "Romania", BG: "Bulgaria", HR: "Croatia",
  RS: "Serbia", UA: "Ukraine", GR: "Greece", EE: "Estonia", LT: "Lithuania",
  // Asia-Pacific
  AU: "Australia", NZ: "New Zealand", JP: "Japan", KR: "South Korea",
  SG: "Singapore", HK: "Hong Kong", IN: "India", ID: "Indonesia",
  MY: "Malaysia", PH: "Philippines", TH: "Thailand", VN: "Vietnam",
  // Middle East / Africa
  AE: "UAE", IL: "Israel", ZA: "South Africa", TR: "Turkey",
};

export interface OTTPlatform {
  region: RegionCode;
  name: string;
  url: string;
  icon: string;
  type?: string; // "sub", "rent", "buy", "free", "tve"
  price?: number;
}

export interface Season {
  id: number;
  name: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date?: string;
  overview?: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date?: string;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}
