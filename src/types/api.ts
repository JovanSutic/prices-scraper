import { CreateCategoryDto } from "../../../node-test/src/categories/categories.dto";
export enum PriceType {
  CURRENT = "CURRENT",
  HISTORICAL = "HISTORICAL",
}

export interface City {
  id: number;
  name: string;
  country: string;
  numbeo_id?: number;
}

export interface Year {
  id: number;
  year: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  unit: string;
  description?: string;
}

export interface CreateProduct {
  name: string;
  categoryId: number;
  unit: string;
  description?: string;
}

export interface CreatePrice {
  price: number;
  currency: string;
  cityId: number;
  productId: number;
  yearId: number;
  priceType: PriceType;
}

export interface CreateCategory {
  name: string;
}

export interface PrepPricesConfig {
  products: Record<string, Product>;
  years: Record<string, Year>;
  city: number;
}
