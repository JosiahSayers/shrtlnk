import { User } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "remix";

import { db } from "./db.server";
import {
  authenticateLegacyUser,
  isLegacyUser,
} from "./legacy-authenticate.server";
import { doPasswordsMatch, hashPassword } from "./password.server";

type LoginForm = {
  email: string;
  password: string;
};

export async function signin({
  email,
  password,
}: LoginForm): Promise<User | null> {
  let user = await db.user.findUnique({
    where: { email },
  });
  if (!user) return null;

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAttempt: new Date() },
  });
  let isAuthenticated: boolean;

  if (isLegacyUser(user)) {
    isAuthenticated = await authenticateLegacyUser(user, password);
  } else {
    isAuthenticated = await doPasswordsMatch(password, user.password);
  }

  user = await db.user.update({
    where: { id: user.id },
    data: {
      lastLoginAttempt: new Date(),
      lastLoginSuccess: isAuthenticated ? new Date() : user.lastLoginSuccess,
    },
  });
  return isAuthenticated ? user : null;
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
    maxAge: 60 * 25,
    httpOnly: true,
  },
});

export async function createUserSession(user: User, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", user.id);
  session.set("firstName", user.firstName);
  session.set("lastName", user.lastName);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

async function getSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserSession(request: Request) {
  const session = await getSession(request);
  const userInfo = {
    id: session?.get("userId"),
    firstName: session?.get("firstName"),
    lastName: session?.get("lastName"),
  };

  if (!userInfo.id) {
    return null;
  }

  return userInfo;
}

export async function requireUserSession(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userSession = await getUserSession(request);
  if (!userSession) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/developer/signin?${searchParams}`);
  }
  return userSession;
}

export async function signout(request: Request) {
  const session = await getSession(request);
  return redirect("/developer", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function updateName(
  firstName: string,
  lastName: string,
  id: string
) {
  return db.user.update({
    where: { id },
    data: { firstName, lastName },
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  id: string
) {
  const user = await db.user.findUnique({ where: { id } });
  if (!(await doPasswordsMatch(currentPassword, user!.password))) {
    throw new Error("password mismatch");
  }
  return db.user.update({
    where: { id },
    data: { password: await hashPassword(newPassword) },
  });
}
