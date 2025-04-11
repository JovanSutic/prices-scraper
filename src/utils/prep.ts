import {
  PriceType,
  type Category,
  type CreateCategory,
  type CreatePrice,
  type CreateProduct,
  type PrepPricesConfig,
} from "../types/api";
import type { HistoryScrapData } from "../types/scraper";

export function prepCategories(scrapData: HistoryScrapData) {
  const keys = Object.keys(scrapData);
  const result: CreateCategory[] = [];

  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];
    result.push({ name: element! });
  }

  return result;
}

export function prepProducts(
  scrapData: HistoryScrapData,
  categories: Category[]
) {
  const keys = Object.keys(scrapData);
  const products: CreateProduct[] = [];
  const productTrack: Record<string, number> = {};
  const categoriesMap: Record<string, Category> = {};

  for (let index = 0; index < categories.length; index++) {
    const element = categories[index]!;
    categoriesMap[element.name] = element;
  }

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]!;
    scrapData[key]?.forEach((item) => {
      if (!productTrack[item.product]) {
        products.push({
          name: item.product,
          unit: "1 item",
          categoryId: categoriesMap[key]?.id || 0,
        });
        productTrack[item.product] = 1;
      }
    });
  }
  return products;
}

export function prepPrices(
  scrapData: HistoryScrapData,
  config: PrepPricesConfig
) {
  const { products, years, city, categories: categoriesMap } = config;
  const categories = Object.keys(scrapData);
  const result: CreatePrice[] = [];

  for (let index = 0; index < categories.length; index++) {
    const category = categories[index]!;
    scrapData[category]?.forEach((item) => {
      const product = products[`${item.product}_${categoriesMap[category]}`];
      const year = years[item.year];

      if (product && year) {
        const price = {
          price: Number(item.price !== "-" ? item.price : 0.01),
          currency: "EUR",
          cityId: city,
          productId: product,
          yearId: year,
          priceType: PriceType.HISTORICAL,
        };
        result.push(price);
      }
    });
  }

  return result;
}
