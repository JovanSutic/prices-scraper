import { CreateCategoryDto } from "../../../node-test/src/categories/categories.dto";
export enum PriceType {
  CURRENT = "CURRENT",
  HISTORICAL = "HISTORICAL",
}

export enum ProductType {
  ALL = "ALL",
  CURRENT = "CURRENT",
  HISTORICAL = "HISTORICAL",
}

export interface City {
  id: number;
  name: string;
  country: string;
  search: string;
  lat: number;
  lng: number;
  seaside: boolean;
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
  type?: ProductType;
}

export interface CreateProduct {
  name: string;
  categoryId: number;
  unit: string;
  description?: string;
  type?: ProductType;
}

export interface CreatePrice {
  price: number;
  bottom?: number;
  top?: number;
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
  products: Record<string, number>;
  years: Record<string, number>;
  categories: Record<string, number>;
  city: number;
}
