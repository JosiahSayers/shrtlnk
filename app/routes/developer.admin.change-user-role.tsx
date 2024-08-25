import { Button, HStack, Select, useToast } from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import AdminHeading from "~/components/developer/admin/AdminHeading";
import { BoxComponent } from "~/components/developer/box";
import { db } from "~/utils/db.server";
import { makeUserPrivilegedRoleEmail } from "~/utils/email.server";
import { requireAdminRole } from "~/utils/session.server";

interface LoaderData {
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }>;
  validRoles: string[];
}

const validRoles = ["Developer", "Privileged", "Admin"];

export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await requireAdminRole(request);
  const users = await db.user.findMany({
    orderBy: { firstName: "asc" },
    where: { id: { not: currentUser.id } },
  });
  return {
    users: users.map(({ id, email, firstName, lastName, role }) => ({
      id,
      email,
      firstName,
      lastName,
      role,
    })),
    validRoles,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const admin = await requireAdminRole(request);
  const form = await parseForm<{ user: string; selectedRole: string }>(request);
  if (
    !form.user ||
    !form.selectedRole ||
    !validRoles.includes(form.selectedRole)
  ) {
    return json({ msg: "form not valid" }, 403);
  }
  const user = await db.user.update({
    where: { id: form.user },
    data: { role: form.selectedRole },
  });
  await db.userActivity.createMany({
    data: [
      {
        userId: admin.id,
        activity: "admin-actions.updated-user-role",
        note: `Updated user ID: ${user.id}. new role: ${form.selectedRole}`,
      },
      {
        userId: user.id,
        activity: "role-changed",
        note: `new role: ${form.selectedRole}`,
      },
    ],
  });
  if (form.selectedRole === "Privileged") {
    await makeUserPrivilegedRoleEmail(user);
  }
  return json({ userUpdated: true });
};

export default function ChangeUserRole() {
  const { users, validRoles } = useLoaderData<LoaderData>();
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [selectedRole, setSelectedRole] = useState(users[0].role);
  const { state } = useNavigation();
  const actionData = useActionData();
  const toast = useToast();

  useEffect(() => {
    if (actionData?.userUpdated) {
      toast({
        title: "Success",
        description: "The user's role was successfully updated",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [actionData]);

  return (
    <div className="container">
      <AdminHeading>Change User Role</AdminHeading>
      <Form method="post">
        <HStack>
          <label htmlFor="user">User:</label>
          <Select
            name="user"
            id="user"
            bg="white"
            onChange={(event) => {
              setSelectedUser(users.find((u) => u.id === event.target.value)!);
              setSelectedRole(
                users.find((u) => u.id === event.target.value)!.role
              );
            }}
            value={selectedUser.id}
          >
            {users.map((user) => (
              <option value={user.id} key={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </Select>
        </HStack>

        <BoxComponent className="my-3">
          <div className="card-body">
            <h5 className="card-title">
              {selectedUser.firstName} {selectedUser.lastName}
            </h5>
            <div className="card-text">
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <label htmlFor="selectedRole">
                  <strong className="mr-2">Role:</strong>
                </label>
                <Select
                  name="selectedRole"
                  id="selectedRole"
                  display="inline-block"
                  size="sm"
                  width="fit-content"
                  onChange={(event) => {
                    setSelectedRole(event.target.value);
                  }}
                  value={selectedRole}
                >
                  {validRoles.map((role) => (
                    <option value={role} key={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </p>
            </div>
          </div>
        </BoxComponent>

        <Button
          bg={"blue.400"}
          color={"white"}
          type="submit"
          variant="solid"
          isLoading={state !== "idle"}
        >
          Change Role
        </Button>
      </Form>
    </div>
  );
}
