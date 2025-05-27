export interface PriceItem {
  year: string;
  product: string;
  price: string;
}

export type HistoryScrapData = Record<string, PriceItem[]>;

export interface CurrentItem {
  product: string;
  category: string;
  price: number;
  bottom: number;
  top: number;
}

export interface CurrentProduct {
  id: number;
  category: number;
}

export interface CurrentMaps {
  categories: Record<string, number>;
  products: Record<string, CurrentProduct>;
  city: number;
  year: number;
}

export interface CrimeData {
  name: string;
  rank: number;
}