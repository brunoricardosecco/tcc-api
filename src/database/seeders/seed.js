const { PrismaClient } = require('@prisma/client');
const { states } = require('./states');
const { cities } = require('./cities');

const prisma = new PrismaClient();

async function main() {
  await prisma.state.createMany({
    data: states,
  });

  return prisma.city.createMany({
    data: cities,
  });
}

// to run all seeds, uncomment the block below

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
