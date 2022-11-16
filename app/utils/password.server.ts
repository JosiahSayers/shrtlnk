import { PasswordReset } from "@prisma/client";
import bcrypt from "bcryptjs";
import ShortUniqueId from "short-unique-id";
import { db } from "~/utils/db.server";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function doPasswordsMatch(
  passwordCandidate: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(passwordCandidate, passwordHash);
}

export async function invalidateExistingPasswordResets(
  userId: string
): Promise<boolean> {
  try {
    await db.passwordReset.updateMany({
      data: { valid: false },
      where: { userId, valid: true },
    });
    return true;
  } catch (e) {
    console.error(
      `Error invalidating existing password resets for ${userId}`,
      e
    );
    return false;
  }
}

export async function createPasswordResetForUser(
  userId: string
): Promise<PasswordReset | null> {
  try {
    return db.passwordReset.create({
      data: {
        userId,
        key: new ShortUniqueId({
          dictionary: "alphanum_lower",
          length: 55,
        }).randomUUID(),
      },
    });
  } catch (e) {
    console.error(`Error creating password reset for user ${userId}`, e);
    return null;
  }
}
