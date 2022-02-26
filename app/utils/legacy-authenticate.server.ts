import { User } from "@prisma/client"
import pbkdf2Hmac from "pbkdf2-hmac";

type LegacyUser = User & {
  dotnetPassword: string;
  dotnetSaltArray: string;
}

export const authenticateLegacyUser = async (user: LegacyUser, passwordCandidate: string): Promise<boolean> => {
  const salt = Buffer.from(JSON.parse(user.dotnetSaltArray));
  const hashedPass = await pbkdf2Hmac(
    passwordCandidate,
    salt,
    10000,
    256 / 8,
    "SHA-512"
  );
  return arrayBufferToBase64(hashedPass) === user.dotnetPassword.split('.')[1];
};

export function isLegacyUser(user: User | LegacyUser): user is LegacyUser {
  return !!user.dotnetPassword && !!user.dotnetSaltArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
