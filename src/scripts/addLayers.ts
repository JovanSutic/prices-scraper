import type { City, Price, SocialLifestyle } from "../types/api";
import type { CreateLayer } from "../types/utils";
import { calculateLowBudget } from "../utils/budget";
import { fetchData } from "../utils/fetch";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const country = "Bulgaria";
  let layerType: "opt_tax" | "budget_low" = "opt_tax";
  console.log(`START ADDING LAYERS FOR ${country}`);

  let cities: City[] = [];
  const layerItems: CreateLayer[] = [];

  try {
    const citiesData: { data: City[] } = await fetchData(
      `${baseUrl}cities/?country=${country}&take=50'`,
      {
        headers,
      }
    );
    if (citiesData.data?.length) {
      cities = citiesData.data;
    }
  } catch (error) {
    console.log(error);
  }

  if (layerType === "opt_tax") {
    for (const item of cities) {
      try {
        const tax = 14;

        layerItems.push({
          cityId: item.id,
          layerTypeId: 3,
          value: tax,
        });
      } catch (error) {
        console.error(`Failed to fetch prices for city ${item.name}:`, error);
      }
    }
  } else {
    for (const item of cities) {
      try {
        const prices: { data: Price[] } = await fetchData(
          `${baseUrl}prices?sortBy=productId&order=asc&cityId=${item.id}&limit=60&priceType=CURRENT`,
          { headers }
        );

        const budget = calculateLowBudget(prices.data, item.name);

        layerItems.push({
          cityId: item.id,
          layerTypeId: 2,
          value: budget,
        });
      } catch (error) {
        console.error(`Failed to fetch prices for city ${item.name}:`, error);
      }
    }
  }

  if (layerItems.length) {
    try {
      const { count } = await fetchData(`${baseUrl}layers/`, {
        method: "POST",
        data: layerItems,
        headers,
      });
      console.log(`POSTED ${count} LAYERS`);
    } catch (error) {
      console.log(error);
    }
  }

  console.log(`FINISH ADDING LAYERS FOR ${country}`);
})();
