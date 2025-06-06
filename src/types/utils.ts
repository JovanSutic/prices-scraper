export interface BudgetItem {
  productId: number;
  quantity: number;
}

export enum SocialType {
  SOLO = "SOLO",
  PAIR = "PAIR",
  FAMILY = "FAMILY",
}

export interface AveragePrice {
  country: string;
  productId: number;
  yearId: number;
  average_price: number;
}
