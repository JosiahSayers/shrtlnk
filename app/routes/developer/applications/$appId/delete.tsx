import { Application } from "@prisma/client";
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { deleteApp } from "~/application.server";
import { requireUserOwnsApplication } from "~/utils/authorization.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { app } = await requireUserOwnsApplication(request, params.appId);
  return app;
};

export const action: ActionFunction = async ({ request, params }) => {
  const {
    app: { id },
  } = await requireUserOwnsApplication(request, params.appId);
  await deleteApp(id);
  return redirect("/developer/applications");
};

export default function DeleteApp() {
  const app = useLoaderData<Application>();

  return (
    <div className="container">
      <div className="card pt-4 pb-4 pr-4 pl-4">
        <div className="card-body text-center">
          <div className="card-title">
            <p>Are you sure that you want to delete this?</p>
            <p>All applications using this API key will no longer work.</p>
            <p>
              All shrtlnks that were created through this application will not
              be deleted and will remain functional.
            </p>
          </div>
          <div className="card-text">
            <p>
              <strong>App: </strong>
              {app.name}
            </p>
            <Form method="post" className="mt-4">
              <input type="hidden" name="appId" value={app.id} />
              <input type="submit" className="btn btn-danger" value="Delete" />
              <Link to="/developer/applications" className="btn btn-secondary">
                Cancel
              </Link>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}