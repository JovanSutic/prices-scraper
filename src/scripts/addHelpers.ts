import { ProductType } from "../types/api";
import { SocialType } from "../types/utils";
import { addBudgetType, addProductType } from "../utils/scrapCurrent";

(async function () {
  const token = process.env.AUTH_TOKEN;

  if (token) {
    try {
      console.log("addProductType start");
      await addProductType(ProductType.ALL, token);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }

    try {
      console.log("addBudgetType start");
      await addBudgetType(SocialType.SOLO, token);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw error;
      }
    }
  }

  console.log("ADD HELPERS SCRIPT IS DONE");
})();
