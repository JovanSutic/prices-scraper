export interface PriceItem {
  year: string;
  product: string;
  price: string;
}

export type HistoryScrapData = Record<string, PriceItem[]>;
