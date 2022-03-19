import { LoaderFunction } from "remix";
import { signout } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  return await signout(request);
};
