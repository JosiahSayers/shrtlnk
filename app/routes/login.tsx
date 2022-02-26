import { ActionFunction, useSearchParams } from "remix";
import { createUserSession, login } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  const userId = await login({ email, password });
  if (userId) {
    return createUserSession(userId, "");
  }
  return null;
};

export default function Login() {
  const [searchParams] = useSearchParams();
  return (
    <div>
      <h1>Login</h1>
      <form method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />

        <input type="text" name="email" id="email" placeholder="email" />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="password"
        />
        <input type="submit" value="Log in" />
      </form>
    </div>
  );
}
