import type { Category, Product, Year } from "../types/api";
import type { CurrentItem, CurrentProduct } from "../types/scraper";
import { fetchData } from "../utils/fetch";
import { prepCurrent, prepPrices } from "../utils/prep";
import { scrapeCurrent } from "../utils/scrapCurrent";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;
  const scrapUrl =
    "https://www.numbeo.com/cost-of-living/in/Belgrade?displayCurrency=EUR";

  let resultScrape: CurrentItem[] = [];
  const categoriesMap: Record<string, number> = {};
  const productsMap: Record<string, CurrentProduct> = {};
  const scrapCategories: Record<string, boolean> = {};

  try {
    resultScrape = await scrapeCurrent(scrapUrl);
    resultScrape.forEach((item) => {
      if (!scrapCategories[item.category]) {
        scrapCategories[item.category] = true;
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  try {
    const categories: Category[] = await fetchData(`${baseUrl}categories/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (categories.length) {
      categories.forEach((item) => {
        categoriesMap[`${item.name}`] = item.id;
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  try {
    const products: Product[] = await fetchData(`${baseUrl}products/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (products.length) {
      products.forEach((item) => {
        if (!productsMap[item.name]) {
          productsMap[`${item.name}`] = {
            id: item.id,
            category: item.categoryId,
          };
        } else {
          productsMap[`${item.name}_${item.categoryId}`] = {
            id: item.id,
            category: item.categoryId,
          };
        }
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  if (
    resultScrape &&
    Object.keys(categoriesMap).length &&
    Object.keys(productsMap).length
  ) {
    const prices = prepCurrent(resultScrape, {
      products: productsMap,
      year: 16,
      city: 1,
      categories: categoriesMap,
    });

    if (prices.length) {
      console.log("SAVING PRICES UNDER WAY");
      try {
        const { count } = await fetchData(`${baseUrl}prices/`, {
          method: "POST",
          data: prices,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log(`We added ${count} prices records.`);
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      }
    }
  }

  console.log("ADD CURRENT SCRIPT IS DONE");
})();
