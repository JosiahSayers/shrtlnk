/// <reference types="cypress" />

import { User } from "@prisma/client";
import ShortUniqueId from "short-unique-id";
import { db } from "~/utils/db.server";
import {
  createPasswordResetForUser,
  hashPassword,
} from "~/utils/password.server";

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
/* eslint-disable */
export default function (on: any, config: any) {
  on("task", {
    createUser: async (input?: Partial<User>) =>
      db.user.create({
        data: {
          email: input?.email ?? `integration-${new Date().getTime()}@test.com`,
          firstName: input?.firstName ?? "first",
          lastName: input?.lastName ?? "last",
          role: input?.role ?? "Developer",
          password: await hashPassword(input?.password ?? "password"),
          verified: true,
        },
      }),
    getUser: async (email: string) => db.user.findUnique({ where: { email } }),
    deleteUser: async (email: string) =>
      await db.user.delete({ where: { email } }),
    createApplication: async ({ email, app }: { email: string; app: any }) => {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error(`Could not find user with email: ${email}`);
      }
      return await db.application.create({
        data: {
          name: app.name,
          website: app.website,
          userId: user.id,
          apiKey: `TEST_${new ShortUniqueId()()}`,
        },
      });
    },
    deleteApplication: async ({
      name,
      email,
    }: {
      name: string;
      email: string;
    }) => {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error(`Could not find user with email: ${email}`);
      }
      await db.application.deleteMany({ where: { name, userId: user.id } });
      return null;
    },
    getImpersonations: async () =>
      await db.impersonation.findMany({
        include: { impersonated: true, impersonator: true },
        orderBy: { createdAt: "asc" },
      }),
    getShrtlnk: async (key: string) =>
      db.shrtlnk.findUnique({ where: { key } }),
    getPasswordResetsForUser: async (email: string) => {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        console.error(`unable to find user with email ${email}`);
        return;
      }
      return db.passwordReset.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    },
    createPasswordResetForUser: async (email: string) => {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        console.error(`unable to find user with email ${email}`);
        return;
      }
      return createPasswordResetForUser(user.id);
    },
    getFeedback: async () => db.feedback.findMany(),
    getLastBlockedUrl: async () =>
      db.blockedUrl.findFirst({ orderBy: { createdAt: "desc" } }),
  });
  return config;
}
/* eslint-enable */
