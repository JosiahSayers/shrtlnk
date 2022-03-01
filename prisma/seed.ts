import { db } from "~/utils/db.server";

async function seed() {
  const user1Data = {
    email: 'test@test.com',
    firstName: 'John',
    lastName: 'Developer',
    password: '',
    dotnetPassword: '',
    dotnetSaltArray: '',
    role: 'Developer',
    verified: true
  };
  const user = await db.user.upsert({
    where: { email: 'test@test.com' },
    update: user1Data,
    create: user1Data
  });

  const legacyUserData = {
    email: 'legacy@test.com',
    firstName: 'Legacy',
    lastName: 'User',
    password: '',
    dotnetPassword: 'oI0q5vlL3nk7/NWIQQ49+A==.JKjrP/IU3815bwj+lWnVQZlXU529yFAbfenUEu3rQbA=', // password
    dotnetSaltArray: '[160,141,42,230,249,75,222,121,59,252,213,136,65,14,61,248]',
    role: 'Developer',
    verified: true
  };
  const legacyUser = await db.user.upsert({
    where: { email: 'legacy@test.com' },
    update: legacyUserData,
    create: legacyUserData
  });

  const applicationData = {
    name: 'Test App',
    website: 'http://localhost:3000',
    apiKey: 'test-api-key',
    status: 'Valid',
    userId: user.id
  };
  const application = await db.application.upsert({
    where: { apiKey: 'test-api-key' },
    update: applicationData,
    create: applicationData
  });

  const shrtlnkData = [
    {
      key: 'ABC123',
      url: 'https://google.com',
      applicationId: application.id
    },
    {
      key: 'SECKEY',
      url: 'https://shrtlnk.dev',
      applicationId: application.id
    }
  ];
  const shrtlnks = [
    await db.shrtlnk.upsert({
      where: { key: 'ABC123' },
      update: shrtlnkData[0],
      create: shrtlnkData[0]
    }),
    await db.shrtlnk.upsert({
      where: { key: 'SECKEY' },
      update: shrtlnkData[1],
      create: shrtlnkData[1]
    })
  ];

  await db.shrtlnkLoad.createMany({
    data: [
      {
        shrtlnkId: shrtlnks[0].id
      },
      {
        shrtlnkId: shrtlnks[0].id
      },
      {
        shrtlnkId: shrtlnks[1].id
      }
    ]
  })
};

seed();
