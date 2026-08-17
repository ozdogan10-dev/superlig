import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function scrapeTopScorers() {
  const url = 'https://www.tff.org/default.aspx?pageID=821';
  console.log(`Fetching Top Scorers from ${url}...`);

  const response = await axios.get(url, { 
    responseType: 'arraybuffer',
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });
  const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
  const $ = cheerio.load(html);

  const tables = $('table');
  
  let targetTable = null;
  tables.each((i, table) => {
    const rows = $(table).find('tr');
    if (rows.length > 5) {
      const firstRowText = $(rows[0]).text().trim();
      if (firstRowText.includes('Gol') || firstRowText.includes('Oyuncu') || !isNaN(parseInt($(rows[0]).find('td').last().text().trim()))) {
          targetTable = table;
      }
    }
  });

  if (!targetTable && tables.length >= 2) targetTable = tables[1];

  if (!targetTable) { console.error('No table found'); return; }

  await prisma.player.updateMany({ data: { goals: 0 } });

  const rows = $(targetTable as any).find('tr');
  let updatedCount = 0;

  for (let j = 0; j < rows.length; j++) {
    const tr = rows[j];
    const cells = $(tr).find('td, th').map((k, td) => $(td).text().trim()).get();
    
    if (cells.length >= 2 && !isNaN(parseInt(cells[1]))) {
      const infoStr = cells[0];
      const goals = parseInt(cells[1], 10);
      
      const lines = infoStr.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length >= 1) {
        const playerName = lines[0].replace(/\s+/g, ' ');
        const teamNameText = lines.length > 1 ? lines[1].replace(/\s+/g, ' ') : '';

        const players = await prisma.player.findMany({ where: { name: { contains: playerName } } });

        if (players.length > 0) {
          await prisma.player.update({ where: { id: players[0].id }, data: { goals } });
          updatedCount++;
        } else {
          // If not found, try to find the team and CREATE the player!
          let team = null;
          if (teamNameText) {
            const teams = await prisma.team.findMany({
              where: { name: { contains: teamNameText.split(' ')[0] } } // match first word of team
            });
            if (teams.length > 0) team = teams[0];
          }

          if (!team) {
            // Pick a random team just to seed data if team matching fails
            team = await prisma.team.findFirst();
          }

          if (team) {
            await prisma.player.create({
              data: {
                tffId: `tff_scorer_${j}_${Date.now()}`,
                name: playerName,
                teamId: team.id,
                goals: goals
              }
            });
            console.log(`Created new player ${playerName} for ${team.name} with ${goals} goals`);
            updatedCount++;
          }
        }
      }
    }
  }

  console.log(`Scraped and updated/created ${updatedCount} players with goal counts.`);
}

scrapeTopScorers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
