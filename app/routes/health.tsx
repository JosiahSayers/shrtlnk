import { json, LoaderFunction } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
  const dbConnected = await isDbConnected();
  const currentTime = new Date().getTime();
  const status = dbConnected && currentTime ? "ok" : "error";
  return json(
    { dbConnected, currentTime, status },
    { status: status === "ok" ? 200 : 500 }
  );
};

const isDbConnected = async () => {
  try {
    return !!(await db.shrtlnk.findFirst());
  } catch (e) {
    return false;
  }
};
