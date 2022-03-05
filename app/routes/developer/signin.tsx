import Joi, { string } from "joi";
import { ActionFunction, json, useActionData, useSearchParams } from "remix";
import { getErrors } from "~/utils/get-validation-errors";
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
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  });
  const errors = getErrors(schema, form);
  return errors;
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  const errors = validateForm({ email, password });

  if (errors) {
    return json(
      {
        errors,
        fields: {
          email,
          password,
        },
      },
      { status: 400 }
    );
  }

  const user = await signin({ email, password });
  if (user) {
    return createUserSession(user, "/developer");
  }

  return json(
    {
      formLevelError: "Could not log you in with these credentials",
      fields: { email, password },
    },
    { status: 400 }
  );
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  return (
    <div className="container">
      <h1>Sign In</h1>

      <div className="card pt-4 pb-4 pr-4 pl-4">
        <form asp-controller="Developer" asp-action="SignIn" method="post">
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

// export default function Login() {
//   const [searchParams] = useSearchParams();
//   return (
//     <div>
//       <h1>Login</h1>
//       <form method="post">
//         <input
//           type="hidden"
//           name="redirectTo"
//           value={searchParams.get("redirectTo") ?? undefined}
//         />

//         <input type="text" name="email" id="email" placeholder="email" />
//         <input
//           type="password"
//           name="password"
//           id="password"
//           placeholder="password"
//         />
//         <input type="submit" value="Log in" />
//       </form>
//     </div>
//   );
// }
