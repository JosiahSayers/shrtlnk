import { json } from "@remix-run/node";
import { LoaderFunctionArgs } from "react-router";
import { db } from "~/utils/db.server";
import { safelyParseData } from "~/utils/safely-parse";
import { requireAdminRole } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminRole(request);
  const [shrtlnks, loads, blockedUrls] = await db.$transaction([
    db.shrtlnk.count(),
    db.shrtlnkLoad.count(),
    db.blockedUrl.count(),
  ]);

  const safeData = safelyParseData({
    stats: [
      { name: "Shrtlnks", count: shrtlnks },
      { name: "Shrtlnk Loads", count: loads },
      { name: "Blocked URLs", count: blockedUrls },
    ],
  });

  return json(safeData);
}
