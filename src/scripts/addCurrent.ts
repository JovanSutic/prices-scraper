import type { Category, Product, Year } from "../types/api";
import type { CurrentItem, CurrentProduct } from "../types/scraper";
import { fetchData } from "../utils/fetch";
import { prepCurrent, prepPrices } from "../utils/prep";
import { scrapeCurrent } from "../utils/scrapCurrent";

(async function () {
  const token =
    "eyJraWQiOiJDemVYd3FTRzg1ZDhDRmFOTWI5XC9aZFZWa0hGeEdWTTJ2Qk5xSFVLT1RTWT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1YXJqN2c2MDdtNXVuc2o0ZWJsdnBtNGxrMyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibmVzdEFwaVJTXC93cml0ZSIsImF1dGhfdGltZSI6MTc0NTAwMzMwMywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfeWZvYXZYU1BuIiwiZXhwIjoxNzQ1MDA2OTAzLCJpYXQiOjE3NDUwMDMzMDMsInZlcnNpb24iOjIsImp0aSI6IjY3MDRiNTQ5LWRkMWEtNGIwNC05ZjJlLTY3MWU1NTdlZDlhZCIsImNsaWVudF9pZCI6IjVhcmo3ZzYwN201dW5zajRlYmx2cG00bGszIn0.TVJy0iiehzS8D0rUxGhZSo2_NNSHwF_PxZyASS9Evu1MA1CBOTVVOAl2dO7dzlbgqC1OX2OIjJCDcIzPseQXpg_R83vO0BvnTozCzuB7tLbd8KFpHNMTTMhKsaWKE3gIBDRTxwu6AyOzGhQdaPssY3YdAahFBuqnhjoYbE98A_Ry24pDmrc1c911177DmoUz7hLQniWsbVQdnT2qfVcwzF4a3-f8O0uvYCx88jTWY0lqEYKrCZRehfMjxBQZJF9yPBVQcMdXR4CMwdm2EeaaKb57ypGtjJx0ZJTgvw_rNxXG2YvtTUOOBzd5RP79n-tMEPsR4urx0i7yIEOyTtdNVA";
  const baseUrl = "http://3.77.158.72:3000/";
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
    // console.log(prices);

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
