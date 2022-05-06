import Joi from "joi";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { getAppByApiKey } from "~/application.server";
import { createShrtlnk } from "~/shrtlnk.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export const loader: LoaderFunction = () =>
  new Response(null, {
    headers: new Headers(corsHeaders),
    status: 204,
  });

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: `${request.method} requests are not allowed` }, 405);
  }

  const apiKey = request.headers.get("api-key");
  const apiKeyValidation = Joi.string().required().validate(apiKey);

  if (apiKeyValidation.error) {
    return json(
      { message: "api-key header is required" },
      { headers: corsHeaders, status: 403 }
    );
  }

  const application = await getAppByApiKey(apiKeyValidation.value);

  if (!application || application.status !== "Valid") {
    return json(
      { message: "API key is not valid" },
      { headers: corsHeaders, status: 403 }
    );
  }

  const data = await request.json();
  const urlValidationResult = Joi.string()
    .label("url")
    .required()
    .uri()
    .validate(data.url);

  if (urlValidationResult.error) {
    return json(
      { message: urlValidationResult.error.message },
      { headers: corsHeaders, status: 400 }
    );
  }

  try {
    const newShrtlnk = await createShrtlnk(
      urlValidationResult.value,
      application.apiKey
    );
    if (!newShrtlnk) {
      return json(
        { message: "Error creating shrtlnk, please try again" },
        { headers: corsHeaders, status: 500 }
      );
    }
    return json(
      {
        url: newShrtlnk.url,
        key: newShrtlnk.key,
        shrtlnk: `https://shrtlnk.dev/${newShrtlnk.key}`,
      },
      { headers: corsHeaders, status: 201 }
    );
  } catch (e: any) {
    if (e.message === "unsafe URL") {
      return json(
        { message: "This URL has been marked as unsafe and cannot be added" },
        451
      );
    }
    return json(
      { message: "Unknown error occured" },
      { headers: corsHeaders, status: 500 }
    );
  }
};
