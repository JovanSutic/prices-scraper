import * as cheerio from "cheerio";
import { fetchData } from "./fetch";
import type { HistoryScrapData, PriceItem } from "../types/scraper";

/**
 * Function to scrape data from the tables on the webpage.
 * @param url - The URL of the page to scrape.
 * @returns A promise that resolves with an array of objects representing the tables and their data.
 */
export async function scrapeTables(
  url: string
): Promise<HistoryScrapData> {
  try {
    const response = await fetchData(url);
    const $ = cheerio.load(response);

    const tablesData: HistoryScrapData = {};

    $("table").each((index: any, table: any) => {
      const tableTitle = $(table).prev("h3").text();
      const tableRows: PriceItem[] = [];

      const products: string[] = [];

      $(table)
        .find("thead tr th")
        .each((rowIndex: any, head: any) => {
          const product = $(head).text().trim();
          if (product !== "Year") {
            products.push(product);
          }
        });

      $(table)
        .find("tbody tr")
        .each((rowIndex: any, row: any) => {
          for (let index = 0; index < products.length; index++) {
            const product = products[index] || "";
            const year = $(row).find("td").eq(0).text().trim();
            const price = $(row)
              .find("td")
              .eq(index + 1)
              .text()
              .trim();
            if (year && price) {
              tableRows.push({ year, product, price });
            }
          }
        });

      if (tableRows.length > 0) {
        if (tableTitle) {
          tablesData[tableTitle] = tableRows;
        } else {
          const currentKey =
            Object.keys(tablesData)[Object.keys(tablesData).length - 1] || "";
          tablesData[currentKey] = [...tablesData[currentKey]!, ...tableRows];
        }
      }
    });

    return tablesData;
  } catch (error) {
    console.error("Error scraping tables:", error);
    throw error;
  }
}
