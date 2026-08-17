import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('match_dump.html', 'utf-8');
const $ = cheerio.load(html);

// Find tables that contain 'kisiId'
$('table').each((i, table) => {
    const players = $(table).find('a[href*="kisiId="]');
    if (players.length > 0) {
        console.log(`Table ${i} has ${players.length} players. text:`);
        // print the first few rows
        $(table).find('tr').slice(0, 3).each((j, tr) => {
            console.log('  row', j, $(tr).text().trim().replace(/\s+/g, ' '));
        });
        console.log('---');
    }
});
