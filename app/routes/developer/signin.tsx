import Joi from "joi";
import { ActionFunction, json, useActionData, useSearchParams } from "remix";
import { validate } from "~/utils/get-validation-errors";
import { createUserSession, signin } from "~/utils/session.server";

type ActionData = {
  formLevelError?: string;
  errors?: {
    email?: string;
    password?: string;
  };
  fields?: {
    email?: string;
    password?: string;
  };
};

const validateForm = (form: {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  return validate(schema, form);
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo");

  const { fields, errors } = validateForm({ email, password });

  if (errors) {
    return json(
      {
        errors,
        fields,
      },
      { status: 400 }
    );
  }

  const user = await signin(fields);
  if (user) {
    return createUserSession(
      user,
      (redirectTo as string) || "/developer/applications"
    );
  }

  return json(
    {
      formLevelError: "Could not log you in with these credentials",
      fields: fields,
    },
    { status: 400 }
  );
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();

  return (
    <div className="container">
      <h1>Sign In</h1>

      <div className="card pt-4 pb-4 pr-4 pl-4">
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? undefined}
          />
          <div className="form-group">
            <input
              className="form-control"
              placeholder="Email"
              name="email"
              type="email"
              defaultValue={actionData?.fields?.email}
            />
            {actionData?.errors?.email && (
              <span className="text-danger">{actionData?.errors.email}</span>
            )}
          </div>
          <div className="form-group">
            <input
              className="form-control"
              name="password"
              placeholder="Password"
              type="password"
              defaultValue={actionData?.fields?.password}
            />
            {actionData?.errors?.password && (
              <span className="text-danger">{actionData?.errors.password}</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          {actionData?.formLevelError && (
            <p>
              <br />
              <span className="text-danger">{actionData.formLevelError}</span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
