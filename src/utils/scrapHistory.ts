import * as cheerio from "cheerio";
import { fetchData } from "./fetch";

/**
 * Function to scrape data from the tables on the webpage.
 * @param url - The URL of the page to scrape.
 * @returns A promise that resolves with an array of objects representing the tables and their data.
 */
export async function scrapeTables(url: string): Promise<any[]> {
  try {
    const response = await fetchData(url);
    const $ = cheerio.load(response);

    const tablesData: any[] = [];

    // Find all tables with the specific class that represents the tables you want to scrape
    $("table").each((index: any, table: any) => {
      // Get the title of the table (assumes each table has a heading or title)
      const tableTitle = $(table).prev("h2").text() || `Table ${index + 1}`;

      // Initialize an array to hold the rows of data for this table
      const tableRows: any[] = [];

      // Find all rows in the table (ignoring the header row)
      $(table)
        .find("tbody tr")
        .each((rowIndex: any, row: any) => {
          // Get the year, product, and price from each row (assumes the first column is the year, second is product, and third is price)
          const year = $(row).find("td").eq(0).text().trim(); // Year is in the first column
          const product = $(row).find("td").eq(1).text().trim(); // Product is in the second column
          const price = $(row).find("td").eq(2).text().trim(); // Price is in the third column

          // If the row has valid data, push it into the tableRows array
          if (year && product && price) {
            tableRows.push({ year, product, price });
          }
        });

      if (tableRows.length > 0) {
        tablesData.push({ [tableTitle]: tableRows });
      }
    });

    return tablesData;
  } catch (error) {
    console.error("Error scraping tables:", error);
    throw error;
  }
}
