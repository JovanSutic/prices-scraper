import type { Category, City, Product, Year } from "../types/api";
import type { CurrentItem, CurrentProduct } from "../types/scraper";
import { fetchData } from "../utils/fetch";
import { prepCurrent, prepPrices } from "../utils/prep";
import { scrapeCurrent } from "../utils/scrapCurrent";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;
  const proxy = true;

  const categoriesMap: Record<string, number> = {};
  const productsMap: Record<string, CurrentProduct> = {};
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

  try {
    const uniqueCities: { data: number[]; count: number } = await fetchData(
      `${baseUrl}prices/unique-cities?priceType=CURRENT`,
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
    neededCites.length
  ) {
    for (let index = 0; index < neededCites.length; index++) {
      const element = neededCites[index];

      if (element) {
        const scrapUrl = `https://www.numbeo.com/cost-of-living/in/${element.search}?displayCurrency=EUR`;
        console.log(scrapUrl);

        let resultScrape: CurrentItem[] = [];
        const scrapCategories: Record<string, boolean> = {};

        try {
          resultScrape = await scrapeCurrent(scrapUrl, proxy);
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

        if (resultScrape.length) {
          const prices = prepCurrent(resultScrape, {
            products: productsMap,
            year: 16,
            city: element.id,
            categories: categoriesMap,
          });

          const missingPrices = prices.filter(
            (item) => item.price === 0.01
          ).length;

          if (prices.length) {
            console.log(
              `SAVING CURRENT FOR ${element?.name} PRICES UNDER WAY - COUNT ${
                prices.length
              } | MISSING ${((missingPrices / prices.length) * 100).toFixed(
                2
              )}%`
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

  console.log("ADD CURRENT SCRIPT IS DONE");
})();
