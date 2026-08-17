import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import iconv from 'iconv-lite';

const prisma = new PrismaClient();

const agent = new https.Agent({ rejectUnauthorized: false });

async function main() {
  console.log('Fetching teams from TFF...');
  try {
    const response = await axios.get('https://www.tff.org/default.aspx?pageID=170', {
      httpsAgent: agent,
      responseType: 'arraybuffer'
    });
    
    // TFF uses windows-1254 encoding
    const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
    const $ = cheerio.load(html);
    
    const teamLinks = $('a[href*="kulupID="]');
    console.log(`Found ${teamLinks.length} team links.`);
    
    const teams: {tffId: string, name: string, logoUrl: string}[] = [];
    
    teamLinks.each((i, el) => {
       const href = $(el).attr('href');
       const img = $(el).find('img');
       const name = img.attr('alt')?.trim();
       const logoUrl = img.attr('src');
       
       if (href && name) {
           const match = href.match(/kulupID=(\d+)/);
           if (match) {
               const tffId = match[1];
               if (!teams.some(t => t.tffId === tffId)) {
                   teams.push({ tffId, name, logoUrl: logoUrl || '' });
               }
           }
       }
    });

    console.log(`Extracted ${teams.length} unique teams.`);
    
    // Save to database
    for (const t of teams) {
        await prisma.team.upsert({
            where: { tffId: t.tffId },
            update: { name: t.name, logoUrl: t.logoUrl },
            create: { tffId: t.tffId, name: t.name, logoUrl: t.logoUrl }
        });
        console.log(`Upserted team: ${t.name} (${t.tffId})`);
    }
    
    console.log('Teams saved successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
