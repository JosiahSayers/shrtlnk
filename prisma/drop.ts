import { db } from "~/utils/db.server";

async function drop() {
  await db.shrtlnkLoad.deleteMany();
  await db.shrtlnk.deleteMany();
  await db.blockedUrl.deleteMany();
  await db.application.deleteMany();
  await db.user.deleteMany();
}

drop();
