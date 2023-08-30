import { HTTPResponse } from "../types";

export const HTTPCodes: Record<HTTPResponse, number> = {
  OK: 200,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
};
