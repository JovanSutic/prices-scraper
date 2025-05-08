import * as cheerio from "cheerio";
import { fetchData, fetchScrap } from "./fetch";
import type { CurrentItem } from "../types/scraper";
import type { Product, ProductType } from "../types/api";

export function parseEuroString(value: string) {
  if (value) {
    const cleaned = value.replace(/[€\s]/g, "").replace(",", "");
    return parseFloat(cleaned);
  }

  return 0;
}

/**
 * Function to scrape data from the tables on the webpage.
 * @param url - The URL of the page to scrape.
 * @returns A promise that resolves with an array of objects representing the tables and their data.
 */
export async function scrapeCurrent(url: string, proxy: boolean): Promise<CurrentItem[]> {
  try {
    const response = await fetchScrap(url, proxy);
    const $ = cheerio.load(response);

    // console.log($.html());

    const tableRows: CurrentItem[] = [];
    let category = "";

    $("table tr").each((i, row) => {
      const cells = $(row).find("td");
      const head = $(row).find("th");
      if (head.length) {
        const head = $(row).find("th");
        if (head[0]) {
          category = $(head[0]).text()?.trim() || "";
        }
      }
      if (cells.length === 3) {
        const range = $(cells[2]).text().trim();
        const rowData = {
          product: $(cells[0]).text().trim(),
          category,
          price: parseEuroString($(cells[1]).text().trim()),
          bottom: parseEuroString(range.split("-")?.[0] || ""),
          top: parseEuroString(range.split("-")?.[1] || ""),
        };

        if (rowData.product) {
          tableRows.push(rowData);
        }
      }
    });

    return tableRows;
  } catch (error) {
    console.error("Error scraping tables:", error);
    throw error;
  }
}

export async function addProductType(type: ProductType, token: string) {
  try {
    const products: Product[] = await fetchData(
      `${process.env.BASE_URL}products/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (products.length) {
      return await fetchData(`${process.env.BASE_URL}products/`, {
        method: "PUT",
        data: products.map((item) => (item.type = type)),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }

    return products;
  } catch (error: any) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }
}
