const { chromium } = require('playwright');
const fs = require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'});
 await context.addInitScript(() => {localStorage.setItem('cookie-consent', JSON.stringify({necessary:true,preferences:false,statistics:false,marketing:false})); localStorage.setItem('theme','light');});
 const base=process.env.DASHBOARD_REVIEW_URL || 'http://localhost:3003';
 const login=await context.request.post(`${base}/api/auth/login`,{data:{email:process.env.TEST_USER_EMAIL || 'test@3yeses.online',password:process.env.TEST_USER_PASSWORD || 'Test123!'}});
 if (!login.ok()) throw new Error(`Login failed: ${login.status()}`);
 const page=await context.newPage(); page.setDefaultNavigationTimeout(120000);
 const failures=[]; page.on('pageerror', e=>{failures.push(e.message); console.log('PAGE ERROR', e.message);});
 const results=[];
 const setTheme = async (wantDark) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
   const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
   if (isDark === wantDark) return;
   await page.getByRole('button',{name:'Toggle theme'}).click();
   await page.waitForTimeout(150);
  }
  await page.waitForFunction((dark) => document.documentElement.classList.contains('dark') === dark, wantDark, {timeout:10000});
 };
 for (const route of (process.env.DASHBOARD_ROUTES || 'overview,profile,gallery,analytics,activity,saved,history,messages,billing,settings,tickets,subscription,subscription/success,talent').split(',')) {
  await page.goto(`${base}/en-gb/dashboard/${route}`,{waitUntil:'domcontentloaded'});
  await page.locator('#dashboard-content h1').first().waitFor({timeout:60000}).catch(async e=>{console.log('FAILED ROUTE',route,page.url(),(await page.locator('body').innerText()).slice(0,2000)); throw e;});
  await page.screenshot({path:`test-results/dashboard-${route.replaceAll('/','-')}-desktop.png`,fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth+1);
  results.push({route,viewport:'desktop',overflow,title:await page.locator('#dashboard-content h1').first().innerText()});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:`test-results/dashboard-${route.replaceAll('/','-')}-mobile.png`,fullPage:true});
  results.push({route,viewport:'mobile',overflow:await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth+1)});
  await page.setViewportSize({width:1440,height:1000});
  await setTheme(true);
  await page.screenshot({path:`test-results/dashboard-${route.replaceAll('/','-')}-dark.png`,fullPage:true});
  await setTheme(false);
  const rawKeys=await page.locator('#dashboard-content').innerText();
  if (/dashboard\.[a-z]+\.[a-z]/i.test(rawKeys)) failures.push(`Missing labels on ${route}`);
  console.log('Reviewed',route);
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Open dashboard menu'}).click();
 await page.getByRole('navigation',{name:'Dashboard',exact:true}).getByRole('link',{name:'Gallery',exact:true}).click();
 await page.locator('#dashboard-content h1').waitFor();
 if (await page.getByRole('button',{name:'Open dashboard menu'}).getAttribute('aria-expanded') !== 'false') throw new Error('Mobile menu did not close');
 await setTheme(true);
 await page.screenshot({path:'test-results/dashboard-gallery-dark-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Add media',exact:true}).click();
 await page.getByRole('dialog').waitFor();
 await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).first().click();
 await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.route('**/api/analytics/dashboard?*',route=>route.fulfill({status:500,json:{success:false}}));
 await page.goto(`${base}/en-gb/dashboard/analytics`,{waitUntil:'domcontentloaded'});
 await page.getByRole('alert').filter({hasText:'couldn’t load'}).waitFor();
 await page.unroute('**/api/analytics/dashboard?*');
 await page.getByRole('button',{name:'Try again',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'couldn’t load'}).waitFor({state:'hidden'});
 await page.route('**/api/subscription/current',route=>route.fulfill({json:{status:'NONE',plan:null}}));
 await page.goto(`${base}/en-gb/dashboard/subscription/success?session_id=review`,{waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:'Subscription needs review'}).waitFor();
 await page.unroute('**/api/subscription/current');
 await page.route('**/api/subscription/current',route=>route.fulfill({json:{status:'ACTIVE',plan:'STANDARD'}}));
 await page.reload({waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:'Standard Access is active'}).waitFor();
 await page.unroute('**/api/subscription/current');
 console.log('Passed mobile navigation, theme switching, gallery dialog, analytics retry, and subscription confirmation states');
 console.log(JSON.stringify({results,failures},null,2));
 fs.writeFileSync('test-results/dashboard-review.json',JSON.stringify({results,failures},null,2));
 if(results.some(x=>x.overflow)||failures.length) process.exitCode=1;
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});




