import { db } from "~/utils/db.server";
import { hashPassword } from "~/utils/password.server";

async function seed() {
  const testDate = new Date("2022-03-05T12:34:27.058Z");
  const user1Data = {
    email: "test@test.com",
    firstName: "John",
    lastName: "Developer",
    password: await hashPassword("password"),
    dotnetPassword: "",
    dotnetSaltArray: "",
    role: "Developer",
    verified: true,
  };
  const user = await db.user.upsert({
    where: { email: "test@test.com" },
    update: user1Data,
    create: user1Data,
  });

  const legacyUserData = {
    email: "legacy@test.com",
    firstName: "Legacy",
    lastName: "User",
    password: "",
    dotnetPassword:
      "oI0q5vlL3nk7/NWIQQ49+A==.JKjrP/IU3815bwj+lWnVQZlXU529yFAbfenUEu3rQbA=", // password
    dotnetSaltArray:
      "[160,141,42,230,249,75,222,121,59,252,213,136,65,14,61,248]",
    role: "Developer",
    verified: true,
  };
  const legacyUser = await db.user.upsert({
    where: { email: "legacy@test.com" },
    update: legacyUserData,
    create: legacyUserData,
  });

  const noAppsUser = await db.user.upsert({
    where: { email: "noapps@test.com" },
    update: { ...user1Data, firstName: "Appless", email: "noapps@test.com" },
    create: { ...user1Data, firstName: "Appless", email: "noapps@test.com" },
  });

  const adminUser = await db.user.upsert({
    where: { email: "admin@test.com" },
    update: {
      ...user1Data,
      firstName: "Admin",
      email: "admin@test.com",
      role: "Admin",
    },
    create: {
      ...user1Data,
      firstName: "Admin",
      email: "admin@test.com",
      role: "Admin",
    },
  });

  const privilegedUser = await db.user.upsert({
    where: { email: "privileged@test.com" },
    update: {
      ...user1Data,
      firstName: "Privileged",
      email: "privileged@test.com",
      role: "Privileged",
    },
    create: {
      ...user1Data,
      firstName: "Privileged",
      email: "privileged@test.com",
      role: "Privileged",
    },
  });

  const shrtlnkWebsiteApplicationData = {
    name: "shrtlnk",
    website: "shrtlnk.dev",
    apiKey: "shrtlnk-test-api-key",
    status: "Valid",
    userId: legacyUser.id,
    createdAt: testDate,
  };
  const shrlnkWebsiteApplication = await db.application.upsert({
    where: { apiKey: "shrtlnk-test-api-key" },
    update: shrtlnkWebsiteApplicationData,
    create: shrtlnkWebsiteApplicationData,
  });

  const applicationData = {
    name: "Test App",
    website: "http://localhost:3000",
    apiKey: "test-api-key",
    status: "Valid",
    userId: user.id,
    createdAt: testDate,
  };
  const application = await db.application.upsert({
    where: { apiKey: "test-api-key" },
    update: applicationData,
    create: applicationData,
  });

  const invalidApplicationData = {
    apiKey: "invalid-application",
    status: "Invalid",
    name: "invalid",
    website: "",
    userId: user.id,
    createdAt: new Date("2022-02-05T03:34:27.058Z"),
  };
  const invalidApplication = await db.application.upsert({
    where: { apiKey: "invalid-application" },
    update: invalidApplicationData,
    create: invalidApplicationData,
  });

  const currentBlocked = await db.blockedUrl.findMany();
  if (
    !currentBlocked.find((url) => url.url === "http://realbank.freesites.com")
  ) {
    const blockedUrlData = {
      url: "http://realbank.freesites.com",
      createdAt: testDate,
      linkCreatedAt: testDate,
      applicationId: invalidApplication.id,
      foundBy: "Seed Data",
    };
    await db.blockedUrl.create({
      data: blockedUrlData,
    });
  }

  if (!currentBlocked.find((url) => url.url === "http://totally-not-a.scam")) {
    const blockedUrlData = {
      url: "http://totally-not-a.scam",
      createdAt: new Date(testDate.getTime() + 1000 * 60 * 60 * 24 * 3),
      linkCreatedAt: new Date(testDate.getTime() + 1000 * 60),
      applicationId: application.id,
      foundBy: "Seed Data",
    };
    await db.blockedUrl.create({
      data: blockedUrlData,
    });
  }

  const shrtlnkData = [
    {
      key: "ABC123",
      url: "https://google.com",
      applicationId: application.id,
    },
    {
      key: "SECKEY",
      url: "https://shrtlnk.dev",
      applicationId: application.id,
    },
  ];
  const shrtlnks = [
    await db.shrtlnk.upsert({
      where: { key: "ABC123" },
      update: shrtlnkData[0],
      create: shrtlnkData[0],
    }),
    await db.shrtlnk.upsert({
      where: { key: "SECKEY" },
      update: shrtlnkData[1],
      create: shrtlnkData[1],
    }),
  ];

  await db.shrtlnkLoad.createMany({
    data: [
      {
        shrtlnkId: shrtlnks[0].id,
      },
      {
        shrtlnkId: shrtlnks[0].id,
      },
      {
        shrtlnkId: shrtlnks[1].id,
      },
    ],
  });

  const existingLogs = await db.cleanLinksLog.findMany();
  if (
    !existingLogs.find(
      (log) => log.totalThreatsFound === 4 && log.status === "success"
    )
  ) {
    await db.cleanLinksLog.create({
      data: {
        createdAt: testDate,
        completedAt: new Date(testDate.getTime() + 5000),
        totalThreatsFound: 4,
        status: "success",
      },
    });
  }

  if (
    !existingLogs.find(
      (log) => log.totalThreatsFound === 0 && log.status === "failure"
    )
  ) {
    await db.cleanLinksLog.create({
      data: {
        createdAt: testDate,
        completedAt: new Date(testDate.getTime() + 5000),
        totalThreatsFound: 0,
        status: "failure",
      },
    });
  }

  if (
    !existingLogs.find(
      (log) => log.totalThreatsFound === 0 && log.status === "success"
    )
  ) {
    await db.cleanLinksLog.create({
      data: {
        createdAt: testDate,
        completedAt: new Date(testDate.getTime() + 5000),
        totalThreatsFound: 0,
        status: "success",
      },
    });
  }
}

seed();
