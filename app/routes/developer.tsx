import { useState } from "react";
import { LinksFunction, LoaderFunction, Outlet, useLoaderData } from "remix";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const path = request.url.split("/developer")[1];
  return { path, isSignedIn: false };
};

export default function DeveloperRoot() {
  const { path, isSignedIn } = useLoaderData();
  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-dark"
        onClick={() => setShowMobileNav(!showMobileNav)}
      >
        <a className="navbar-brand" href="/">
          shrtlnk
        </a>
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
                path === "" || path === "/" ? "nav-item active" : "nav-item"
              }
            >
              <a className="nav-link" href="/developer">
                Dev Portal
              </a>
            </li>
            <li
              className={
                path === "/documentation" ? "nav-item active" : "nav-item"
              }
            >
              <a className="nav-link" href="/developer/documentation">
                Documentation
              </a>
            </li>
            {isSignedIn && (
              <li
                className={
                  path === "/applications" ? "nav-item active" : "nav-item"
                }
              >
                <a className="nav-link" href="/developer/applications">
                  My Applications
                </a>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {isSignedIn ? (
              <>
                <li
                  className={
                    path === "/edit-account" ? "nav-item active" : "nav-item"
                  }
                >
                  <a className="nav-link" href="/developer/account">
                    Hey there, @auth.CurrentUser.FirstName
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/developer/logout">
                    Sign Out
                  </a>
                </li>
              </>
            ) : (
              <>
                <li
                  className={
                    path === "/register" ? "nav-item active" : "nav-item"
                  }
                >
                  <a className="nav-link" href="/developer/register">
                    Register
                  </a>
                </li>
                <li
                  className={path === "/login" ? "nav-item active" : "nav-item"}
                >
                  <a className="nav-link" href="/developer/signin">
                    Sign In
                  </a>
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
