import { Application } from "@prisma/client";
import {
  ActionFunction,
  Link,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { deleteApp, getApp } from "~/application";
import { requireUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userInfo = await requireUserSession(request);
  const appId = Number.parseInt(params.appId ?? "0");
  const app = await getApp(appId);
  if (!app || app.userId !== userInfo.id) {
    return redirect("/developer/applications", 500);
  }
  return app;
};

export const action: ActionFunction = async ({ request, params }) => {
  const userInfo = await requireUserSession(request);
  const appId = Number.parseInt(params.appId ?? "0");
  await deleteApp(appId, userInfo.id);
  return redirect("/developer/applications");
};

export default function DeleteApp() {
  const app = useLoaderData<Application>();

  return (
    <div className="container">
      <div className="card pt-4 pb-4 pr-4 pl-4">
        <div className="card-body text-center">
          <div className="card-title">
            Are you sure that you want to delete this?
            <br />
            All applications using this API key will no longer work.
            <br />
            All shrtlnks that were created through this application will not be
            deleted and will remain functional.
          </div>
          <div className="card-text">
            <strong>App: </strong>
            {app.name}
            <form method="post" className="mt-4">
              <input type="hidden" name="appId" value={app.id} />
              <input type="submit" className="btn btn-danger" value="Delete" />
              <Link to="/developer/applications" className="btn btn-secondary">
                Cancel
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
