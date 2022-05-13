import { ActionFunction, LoaderFunction } from "@remix-run/node";
import Joi from "joi";
import { getAppByApiKey } from "~/application.server";
import { createShrtlnk } from "~/shrtlnk.server";
import { defaultCorsHeaders, jsonWithCors } from "~/utils/api-helpers.server";

export const loader: LoaderFunction = () =>
  new Response(null, {
    headers: new Headers(defaultCorsHeaders),
    status: 204,
  });

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return jsonWithCors(
      { message: `${request.method} requests are not allowed` },
      405
    );
  }

  const apiKey = request.headers.get("api-key");
  const apiKeyValidation = Joi.string().required().validate(apiKey);

  if (apiKeyValidation.error) {
    return jsonWithCors({ message: "api-key header is required" }, 403);
  }

  const application = await getAppByApiKey(apiKeyValidation.value);

  if (!application || application.status !== "Valid") {
    return jsonWithCors({ message: "API key is not valid" }, 403);
  }

  const data = await request.json();
  const urlValidationResult = Joi.string()
    .label("url")
    .required()
    .uri()
    .validate(data.url);

  if (urlValidationResult.error) {
    return jsonWithCors({ message: urlValidationResult.error.message }, 400);
  }

  try {
    const newShrtlnk = await createShrtlnk(
      urlValidationResult.value,
      application.apiKey
    );
    if (!newShrtlnk) {
      return jsonWithCors(
        { message: "Error creating shrtlnk, please try again" },
        500
      );
    }
    return jsonWithCors(
      {
        url: newShrtlnk.url,
        key: newShrtlnk.key,
        shrtlnk: `https://shrtlnk.dev/${newShrtlnk.key}`,
      },
      201
    );
  } catch (e: any) {
    if (e.message === "unsafe URL") {
      return jsonWithCors(
        { message: "This URL has been marked as unsafe and cannot be added" },
        451
      );
    }
    return jsonWithCors({ message: "Unknown error occured" }, 500);
  }
};
