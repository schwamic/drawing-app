import { HTTPMethod } from "../types";

export const HTTPMethods: Record<HTTPMethod, HTTPMethod> = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};
