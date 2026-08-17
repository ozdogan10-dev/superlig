import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const matches = await prisma.match.findMany({ select: { tffId: true, homeManager: true, awayManager: true }});
  console.log('Match Managers:', matches);
}
check().catch(console.error).finally(() => prisma.$disconnect());
