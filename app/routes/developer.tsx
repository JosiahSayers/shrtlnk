import { useState } from "react";
import {
  Link,
  LinksFunction,
  LoaderFunction,
  Outlet,
  useLoaderData,
  useLocation,
} from "remix";
import { getUserSession } from "~/utils/session.server";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserSession(request);
  return { userInfo };
};

export default function DeveloperRoot() {
  const { userInfo } = useLoaderData();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const currentPath = useLocation().pathname.split("/developer")[1];

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-dark"
        onClick={() => setShowMobileNav(!showMobileNav)}
      >
        <Link to="/" className="navbar-brand">
          shrtlnk
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse${showMobileNav ? " show" : ""}`}
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav mr-auto">
            <li
              className={
                currentPath === "" || currentPath === "/"
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              <Link to="/developer" className="nav-link">
                Dev Portal
              </Link>
            </li>
            <li
              className={
                currentPath === "/documentation"
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              <Link to="/developer/documentation" className="nav-link">
                Documentation
              </Link>
            </li>
            {userInfo && (
              <li
                className={
                  currentPath === "/applications"
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <Link className="nav-link" to="/developer/applications">
                  My Applications
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {userInfo ? (
              <>
                <li
                  className={
                    currentPath === "/edit-account"
                      ? "nav-item active"
                      : "nav-item"
                  }
                >
                  <Link className="nav-link" to="/developer/account">
                    Hey there, {userInfo.firstName}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/developer/signout"
                    reloadDocument
                  >
                    Sign Out
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li
                  className={
                    currentPath === "/register" ? "nav-item active" : "nav-item"
                  }
                >
                  <Link className="nav-link" to="/developer/register">
                    Register
                  </Link>
                </li>
                <li
                  className={
                    currentPath === "/login" ? "nav-item active" : "nav-item"
                  }
                >
                  <Link className="nav-link" to="/developer/signin">
                    Sign In
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
