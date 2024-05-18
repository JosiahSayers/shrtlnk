import ShortUniqueId from "short-unique-id";
import { doesKeyExist } from "~/shrtlnk.server";
import { db } from "~/utils/db.server";

const batchSize = 1000;

async function seed() {
  const totalToCreate = 1000000;
  let reportedProgress = 0;

  let key: string;
  do {
    key = new ShortUniqueId({ dictionary: "alphanum_lower" }).randomUUID(6);
  } while (await doesKeyExist(key));

  for (let i = 0; i < totalToCreate; i += batchSize) {
    const newProgress = Math.floor((i / totalToCreate) * 100);
    if (newProgress > reportedProgress) {
      reportedProgress = newProgress;
      console.log(`${reportedProgress}%`);
    }

    try {
      await db.shrtlnk.createMany({
        data: createBatch(),
      });
    } catch (e) {
      // ignore key collisions
    }
  }
}

function createBatch(size = batchSize) {
  return Array.from({ length: size }).map(() => {
    const key = new ShortUniqueId({ dictionary: "alphanum_lower" }).randomUUID(
      6
    );
    return {
      url: `http://loadtest.net/${key}`,
      key,
      applicationId: "0a5bcece-ab5e-4412-8188-ee1e5bb81bfe",
    };
  });
}

seed();
