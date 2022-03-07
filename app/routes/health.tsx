import { json, LoaderFunction } from "remix";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
  const dbConnected = !!(await db.shrtlnk.findFirst());
  const currentTime = new Date().getTime();
  const status = dbConnected && currentTime ? "ok" : "error";
  return json({ dbConnected, currentTime, status });
};
