import * as cheerio from "cheerio";
import { fetchScrap } from "./fetch";
import type { CrimeData } from "../types/scraper";
import type { CrimeAspect } from "../types/api";

export async function scrapeCrimeData(
  url: string,
  proxy: boolean
): Promise<CrimeData[]> {
  const response = await fetchScrap(url, proxy);
  const $ = cheerio.load(response);

  const result: CrimeData[] = [];

  $("table.data_wide_table").each((tableIndex, table) => {
    $(table)
      .find("tr")
      .each((_, row) => {
        const nameCell = $(row).find("td.columnWithName").first();
        const indexCell = $(row).find("td.indexValueTd").eq(0);

        if (nameCell.length && indexCell.length) {
          const name = nameCell.text().trim();
          const rankText = indexCell.text().trim();
          const rank = parseFloat(rankText);

          if (!isNaN(rank)) {
            result.push({ name, rank });
          }
        }
      });
  });

  return result;
}

export function matchAspect(list: CrimeAspect[], item: CrimeData): number {
  const match = list.find((listItem) => listItem.name === item.name);

  return match?.id || 0;
}
