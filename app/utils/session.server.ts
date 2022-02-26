import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  createCookieSessionStorage,
  redirect,
} from "remix";

import { db } from "./db.server";
import { authenticateLegacyUser, isLegacyUser } from "./legacy-authenticate.server";

type LoginForm = {
  email: string;
  password: string;
};

export async function login({
  email,
  password,
}: LoginForm) {
  let user = await db.user.findUnique({
    where: { email },
  });
  if (!user) return null;
  if (isLegacyUser(user)) {
    if (!(await authenticateLegacyUser(user, password))) {
      return null;
    }
    user = await db.user.update({
      data: {
        password: await bcrypt.hash(password, 10),
        dotnetPassword: null,
        dotnetSaltArray: null
      },
      where: {
        id: user.id
      }
    });
  } else {
    const isCorrectPassword = await bcrypt.compare(
      password,
      user.password
    );
    if (!isCorrectPassword) return null;
  }

  return user.id;
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

export async function createUserSession(
  userId: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
