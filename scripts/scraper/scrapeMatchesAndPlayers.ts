import axios from 'axios';
import https from 'https';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

async function getMatchIds() {
  console.log('Fetching fixture to get all match IDs...');
  const response = await axios.get('https://www.tff.org/default.aspx?pageID=198', {
    httpsAgent: agent,
    responseType: 'arraybuffer'
  });
  const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
  const $ = cheerio.load(html);
  
  const macIds = new Set<string>();
  $('a[href*="macId="]').each((i, el) => {
      const match = $(el).attr('href')?.match(/macId=(\d+)/i);
      if (match) macIds.add(match[1]);
  });
  
  return Array.from(macIds);
}

async function scrapeMatch(macId: string) {
  const url = `https://www.tff.org/Default.aspx?pageId=29&macId=${macId}`;
  const response = await axios.get(url, { httpsAgent: agent, responseType: 'arraybuffer' });
  const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
  const $ = cheerio.load(html);

  // 1. Get Home and Away Teams
  const teamIds = new Set<string>();
  $('a[href*="kulupId="]').each((i, el) => {
      const match = $(el).attr('href')?.match(/kulupId=(\d+)/i);
      if (match) teamIds.add(match[1]);
  });
  
  const uniqueIds = Array.from(teamIds);
  if (uniqueIds.length < 2) return;
  
  const homeTffId = uniqueIds[0];
  const awayTffId = uniqueIds[1];

  const homeTeam = await prisma.team.findUnique({ where: { tffId: homeTffId } });
  const awayTeam = await prisma.team.findUnique({ where: { tffId: awayTffId } });
  if (!homeTeam || !awayTeam) return;

  // 2. Get Score
  // Score is usually just after the team name, or we can look for something like '2', '2' in the title or spans
  // A robust way: find text between the team names in the DOM, but for now we can skip score or parse it simply.
  // Actually, we can get score from the title if available, or just leave it blank for now.

  // 3. Upsert Match
  let match = await prisma.match.findUnique({ where: { tffId: macId } });
  if (!match) {
      match = await prisma.match.create({
          data: {
              tffId: macId,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
          }
      });
  }

  // 4. Referees
  const referees: { name: string, role: string, tffId: string }[] = [];
  $('a[href*="hakemId="]').each((i, el) => {
      const text = $(el).text().trim();
      // text is like "BATUHAN KOLAK(Hakem)"
      const roleMatch = text.match(/\((.*?)\)$/);
      const name = text.replace(/\(.*?\)$/, '').trim();
      const role = roleMatch ? roleMatch[1] : '';
      const tffId = $(el).attr('href')?.match(/hakemId=(\d+)/i)?.[1];
      if (name && tffId) referees.push({ name, role, tffId });
  });

  for (const ref of referees) {
      await prisma.referee.upsert({
          where: { tffId: ref.tffId },
          update: { role: ref.role },
          create: { tffId: ref.tffId, name: ref.name, role: ref.role }
      });
  }

  // 5. Players
  const processPlayers = async (teamId: string, headerIndices: number[]) => {
      // Find all players in tables after the specific headers
      const sections = $('span').filter((i, el) => $(el).text() === 'İlk 11' || $(el).text() === 'Yedekler');
      for (const idx of headerIndices) {
          const section = sections.eq(idx);
          if (section.length) {
              const table = section.closest('table').next('table'); // TFF structure usually puts players in next table or same td
              const td = section.closest('td');
              const players = td.find('a[href*="kisiId="]');
              for (let i = 0; i < players.length; i++) {
                  const pNode = players.eq(i);
                  const pName = pNode.text().trim();
                  const pTffId = pNode.attr('href')?.match(/kisiId=(\d+)/i)?.[1];
                  // ignore coach links which might have antId, though we selected kisiId
                  if (pName && pTffId) {
                      await prisma.player.upsert({
                          where: { tffId: pTffId },
                          update: { teamId: teamId }, // Update team if transferred
                          create: { tffId: pTffId, name: pName, teamId: teamId }
                      });
                  }
              }
          }
      }
  };

  // Home players are usually under the 1st "İlk 11" and 1st "Yedekler"
  // Away players are under the 2nd "İlk 11" and 2nd "Yedekler"
  // Let's just find all 'kisiId' links and split them!
  // It's safer because TFF tables can be deeply nested.
  const allPlayerLinks = $('a[href*="kisiId="]');
  let homeCount = 0;
  let awayCount = 0;
  
  // Actually, wait, the simplest way is to iterate over the sections
  const first11s = $('span').filter((i, el) => $(el).text() === 'İlk 11');
  const yedeklers = $('span').filter((i, el) => $(el).text() === 'Yedekler');
  
  if (first11s.length >= 2 && yedeklers.length >= 2) {
      await processPlayers(homeTeam.id, [0]); // Home ilk11
      // home yedekler
      const homeYedekTd = yedeklers.eq(0).closest('td');
      const hp = homeYedekTd.find('a[href*="kisiId="]');
      for(let i=0; i<hp.length; i++) {
          const pTffId = hp.eq(i).attr('href')?.match(/kisiId=(\d+)/i)?.[1];
          if(pTffId) {
              await prisma.player.upsert({ where: {tffId: pTffId}, update: {teamId: homeTeam.id}, create: {tffId: pTffId, name: hp.eq(i).text().trim(), teamId: homeTeam.id}});
          }
      }
      
      const homeIlk11Td = first11s.eq(0).closest('td');
      const hip = homeIlk11Td.find('a[href*="kisiId="]');
      for(let i=0; i<hip.length; i++) {
          const pTffId = hip.eq(i).attr('href')?.match(/kisiId=(\d+)/i)?.[1];
          if(pTffId) {
              await prisma.player.upsert({ where: {tffId: pTffId}, update: {teamId: homeTeam.id}, create: {tffId: pTffId, name: hip.eq(i).text().trim(), teamId: homeTeam.id}});
          }
      }
      
      const awayYedekTd = yedeklers.eq(1).closest('td');
      const ap = awayYedekTd.find('a[href*="kisiId="]');
      for(let i=0; i<ap.length; i++) {
          const pTffId = ap.eq(i).attr('href')?.match(/kisiId=(\d+)/i)?.[1];
          if(pTffId) {
              await prisma.player.upsert({ where: {tffId: pTffId}, update: {teamId: awayTeam.id}, create: {tffId: pTffId, name: ap.eq(i).text().trim(), teamId: awayTeam.id}});
          }
      }
      
      const awayIlk11Td = first11s.eq(1).closest('td');
      const aip = awayIlk11Td.find('a[href*="kisiId="]');
      for(let i=0; i<aip.length; i++) {
          const pTffId = aip.eq(i).attr('href')?.match(/kisiId=(\d+)/i)?.[1];
          if(pTffId) {
              await prisma.player.upsert({ where: {tffId: pTffId}, update: {teamId: awayTeam.id}, create: {tffId: pTffId, name: aip.eq(i).text().trim(), teamId: awayTeam.id}});
          }
      }
  }

  console.log(`Processed match ${macId}: ${homeTeam.name} vs ${awayTeam.name}`);
}

async function main() {
  try {
      const macIds = await getMatchIds();
      console.log(`Got ${macIds.length} matches to process.`);
      
      let count = 0;
      for (const macId of macIds) {
          count++;
          console.log(`[${count}/${macIds.length}] Fetching match ${macId}...`);
          try {
              await scrapeMatch(macId);
          } catch (e) {
              console.error(`Error processing match ${macId}`, e);
          }
          await new Promise(r => setTimeout(r, 200)); // be nice to TFF
      }
      console.log('Finished processing all matches.');
  } finally {
      await prisma.$disconnect();
  }
}

main();
