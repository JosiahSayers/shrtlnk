import { useState } from "react";
import { ActionFunction, Form, LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import {
  impersonateUser,
  requireAdminRole,
  revertImpersonateSession,
} from "~/utils/session.server";

type CleanedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLoginAttempt: Date;
  lastLoginSuccess: Date;
};

export const loader: LoaderFunction = async () => {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  return users.map(
    ({
      id,
      email,
      firstName,
      lastName,
      createdAt,
      lastLoginAttempt,
      lastLoginSuccess,
    }) => ({
      id,
      email,
      firstName,
      lastName,
      createdAt,
      lastLoginAttempt,
      lastLoginSuccess,
    })
  );
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  if (action === "stop") {
    return revertImpersonateSession(request, "/developer/admin/impersonate");
  }
  await requireAdminRole(request);
  const idToImpersonate = formData.get("user") as string;
  return impersonateUser(idToImpersonate, request, "/developer/applications");
};

export default function Impersonate() {
  const users = useLoaderData<CleanedUser[]>();
  const [selected, setSelected] = useState<CleanedUser>(users[0]);

  return (
    <div className="container">
      <h2>Impersonate</h2>
      <Form method="post">
        <select
          name="user"
          id="impersonate-select"
          onChange={(event) => {
            setSelected(users.find((u) => u.id === event.target.value)!);
          }}
          value={selected.id}
        >
          {users.map((user) => (
            <option value={user.id} key={user.id}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>

        <div className="card text-center mb-3">
          <div className="card-body">
            <h5 className="card-title">
              {selected.firstName} {selected.lastName}
            </h5>
            <div className="card-text">
              <p>Email: {selected.email}</p>
              <p>
                Created:{" "}
                {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                  new Date(selected.createdAt)
                )}
              </p>
              <p>
                Last Login:{" "}
                {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                  new Date(selected.lastLoginSuccess)
                )}
              </p>
              <p>
                Last Login Attempt:{" "}
                {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                  new Date(selected.lastLoginAttempt)
                )}
              </p>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-warning">
          Impersonate
        </button>
      </Form>
    </div>
  );
}
