import axios from 'axios';
import https from 'https';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

async function main() {
  console.log('Fetching fixture page to get scores and dates...');
  const url = 'https://www.tff.org/default.aspx?pageID=198';
  const response = await axios.get(url, {
    httpsAgent: agent,
    responseType: 'arraybuffer'
  });
  
  const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
  const $ = cheerio.load(html);
  
  const links = $('a[href*="macId="]');
  console.log(`Found ${links.length} matches on the fixture page.`);

  let updatedCount = 0;

  for (let i = 0; i < links.length; i++) {
      const el = links.eq(i);
      const macId = el.attr('href')?.match(/macId=(\d+)/i)?.[1];
      if (!macId) continue;

      const week = Math.floor(i / 9) + 1; // 9 matches per week for 18 teams

      const row = el.closest('tr');
      const cells = row.find('td').map((j, td) => $(td).text().trim()).get();
      
      // cells[0]: Date
      // cells[1]: Home Team
      // cells[2]: Score
      // cells[3]: Away Team
      
      const dateStr = cells[0];
      const scoreStr = cells[2]; // e.g. "2 - 2" or "v"

      let homeScore: number | null = null;
      let awayScore: number | null = null;
      
      if (scoreStr && scoreStr.includes('-')) {
          const parts = scoreStr.split('-').map(s => parseInt(s.trim(), 10));
          if (!isNaN(parts[0]) && !isNaN(parts[1])) {
              homeScore = parts[0];
              awayScore = parts[1];
          }
      }

      // Parse date: "14.08.2026\n 21:30"
      let dateObj: Date | null = null;
      try {
          const cleanDate = dateStr.replace(/\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
          // format is DD.MM.YYYY HH:mm
          if (cleanDate.length > 10) {
              const parts = cleanDate.split(' ');
              const dateParts = parts[0].split('.');
              const timeParts = parts[1] ? parts[1].split(':') : ['00', '00'];
              if (dateParts.length === 3) {
                  dateObj = new Date(
                      parseInt(dateParts[2], 10),
                      parseInt(dateParts[1], 10) - 1,
                      parseInt(dateParts[0], 10),
                      parseInt(timeParts[0], 10),
                      parseInt(timeParts[1], 10)
                  );
              }
          }
      } catch(e) {
          console.error(`Failed to parse date for match ${macId}: ${dateStr}`);
      }

      await prisma.match.update({
          where: { tffId: macId },
          data: {
              week,
              homeScore,
              awayScore,
              date: dateObj
          }
      });
      
      updatedCount++;
  }
  
  console.log(`Successfully updated ${updatedCount} matches with scores, dates, and weeks.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
