import crawlbase, { CrawlingAPI } from "crawlbase";

export interface FetchDataOptions {
  method?: "GET" | "POST" | "PUT";
  data?: any;
  headers?: Record<string, string>;
  result?: "JSON" | "TEXT";
}

/**
 * Function to perform GET or POST requests to an API or web page.
 * @param url - The URL to send the request to.
 * @param options - An options object to configure the request.
 * @returns A promise that resolves with the response data.
 */
export async function fetchData(
  url: string,
  options: FetchDataOptions = {}
): Promise<any> {
  const { method = "GET", data, headers = {}, result = "JSON" } = options;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if ((method === "POST" || method === "PUT") && data) {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with:", errorText);
      throw new Error(`Request failed. Status: ${response.status}`);
    }

    if (result === "TEXT") {
      const responseData = await response.text();
      return responseData;
    } else {
      const responseData = await response.json();
      return responseData;
    }
  } catch (error) {
    console.error(`Error in ${method} request:`, error);
    throw error;
  }
}

const api = new CrawlingAPI({
  token: "Ru9Tj21KLrR3gMatnavS_g",
  timeout: 30000,
});

export async function fetchWithProxy(url: string) {
  try {
    const proxyData = await api.get(url);

    return proxyData.body;
  } catch (error: any) {
    if (error instanceof Error) {
      console.error(`Error with Crawlbase Proxy:`, error?.message);
      throw error;
    }
  }
}

export async function fetchScrap(url: string, proxy: boolean) {
  if (proxy) {
    return await fetchWithProxy(url);
  }

  return await fetchData(url, { result: "TEXT" });
}
