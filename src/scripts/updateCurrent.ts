import type { Category, City, CreatePrice, Price, Product } from "../types/api";
import type { CurrentItem, CurrentProduct } from "../types/scraper";
import { fetchData } from "../utils/fetch";
import { areCurrentEqual, prepCurrent } from "../utils/prep";
import { scrapeCurrent } from "../utils/scrapCurrent";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;
  const proxy = false;

  const categoriesMap: Record<string, number> = {};
  const productsMap: Record<string, CurrentProduct> = {};
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
    const cities: City[] = await fetchData(`${baseUrl}cities/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (cities.length) {
      cities.forEach((item) => {
        neededCites.push({...item});
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  if (Object.keys(categoriesMap).length && neededCites.length) {
    for (let index = 0; index < neededCites.length; index++) {
      const city = neededCites[index];
      if (city) {
        const scrapUrl = `https://www.numbeo.com/cost-of-living/in/${city.search}?displayCurrency=EUR`;

        let resultScrape: CurrentItem[] = [];
        const scrapCategories: Record<string, boolean> = {};
        let diffPrices: Record<number, Price> = {};

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

          if (prices.length) {
            prices.forEach((item) => {
              diffPrices[item.productId] = { ...item };
            });
          }
        } catch (error) {
          if (error instanceof Error) {
            console.log(error.message);
            throw error;
          }
        }

        if (resultScrape.length && Object.keys(diffPrices).length) {
          const pricesToCreate: CreatePrice[] = [];
          const pricesToUpdate: Price[] = [];
          const scrapPrices = prepCurrent(resultScrape, {
            products: productsMap,
            year: 16,
            city: city.id,
            categories: categoriesMap,
          });

          scrapPrices.forEach((item) => {
            if (!diffPrices[item.productId]) {
              pricesToCreate.push(item);
            } else {
              if (!areCurrentEqual(diffPrices[item.productId]!, item)) {
                pricesToUpdate.push({
                  ...diffPrices[item.productId]!,
                  top: item.top,
                  bottom: item.bottom,
                  price: item.price,
                });
              }
            }
          });

          if (pricesToCreate.length) {
            try {
              const { count } = await fetchData(`${baseUrl}prices/`, {
                method: "POST",
                data: pricesToCreate,
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


          if(pricesToUpdate.length) {
            try {
                const updateResult = await fetchData(`${baseUrl}prices/`, {
                  method: "PUT",
                  data: pricesToUpdate,
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });
                console.log(`We updated ${updateResult.length} prices records.`);
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
