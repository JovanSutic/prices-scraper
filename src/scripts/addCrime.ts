import type {
  City,
  CreateCrimeRank,
  CrimeAspect,
} from "../types/api";
import { matchAspect, scrapeCrimeData } from "../utils/crime";
import { fetchData } from "../utils/fetch";

(async function () {
  const token = process.env.AUTH_TOKEN;
  const baseUrl = process.env.BASE_URL;
  const country = "Sweden";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let crimeCities: City[] = [];
  let crimeAspects: CrimeAspect[] = [];

  try {
    const { data: cities }: { data: City[] } = await fetchData(
      `${baseUrl}cities?take=100&country=${country}`,
      {
        headers,
      }
    );

    if (cities.length) {
      crimeCities = cities;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  try {
    const data: CrimeAspect[] = await fetchData(`${baseUrl}crimes/aspects`, {
      headers,
    });

    if (data.length) {
      crimeAspects = data;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw error;
    }
  }

  if (crimeAspects.length && crimeCities.length) {
    let crimeRanks: CreateCrimeRank[] = [];
    console.log(`Getting data for ${crimeCities.length} cities in ${country}`);

    for (let index = 0; index < crimeCities.length; index++) {
      const city = crimeCities[index];
      if (!city) {
        console.log("There is no city");
        continue;
      }
      const scrapUrl = `https://www.numbeo.com/crime/in/${city.search}`;

      try {
        const scrapData = await scrapeCrimeData(scrapUrl, false);

        if (scrapData.length === 15) {
          console.log(`Preparing data for ${city.name}`);
          scrapData.forEach((item) => {
            const newRank = {
              cityId: city.id,
              yearId: 16,
              crimeAspectId: matchAspect(crimeAspects, item),
              rank: item.rank,
            };

            if (newRank.crimeAspectId && newRank.rank) {
              crimeRanks.push(newRank);
            }
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (crimeRanks.length) {
        try {
          const { count } = await fetchData(`${baseUrl}crimes/`, {
            method: "POST",
            data: crimeRanks,
            headers,
          });
          console.log(`Successfully added ${count} crime ranks for ${country}`)
        } catch (error) {
          if (error instanceof Error) {
            console.log(error.message);
            throw error;
          }
        }
    }
  }

  console.log("ADD CRIME SCRIPT IS DONE");
})();
