import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('match_317791.html', 'utf8');
const $ = cheerio.load(html);

// Find match info
const matchTitle = $('#lblMacTitle').text().trim() || $('#Label1').text().trim();
const scoreHome = $('#lblEvsahibiSkor').text().trim();
const scoreAway = $('#lblMisafirSkor').text().trim();

console.log(`Title: ${matchTitle}`);
console.log(`Score: ${scoreHome} - ${scoreAway}`);

const tables = $('table').toArray();

tables.forEach((table, i) => {
    const text = $(table).text().replace(/\s+/g, ' ');
    if (text.includes('İlk 11') || text.includes('Hakemler') || text.includes('Goller') || text.includes('OĞUZHAN ÇAKIR')) {
        console.log(`Found table with ID: ${$(table).attr('id')} or class: ${$(table).attr('class')}`);
        // print a few span IDs inside it
        console.log($(table).find('span[id]').map((_, el) => $(el).attr('id')).get().join(', '));
        console.log($(table).find('a[id]').map((_, el) => $(el).attr('id')).get().join(', '));
    }
});
