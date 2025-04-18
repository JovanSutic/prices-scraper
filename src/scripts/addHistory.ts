import type { Category, Product, Year } from "../types/api";
import type { HistoryScrapData } from "../types/scraper";
import { fetchData } from "../utils/fetch";
import { prepPrices } from "../utils/prep";
import { scrapeTables } from "../utils/scrapHistory";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;
  const scrapUrl =
    "https://www.numbeo.com/cost-of-living/city-history/in/Belgrade?displayCurrency=EUR";

  let resultScrape: HistoryScrapData | undefined;
  const categoriesMap: Record<string, number> = {};
  const productsMap: Record<string, number> = {};
  const yearsMap: Record<string, number> = {};

  try {
    resultScrape = await scrapeTables(scrapUrl);
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
        productsMap[`${item.name}_${item.categoryId}`] = item.id;
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  try {
    const years: Year[] = await fetchData(`${baseUrl}years/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (years.length) {
      years.forEach((item) => {
        yearsMap[item.year] = item.id;
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
    Object.keys(productsMap).length &&
    Object.keys(yearsMap).length
  ) {
    const prices = prepPrices(resultScrape, {
      products: productsMap,
      years: yearsMap,
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

  console.log("ADD HISTORY SCRIPT IS DONE");
})();
