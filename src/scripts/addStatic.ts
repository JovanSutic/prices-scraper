import type { Category } from "../types/api";
import type { HistoryScrapData } from "../types/scraper";
import { fetchData } from "../utils/fetch";
import { prepProducts } from "../utils/prep";
import { scrapeTables } from "../utils/scrapHistory";

(async function () {
  const token = "";
  const baseUrl = "http://3.77.158.72:3000/";
  const scrapUrl =
    "https://www.numbeo.com/cost-of-living/city-history/in/Bucharest?displayCurrency=EUR";

  let resultScrape: HistoryScrapData | undefined;

  try {
    resultScrape = await scrapeTables(scrapUrl);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  const categories = Object.keys(resultScrape!);

  let resultCategories: Category[] | undefined;

  try {
    resultCategories = await fetchData(`${baseUrl}categories/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  if (!(resultCategories || []).length) {
    try {
      await fetchData(`${baseUrl}categories/`, {
        method: "POST",
        data: categories.map((item) => ({ name: item })),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  }

  let resultCategoriesRetry: Category[] | undefined = resultCategories?.length
    ? resultCategories
    : undefined;

  if (!resultCategories?.length) {
    try {
      resultCategoriesRetry = await fetchData(`${baseUrl}categories/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  }

  if (resultCategoriesRetry?.length && resultScrape) {
    const products = prepProducts(resultScrape, resultCategoriesRetry);

    try {
      await fetchData(`${baseUrl}products/`, {
        method: "POST",
        data: products,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  }

  console.log("ADD STATIC SCRIPT IS DONE");
})();
