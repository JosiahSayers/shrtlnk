import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireAdminRole } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import AdminLink from "~/components/developer/admin/AdminLink";

const getLinks = async () => [
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
  {
    href: "blocked-urls",
    title: "Blocked URLs",
  },
  {
    href: "change-user-role",
    title: "Change User Role",
  },
  {
    href: "feedback",
    title: "User Feedback",
    notificationCount: await db.feedback.count({
      where: { acknowledgedByUserId: null },
    }),
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminRole(request);
  return json({ links: await getLinks() });
}

export default function Admin() {
  const { links } = useLoaderData<typeof loader>();

  return (
    <div
      className="container-fluid pl-0"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <div
        className="row no-gutters"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
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
              <AdminLink {...link} key={link.href} />
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
