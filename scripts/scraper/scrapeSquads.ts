import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

async function scrapeSquads() {
  const teams = await prisma.team.findMany();
  
  for (const team of teams) {
    console.log(`Scraping squad for ${team.name} (kulupID: ${team.tffId})`);
    const url = `https://www.tff.org/Default.aspx?pageId=28&kulupID=${team.tffId}`;
    
    try {
      const response = await axios.get(url, { httpsAgent: agent, responseType: 'arraybuffer' });
      const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
      const $ = cheerio.load(html);

      // On team page, there's a link to players: a[href*="kisiId="]
      const players = $('a[href*="kisiId="]');
      let count = 0;

      for (let i = 0; i < players.length; i++) {
        const pNode = players.eq(i);
        const pName = pNode.text().trim();
        const pTffId = pNode.attr('href')?.match(/kisiId=(\d+)/i)?.[1];
        
        if (pName && pTffId) {
          await prisma.player.upsert({
            where: { tffId: pTffId },
            update: { teamId: team.id },
            create: { tffId: pTffId, name: pName, teamId: team.id }
          });
          count++;
        }
      }
      
      console.log(`Saved ${count} players for ${team.name}`);
    } catch (e: any) {
      console.error(`Error fetching squad for ${team.name}:`, e.message);
    }
  }

  console.log('Finished scraping all squads.');
}

scrapeSquads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
