import { json } from "@remix-run/node";
import { JsonFunction } from "@remix-run/server-runtime";

export const defaultCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export const jsonWithCors: JsonFunction = (data, init = {}) => {
  let corsInit: ResponseInit = {};
  if (typeof init !== "number" && init.headers) {
    corsInit = {
      ...init,
      headers: {
        ...defaultCorsHeaders,
        ...init.headers,
      },
    };
  } else if (typeof init === "number") {
    corsInit = {
      headers: defaultCorsHeaders,
      status: init,
    };
  } else {
    corsInit = {
      headers: defaultCorsHeaders,
    };
  }
  return json(data, corsInit);
};
