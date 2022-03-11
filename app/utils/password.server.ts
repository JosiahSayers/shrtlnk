import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function doPasswordsMatch(
  passwordCandidate: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(passwordCandidate, passwordHash);
}
