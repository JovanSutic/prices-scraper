import type { Category } from "../types/api";
import type { HistoryScrapData } from "../types/scraper";
import { fetchData, handleAsync } from "../utils/fetch";
import { prepProducts } from "../utils/prep";
import { scrapeTables } from "../utils/scrapHistory";

(async function () {
  const token =
    "eyJraWQiOiJDemVYd3FTRzg1ZDhDRmFOTWI5XC9aZFZWa0hGeEdWTTJ2Qk5xSFVLT1RTWT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1YXJqN2c2MDdtNXVuc2o0ZWJsdnBtNGxrMyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoibmVzdEFwaVJTXC93cml0ZSIsImF1dGhfdGltZSI6MTc0Mzc3ODQyOCwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfeWZvYXZYU1BuIiwiZXhwIjoxNzQzNzgyMDI4LCJpYXQiOjE3NDM3Nzg0MjgsInZlcnNpb24iOjIsImp0aSI6IjkxYzUyOGM0LWJjOTItNDk4NC05MTI5LTU5ZWRkN2ZlMTE3ZCIsImNsaWVudF9pZCI6IjVhcmo3ZzYwN201dW5zajRlYmx2cG00bGszIn0.mmvJu-X3gCKN_0C552kZTeabxfk5tmZQFG-E8ExK80NEwi2NbqQopm_IxB57k0QrY-3ps7GrsP3Xlqfo_k5l5KMFjcDfWc6mZKET0QfkfyGCS_-JxLmSZx1shp9QsDi3NnLNYhZIOmh6q9O6EH1RBLQl4k233KpNw_YArdp4F5oRswVsKLrh7v1-npNGp33Zdy-ueCDUkUp6-RXswUzxyTfvSj6DnK8vBKvrr49AoWgsF1t_MF0fBoW46SjVB_IP9O7h5cfynwGR-udWmcMSDH2ZfE4-Tb9sfEVSolXG8rWDHusvMvHgNF6SxPomsLcteeHihiZq0V3cMw4Cpryt0w";
  const baseUrl = "http://3.77.158.72:3000/";
  const scrapUrl =
    "https://www.numbeo.com/cost-of-living/city-history/in/Bucharest?displayCurrency=EUR";

  const {
    success: successScrape,
    result: resultScrape,
    error: errorScrape,
  } = await handleAsync<HistoryScrapData>(() => scrapeTables(scrapUrl));

  if (!successScrape || errorScrape) {
    console.log(errorScrape);
    throw new Error(errorScrape || "scrapeTables function error");
  }

  const categories = Object.keys(resultScrape!);

  const {
    success: successCategories,
    result: resultCategories,
    error: errorCategories,
  } = await handleAsync<Category[]>(() =>
    fetchData(`${baseUrl}categories/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  );

  if (!successCategories || errorCategories) {
    console.log(errorCategories);
    throw new Error(errorCategories || "get categories function error");
  }

  if (!(resultCategories || []).length) {
    const { success: successPostCategories, error: errorPostCategories } =
      await handleAsync<Category[]>(() =>
        fetchData(`${baseUrl}categories/`, {
          method: "POST",
          data: categories.map((item) => ({ name: item })),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      );

    if (!successPostCategories || errorPostCategories) {
      console.log(errorPostCategories);
      throw new Error(errorPostCategories || "post categories function error");
    }
  }

  const {
    success: successCategoriesRetry,
    result: resultCategoriesRetry,
    error: errorCategoriesRetry,
  } = await handleAsync<Category[]>(
    () =>
      fetchData(`${baseUrl}categories/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    (resultCategories || []).length ? resultCategories : undefined
  );

  if (!successCategoriesRetry || errorCategoriesRetry) {
    console.log(errorCategoriesRetry);
    throw new Error(
      errorCategoriesRetry || "get categories retry function error"
    );
  }

  if (resultCategoriesRetry?.length && resultScrape) {
    const products = prepProducts(resultScrape, resultCategoriesRetry!);

    const {
      success: successProducts,
      result: resultProducts,
      error: errorProducts,
    } = await handleAsync<Category[]>(() =>
      fetchData(`${baseUrl}products/`, {
        method: "POST",
        data: products,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    );

    if (!successProducts || errorProducts) {
      console.log(errorProducts);
      throw new Error(errorProducts || "post products function error");
    }
  }

  console.log("ADD STATIC SCRIPT IS DONE");
})();
