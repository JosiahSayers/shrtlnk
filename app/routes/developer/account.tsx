import Joi from "joi";
import { useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { validate } from "~/utils/get-validation-errors.server";
import {
  changePassword,
  createUserSession,
  requireUserSession,
  updateName,
} from "~/utils/session.server";

type LoaderData = {
  firstName?: string;
  lastName?: string;
  formType?: "name" | "password";
};

type ActionData = {
  formType?: "name" | "password";
  formLevelError?: string;
  errors?: {
    firstName?: string;
    lastName?: string;
    formType?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  };
  fields?: {
    firstName?: string;
    lastName?: string;
    formType?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  };
};

const validateNameForm = (form: {
  firstName: FormDataEntryValue | null;
  lastName: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    firstName: Joi.string().label("First Name").required(),
    lastName: Joi.string().label("Last Name").required(),
  });
  return validate<{ firstName: string; lastName: string }>(schema, form);
};

const validatePasswordForm = (form: {
  currentPassword: FormDataEntryValue | null;
  newPassword: FormDataEntryValue | null;
  confirmNewPassword: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    currentPassword: Joi.string().label("Current Password").required(),
    newPassword: Joi.string().label("New Password").required().min(8),
    confirmNewPassword: Joi.string()
      .required()
      .valid(Joi.ref("newPassword"))
      .messages({ "any.only": '"Confirm Password" must match "New Password"' }),
  });
  return validate<{
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }>(schema, form);
};

export const loader: LoaderFunction = async ({ request }) => {
  const { firstName, lastName } = await requireUserSession(request);
  const formType = new URL(request.url).searchParams.get("formType");
  return { firstName, lastName, formType };
};

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await requireUserSession(request);
  const formData = await request.formData();
  const formType = formData.get("_action");
  console.log({ formType });

  if (formType === "name") {
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const { fields, errors } = validateNameForm({ firstName, lastName });
    if (errors) {
      return json({ errors, fields, formType: "name" }, 400);
    }
    const newUser = await updateName(
      fields.firstName,
      fields.lastName,
      userInfo.id
    );
    return createUserSession(newUser, "/developer/applications");
  }

  if (formType === "password") {
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmNewPassword = formData.get("confirmNewPassword");
    const { fields, errors } = validatePasswordForm({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    if (errors) {
      return json({ errors, fields, formType: "password" }, 400);
    }
    try {
      const newUser = await changePassword(
        fields.currentPassword,
        fields.newPassword,
        userInfo.id
      );
      if (!newUser) {
        return json({
          formLevelError: "Something went wrong, please try again.",
          formType: "password",
        });
      }
      return redirect("/developer/applications");
    } catch (e: any) {
      if (e.message === "password mismatch") {
        return json({
          errors: {
            currentPassword:
              "The password you entered does not match your current password",
          },
          fields,
          formType: "password",
        });
      }
    }
  }
};

export default function Account() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [formType, setFormType] = useState<"name" | "password">(
    loaderData?.formType || actionData?.formType || "name"
  );

  const firstName = loaderData?.firstName || actionData?.fields?.firstName;
  const lastName = loaderData?.lastName || actionData?.fields?.lastName;

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li
              className="nav-item"
              id="edit-name"
              onClick={() => setFormType("name")}
            >
              <Link
                className={`nav-link${formType === "name" ? " active" : ""}`}
                to="/developer/account?formType=name"
              >
                Edit Name
              </Link>
            </li>
            <li
              className="nav-item"
              id="change-password"
              onClick={() => setFormType("password")}
            >
              <Link
                className={`nav-link${
                  formType === "password" ? " active" : ""
                }`}
                to="/developer/account?formType=password"
              >
                Change Password
              </Link>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {actionData?.formLevelError && (
            <p className="text-danger">{actionData.formLevelError}</p>
          )}
          {formType === "name" && (
            <Form method="post">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>{" "}
                <input
                  type="text"
                  defaultValue={firstName}
                  name="firstName"
                  id="firstName"
                />
                {actionData?.errors?.firstName && (
                  <p className="text-danger">{actionData.errors.firstName}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>{" "}
                <input
                  type="text"
                  defaultValue={lastName}
                  name="lastName"
                  id="lastName"
                />
                {actionData?.errors?.lastName && (
                  <p className="text-danger">{actionData.errors.lastName}</p>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                name="_action"
                value="name"
              >
                Submit
              </button>
            </Form>
          )}
          {formType === "password" && (
            <Form method="post">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>{" "}
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  defaultValue={actionData?.fields?.currentPassword}
                />
                {actionData?.errors?.currentPassword && (
                  <p className="text-danger">
                    {actionData.errors.currentPassword}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>{" "}
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  defaultValue={actionData?.fields?.newPassword}
                />
                {actionData?.errors?.newPassword && (
                  <p className="text-danger">{actionData.errors.newPassword}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm Password</label>{" "}
                <input
                  type="password"
                  name="confirmNewPassword"
                  id="confirmNewPassword"
                  defaultValue={actionData?.fields?.confirmNewPassword}
                />
                {actionData?.errors?.confirmNewPassword && (
                  <p className="text-danger">
                    {actionData.errors.confirmNewPassword}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                name="_action"
                value="password"
              >
                Submit
              </button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
