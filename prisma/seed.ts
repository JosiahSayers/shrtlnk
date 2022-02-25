import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seed() {
  const user = await db.user.create({
    data: {
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Developer',
      password: '',
      dotnetPassword: '',
      dotnetSaltArray: '',
      role: 'Developer',
      verified: true
    }
  });

  const application = await db.application.create({
    data: {
      name: 'Test App',
      website: 'http://localhost:3000',
      apiKey: 'test-api-key',
      status: 'Valid',
      userId: user.id
    }
  });

  const shrtlnks = [
    await db.shrtlnk.create({
      data: {
        key: 'ABC123',
        url: 'https://google.com',
        applicationId: application.id
      }
    }),
    await db.shrtlnk.create({
      data: {
        key: 'SECKEY',
        url: 'https://shrtlnk.dev',
        applicationId: application.id
      }
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
