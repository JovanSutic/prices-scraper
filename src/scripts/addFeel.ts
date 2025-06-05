import type { City, CreateCityFeel, SocialLifestyle } from "../types/api";
import { fetchData } from "../utils/fetch";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;
  const country = "Bosnia+and+Hercegovina";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let feelCities: City[] = [];

  try {
    const { data: cities }: { data: City[] } = await fetchData(
      `${baseUrl}cities?take=100&country=${country}`,
      {
        headers,
      }
    );

    if (cities.length) {
      feelCities = cities;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  if (feelCities.length) {
    let feels: CreateCityFeel[] = [];
    console.log(`Getting data for ${feelCities.length} cities in ${country}`);

    for (let index = 0; index < feelCities.length; index++) {
      const city = feelCities[index];
      if (!city) {
        console.log("There is no city");
        continue;
      }

      try {
        const { data: budgets }: { data: SocialLifestyle[] } = await fetchData(
          `${baseUrl}social_lifestyle?cityId=${city.id}&yearId=16&type=SOLO`,
          {
            headers,
          }
        );

        if (budgets.length) {
          const budget = budgets[0];
          let rank = 4;
          feels.push({
            cityId: city.id,
            rank,
            tags: "init",
            budget: budget?.avg_price || 0,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (feels.length) {
      try {
        const { count } = await fetchData(`${baseUrl}city-feel/`, {
          method: "POST",
          data: feels,
          headers,
        });
        console.log(`Successfully added ${count} feels for ${country}`);
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          throw error;
        }
      }
    }
  }

  console.log("ADD FEEL SCRIPT IS DONE");
})();