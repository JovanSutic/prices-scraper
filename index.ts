import { scrapeTables } from "./src/utils/scrapHistory";

scrapeTables(
  "https://www.numbeo.com/cost-of-living/city-history/in/Bucharest?displayCurrency=EUR"
)
  .then((scrapedData) => {
    console.log("Scraped Tables:", JSON.stringify(scrapedData, null, 2));
  })
  .catch((error) => {
    console.error("Error:", error);
  });
