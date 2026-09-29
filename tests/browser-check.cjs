// Uses the bundled Playwright runtime, or a supplied PLAYWRIGHT_MODULE path.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/mochi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const base='http://127.0.0.1:3000';const results=[];
 const out=new URL('../docs/verification/',`file:///${__filename.replaceAll('\\','/')}`).pathname;
 fs.mkdirSync('docs/verification',{recursive:true});
 async function shot(name){await page.screenshot({path:`docs/verification/${name}.png`,fullPage:true})}
 async function noOverflow(label){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,label);results.push(label)}
 await page.goto(base);await page.getByRole('button',{name:/免許を返したら/}).waitFor();
 for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await noOverflow(`list ${width}px`);await shot(`list-${width}`)}
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:/免許を返したら/}).click();await page.getByRole('heading',{name:/免許を返したら/}).waitFor();await shot('watch-390');for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await noOverflow(`watch ${width}px`)}await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:/感想フォームを開く/}).click();assert.equal(await page.locator('#movie').inputValue(),'mobility-onsen');
 await page.locator('#comment').fill('作品別の下書き');await page.getByRole('button',{name:'← 動画に戻る'}).click();await page.getByRole('heading',{name:/免許を返したら/}).waitFor();await page.goBack();await page.locator('#comment').waitFor();assert.equal(await page.locator('#comment').inputValue(),'作品別の下書き');
 await page.locator('#movie').selectOption('family-robots');assert.equal(await page.locator('#comment').inputValue(),'');await page.locator('#movie').selectOption('mobility-onsen');assert.equal(await page.locator('#comment').inputValue(),'作品別の下書き');results.push('history / entry selection / per-movie drafts');
 for(const value of ['   ','😀'.repeat(201)]){await page.locator('#comment').fill(value);await page.getByRole('button',{name:'送信を試す（保存されません）'}).click();await page.locator('#form-error').waitFor();assert.match(await page.locator('#form-error').innerText(),/1～200/)}
 await page.locator('#comment').fill('😀'.repeat(200));await page.getByRole('button',{name:'送信を試す（保存されません）'}).click();await page.getByText('デモのため感想は送信・保存されません。',{exact:true}).waitFor();assert.equal(await page.locator('#comment').inputValue(),'😀'.repeat(200));results.push('empty / 201 Unicode rejected; 200 accepted; demo does not save');
 await page.locator('#comment').fill('<img src=x onerror=alert(1)>\nこんな未来を見てみたい。');await shot('form-390');
 for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await noOverflow(`form ${width}px`)}
 await page.getByRole('button',{name:/完了画面の見た目を確認/}).click();await page.getByRole('heading',{name:'一言、ありがとう。'}).waitFor();assert.equal(await page.locator('blockquote img').count(),0);await shot('complete-430');for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await noOverflow(`complete ${width}px`)}results.push('explicit unsaved preview / HTML input is text');
 await page.getByRole('button',{name:/ほかのお悩みも/}).click();await page.getByRole('button',{name:/感想フォームを開く/}).click();assert.equal(await page.locator('#movie').inputValue(),'');
 await page.locator('#movie').selectOption('family-robots');await page.locator('#comment').fill('通信障害のテスト');
 let requests=0,posted=[];
 await page.route('**/api/feedback',async route=>{requests++;posted.push(route.request().postDataJSON());await new Promise(r=>setTimeout(r,500));await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,code:'UPSTREAM',message:'保存結果が不明です。'})})});
 await page.getByRole('button',{name:'送信を試す（保存されません）'}).dblclick();await page.getByRole('button',{name:'保存結果を再確認'}).waitFor();assert.equal(requests,1);assert.equal(await page.locator('#comment').isDisabled(),true);assert.equal(await page.locator('#comment').inputValue(),'通信障害のテスト');
 await page.getByRole('button',{name:'保存結果を再確認'}).click();await page.getByRole('button',{name:'保存結果を再確認'}).waitFor();assert.equal(posted[0].submissionId,posted[1].submissionId);results.push('double-click only sends once; uncertain response locks input; retry uses same UUID');
 await page.unroute('**/api/feedback');
 // Verify lifecycle with a clearly synthetic Drive iframe; no real playback claim.
 await page.route('**/api/movies',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,mode:'sheets',movies:[{id:'test-video',category:'テスト',problem:'プレイヤー破棄テスト',title:'テスト作品',driveFileId:'synthetic-test-id',resourceKey:'',thumbnailKey:'family',durationSeconds:42}]})}));
 await page.route('https://drive.google.com/**',route=>route.fulfill({contentType:'text/html',body:'<p>Test fixture only</p>'}));
 await page.goto(base);await page.getByRole('button',{name:/プレイヤー破棄テスト/}).click();await page.locator('iframe.player').waitFor();await page.getByRole('button',{name:/感想フォームを開く/}).click();assert.equal(await page.locator('iframe.player').count(),0);results.push('leaving watch removes iframe (synthetic fixture; real audio unverified)');
 fs.writeFileSync('docs/verification/browser-results.json',JSON.stringify({browser:'Microsoft Edge / Playwright',results,realVideoVerified:false,realSheetVerified:false},null,2));
 console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
