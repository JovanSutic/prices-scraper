import type { Price } from "../types/api";
import type { BudgetItem } from "../types/utils";

export function roundToTwoDecimals(value: number): number {
  const decimals = value.toString().split(".")[1];

  if (decimals && decimals.length > 2) {
    return parseFloat(value.toFixed(2));
  }

  return value;
}

const SOCIAL_LIFESTYLE_BUDGET: BudgetItem[] = [
  { productId: 27, quantity: 1 }, // Rent (1-bedroom city center)
  { productId: 38, quantity: 1 }, // Utilities
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

export function calculateSocialLifestyleBudget(prices: Price[]): number {
  let total = 0;

  for (const item of SOCIAL_LIFESTYLE_BUDGET) {
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
