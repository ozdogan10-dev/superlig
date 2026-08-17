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
  
  let currentWeek = 0;
  
  // Usually weeks are in h3, h4, th, or specific classes
  $('th, span, div, h3, h4').each((i, el) => {
      const text = $(el).text().trim();
      const match = text.match(/^(\d+)\.\s*Hafta/i);
      if (match && text.length < 20) {
          console.log(`Found week header: ${text}`);
      }
  });
}

main();
