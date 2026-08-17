import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function scrapeMatch(macId: number) {
  console.log(`Fetching match ${macId}...`);
  const url = `https://www.tff.org/Default.aspx?pageId=29&macId=${macId}`;
  
  const response = await axios.get(url, {
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    responseType: 'arraybuffer'
  });
  
  const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
  const $ = cheerio.load(html);

  // Parse basic match info
  const scoreHomeText = $('#ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_lblTakim1Skor').text().trim();
  const scoreAwayText = $('#ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_Label12').text().trim(); // this might be empty, or label12 is score2. Let's find score2.
  // Wait, score 2 might be lblTakim2Skor but usually it's label12 or something.
  // Let's just find the text "BEŞİKTAŞ A.Ş. 1 EYÜPSPOR 0"
  
  let scoreHome = null;
  let scoreAway = null;
  
  if (scoreHomeText && !isNaN(parseInt(scoreHomeText))) {
      scoreHome = parseInt(scoreHomeText);
  }
  
  const scoreAwayRaw = $('#ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_Label12').text().trim();
  if (scoreAwayRaw && !isNaN(parseInt(scoreAwayRaw))) {
      scoreAway = parseInt(scoreAwayRaw);
  }

  const stadiumName = $('#ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_lnkStad').text().trim();
  
  const referees = $('a[id^="ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_rpt_ctl"][id$="_lnkHakem"]')
    .map((_, el) => $(el).text().trim()).get();

  // We need to associate this data with the existing Match in DB
  const matchRecord = await prisma.match.findFirst({
    where: { tffId: macId.toString() },
    include: { homeTeam: true, awayTeam: true }
  });

  if (!matchRecord) {
    console.error(`Match ${macId} not found in DB!`);
    return;
  }

  let stadiumId = null;
  if (stadiumName) {
    let stadium = await prisma.stadium.findFirst({ where: { name: stadiumName }});
    if (!stadium) {
      stadium = await prisma.stadium.create({ data: { name: stadiumName } });
    }
    stadiumId = stadium.id;
  }

  const homeManager = $('#ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim1_rptTeknikKadro_ctl01_lnkTeknikSorumlu').text().trim() || null;
  const awayManager = $('#ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim2_rptTeknikKadro_ctl01_lnkTeknikSorumlu').text().trim() || null;

  await prisma.match.update({
    where: { id: matchRecord.id },
    data: {
      homeScore: scoreHome,
      awayScore: scoreAway,
      stadiumId,
      homeManager,
      awayManager
    }
  });

  if (homeManager) {
    await prisma.team.update({ where: { id: matchRecord.homeTeamId }, data: { manager: homeManager } });
  }
  if (awayManager) {
    await prisma.team.update({ where: { id: matchRecord.awayTeamId }, data: { manager: awayManager } });
  }

  // Handle Referees
  for (const refName of referees) {
    let ref = await prisma.referee.findFirst({ where: { name: refName }});
    if (!ref) {
      ref = await prisma.referee.create({ data: { name: refName, tffId: refName }});
    }
    await prisma.match.update({
      where: { id: matchRecord.id },
      data: {
        referees: { connect: { id: ref.id } }
      }
    });
  }

  // Handle Lineups and Events
  // Clear old ones first
  await prisma.lineup.deleteMany({ where: { matchId: matchRecord.id }});
  await prisma.matchEvent.deleteMany({ where: { matchId: matchRecord.id }});

  const parsePlayers = async (selector: string, teamId: string, isStartingEleven: boolean) => {
    const players = $(selector).map((_, el) => $(el).text().trim()).get();
    for (const playerName of players) {
      let player = await prisma.player.findFirst({ where: { name: playerName, teamId } });
      if (!player) {
        player = await prisma.player.create({ data: { name: playerName, teamId, tffId: playerName + teamId } });
      }
      await prisma.lineup.create({
        data: {
          matchId: matchRecord.id,
          teamId,
          playerId: player.id,
          isStartingEleven
        }
      });
    }
  };

  await parsePlayers('a[id^="ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim1_rptKadrolar_ctl"][id$="_lnkOyuncu"]', matchRecord.homeTeamId, true);
  await parsePlayers('a[id^="ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim1_rptYedekler_ctl"][id$="_lnkOyuncu"]', matchRecord.homeTeamId, false);
  
  await parsePlayers('a[id^="ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim2_rptKadrolar_ctl"][id$="_lnkOyuncu"]', matchRecord.awayTeamId, true);
  await parsePlayers('a[id^="ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim2_rptYedekler_ctl"][id$="_lnkOyuncu"]', matchRecord.awayTeamId, false);

  // Parse Goals
  const parseGoals = async (selector: string, teamId: string) => {
    const events = $(selector).map((_, el) => $(el).text().trim()).get();
    for (const evt of events) {
      const minuteMatch = evt.match(/(\d+\+?\d*)\.dk/);
      const minute = minuteMatch ? minuteMatch[1] : '0';
      const namePart = evt.split(',')[0].replace(/\d+\+?\d*\.dk.*/, '').trim();
      
      let player = await prisma.player.findFirst({ where: { name: namePart, teamId } });
      if (!player) {
        player = await prisma.player.findFirst({ where: { teamId, name: { contains: namePart } } });
        if (!player) player = await prisma.player.create({ data: { name: namePart, teamId, tffId: namePart + teamId }});
      }
      
      await prisma.matchEvent.create({ data: { matchId: matchRecord.id, playerId: player.id, type: 'GOAL', minute } });
    }
  };

  await parseGoals('a[id^="ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim1_rptGoller_ctl"][id$="_lblGol"]', matchRecord.homeTeamId);
  await parseGoals('a[id^="ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim2_rptGoller_ctl"][id$="_lblGol"]', matchRecord.awayTeamId);

  // Parse Cards
  const parseCards = async (tableSelectorPattern: string, teamId: string) => {
    const promises = $(`a[id^="${tableSelectorPattern}"][id$="_lblKart"]`).map(async (_, el) => {
      const namePart = $(el).text().trim();
      const minuteText = $(el).next('span').text().trim();
      const minuteMatch = minuteText.match(/(\d+\+?\d*)\.dk/);
      const minute = minuteMatch ? minuteMatch[1] : '0';

      const imgHtml = $(el).prev('img').attr('src') || '';
      let type = 'YELLOW_CARD';
      if (imgHtml.includes('kirmizi')) type = 'RED_CARD';
      if (imgHtml.includes('sarikirmizi')) type = 'RED_CARD'; // double yellow = red
      
      let player = await prisma.player.findFirst({ where: { name: namePart, teamId } });
      if (!player) {
        player = await prisma.player.findFirst({ where: { teamId, name: { contains: namePart } } });
        if (!player) player = await prisma.player.create({ data: { name: namePart, teamId, tffId: namePart + teamId }});
      }

      await prisma.matchEvent.create({ data: { matchId: matchRecord.id, playerId: player.id, type, minute } });
    }).get();
    
    await Promise.all(promises);
  };

  await parseCards('ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim1_rptKartlar_ctl', matchRecord.homeTeamId);
  await parseCards('ctl00_MPane_m_29_194_ctnr_m_29_194_grdTakim2_rptKartlar_ctl', matchRecord.awayTeamId);
  // Need exact IDs for cards, but often it's _lblSariKart or _lblKirmiziKart.
  // Wait, the DOM for cards: let's grep for "_lblSari" or "_lblKart".
  // Actually, I will just dump the HTML and use regex to find card spans.
  // We'll write a separate logic for cards if needed. Let's start with goals.
  
  console.log(`Successfully scraped match ${macId}!`);
}

const macId = process.argv[2] ? parseInt(process.argv[2]) : 317791;
scrapeMatch(macId).then(() => {
  console.log('Done');
  process.exit(0);
}).catch(console.error);
