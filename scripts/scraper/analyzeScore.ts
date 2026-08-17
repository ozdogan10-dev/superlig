import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('match_dump.html', 'utf-8');
const $ = cheerio.load(html);

// Find the text that contains the team names
const home = 'GALATASARAY A.Ş.';
const away = 'ARCA ÇORUM FK';

$('span, div, td').each((i, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.includes(home) && text.includes(away) && text.length < 200) {
        console.log(`Possible Match Header: ${text}`);
        console.log(`HTML: ${$(el).html()}`);
        console.log('---');
    }
});
