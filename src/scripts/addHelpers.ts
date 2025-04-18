import { ProductType } from "../types/api";
import { addProductType } from "../utils/scrapCurrent";

(async function () {
  const token = process.env.AUTH_TOKEN;

  if (token) {
    try {
      await addProductType(ProductType.ALL, token);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  }

  console.log("ADD HELPERS SCRIPT IS DONE");
})();
