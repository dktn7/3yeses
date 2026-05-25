#!/usr/bin/env node
/**
 * scripts/audit-pages.js
 * Usage: node scripts/audit-pages.js <baseUrl> <outDir>
 *
 * Visits a set of public pages, captures light/dark screenshots and computes
 * basic style metrics (hero contrast, pill contrast, CTA contrast, SwoopingTick strokes).
 */
const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.argv[2] || 'http://localhost:3002';
const outDir = process.argv[3] || 'tmp/screenshots/audit';

const pages = [
  '/',
  '/support',
  '/pricing',
  '/terms',
  '/contact',
  '/auth/login',
  '/auth/signup',
  '/categories',
  '/talent/1'
];

function slugFromPath(p) {
  if (p === '/') return 'home';
  return p.replace(/^\//, '').replace(/\//g, '-').replace(/[^\w-]/g, '') || 'page';
}

async function run() {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const results = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    pages: []
  };

  for (const p of pages) {
    const url = new URL(p, baseUrl).toString();
    const slug = slugFromPath(p);
    console.log('Visiting', url);
    let pageResult = { path: p, url, slug, ok: false };
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(800);

      const metricsLight = await page.evaluate(() => {
        function parseRgb(rgb) {
          if (!rgb) return null;
          const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (!m) return null;
          return { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? +m[4] : 1 };
        }
        function lum({ r, g, b }) {
          const srgb = [r, g, b].map(v => {
            v = v / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
        }
        function contrast(c1, c2) {
          const A = parseRgb(c1) || { r: 255, g: 255, b: 255 };
          const B = parseRgb(c2) || { r: 255, g: 255, b: 255 };
          const L1 = lum(A);
          const L2 = lum(B);
          const light = Math.max(L1, L2);
          const dark = Math.min(L1, L2);
          return (light + 0.05) / (dark + 0.05);
        }
        function effectiveBackground(el) {
          let e = el;
          while (e && e.nodeType === 1 && e.nodeName !== 'HTML') {
            const bg = getComputedStyle(e).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
            e = e.parentElement;
          }
          return getComputedStyle(document.body).backgroundColor;
        }
        function first(...sels) {
          for (const s of sels) {
            const el = document.querySelector(s);
            if (el) return el;
          }
          return null;
        }

        const heroEl = first('header h1', '.hero h1', '.page-hero h1', 'h1');
        let heroMetrics = null;
        if (heroEl) {
          const color = getComputedStyle(heroEl).color;
          const bg = effectiveBackground(heroEl);
          const ratio = contrast(color, bg);
          heroMetrics = { color, bg, fontSize: getComputedStyle(heroEl).fontSize, ratio, pass: ratio >= 4.5 };
        }

        const pill = document.querySelector('.marketing-pill, .pill, [data-pill], .marketing-pill--default');
        let pillMetrics = null;
        if (pill) {
          const textEl = pill.querySelector('.pill-text') || pill;
          const textColor = getComputedStyle(textEl).color;
          const pillBg = getComputedStyle(pill).backgroundColor;
          const ratio = contrast(textColor, pillBg);
          pillMetrics = { textColor, pillBg, ratio, pass: ratio >= 4.5 };
          const svg = pill.querySelector('svg');
          if (svg) {
            const circle = svg.querySelector('circle, path');
            const circleStroke = circle ? (circle.getAttribute('stroke') || getComputedStyle(circle).stroke) : null;
            const check = svg.querySelector('path, polyline');
            const checkStroke = check ? (check.getAttribute('stroke') || getComputedStyle(check).stroke) : null;
            pillMetrics.svg = { circleStroke, checkStroke };
          }
        }

        const cta = document.querySelector('button, a.button, .btn, .cta, [role="button"]');
        let ctaMetrics = null;
        if (cta) {
          const color = getComputedStyle(cta).color;
          const bg = getComputedStyle(cta).backgroundColor;
          const ratio = contrast(color, bg);
          ctaMetrics = { color, bg, ratio, pass: ratio >= 4.5 };
        }

        const swoops = Array.from(document.querySelectorAll('svg.swooping-tick, .swooping-tick svg, svg')).slice(0, 5).map(svg => {
          const circle = svg.querySelector('circle, path');
          const circleStroke = circle ? (circle.getAttribute('stroke') || getComputedStyle(circle).stroke) : null;
          const check = svg.querySelector('path, polyline');
          const checkStroke = check ? (check.getAttribute('stroke') || getComputedStyle(check).stroke) : null;
          return { circleStroke, checkStroke };
        });

        return { heroMetrics, pillMetrics, ctaMetrics, swoopsCount: swoops.length, swoops };
      });

      const lightPath = path.join(outDir, `${slug}-light.png`);
      await page.screenshot({ path: lightPath, fullPage: true });

      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await page.waitForTimeout(500);

      const metricsDark = await page.evaluate(() => {
        function parseRgb(rgb) {
          if (!rgb) return null;
          const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (!m) return null;
          return { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? +m[4] : 1 };
        }
        function lum({ r, g, b }) {
          const srgb = [r, g, b].map(v => {
            v = v / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
        }
        function contrast(c1, c2) {
          const A = parseRgb(c1) || { r: 255, g: 255, b: 255 };
          const B = parseRgb(c2) || { r: 255, g: 255, b: 255 };
          const L1 = lum(A);
          const L2 = lum(B);
          const light = Math.max(L1, L2);
          const dark = Math.min(L1, L2);
          return (light + 0.05) / (dark + 0.05);
        }
        function effectiveBackground(el) {
          let e = el;
          while (e && e.nodeType === 1 && e.nodeName !== 'HTML') {
            const bg = getComputedStyle(e).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
            e = e.parentElement;
          }
          return getComputedStyle(document.body).backgroundColor;
        }
        function first(...sels) {
          for (const s of sels) {
            const el = document.querySelector(s);
            if (el) return el;
          }
          return null;
        }

        const heroEl = first('header h1', '.hero h1', '.page-hero h1', 'h1');
        let heroMetrics = null;
        if (heroEl) {
          const color = getComputedStyle(heroEl).color;
          const bg = effectiveBackground(heroEl);
          const ratio = contrast(color, bg);
          heroMetrics = { color, bg, fontSize: getComputedStyle(heroEl).fontSize, ratio, pass: ratio >= 4.5 };
        }

        const pill = document.querySelector('.marketing-pill, .pill, [data-pill], .marketing-pill--default');
        let pillMetrics = null;
        if (pill) {
          const textEl = pill.querySelector('.pill-text') || pill;
          const textColor = getComputedStyle(textEl).color;
          const pillBg = getComputedStyle(pill).backgroundColor;
          const ratio = contrast(textColor, pillBg);
          pillMetrics = { textColor, pillBg, ratio, pass: ratio >= 4.5 };
          const svg = pill.querySelector('svg');
          if (svg) {
            const circle = svg.querySelector('circle, path');
            const circleStroke = circle ? (circle.getAttribute('stroke') || getComputedStyle(circle).stroke) : null;
            const check = svg.querySelector('path, polyline');
            const checkStroke = check ? (check.getAttribute('stroke') || getComputedStyle(check).stroke) : null;
            pillMetrics.svg = { circleStroke, checkStroke };
          }
        }

        const cta = document.querySelector('button, a.button, .btn, .cta, [role="button"]');
        let ctaMetrics = null;
        if (cta) {
          const color = getComputedStyle(cta).color;
          const bg = getComputedStyle(cta).backgroundColor;
          const ratio = contrast(color, bg);
          ctaMetrics = { color, bg, ratio, pass: ratio >= 4.5 };
        }

        const swoops = Array.from(document.querySelectorAll('svg.swooping-tick, .swooping-tick svg, svg')).slice(0, 5).map(svg => {
          const circle = svg.querySelector('circle, path');
          const circleStroke = circle ? (circle.getAttribute('stroke') || getComputedStyle(circle).stroke) : null;
          const check = svg.querySelector('path, polyline');
          const checkStroke = check ? (check.getAttribute('stroke') || getComputedStyle(check).stroke) : null;
          return { circleStroke, checkStroke };
        });

        return { heroMetrics, pillMetrics, ctaMetrics, swoopsCount: swoops.length, swoops };
      });

      const darkPath = path.join(outDir, `${slug}-dark.png`);
      await page.screenshot({ path: darkPath, fullPage: true });

      function gradeFrom(light, dark) {
        const keys = ['heroMetrics', 'pillMetrics', 'ctaMetrics'];
        let present = 0, passed = 0, failures = [];
        for (const k of keys) {
          const l = light && light[k];
          const d = dark && dark[k];
          const item = l || d;
          if (item) {
            present += 1;
            const ok = (l && l.pass) || (d && d.pass);
            if (ok) passed += 1; else failures.push(k);
          }
        }
        if (present === 0) return { grade: 'B', reason: 'no measurable elements' };
        const ratio = passed / present;
        if (ratio === 1) return { grade: 'A', reason: 'all checks passed' };
        if (ratio >= 0.75) return { grade: 'B', reason: 'most checks passed', failures };
        if (ratio >= 0.5) return { grade: 'C', reason: 'some checks failed', failures };
        return { grade: 'D', reason: 'multiple failures', failures };
      }

      const grade = gradeFrom(metricsLight, metricsDark);

      pageResult.ok = true;
      pageResult.metricsLight = metricsLight;
      pageResult.metricsDark = metricsDark;
      pageResult.screenshots = { light: `${slug}-light.png`, dark: `${slug}-dark.png` };
      pageResult.grade = grade.grade;
      pageResult.gradeReason = grade.reason;
      pageResult.failures = grade.failures || [];

    } catch (err) {
      console.error('Error auditing', url, err && err.message);
      pageResult.ok = false;
      pageResult.error = (err && err.message) || String(err);
    }

    results.pages.push(pageResult);
  }

  const outJson = path.join(outDir, 'audit-report.json');
  await fs.writeFile(outJson, JSON.stringify(results, null, 2), 'utf8');
  console.log('Wrote', outJson);
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
