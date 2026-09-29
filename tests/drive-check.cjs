// Direct playback regression check. Run only against a local TEST/demo server.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mochi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 try {
  for(const id of ['mobility-onsen','family-robots']){
   await page.goto('http://127.0.0.1:3000/#watch/'+id);
   const video=page.locator('video');await video.waitFor();
   assert.equal(await video.evaluate(v=>v.controls),false);
   await page.getByRole('button',{name:'再生',exact:true}).click();
   await page.waitForFunction(()=>{const v=document.querySelector('video');return v.currentTime>1&&!v.paused});
   assert.equal(await page.evaluate(()=>document.querySelector('.movie-controls').getBoundingClientRect().top>=document.querySelector('video').getBoundingClientRect().bottom),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.getByRole('button',{name:'一時停止',exact:true}).click();
   assert.equal(await video.evaluate(v=>v.paused),true);
   await page.getByRole('button',{name:/感想フォームを開く/}).click();
   assert.equal(await page.locator('#movie').inputValue(),id);
   assert.equal(await page.locator('video').count(),0);
  }
  console.log('Direct playback, external controls, layout and form selection passed.');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
