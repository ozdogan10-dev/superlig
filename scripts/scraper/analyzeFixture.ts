import axios from 'axios';
import https from 'https';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';

const agent = new https.Agent({ rejectUnauthorized: false });

async function main() {
  const url = 'https://www.tff.org/default.aspx?pageID=198';
  const response = await axios.get(url, {
    httpsAgent: agent,
    responseType: 'arraybuffer'
  });
  
  const html = iconv.decode(Buffer.from(response.data), 'windows-1254');
  const $ = cheerio.load(html);
  
  // Find all rows that contain a macId link
  $('a[href*="macId="]').slice(0, 5).each((i, el) => {
      const macId = $(el).attr('href')?.match(/macId=(\d+)/i)?.[1];
      const row = $(el).closest('tr'); // Table row
      // Print the text of all cells in this row
      const cells = row.find('td').map((j, td) => $(td).text().trim()).get();
      console.log(`Match ${macId}:`, cells);
  });
}

main();
