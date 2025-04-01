export interface FetchDataOptions {
  method?: "GET" | "POST";
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
  const { method = "GET", data, headers = {}, result = "TEXT" } = options;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (method === "POST" && data) {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
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
