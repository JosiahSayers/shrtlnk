import { json, LoaderFunction } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async () => {
  const dbConnected = await isDbConnected();
  const currentTime = new Date().getTime();
  const status = dbConnected && currentTime ? "ok" : "error";
  const version = process.env.VERCEL_GIT_COMMIT_SHA;
  return json(
    { dbConnected, currentTime, status, version },
    { status: status === "ok" ? 200 : 500 }
  );
};

const isDbConnected = async () => {
  try {
    return !!(await db.$queryRaw`SELECT 1`);
  } catch (e) {
    return false;
  }
};
