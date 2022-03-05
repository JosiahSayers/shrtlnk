import { LoaderFunction, redirect } from "remix";
import { signout } from "~/utils/session.server";

export let loader: LoaderFunction = async ({ request }) => {
  return await signout(request);
};
