const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const base = process.argv[2] || 'http://localhost:3002';
  let path = process.argv[3] || '/';
  const outDir = process.argv[4] || 'tmp/screenshots/';
  if (!path.startsWith('/')) path = '/' + path;
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  async function waitForServer(url, attempts = 30, delay = 1000) {
    for (let i = 0; i < attempts; i++) {
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
        if (resp && resp.status() < 400) return;
      } catch (e) {
        // ignore and retry
      }
      await new Promise((r) => setTimeout(r, delay));
    }
    throw new Error('Server did not respond in time: ' + url);
  }

  const url = base.replace(/\/+$/,'') + path;
  console.log('Waiting for', url);
  await waitForServer(url);

  // LIGHT
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/home-light-desktop.png`, fullPage: true });
  console.log('Saved:', `${outDir}/home-light-desktop.png`);

  // DARK
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/home-dark-desktop.png`, fullPage: true });
  console.log('Saved:', `${outDir}/home-dark-desktop.png`);

  // style report (computed colours)
  const report = await page.evaluate(() => {
    const pill = document.querySelector('.marketing-pill') || document.querySelector('.pill') || document.querySelector('.rounded-full');
    const hero = document.querySelector('main h1, main h2, h1, h2');
    const svg = (pill && pill.querySelector('svg')) || document.querySelector('svg');
    const getStroke = (el) => el ? (el.getAttribute('stroke') || getComputedStyle(el).stroke) : null;
    const circle = svg ? svg.querySelector('circle') : null;
    const pathEl = svg ? svg.querySelector('path') : null;
    const pillStyle = pill ? getComputedStyle(pill) : null;
    const heroStyle = hero ? getComputedStyle(hero) : null;
    return {
      url: location.href,
      pill: {
        exists: !!pill,
        color: pillStyle ? pillStyle.color : null,
        background: pillStyle ? pillStyle.backgroundColor : null
      },
      hero: {
        exists: !!hero,
        color: heroStyle ? heroStyle.color : null
      },
      svg: {
        circleStroke: getStroke(circle),
        pathStroke: getStroke(pathEl)
      }
    };
  });

  fs.writeFileSync(`${outDir}/home-style-report.json`, JSON.stringify(report, null, 2));
  console.log('Saved style report to', `${outDir}/home-style-report.json`);

  await browser.close();
})();
