import type { City, Price, CreateSocialLifestyle } from "../types/api";
import { SocialType } from "../types/utils";
import {
  calculateSocialLifestyleBudget,
  formatCurrency,
} from "../utils/budget";
import { fetchData } from "../utils/fetch";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;

  let richCities: City[] = [];
  const socialLifestyleList: CreateSocialLifestyle[] = [];

  try {
    const cities: City[] = await fetchData(
      `${baseUrl}cities/missing-social-report?type=SOLO`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (cities.length) {
      richCities = cities;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  if (richCities.length) {
    for (let index = 0; index < richCities.length; index++) {
      const city = richCities[index];

      if (!city) continue;

      try {
        const { data: prices }: { data: Price[] } = await fetchData(
          `${baseUrl}prices?limit=100&priceType=CURRENT&sortBy=productId&order=asc&cityId=${city.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const missingPrice = prices.find((item) => item.price === 0.01);
        if (missingPrice) {
          console.log(`${city.name} has missing price.`);
        }

        if (prices.length && prices.length > 54 && !missingPrice) {
          const budget = calculateSocialLifestyleBudget(prices);

          if (prices[0] && budget && city) {
            socialLifestyleList.push({
              cityId: city.id,
              yearId: prices[0].yearId,
              currency: "EUR",
              type: SocialType.SOLO,
              avg_price: budget,
            });
            console.log(
              `Adding ${city.name} with budget of ${formatCurrency(budget)}`
            );
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      }
    }

    if (socialLifestyleList.length) {
      try {
        const { count } = await fetchData(`${baseUrl}social_lifestyle/`, {
          method: "POST",
          data: socialLifestyleList,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log(`We added ${count} social lifestyle records.`);
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      }
    }
  }

  console.log("ADD SOCIAL LIFESTYLE SCRIPT IS DONE");
})();
