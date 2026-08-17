import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import iconv from 'iconv-lite';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

async function main() {
  console.log('Fetching stadiums for teams...');
  try {
    const teams = await prisma.team.findMany();
    console.log(`Found ${teams.length} teams in db.`);

    for (const team of teams) {
      console.log(`Fetching info for ${team.name}...`);
      const response = await axios.get(`https://www.tff.org/default.aspx?pageID=28&kulupID=${team.tffId}`, {
        httpsAgent: agent,
        responseType: 'arraybuffer'
      });
      
      const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
      const $ = cheerio.load(html);
      
      let stadiumName = '';
      const desc = $('meta[name="description"]').attr('content');
      if (desc) {
          const parts = desc.split(' - ');
          if (parts.length > 0) {
              stadiumName = parts[0].trim();
          }
      }
      
      if (stadiumName && !stadiumName.includes("Türkiye Futbol Federasyonu")) {
          // Check if stadium exists, else create it
          let stadium = await prisma.stadium.findFirst({ where: { name: stadiumName }});
          if (!stadium) {
              stadium = await prisma.stadium.create({
                  data: { name: stadiumName }
              });
              console.log(`Created stadium: ${stadiumName}`);
          }
          
          // Link stadium to team
          await prisma.team.update({
              where: { id: team.id },
              data: { stadiumId: stadium.id }
          });
          console.log(`Linked ${stadiumName} to ${team.name}`);
      } else {
          console.log(`Could not find stadium for ${team.name}`);
      }
      
      // wait 500ms
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('Stadiums scraping finished.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
