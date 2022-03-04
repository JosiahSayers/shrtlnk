import { User } from "@prisma/client";
import pbkdf2Hmac from "pbkdf2-hmac";
import { db } from "./db.server";
import { hashPassword } from "./password.server";

export type LegacyUser = User & {
  dotnetPassword: string;
  dotnetSaltArray: string;
};

export const authenticateLegacyUser = async (
  user: LegacyUser,
  passwordCandidate: string
): Promise<boolean> => {
  if (!(await doesLegacyPasswordMatch(user, passwordCandidate))) {
    return false;
  }

  await db.user.update({
    data: {
      password: await hashPassword(passwordCandidate),
      dotnetPassword: null,
      dotnetSaltArray: null,
    },
    where: {
      id: user.id,
    },
  });

  return true;
};

export function isLegacyUser(user: User | LegacyUser): user is LegacyUser {
  return !!user.dotnetPassword && !!user.dotnetSaltArray;
}

export async function doesLegacyPasswordMatch(
  user: LegacyUser,
  passwordCandidate: string
): Promise<boolean> {
  const salt = Buffer.from(JSON.parse(user.dotnetSaltArray));
  const hashedPass = await pbkdf2Hmac(
    passwordCandidate,
    salt,
    10000,
    256 / 8,
    "SHA-512"
  );
  const hashedPassAsString = arrayBufferToBase64(hashedPass);
  const storedPass = user.dotnetPassword.split(".")[1];
  return hashedPassAsString === storedPass;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
