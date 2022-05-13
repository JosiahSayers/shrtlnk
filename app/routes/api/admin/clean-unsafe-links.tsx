import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { cleanLinks } from "~/utils/admin/clean-links";
import { defaultCorsHeaders, jsonWithCors } from "~/utils/api-helpers.server";

export const loader: LoaderFunction = ({ request }) => {
  if (request.method === "OPTIONS") {
    new Response(null, {
      headers: new Headers(defaultCorsHeaders),
      status: 204,
    });
  }
  return jsonWithCors(
    { message: `${request.method} requests are not allowed` },
    405
  );
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return jsonWithCors(
      { message: `${request.method} requests are not allowed` },
      405
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return jsonWithCors({ message: "Not Authorized" }, 403);
  }

  try {
    cleanLinks();
    return jsonWithCors({ msg: "Cleaning Started" }, 200);
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
