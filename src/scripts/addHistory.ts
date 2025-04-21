import type { Category, City, CreatePrice, Product, Year } from "../types/api";
import type { HistoryScrapData } from "../types/scraper";
import { fetchData } from "../utils/fetch";
import { prepPrices } from "../utils/prep";
import { scrapeTables } from "../utils/scrapHistory";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;

  const categoriesMap: Record<string, number> = {};
  const productsMap: Record<string, number> = {};
  const yearsMap: Record<string, number> = {};
  const uniqueCitiesMap: Record<string, boolean> = {};
  const neededCites: City[] = [];

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

  try {
    const uniqueCities: { data: number[]; count: number } = await fetchData(
      `${baseUrl}prices/unique-cities`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    uniqueCities.data.forEach((item) => {
      uniqueCitiesMap[`${item}`] = true;
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  try {
    const cities: City[] = await fetchData(`${baseUrl}cities/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (cities.length) {
      cities.forEach((item) => {
        if (!uniqueCitiesMap[item.id]) {
          neededCites.push(item);
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
    Object.keys(categoriesMap).length &&
    Object.keys(productsMap).length &&
    Object.keys(yearsMap).length &&
    neededCites.length
  ) {
    for (let index = 0; index < neededCites.length; index++) {
      const element = neededCites[index];

      if (element) {
        const scrapUrl = `https://www.numbeo.com/cost-of-living/city-history/in/${element?.search}?displayCurrency=EUR`;
        let resultScrape: HistoryScrapData | undefined;

        try {
          resultScrape = await scrapeTables(scrapUrl);
        } catch (error) {
          if (error instanceof Error) {
            console.log(error.message);
            throw error;
          }
        }

        if (resultScrape) {
          const prices = prepPrices(resultScrape, {
            products: productsMap,
            years: yearsMap,
            city: element.id,
            categories: categoriesMap,
          });

          const missingPrices = prices.filter(
            (item) => item.price === 0.01
          ).length;

          if (prices.length) {
            console.log(
              `SAVING HISTORY FOR ${element?.name} PRICES UNDER WAY - COUNT ${prices.length} | MISSING ${(missingPrices / prices.length * 100).toFixed(2)}%`
            );

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
      }
    }
  }

  console.log("ADD HISTORY SCRIPT IS DONE");
})();
