import { expect } from '@jest/globals';
import {
  doesLegacyPasswordMatch,
  isLegacyUser,
  LegacyUser,
} from "./legacy-authenticate.server";

describe("doesLegacyPasswordMatch", () => {
  const testUser = {
    dotnetPassword:
      "oI0q5vlL3nk7/NWIQQ49+A==.JKjrP/IU3815bwj+lWnVQZlXU529yFAbfenUEu3rQbA=", // password
    dotnetSaltArray:
      "[160,141,42,230,249,75,222,121,59,252,213,136,65,14,61,248]",
  } as LegacyUser;

  it("returns true if the password candidate matches the stored password", async () => {
    expect(await doesLegacyPasswordMatch(testUser, "password")).toBe(true);
  });

  it("returns false if the password candidate does not match the stored password", async () => {
    expect(await doesLegacyPasswordMatch(testUser, "wrong_password")).toBe(
      false
    );
  });
});

describe("isLegacyUser", () => {
  it("returns true when the user has truthy dotnetPassword and dotnetSaltArray properties", () => {
    const testUser = {
      dotnetPassword: "password",
      dotnetSaltArray: "salt as array",
    } as LegacyUser;
    expect(isLegacyUser(testUser)).toBe(true);
  });

  it("returns false when the user has a falsy dotnetPassword property", () => {
    const testUser = {
      dotnetPassword: "",
      dotnetSaltArray: "salt as array",
    } as LegacyUser;
    expect(isLegacyUser(testUser)).toBe(false);
  });

  it("returns false when the user has a falsy dotnetSaltArray property", () => {
    const testUser = {
      dotnetPassword: "password",
      dotnetSaltArray: "",
    } as LegacyUser;
    expect(isLegacyUser(testUser)).toBe(false);
  });
});
