import {
  PriceType,
  type Category,
  type CreateCategory,
  type CreatePrice,
  type CreateProduct,
  type PrepPricesConfig,
  type Price,
} from "../types/api";
import type {
  CurrentItem,
  CurrentMaps,
  CurrentProduct,
  HistoryScrapData,
} from "../types/scraper";
import { categories, products } from "../../../node-test/prisma/seedData";

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

function extractProductAndCategory(
  current: CurrentItem,
  productMap: Record<string, CurrentProduct>,
  categories: Record<string, number>
) {
  const category = categories[current.category];

  if (category && productMap[`${current.product}_${category}`]) {
    return productMap[`${current.product}_${category}`];
  }

  if (productMap[current.product]) {
    return productMap[current.product];
  }

  return null;
}

export function prepCurrent(current: CurrentItem[], maps: CurrentMaps) {
  const { categories, products, city, year } = maps;
  const result: CreatePrice[] = [];

  for (let index = 0; index < current.length; index++) {
    const currentItem = current[index];
    const foreignKeys = extractProductAndCategory(
      currentItem!,
      products,
      categories
    );

    if (city && year && currentItem && foreignKeys) {
      const price = {
        price: currentItem.price > 0 ? currentItem.price : 0.01,
        bottom: currentItem.bottom,
        top: currentItem.top,
        currency: "EUR",
        cityId: city,
        productId: foreignKeys.id,
        yearId: year,
        priceType: PriceType.CURRENT,
      };
      result.push(price);
    }
  }

  return result;
}

export function areCurrentEqual(base: Price, compare: CreatePrice) {
  if (base.price !== compare.price) {
    return false;
  }
  if ((base.bottom || compare.bottom) && base.bottom !== compare.bottom) {
    return false;
  }
  if ((base.top || compare.top) && base.top !== compare.top) {
    return false;
  }
  return true;
}
