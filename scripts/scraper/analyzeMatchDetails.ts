import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('match_317791.html', 'utf8');
const $ = cheerio.load(html);

// Find match info
console.log('--- Match Info ---');
console.log('Title:', $('span#lblMacBilgi').text().trim() || $('title').text());
console.log('Score:', $('span#lblSkor').text().trim() || $('h3').text().trim());

// Find Goals
console.log('\n--- Goals ---');
$('span:contains("Goller")').parent().next().find('tr').each((i, el) => {
  console.log($(el).text().replace(/\s+/g, ' ').trim());
});

// Find Cards
console.log('\n--- Cards ---');
$('span:contains("Sarı Kartlar")').parent().next().find('tr').each((i, el) => {
  console.log('SARI:', $(el).text().replace(/\s+/g, ' ').trim());
});
$('span:contains("Kırmızı Kartlar")').parent().next().find('tr').each((i, el) => {
  console.log('KIRMIZI:', $(el).text().replace(/\s+/g, ' ').trim());
});

// Find Referees
console.log('\n--- Referees ---');
$('span:contains("Hakemler")').parent().next().find('tr').each((i, el) => {
  console.log($(el).text().replace(/\s+/g, ' ').trim());
});

// Find Players
console.log('\n--- Players ---');
const first11s = $('span').filter((i, el) => $(el).text() === 'İlk 11');
if (first11s.length > 0) {
    const homeFirst11 = first11s.eq(0).closest('table').next('table').find('a[href*="kisiId="]');
    console.log(`Home First 11: ${homeFirst11.length} players`);
    
    // In TFF, the players are actually inside a nested table. Let's just find the closest td.
    const homeTd = first11s.eq(0).closest('td');
    console.log(`Home First 11 (td):`, homeTd.find('a[href*="kisiId="]').map((i, el) => $(el).text()).get().join(', '));
}
