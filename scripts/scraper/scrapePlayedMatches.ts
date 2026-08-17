import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  // Find all matches that have a date before right now
  const playedMatches = await prisma.match.findMany({
    where: {
      date: { lt: new Date() }
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${playedMatches.length} matches played so far. Scraping them...`);

  for (const match of playedMatches) {
    if (!match.tffId) continue;
    try {
      console.log(`Scraping match ${match.tffId}...`);
      execSync(`npx ts-node scripts/scraper/scrapeMatchToDb.ts ${match.tffId}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to scrape match ${match.tffId}:`, e);
    }
  }

  console.log('Finished scraping all played matches!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
