import { json } from "@remix-run/node";
import { LoaderFunctionArgs } from "react-router";
import { db } from "~/utils/db.server";
import { safelyParseData } from "~/utils/safely-parse";
import { requireAdminRole } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminRole(request);
  const [users, admins, applications] = await db.$transaction([
    db.user.count(),
    db.user.count({ where: { role: "Admin" } }),
    db.application.count(),
  ]);

  const safeData = safelyParseData({
    stats: [
      { name: "Users", count: users },
      { name: "Admins", count: admins },
      { name: "Applications", count: applications },
    ],
  });

  return json(safeData);
}
