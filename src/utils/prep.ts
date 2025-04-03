import { PriceType, type CreatePrice, type PrepPricesConfig } from "../types/api";
import type { HistoryScrapData } from "../types/scraper";



export function prepProducts(scrapData: HistoryScrapData) {
  const keys = Object.keys(scrapData);
  const products: string[] = [];

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]!;
    scrapData[key]?.forEach((item) => {
      products.push(item.product);
    });
  }

  const result = new Set(products);
  return result;
}

export function prepPrices(
  scrapData: HistoryScrapData,
  config: PrepPricesConfig
) {
  const { products, years, city } = config;
  const categories = Object.keys(scrapData);
  const result: CreatePrice[] = [];

  for (let index = 0; index < categories.length; index++) {
    const category = categories[index]!;
    scrapData[category]?.forEach((item) => {
      const product = products[item.product];
      const year = years[item.year];

      if (product && year) {
        const price = {
          price: Number(item.price !== "-" ? item.price : 0),
          currency: "EUR",
          cityId: city,
          productId: product.id,
          yearId: year.id,
          priceType: PriceType.HISTORICAL,
        };
        result.push(price);
      }
    });
  }

  return result;
}
