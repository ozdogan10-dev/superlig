import axios from 'axios';
import https from 'https';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

async function main() {
  console.log('Fetching fixture page to recreate all matches correctly...');
  const url = 'https://www.tff.org/default.aspx?pageID=198';
  const response = await axios.get(url, {
    httpsAgent: agent,
    responseType: 'arraybuffer'
  });
  
  const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
  const $ = cheerio.load(html);
  
  const links = $('a[href*="macId="]');
  console.log(`Found ${links.length} matches on the fixture page.`);

  // Load all teams into a map for fast lookup
  const teams = await prisma.team.findMany();
  const teamMap = new Map<string, string>(); // name -> id
  teams.forEach(t => teamMap.set(t.name.trim(), t.id));

  // Let's clear all existing matches first
  await prisma.match.deleteMany({});
  console.log('Cleared existing matches.');

  let createdCount = 0;
  const uniqueMatches = new Set<string>(); // some links might be duplicated

  for (let i = 0; i < links.length; i++) {
      const el = links.eq(i);
      const macId = el.attr('href')?.match(/macId=(\d+)/i)?.[1];
      if (!macId) continue;

      if (uniqueMatches.has(macId)) continue;
      uniqueMatches.add(macId);

      // Weeks: wait, if we deduplicate, the index 'i' might not map perfectly to week.
      // A better way to calculate week is to increment week every 9 unique matches.
      const week = Math.floor(createdCount / 9) + 1;

      const row = el.closest('tr');
      const cells = row.find('td').map((j, td) => $(td).text().trim()).get();
      
      let dateStr = '';
      let homeName = '';
      let scoreStr = '';
      let awayName = '';

      if (cells.length >= 4 && cells[0].match(/^\d{2}\.\d{2}\.\d{4}/)) {
          dateStr = cells[0];
          homeName = cells[1];
          scoreStr = cells[2];
          awayName = cells[3];
      } else {
          // Unscheduled match or structure differs
          homeName = cells[0];
          scoreStr = cells[1];
          awayName = cells[2];
      }
      
      const homeId = teamMap.get(homeName);
      const awayId = teamMap.get(awayName);

      if (!homeId || !awayId) {
          console.error(`Could not find team ID for "${homeName}" or "${awayName}". Cells: ${JSON.stringify(cells)}`);
          continue;
      }

      let homeScore: number | null = null;
      let awayScore: number | null = null;
      
      if (scoreStr && scoreStr.includes('-')) {
          const parts = scoreStr.split('-').map(s => parseInt(s.trim(), 10));
          if (!isNaN(parts[0]) && !isNaN(parts[1])) {
              homeScore = parts[0];
              awayScore = parts[1];
          }
      }

      let dateObj: Date | null = null;
      try {
          const cleanDate = dateStr.replace(/\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
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

      await prisma.match.create({
          data: {
              tffId: macId,
              homeTeamId: homeId,
              awayTeamId: awayId,
              week,
              homeScore,
              awayScore,
              date: dateObj
          }
      });
      
      createdCount++;
  }
  
  console.log(`Successfully created ${createdCount} matches.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
