import type { City, Price, CreateSocialLifestyle } from "../types/api";
import { fetchData } from "../utils/fetch";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;

  let richCities: City[] = [];

  const citiesList: number[] = [];
  const productList: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 27, 28, 29, 30, 34, 36, 38, 39, 40, 41, 49, 50, 51,
  ];

  const socialLifestyleList: CreateSocialLifestyle[] = [];

  try {
    const cities: City[] = await fetchData(`${baseUrl}cities/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    richCities = cities;

    if (cities.length) {
      cities.forEach((item) => {
        citiesList.push(item.id);
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  if (citiesList.length) {
    for (let index = 0; index < citiesList.length; index++) {
      const city = citiesList[index];

      try {
        const { data: prices }: { data: Price[] } = await fetchData(
          `${baseUrl}prices?limit=100&priceType=CURRENT&sortBy=productId&order=asc&cityId=${city}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (prices.length) {
          const socialLifestylePrices: Price[] = [];

          productList.forEach((item) => {
            const match = prices.find((price) => price.productId === item);
            if (match) {
              socialLifestylePrices.push(match);
            }
          });

          const diff = productList.length - socialLifestylePrices.length;

          if(diff > 0) {
            const leaveCity = richCities.find((item) => item.id === city);
            console.log(`${leaveCity?.name} has ${diff} prices less than we need`);
          }

          if (
            socialLifestylePrices[0] &&
            socialLifestylePrices.length === productList.length &&
            city
          ) {
            socialLifestyleList.push({
              cityId: city,
              yearId: socialLifestylePrices[0].yearId,
              currency: "EUR",
              avg_price: socialLifestylePrices.reduce(
                (acc, next) => acc + next.price,
                0
              ),
            });
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      }
    }
  }

  
  console.log(socialLifestyleList.length);
  console.log(citiesList.length);

  console.log("ADD SOCIAL LIFESTYLE SCRIPT IS DONE");
})();
