import { LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { requireAdminRole } from "~/utils/session.server";

const getLinks = () => [
  {
    href: "",
    title: "Dashboard",
  },
  {
    href: "impersonate",
    title: "Impersonate",
  },
  {
    href: "cleaned-links",
    title: "Link Cleaning Log",
  },
];

type LoaderData = { links: ReturnType<typeof getLinks> };

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  await requireAdminRole(request);
  return { links: getLinks() };
};

export default function Admin() {
  const { links } = useLoaderData<LoaderData>();
  const currentPath = useLocation().pathname.split("/developer/admin")[1];

  return (
    <div
      className="container-fluid pl-0"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <div className="row no-gutters">
        <div className="col-3 bg-white">
          <h1
            className="text-center"
            style={{
              margin: "1rem 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            Admin Tools
          </h1>

          <nav className="nav flex-column">
            {links.map((link) => (
              <Link
                className={`nav-link${
                  currentPath === link.href || currentPath === `/${link.href}`
                    ? " font-weight-bold"
                    : ""
                }`}
                to={link.href}
                key={link.title}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="col-9 text-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
