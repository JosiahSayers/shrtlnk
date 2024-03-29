import { Button } from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import AdminHeading from "~/components/developer/admin/AdminHeading";
import { BoxComponent } from "~/components/developer/box";
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

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminRole(request);
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
  const { _action: action, user: idToImpersonate } = await parseForm(request);
  if (action === "stop") {
    return revertImpersonateSession(request, "/developer/admin/impersonate");
  }
  await requireAdminRole(request);
  return impersonateUser(idToImpersonate, request, "/developer/applications");
};

export default function Impersonate() {
  const users = useLoaderData<CleanedUser[]>();
  const [selected, setSelected] = useState<typeof users[number]>(users[0]);
  const { state } = useNavigation();

  return (
    <div className="container">
      <AdminHeading>Impersonate</AdminHeading>
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

        <BoxComponent className="my-3">
          <div className="card-body">
            <h5 className="card-title">
              {selected.firstName} {selected.lastName}
            </h5>
            <div className="card-text">
              <p>
                <strong>Email:</strong> {selected.email}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                  new Date(selected.createdAt)
                )}
              </p>
              <p>
                <strong>Last Login:</strong>{" "}
                {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                  new Date(selected.lastLoginSuccess)
                )}
              </p>
              <p>
                <strong>Last Login Attempt:</strong>{" "}
                {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                  new Date(selected.lastLoginAttempt)
                )}
              </p>
            </div>
          </div>
        </BoxComponent>

        <Button
          type="submit"
          className="btn btn-warning"
          isLoading={state !== "idle"}
        >
          Start Impersonating
        </Button>
      </Form>
    </div>
  );
}
