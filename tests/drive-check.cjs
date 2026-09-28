const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mochi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();const results=[];
 try {
 for(const id of ['mobility-onsen','family-robots']){
  await page.goto('http://127.0.0.1:3000/#watch/'+id);
  await page.getByRole('button',{name:/動画を再生/}).waitFor();
  const result={movieId:id,initialIframeCount:await page.locator('iframe.player').count(),signedIn:false};results.push(result);
  await page.getByRole('button',{name:/動画を再生/}).click();
  const frame=await (await page.locator('iframe.player').elementHandle()).contentFrame();
  try {await frame.waitForLoadState('domcontentloaded',{timeout:30000});} catch {}
  await page.waitForTimeout(5000);
  result.frameUrl=frame.url();
  const play=frame.locator('[aria-label^="再生"]:visible').first();
  await page.locator('iframe.player').click();
  await page.waitForTimeout(2000);
  const videoFrame=page.frames().find(f=>f.url().startsWith('https://youtube.googleapis.com/embed/'));
  if(videoFrame){try{await videoFrame.waitForFunction(()=>{const v=document.querySelector('video');return v&&v.currentTime>1&&!v.paused},{},{timeout:45000});}catch(e){result.playbackWait='Timed out waiting for playback progression';}}
  const media=async()=>videoFrame?videoFrame.locator('video').evaluateAll(videos=>videos.map(v=>({currentTime:v.currentTime,duration:v.duration,paused:v.paused,muted:v.muted,volume:v.volume,readyState:v.readyState,audioDecodedBytes:v.webkitAudioDecodedByteCount,videoDecodedBytes:v.webkitVideoDecodedByteCount,error:v.error?.code||null}))):[];
  result.mediaBefore=await media();
  const unmute=frame.getByRole('button',{name:'ミュートを解除（M）',exact:true});
  if(await unmute.isVisible())await unmute.click();
  await page.waitForTimeout(3000);result.mediaAfter=await media();
  console.log(JSON.stringify({movieId:id,mediaBefore:result.mediaBefore,mediaAfter:result.mediaAfter}));
  await page.locator('iframe.player').hover();
  const fullscreen=frame.locator('[aria-label*="全画面"]:visible').first();
  try {await fullscreen.click({timeout:5000});}catch(e){result.fullscreenControlError='Control not available';}
  await page.waitForTimeout(500);
  result.fullscreen=await page.evaluate(()=>!!document.fullscreenElement);
  await page.screenshot({path:`docs/verification/fullscreen-${id}.png`});
  await page.keyboard.press('Escape');await page.waitForTimeout(300);
  if(await page.evaluate(()=>!!document.fullscreenElement))await frame.locator('[aria-label*="全画面"]:visible').first().press('Enter');
  result.text=(await frame.locator('body').innerText()).slice(0,500);
  await page.screenshot({path:`docs/verification/drive-${id}.png`,fullPage:true});
  await page.getByRole('button',{name:/感想フォームを開く/}).click();
  result.selectedMovie=await page.locator('#movie').inputValue();
  result.iframeAfterExit=await page.locator('iframe.player').count();
  await page.waitForTimeout(300);result.playbackFrameDetached=videoFrame?.isDetached();

 }
 } finally {fs.writeFileSync('docs/verification/drive-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
