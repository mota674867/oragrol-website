import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const require=createRequire(path.join(process.env.SEARCH_BROWSER_PACKAGE_ROOT??root,'package.json'));
const {chromium}=require('playwright-core');
const base=process.env.SEARCH_TEST_BASE_URL??'http://localhost:3000';
const url=new URL(base);
if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error('Browser checks are loopback-only; never contact a live site');
const evidence=path.resolve(process.env.SEARCH_TEST_EVIDENCE_DIR??'test-results/site-search');
mkdirSync(evidence,{recursive:true});
const executablePath=process.env.CHROME_EXECUTABLE_PATH??(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined);
const browser=await chromium.launch({headless:true,executablePath});
const results=[];
async function check(name,action){await action();results.push({name,result:'PASS'});console.log('PASS '+name);}
try{
  for(const width of [1366,390]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('dialog').waitFor({state:'attached'});
    const trigger=page.getByRole('button',{name:'Search',exact:true}).first();
    await check(`${width}: closed search does not change visible NAV`,async()=>{
      assert.equal(await page.getByRole('dialog').count(),0);assert.ok(await trigger.isVisible());
    });
    await trigger.click();const dialog=page.getByRole('dialog',{name:'Search the website'});const field=page.getByRole('searchbox');
    await check(`${width}: existing search button opens a labelled focused dialog`,async()=>{
      await dialog.waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('input[type=search]')===document.activeElement);
      await page.getByText('Type at least two characters to find a page.').waitFor();
      assert.equal(await trigger.getAttribute('aria-expanded'),'true');
    });
    await field.fill('OR ONE');
    await check(`${width}: keyword results include the real OR ONE page`,async()=>{
      await dialog.locator('a[href="/or-one"]').waitFor();assert.ok(await dialog.locator('[data-search-result]').count()>0);
    });
    await page.screenshot({path:path.join(evidence,width===1366?'desktop.png':'phone.png'),fullPage:true});
    await check(`${width}: bounded dialog and page have no horizontal overflow`,async()=>{
      const bounds=await dialog.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    });
    await check(`${width}: keyboard focus stays in the native dialog`,async()=>{
      for(let i=0;i<20;i++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)));}
    });
    await field.fill('definitelynotapublicwebsiteword987654');
    await check(`${width}: no matches show an honest empty state`,async()=>{await page.getByText('No results found. Try another word or a shorter phrase.').waitFor();assert.equal(await dialog.locator('[data-search-result]').count(),0);});
    await field.fill('<img src=x onerror=alert(1)>');
    await check(`${width}: query is not injected as HTML`,async()=>{assert.equal(await dialog.locator('img').count(),0);});
    await dialog.getByRole('button',{name:'Clear',exact:true}).click();
    await check(`${width}: clear resets the query and returns focus`,async()=>{assert.equal(await field.inputValue(),'');assert.ok(await field.evaluate(el=>el===document.activeElement));});
    await field.fill('security');
    await check(`${width}: more results are reachable`,async()=>{
      await dialog.getByRole('button',{name:'Show more results'}).waitFor();const before=await dialog.locator('[data-search-result]').count();
      await dialog.getByRole('button',{name:'Show more results'}).click();assert.ok(await dialog.locator('[data-search-result]').count()>before);
    });
    await page.keyboard.press('Escape');
    await check(`${width}: Escape dismisses and restores NAV focus`,async()=>{assert.equal(await dialog.isVisible(),false);assert.ok(await trigger.evaluate(el=>el===document.activeElement));assert.equal(await trigger.getAttribute('aria-expanded'),'false');});
    await trigger.click();await field.fill('MFA');
    await check(`${width}: Enter opens the first actual public destination`,async()=>{
      const href=await dialog.locator('[data-search-result]').first().getAttribute('href');
      await field.press('Enter');await page.waitForURL(destination=>destination.pathname===href);assert.equal(new URL(page.url()).pathname,href);
    });
    await check(`${width}: no client runtime errors`,async()=>{assert.deepEqual(errors,[]);});
    await context.close();
  }
  const context=await browser.newContext();const page=await context.newPage();let calls=0;
  const index=JSON.parse(readFileSync(path.resolve(process.env.SEARCH_INDEX_FILE??'public/site-search-index.json'),'utf8'));
  await page.route('**/site-search-index.json',route=>{calls++;return route.fulfill(calls===1?{status:503,body:'unavailable'}:{status:200,contentType:'application/json',body:JSON.stringify(index)});});
  await page.goto(base,{waitUntil:'networkidle'});await page.locator('dialog').waitFor({state:'attached'});await page.getByRole('button',{name:'Search',exact:true}).first().click();
  await check('unavailable index shows retry instead of fabricated results',async()=>{await page.getByText('Search could not load. Please try again.').waitFor();await page.getByRole('button',{name:'Try again'}).click();await page.getByRole('searchbox').fill('OR ONE');await page.getByRole('dialog').locator('a[href="/or-one"]').waitFor();assert.equal(calls,2);});
  await context.close();
  writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify({node:process.version,browser:'Chrome headless',scope:'shipping component + source-derived public index in an isolated NAV harness; not a live-site deployment test',cases:results},null,2));
  console.log(`${results.length} browser checks passed, 0 failures.`);
}finally{await browser.close();}
