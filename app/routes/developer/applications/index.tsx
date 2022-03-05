import { Link, LinksFunction, LoaderFunction, useLoaderData } from "remix";
import { getApplicationsWithCounts } from "~/application";
import { requireUserSession } from "~/utils/session.server";
import styles from "~/styles/developer/applications.css";

type LoaderData = {
  user: Awaited<ReturnType<typeof requireUserSession>>;
  applications: Awaited<ReturnType<typeof getApplicationsWithCounts>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  return { user, applications: await getApplicationsWithCounts(user.id) };
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export default function Applications() {
  const { applications, user } = useLoaderData<LoaderData>();

  return (
    <div className="container">
      <Link
        className="btn btn-light"
        role="button"
        id="add-app"
        to="/developer/applications/new"
      >
        Add an application
      </Link>

      {applications.length < 1 && (
        <div className="alert alert-light" role="alert">
          Hi, {user.firstName}.
          <br />
          It looks like you haven't added an application yet.{" "}
          <Link to="/applications/new">Click here</Link> to get started!
        </div>
      )}

      {applications.map((app) => (
        <div className="card pt-4 pb-4 pr-4 pl-4 application-card" key={app.id}>
          <div className="app-info">
            <h2>{app.name}</h2>
            <p>
              <strong>Status: </strong>
              {app.status}
            </p>
            <p>
              <strong>API Key: </strong>
              {app.apiKey}
            </p>
            <p>
              <strong>Created on: </strong>
              {new Date(app.createdAt).toDateString()}
            </p>
            {app.website ? (
              <p>
                <strong>Website: </strong>
                <a href={app.website}>{app.website}</a>
              </p>
            ) : (
              <p>
                <strong>Website: </strong>No website added yet
              </p>
            )}
            <p>
              <strong>Shrtlnks created with application: </strong>
              {app.shrtlnksCreated}
            </p>
            <p>
              <strong>Shrtlnk clicks from this application's shrtlnks: </strong>
              {app.shrtlnkLoads}
            </p>
            <p>
              <strong>
                Unsafe URLs detected and blocked from this application:{" "}
              </strong>
              {app.blockedUrls}
            </p>
          </div>
          <div className="app-buttons">
            <Link
              to={`/applications/edit/${app.id}`}
              className="btn btn-primary"
            >
              Edit App
            </Link>
            <Link
              to={`/applications/delete/${app.id}`}
              className="btn btn-danger"
            >
              Delete App
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
