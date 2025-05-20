import type { Price, SocialLifestyle } from "../types/api";
import type { BudgetItem } from "../types/utils";
import { fetchData } from "./fetch";

export function roundToTwoDecimals(value: number): number {
  const decimals = value.toString().split(".")[1];

  if (decimals && decimals.length > 2) {
    return parseFloat(value.toFixed(2));
  }

  return value;
}

export const SOLO_BUDGET: BudgetItem[] = [
  { productId: 27, quantity: 1 }, // Rent (1-bedroom city center)
  { productId: 38, quantity: 0.5 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 1 }, // Mobile plan
  { productId: 1, quantity: 12 }, // Inexpensive restaurant meals
  { productId: 2, quantity: 2 }, // Mid-range 3-course meals
  { productId: 3, quantity: 4 }, // McMeal
  { productId: 8, quantity: 12 }, // Cappuccino
  { productId: 9, quantity: 8 }, // Milk
  { productId: 10, quantity: 8 }, // Bread
  { productId: 11, quantity: 2 }, // Eggs (12-pack)
  { productId: 12, quantity: 12 }, // Water (1.5L)
  { productId: 18, quantity: 2 }, // Rice
  { productId: 25, quantity: 2 }, // Chicken
  { productId: 26, quantity: 1 }, // Beef
  { productId: 14, quantity: 2 }, // Apples
  { productId: 20, quantity: 2 }, // Bananas
  { productId: 15, quantity: 1 }, // Oranges
  { productId: 19, quantity: 2 }, // Tomatoes
  { productId: 16, quantity: 2 }, // Potatoes
  { productId: 21, quantity: 1 }, // Onions
  { productId: 17, quantity: 4 }, // Lettuce
  { productId: 22, quantity: 1 }, // Cheese
  { productId: 13, quantity: 4 }, // Domestic beer (store)
  { productId: 48, quantity: 4 }, // Imported beer (store)
  { productId: 4, quantity: 10 }, // Domestic beer (restaurant)
  { productId: 5, quantity: 6 }, // Imported beer (restaurant)
  { productId: 23, quantity: 2 }, // Wine
  { productId: 24, quantity: 4 }, // Cigarettes
  { productId: 36, quantity: 1 }, // Monthly pass (public transport)
  { productId: 49, quantity: 4 }, // Taxi start
  { productId: 50, quantity: 20 }, // Taxi 1 km (5 km * 4 rides)
  { productId: 41, quantity: 1 }, // Fitness club
  { productId: 43, quantity: 2 }, // Cinema
  { productId: 44, quantity: 0.1 }, // Jeans
  { productId: 45, quantity: 0.1 }, // Summer dress
  { productId: 46, quantity: 0.1 }, // Running shoes
  { productId: 47, quantity: 0.05 }, // Leather business shoes
];

export const PAIR_BUDGET: BudgetItem[] = [
  { productId: 27, quantity: 1 }, // Rent
  { productId: 38, quantity: 0.5 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 2 }, // Mobile plan
  { productId: 1, quantity: 24 }, // Inexpensive restaurant meals (2x)
  { productId: 2, quantity: 4 }, // Mid-range 3-course meals
  { productId: 3, quantity: 8 }, // McMeal
  { productId: 8, quantity: 24 }, // Cappuccino
  { productId: 9, quantity: 14 }, // Milk
  { productId: 10, quantity: 14 }, // Bread
  { productId: 11, quantity: 4 }, // Eggs
  { productId: 12, quantity: 20 }, // Water (1.5L)
  { productId: 18, quantity: 5 }, // Rice
  { productId: 25, quantity: 4 }, // Chicken
  { productId: 26, quantity: 2 }, // Beef
  { productId: 14, quantity: 4 }, // Apples
  { productId: 20, quantity: 5 }, // Bananas
  { productId: 15, quantity: 3 }, // Oranges
  { productId: 19, quantity: 4 }, // Tomatoes
  { productId: 16, quantity: 4 }, // Potatoes
  { productId: 21, quantity: 2 }, // Onions
  { productId: 17, quantity: 7 }, // Lettuce
  { productId: 22, quantity: 2 }, // Cheese
  { productId: 13, quantity: 7 }, // Domestic beer (store)
  { productId: 48, quantity: 7 }, // Imported beer (store)
  { productId: 4, quantity: 20 }, // Domestic beer (restaurant)
  { productId: 5, quantity: 12 }, // Imported beer (restaurant)
  { productId: 23, quantity: 4 }, // Wine
  { productId: 24, quantity: 7 }, // Cigarettes
  { productId: 36, quantity: 2 }, // Monthly pass (2 adults)
  { productId: 49, quantity: 6 }, // Taxi start
  { productId: 50, quantity: 30 }, // Taxi 1km (5km * 4 rides * 2)
  { productId: 41, quantity: 2 }, // Fitness club
  { productId: 43, quantity: 4 }, // Cinema
  { productId: 44, quantity: 0.2 }, // Jeans
  { productId: 45, quantity: 0.2 }, // Summer dress
  { productId: 46, quantity: 0.2 }, // Running shoes
  { productId: 47, quantity: 0.1 }, // Leather business shoes
];

export const FAMILY_BUDGET: BudgetItem[] = [
  { productId: 29, quantity: 1 }, // Rent
  { productId: 38, quantity: 1 }, // Utilities
  { productId: 39, quantity: 1 }, // Internet
  { productId: 40, quantity: 2 }, // Mobile plan
  { productId: 1, quantity: 24 }, // Restaurant (couple only)
  { productId: 2, quantity: 4 },
  { productId: 3, quantity: 8 },
  { productId: 8, quantity: 24 }, // Cappuccino

  // Groceries scaled for 2 adults + 1 child (~2.6x base)
  { productId: 9, quantity: 21 },
  { productId: 10, quantity: 21 },
  { productId: 11, quantity: 6 },
  { productId: 12, quantity: 32 },
  { productId: 18, quantity: 6 },
  { productId: 25, quantity: 6 },
  { productId: 26, quantity: 3 },
  { productId: 14, quantity: 6 },
  { productId: 20, quantity: 6 },
  { productId: 15, quantity: 3 },
  { productId: 19, quantity: 6 },
  { productId: 16, quantity: 6 },
  { productId: 21, quantity: 3 },
  { productId: 17, quantity: 11 },
  { productId: 22, quantity: 3 },

  { productId: 13, quantity: 11 }, // Beer (store)
  { productId: 48, quantity: 11 },
  { productId: 4, quantity: 20 }, // Restaurant beer
  { productId: 5, quantity: 12 },
  { productId: 23, quantity: 4 },
  { productId: 24, quantity: 7 },

  { productId: 36, quantity: 2 }, // Transport passes
  { productId: 49, quantity: 10 }, // Taxi
  { productId: 50, quantity: 50 }, // Taxi km

  { productId: 41, quantity: 2 }, // Fitness
  { productId: 43, quantity: 6 }, // Cinema

  { productId: 44, quantity: 0.3 }, // Jeans
  { productId: 45, quantity: 0.3 }, // Dress
  { productId: 46, quantity: 0.3 }, // Shoes
  { productId: 47, quantity: 0.2 }, // Business shoes

  { productId: 54, quantity: 1 }, // Preschool (use 55 for school)
];

export function calculateBudget(
  budgetItems: BudgetItem[],
  prices: Price[]
): number {
  let total = 0;

  for (const item of budgetItems) {
    const priceObj = prices.find((p) => p.productId === item.productId);
    if (!priceObj) {
      console.warn(`Missing price for productId ${item.productId}`);
      continue;
    }

    total += item.quantity * priceObj.price;
  }

  const buffer = total * 0.1;
  return roundToTwoDecimals(total + buffer);
}

export function formatCurrency(
  value: number,
  locale: string = "sr-RS",
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export async function recalculateBudget(cityId: number, token: string) {
  const baseUrl = process.env.BASE_URL;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let budget: SocialLifestyle | null = null;
  let prices: Price[] = [];

  try {
    const { data } = await fetchData(
      `${baseUrl}social_lifestyle/?limit=1&sortBy=id&order=asc&cityId=${cityId}`,
      { headers }
    );

    if (data.length) {
      budget = data[0];
      console.log(`Fetched budget with id: ${data[0].id} .`);
    }
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }

  if (!budget) {
    console.log("We couldn't find the budget");
    return;
  }

  try {
    const { data }: { data: Price[] } = await fetchData(
      `${baseUrl}prices?limit=100&priceType=CURRENT&sortBy=productId&order=asc&cityId=${cityId}`,
      { headers }
    );

    if (data.filter((item) => item.price > 0.01).length > 54) {
      prices = data;
    }
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw error;
  }

  if (!prices.length) {
    console.log("We couldn't find the prices");
    return;
  }

  const newBudget = calculateBudget(SOLO_BUDGET, prices);

  if (newBudget === budget.avg_price) {
    console.log("Budgets are the same");
    return;
  }

  console.log(
    `The old budget is ${budget.avg_price}, while the new one is ${newBudget}`
  );

  try {
    await fetchData(`${baseUrl}social_lifestyle/`, {
      method: "PUT",
      data: [
        {
          ...budget,
          avg_price: newBudget,
        },
      ],
      headers,
    });
    console.log("New budget successfully changed");
  } catch (error) {
    console.error("Error putting new budget:", error);
    throw error;
  }
}

export async function decreaseSoloUtility(token: string) {
  const baseUrl = process.env.BASE_URL;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let budgets: SocialLifestyle[] = [];
  const result: SocialLifestyle[] = [];

  try {
    const { data } = await fetchData(
      `${baseUrl}social_lifestyle/?limit=400&sortBy=id&order=asc&type=SOLO`,
      { headers }
    );

    if (data.length) {
      budgets = data;
      console.log(`Fetched budgets length: ${data.length} .`);
    }
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }

  if (!budgets.length) {
    console.log("There are no budgets to be changed");
    return;
  }

  for (let index = 0; index < budgets.length; index++) {
    const element = budgets[index];

    if (element) {
      try {
        const { data } = await fetchData(
          `${baseUrl}prices?priceType=CURRENT&yearId=16&cityId=${element.cityId}&productId=38`,
          { headers }
        );

        if (data.length) {
          const decrease = data[0].price / 2;
          result.push({
            ...element,
            avg_price: roundToTwoDecimals(element.avg_price - decrease),
          });
        }
      } catch (error) {
        console.error("Error fetching price:", error);
        throw error;
      }
    }
  }

  if (!result.length) {
    console.log("There are no budgets that are we need to PUT");
    return;
  }

  try {
    const putResult = await fetchData(`${baseUrl}social_lifestyle/`, {
      method: "PUT",
      data: result,
      headers,
    });
    console.log(`We have changed ${putResult.length} budgets`);
  } catch (error) {
    console.error("Error putting budgets:", error);
    throw error;
  }
}
