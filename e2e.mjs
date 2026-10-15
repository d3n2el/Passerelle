/** Real-browser regression suite. Requires Playwright + Chromium and npm run dev. */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const baseURL=process.env.BASE_URL || 'http://localhost:3000';
const artifacts=resolve('tmp/qa');
await mkdir(artifacts,{recursive:true});
let chromium;
try {
  const module=process.env.PLAYWRIGHT_MODULE;
  ({chromium}=await import(module?.startsWith('/')?pathToFileURL(module).href:module||'playwright'));
} catch(error) {
  console.error('Browser checks not run: install Playwright and Chromium (see README).');
  process.exit(1);
}
let browser;
try {browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_ARGS?{args:JSON.parse(process.env.CHROMIUM_ARGS)}:{}),...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});}
catch(error){console.error('Browser checks not run: Chromium could not launch.\n'+error.message);process.exit(1);}
let passed=0;
const act=(page,action)=>page.locator(`[data-action="${action}"]:visible`).first().click();
const next=page=>page.locator('#shipment-form button[type="submit"]').click();
async function completeSample(page,kind='sample') {await act(page,kind);for(let i=0;i<4;i++)await next(page);await page.locator('.results-page').waitFor();}
async function noOverflow(page) {assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Layout overflows horizontally');}
async function test(name,fn,{mobile=false}={}) {
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},acceptDownloads:true});
  const page=await context.newPage();page.setDefaultTimeout(8000);
  const failures=[];const transmitted=[];
  page.on('pageerror',error=>failures.push(error.message));
  page.on('console',msg=>{if(msg.type()==='error')failures.push(msg.text());});
  page.on('request',request=>{if(request.method()!=='GET')transmitted.push(request.method()+' '+request.url());});
  try{await page.goto(baseURL);await fn(page,context);assert.deepEqual(failures,[],'Page/console errors');assert.deepEqual(transmitted,[],'Unexpected data transmission');console.log('PASS '+name);passed++;}
  catch(error){await page.screenshot({path:resolve(artifacts,'failure-'+passed+'.png'),fullPage:true}).catch(()=>{});throw error;}
  finally{await context.close();}
}
try{
 await test('French sample, language state, checklist, downloads and print',async(page,context)=>{
   await page.screenshot({path:resolve(artifacts,'landing-desktop.png'),fullPage:true});await noOverflow(page);
   await act(page,'sample');await page.locator('#field-company').fill('Atelier Test');
   await page.locator('[data-lang="en"]').click();assert.equal(await page.locator('#field-company').inputValue(),'Atelier Test');
   await page.locator('[data-lang="fr"]').click();assert.equal(await page.locator('#field-company').inputValue(),'Atelier Test');
   for(let i=0;i<4;i++)await next(page);
   assert.match(await page.locator('.estimate-total').innerText(),/6\s?614,64/);
   assert.match(await page.locator('.formula').nth(1).innerText(),/5\s?512,20.*20/);
   await page.locator('[data-status]').first().selectOption('complete');
   assert.match(await page.locator('.progress-badge').innerText(),/^1 \/ /);
   await page.locator('[data-lang="en"]').click();assert.equal(await page.locator('[data-status]').first().inputValue(),'complete');
   const downloadWait=page.waitForEvent('download');await act(page,'download');const download=await downloadWait;
   const reportPath=resolve(artifacts,'shipment-report.html');await download.saveAs(reportPath);
   const html=await readFile(reportPath,'utf8');assert.match(html,/<html lang="en">/);assert.match(html,/Indicative estimate only/);assert.match(html,/Why this appears/);
   await page.screenshot({path:resolve(artifacts,'results-desktop.png'),fullPage:true});
   const popupWait=page.waitForEvent('popup');await act(page,'print');const popup=await popupWait;await popup.waitForLoadState('domcontentloaded');
   assert.match(await popup.locator('h1').innerText(),/Export preparation/);
   assert.equal(await popup.locator('main').evaluate(el=>getComputedStyle(el).maxWidth),'900px','Print stylesheet must be allowed by CSP');
   await popup.emulateMedia({media:'print'});await popup.pdf({path:resolve(artifacts,'printed-report.pdf'),format:'A4'});await popup.close();
 });
 await test('English guest validation and unsure path with unknown costs',async page=>{
   await page.locator('[data-lang="en"]').click();await act(page,'start');await next(page);await next(page);
   assert.equal(await page.locator('#field-description').getAttribute('aria-invalid'),'true');
   await page.locator('#field-description').fill('Sample replacement parts');await page.locator('#field-quantity').fill('10');await page.locator('#field-goodsValue').fill('1200,50');
   await next(page);await next(page);await next(page);
   assert.match(await page.locator('.estimate-total').innerText(),/Subtotal of known amounts/);
   assert.equal(await page.locator('.cost-line').nth(2).locator('strong').innerText(),'Not calculated');
   assert.equal(await page.locator('.cost-line').nth(3).locator('strong').innerText(),'Not calculated');
   assert.match(await page.locator('.checklist-items').innerText(),/product rules reviewed/);
 });
 await test('Regulated sample and Northern Ireland block precise tax results',async page=>{
   await completeSample(page,'sample-regulated');assert.match(await page.locator('.risk-card').innerText(),/spécialisé/);
   assert.equal(await page.locator('.cost-line').nth(2).locator('strong').innerText(),'Non calculé');
   await act(page,'home');await act(page,'sample');await page.locator('#field-destinationArea').selectOption('ni');
   for(let i=0;i<4;i++)await next(page);
   assert.equal(await page.locator('.cost-line').nth(2).locator('strong').innerText(),'Non calculé');
   assert.equal(await page.locator('.cost-line').nth(3).locator('strong').innerText(),'Non calculé');
   assert.ok(await page.locator('[data-status="route-review"]').count());
 });
 await test('Explicit draft persistence, contact consent, stale request invalidation and reset',async page=>{
   await completeSample(page);await act(page,'save');
   await act(page,'contact');await page.locator('#contact-form button[type="submit"]').click();
   assert.ok(await page.locator('#consent-error').isVisible());
   await page.locator('#contact-name').fill('Demo User');await page.locator('#contact-email').fill('demo@example.test');
   await page.locator('[data-contact="consent"]').check();await page.locator('#contact-form button[type="submit"]').click();
   assert.match(await page.locator('.success-card').innerText(),/Rien n’a été envoyé/);
   const downloadWait=page.waitForEvent('download');await act(page,'download-contact');await(await downloadWait).saveAs(resolve(artifacts,'contact-request.html'));
   assert.doesNotMatch(await page.evaluate(()=>localStorage.getItem('passerelle.shipment.v1')),/demo@example|Demo User|consent/);
   await act(page,'results');await act(page,'edit');await page.locator('#field-company').fill('Updated company');for(let i=0;i<4;i++)await next(page);
   await act(page,'contact');assert.ok(await page.locator('#contact-form').isVisible());assert.equal(await page.locator('[data-contact="consent"]').isChecked(),false);
   await page.reload();await act(page,'resume');assert.equal(await page.locator('#field-company').inputValue(),'Atelier des Rives');
   await act(page,'privacy');await page.locator('dialog').press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),'privacy');
   await act(page,'reset');await act(page,'confirm-reset');assert.equal(await page.evaluate(()=>localStorage.getItem('passerelle.shipment.v1')),null);
   await page.reload();assert.equal(await page.locator('[data-action="resume"]').count(),0);
 });
 await test('Mobile full flow and navigation',async page=>{
   await noOverflow(page);await page.screenshot({path:resolve(artifacts,'landing-mobile.png'),fullPage:true});
   await act(page,'sample');await noOverflow(page);
   for(let i=0;i<4;i++){await noOverflow(page);await next(page);}
   await noOverflow(page);await page.screenshot({path:resolve(artifacts,'results-mobile.png'),fullPage:true});
   await act(page,'contact');await noOverflow(page);await act(page,'results');await act(page,'home');
   await act(page,'limits');assert.ok(await page.locator('dialog').isVisible());await act(page,'close');
 },{mobile:true});
 console.log(`${passed} browser journeys passed.`);
} finally {await browser.close();}
