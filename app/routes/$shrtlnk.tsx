import { LoaderFunction, redirect } from "remix";
import { db } from "~/utils/db.server";

export let loader: LoaderFunction = async ({ params }) => {
  const link = await db.shrtlnk.findUnique({
    where: {
      key: params.shrtlnk,
    },
  });
  const redirectTo = link ? link.url : "/not-found";
  return redirect(redirectTo);
};
