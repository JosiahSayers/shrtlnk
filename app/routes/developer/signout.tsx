import { LoaderFunction } from "@remix-run/node";
import { signout } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  return await signout(request);
};
