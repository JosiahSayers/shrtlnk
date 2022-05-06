import { LoaderFunction, redirect } from "@remix-run/node";
import { getShrtlnk } from "~/shrtlnk.server";

export const loader: LoaderFunction = async ({ params }) => {
  const link = await getShrtlnk(params.shrtlnk!, true);
  return redirect(link ? link.url : "/not-found");
};
