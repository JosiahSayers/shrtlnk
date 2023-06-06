import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { getAppByApiKey } from "~/application.server";
import { urlSchema } from "~/routes/_index";
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

  if (!apiKey) {
    return jsonWithCors({ message: "api-key header is required" }, 403);
  }

  const application = await getAppByApiKey(apiKey);

  if (!application || application.status !== "Valid") {
    return jsonWithCors({ message: "API key is not valid" }, 403);
  }

  const data = await request.json();
  const urlValidationResult = urlSchema.safeParse(data.url);

  if (!urlValidationResult.success) {
    return jsonWithCors(
      { message: urlValidationResult.error.issues[0].message },
      400
    );
  }

  try {
    const newShrtlnk = await createShrtlnk(
      urlValidationResult.data,
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
