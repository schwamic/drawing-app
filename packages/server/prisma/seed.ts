import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const canvas = await prisma.canvas.upsert({
    where: {
      id: "daf30aeb-368c-4c24-b7ef-dfb9995af31c",
    },
    update: {},
    create: {
      latestAggregation: [],
    },
  });
  console.log(canvas);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
