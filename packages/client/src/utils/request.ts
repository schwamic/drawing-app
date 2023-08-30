import { HTTPMethod } from "@drawing-app/shared/types";

type RequestParams = {
  url: string;
  method: HTTPMethod;
  body?: {
    [key: string]: number | string;
  };
};

export async function request({
  url,
  method,
  body,
}: RequestParams): Promise<unknown> {
  try {
    const response: Response = await fetch(url, {
      method,
      headers: new Headers({
        "Content-Type": "application/json;charset=utf-8",
      }),
      body:
        method === "POST" || method === "PATCH" || method === "PUT"
          ? JSON.stringify(body)
          : undefined,
    });
    if (response.ok) {
      return (await response.json()) as unknown;
    } else {
      throw Error(response.statusText);
    }
  } catch (error: unknown) {
    console.error(error);
  }
}
