/// <reference types="cypress" />

import { db } from "~/utils/db.server";

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
  on('task', {
    deleteUser: async (email: string) => await db.user.delete({ where: { email } }),
    getImpersonations: async () => await db.impersonation.findMany({ include: { impersonated: true, impersonator: true }, orderBy: { createdAt: "asc" } }),
  });
  return config;
};
/* eslint-enable */
