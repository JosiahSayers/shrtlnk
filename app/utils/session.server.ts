import { createCookieSessionStorage, redirect } from "remix";

import { db } from "./db.server";
import {
  authenticateLegacyUser,
  isLegacyUser,
} from "./legacy-authenticate.server";
import { doPasswordsMatch } from "./password.server";

type LoginForm = {
  email: string;
  password: string;
};

export async function login({
  email,
  password,
}: LoginForm): Promise<number | null> {
  let user = await db.user.findUnique({
    where: { email },
  });
  if (!user) return null;
  if (isLegacyUser(user)) {
    return authenticateLegacyUser(user, password);
  } else {
    return (await doPasswordsMatch(password, user.password)) ? user.id : null;
  }
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "shrtlnk_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(userId: number, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
