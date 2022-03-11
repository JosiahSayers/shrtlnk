import { Prisma } from "@prisma/client";
import Joi from "joi";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
} from "remix";
import { validate } from "~/utils/get-validation-errors.server";
import {
  createUserSession,
  getSignoutHeaders,
  getUserSession,
  register,
  RegisterForm,
} from "~/utils/session.server";

type ActionData = {
  formLevelError?: string;
  errors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  fields?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

const validateForm = (form: any) => {
  const schema = Joi.object({
    firstName: Joi.string().label("First Name").required(),
    lastName: Joi.string().label("Last Name").required(),
    email: Joi.string().email().label("Email").required(),
    password: Joi.string().label("New Password").required().min(8),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({ "any.only": '"Confirm Password" must match "Password"' }),
  });
  return validate<RegisterForm>(schema, form);
};

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserSession(request);
  if (userInfo) {
    const headers = await getSignoutHeaders(request);
    return redirect("/developer/register", { headers });
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const form = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
  const { fields, errors } = validateForm(form);
  if (errors) {
    return json({ errors, fields }, 400);
  }
  try {
    const newUser = await register(fields);
    if (newUser) {
      return createUserSession(newUser, "/developer/applications");
    }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return json({ formLevelError: "email is already in use", fields });
    }
  }

  return json({
    formLevelError:
      "Sorry about this, but something unexpected happened on our end. Please submit the form again.",
  });
};

export default function Register() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="container">
      <h1>Register</h1>

      {actionData?.formLevelError && (
        <div className="alert alert-danger" role="alert">
          {actionData.formLevelError}
        </div>
      )}

      {actionData?.errors && (
        <div className="alert alert-warning" role="alert">
          Please fix the errors below.
        </div>
      )}

      <div className="card pt-4 pb-4 pr-4 pl-4">
        <Form method="post">
          <div className="form-group">
            <input
              className="form-control"
              name="firstName"
              id="firstName"
              placeholder="First Name"
              defaultValue={actionData?.fields?.firstName}
            />
            {actionData?.errors?.firstName && (
              <span className="text-danger">{actionData.errors.firstName}</span>
            )}
          </div>
          <div className="form-group mb-5">
            <input
              className="form-control"
              name="lastName"
              id="lastName"
              defaultValue={actionData?.fields?.lastName}
              placeholder="Last Name"
            />
            {actionData?.errors?.lastName && (
              <span className="text-danger">{actionData.errors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <input
              className="form-control"
              placeholder="Email"
              name="email"
              defaultValue={actionData?.fields?.email}
              id="email"
            />
            {actionData?.errors?.email && (
              <span className="text-danger">{actionData.errors.email}</span>
            )}
          </div>
          <div className="form-group">
            <input
              className="form-control"
              name="password"
              id="password"
              defaultValue={actionData?.fields?.password}
              placeholder="Password"
            />
            {actionData?.errors?.password && (
              <span className="text-danger">{actionData.errors.password}</span>
            )}
          </div>
          <div className="form-group">
            <input
              className="form-control"
              name="confirmPassword"
              id="confirmPassword"
              defaultValue={actionData?.fields?.confirmPassword}
              placeholder="Confirm Password"
            />
            {actionData?.errors?.confirmPassword && (
              <span className="text-danger">
                {actionData.errors.confirmPassword}
              </span>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </Form>
      </div>
    </div>
  );
}
