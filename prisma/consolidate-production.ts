import { writeFile } from "fs/promises";

import {
  PrismaClient as MssqlPrismaClient,
  links,
} from "./generated/mssql-client";
import {
  PrismaClient as MongoPrismaClient,
  DeveloperAccounts,
  Applications,
} from "./generated/mongo-client";
import { PrismaClient } from "@prisma/client";

const mssql = new MssqlPrismaClient();
const mongo = new MongoPrismaClient();
const db = new PrismaClient();

async function getLinks() {
  return mssql.links.findMany();
}

async function getProdData() {
  console.log("Grabbing data from prod");
  type AppWithLinks = Applications & { links: links[] };
  type ModifiedUser = DeveloperAccounts & { applications: AppWithLinks[] };
  const users = (await mongo.developerAccounts.findMany({
    include: { applications: true },
  })) as unknown as ModifiedUser[];
  const allLinks = await getLinks();

  console.log("Mashing data into JS object");
  const usersWithLinks = users.map((u) => ({
    ...u,
    applications: u.applications.map((app) => ({
      ...app,
      links: allLinks.filter((l) => l.application_id === app.id),
    })),
  }));
  return usersWithLinks;
}

async function consolidateData() {
  const users = await getProdData();
  console.log("Writing data to postgres");

  for (const user of users) {
    const newUser = await db.user.create({
      data: {
        email: user.id,
        firstName: user.FirstName,
        lastName: user.LastName,
        password: "",
        dotnetPassword: user.Password,
        dotnetSaltArray: user.Salt,
        createdAt: user.AccountCreationDate,
        lastLogin: user.AccountCreationDate,
        role: user.Role,
        verified: user.Verified,
      },
    });

    for (const app of user.applications) {
      const newApp = await db.application.create({
        data: {
          name: app.Name,
          website: app.Website,
          apiKey: app.ApiKey,
          status: app.Status,
          createdAt: app.CreationDate,
          updatedAt: app.CreationDate,
          userId: newUser.id,
        },
      });

      for (const link of app.links) {
        const date = link.date_added || new Date();
        const newLink = await db.shrtlnk.create({
          data: {
            key: link.url_key,
            url: link.url,
            createdAt: date,
            applicationId: newApp.id,
          },
        });

        await db.shrtlnkLoad.createMany({
          data: Array(link.times_loaded)
            .fill(null)
            .map(() => ({
              createdAt: date,
              shrtlnkId: newLink.id,
            })),
        });
      }
    }
  }
}

consolidateData();
