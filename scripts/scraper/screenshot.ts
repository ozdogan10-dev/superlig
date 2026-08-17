import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://www.tff.org/default.aspx?pageID=28&kulupID=3592', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'team_page.png' });
  await browser.close();
  console.log('Screenshot saved as team_page.png');
}
main();
