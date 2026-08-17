import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfill() {
  const teams = await prisma.team.findMany();
  
  for (const team of teams) {
    // Find the latest match for this team where a manager was recorded
    const latestHomeMatch = await prisma.match.findFirst({
      where: { homeTeamId: team.id, homeManager: { not: null } },
      orderBy: { date: 'desc' }
    });
    
    const latestAwayMatch = await prisma.match.findFirst({
      where: { awayTeamId: team.id, awayManager: { not: null } },
      orderBy: { date: 'desc' }
    });

    let manager = null;
    let latestDate = new Date(0);

    if (latestHomeMatch && latestHomeMatch.date && latestHomeMatch.date > latestDate && latestHomeMatch.homeManager) {
      manager = latestHomeMatch.homeManager;
      latestDate = latestHomeMatch.date;
    }

    if (latestAwayMatch && latestAwayMatch.date && latestAwayMatch.date > latestDate && latestAwayMatch.awayManager) {
      manager = latestAwayMatch.awayManager;
      latestDate = latestAwayMatch.date;
    }

    if (manager && team.manager !== manager) {
      console.log(`Updating manager for ${team.name} to ${manager}`);
      await prisma.team.update({
        where: { id: team.id },
        data: { manager }
      });
    }
  }
}

backfill().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
