import { PasswordReset, User } from "@prisma/client";
import { createCookieSessionStorage, redirect, Session } from "@remix-run/node";
import { passwordResetEmail } from "~/utils/email.server";

import { db } from "./db.server";
import {
  authenticateLegacyUser,
  isLegacyUser,
} from "./legacy-authenticate.server";
import {
  createPasswordResetForUser,
  doPasswordsMatch,
  hashPassword,
  invalidateExistingPasswordResets,
} from "./password.server";

type LoginForm = {
  email: string;
  password: string;
};

export type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export async function register(form: RegisterForm) {
  return db.user.create({
    data: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: await hashPassword(form.password),
      role: "Developer",
      verified: true,
    },
  });
}

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

export async function startPasswordReset(
  email: string
): Promise<{ userFound: boolean; success: boolean }> {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { userFound: false, success: false };
    }
    await invalidateExistingPasswordResets(user.id);
    const passwordReset = await createPasswordResetForUser(user.id);
    if (!passwordReset) {
      return { userFound: true, success: false };
    }
    const emailSent = await passwordResetEmail(user, passwordReset);
    return { userFound: true, success: emailSent };
  } catch (e) {
    console.error("Error setting up password reset", e);
    return { userFound: true, success: false };
  }
}

export function isPasswordResetValid(
  passwordReset: PasswordReset | null
): passwordReset is PasswordReset {
  return (
    !!passwordReset &&
    passwordReset.valid &&
    !passwordReset.usedAt &&
    new Date().getTime() - passwordReset.createdAt.getTime() <
      24 * 60 * 60 * 1000 // 24 hours
  );
}

export async function resetPassword(
  passwordResetKey: string,
  newPassword: string
) {
  try {
    const passwordReset = await db.passwordReset.findUnique({
      where: { key: passwordResetKey },
    });
    if (!isPasswordResetValid(passwordReset)) {
      return { passwordResetValid: false, success: false };
    }

    await db.user.update({
      where: { id: passwordReset.userId },
      data: { password: await hashPassword(newPassword) },
    });
    await db.passwordReset.update({
      where: { id: passwordReset.id },
      data: { usedAt: new Date() },
    });
    return { passwordResetValid: true, success: true };
  } catch (e) {
    console.error("error resetting a user's password", e);
    return { success: false };
  }
}

const sessionSecret = process.env.SESSION_SECRET!;

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
  session.set("role", user.role);
  session.set("email", user.email);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function createImpersonateSession(
  session: Session,
  impersonatedUser: User,
  logId: string,
  redirectTo: string
) {
  session.set("impersonatorId", session.get("userId"));
  session.set("impersonatorFirstName", session.get("firstName"));
  session.set("impersonatorLastName", session.get("lastName"));
  session.set("impersonatorRole", session.get("role"));
  session.set("impersonationLogId", logId);
  session.set("userId", impersonatedUser.id);
  session.set("firstName", impersonatedUser.firstName);
  session.set("lastName", impersonatedUser.lastName);
  session.set("role", impersonatedUser.role);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function revertImpersonateSession(
  request: Request,
  redirectTo: string
) {
  const session = await getSession(request);
  session.set("userId", session.get("impersonatorId"));
  session.set("firstName", session.get("impersonatorFirstName"));
  session.set("lastName", session.get("impersonatorLastName"));
  session.set("role", session.get("impersonatorRole"));
  session.unset("impersonatorId");
  session.unset("impersonatorFirstName");
  session.unset("impersonatorLastName");
  session.unset("impersonatorRole");
  const logId = session.get("impersonationLogId");
  session.unset("impersonationLogId");
  await db.impersonation.update({
    where: { id: logId },
    data: { endedAt: new Date() },
  });
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
    role: session?.get("role"),
    email: session?.get("email"),
    impersonator: session.has("impersonatorId")
      ? {
          id: session.get("impersonatorId"),
          firstName: session.get("impersonatorFirstName"),
          lastName: session.get("impersonatorLastName"),
          role: session.get("impersonatorRole"),
        }
      : undefined,
  };

  if (!userInfo.id) {
    return null;
  }

  return userInfo;
}
export type UserInfo = Awaited<ReturnType<typeof getUserSession>>;

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

export async function requireAdminRole(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userData = await requireUserSession(request, redirectTo);
  const user = await db.user.findUnique({ where: { id: userData.id } });
  const isAdmin = user?.role === "Admin";
  if (!isAdmin) {
    throw redirect(`/not-found`);
  }
  return user;
}

export async function requirePrivilegedRole(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userData = await requireUserSession(request, redirectTo);
  const user = await db.user.findUnique({ where: { id: userData.id } });
  const isPrivileged = user?.role === "Privileged" || user?.role === "Admin";
  if (!isPrivileged) {
    throw redirect("/not-found");
  }
  return user;
}

export async function impersonateUser(
  idToImpersonate: string,
  request: Request,
  redirectTo: string
) {
  const userToImpersonate = await db.user.findUnique({
    where: { id: idToImpersonate },
  });
  if (!userToImpersonate) throw redirect("/developer/admin");
  const session = await getSession(request);
  const impersonationLog = await db.impersonation.create({
    data: {
      impersonatorId: session.get("userId"),
      impersonatedId: userToImpersonate.id,
    },
  });
  return createImpersonateSession(
    session,
    userToImpersonate,
    impersonationLog.id,
    redirectTo
  );
}

export async function signout(request: Request) {
  const session = await getSession(request);
  const impersonationLogId = session.get("impersonationLogId");
  if (impersonationLogId) {
    await db.impersonation.update({
      where: { id: impersonationLogId },
      data: { endedAt: new Date() },
    });
  }
  const headers = await getSignoutHeaders(session);
  return redirect("/developer", { headers });
}

export async function getSignoutHeaders(session: Session) {
  return new Headers({
    "Set-Cookie": await storage.destroySession(session),
  });
}
