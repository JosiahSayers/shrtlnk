import { redirect } from "remix";
import { getApp } from "~/application.server";
import { requireUserSession } from "./session.server";

export const requireUserOwnsApplication = async (
  request: Request,
  appId?: string
) => {
  const userInfo = await requireUserSession(request);

  if (!appId) {
    throw redirect("/developer/applications", 404);
  }

  const app = await getApp(appId);
  if (!app || app.userId !== userInfo.id) {
    throw redirect("/developer/applications", 401);
  }

  return { app, userInfo };
};
