import {
  Link,
  LoaderFunction,
  Outlet,
  useLoaderData,
  useLocation,
} from "remix";
import { requireAdminRole } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminRole(request);
  return null;
};

export default function Admin() {
  const currentPath = useLocation().pathname.split("/developer/admin")[1];

  return (
    <div
      className="container-fluid pl-0"
      style={{ height: "calc(100vh - 56px)" }}
    >
      <div className="row no-gutters h-100">
        <div className="col-3 bg-white h-100">
          <h1 className="text-center">Admin Tools</h1>

          <nav className="nav flex-column">
            <Link
              className={`nav-link${
                currentPath === "" || currentPath === "/"
                  ? " font-weight-bold"
                  : ""
              }`}
              to="/developer/admin"
            >
              Dashboard
            </Link>
            <Link
              className={`nav-link${
                currentPath === "/impersonate" ? " font-weight-bold" : ""
              }`}
              to="impersonate"
            >
              Impersonate
            </Link>
          </nav>
        </div>
        <div className="col-9 text-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
