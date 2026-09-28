import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateSubmission,normalize} from '../web/lib/validation.mjs';
const id='71f4d0d9-8268-4c67-8d22-dd9b8658e543';
const payload={submissionId:id,movieId:'family-robots',comment:'あしたも遊ぼう'};
function harness(){
 const props={SHEETS_ENVIRONMENT:'test',APP_VERSION:'0.1.0'}, rows=[];let locked=false,released=0,published=true;
 const headers=['comment','submission_id','movie_id','movie_title_snapshot','submitted_at','review_status','app_version'];
 const decode=x=>typeof x==='string'&&x.startsWith("'")?x.slice(1):x;
 const sheet={getLastRow:()=>rows.length+1,getRange:index=>({setValues:values=>{rows[index-2]=values[0].map(decode)},getValues:()=>[rows[index-2]]})};
 const context=vm.createContext({console,properties_:()=>({getProperty:key=>props[key]}),LockService:{getScriptLock:()=>({tryLock:()=>!locked,releaseLock:()=>released++})},SpreadsheetApp:{flush:()=>{}},fail_:(code,message)=>({ok:false,code,message}),readTable_:()=>({sheet,rows,indices:Object.fromEntries(headers.map((h,i)=>[h,i])),width:headers.length}),getCatalog:()=>({movies:published?[{id:'family-robots',title:'あしたも、あそぼうね。'}]:[]})});
 vm.runInContext(fs.readFileSync(new URL('../apps-script/src/Feedback.gs',import.meta.url),'utf8'),context);
 return {context,rows,send:p=>context.submitFeedback({...p,environment:'test'}),unpublish:()=>published=false,busy:()=>locked=true,get released(){return released}};
}
test('frontend and Apps Script agree on Unicode, CRLF and boundaries',()=>{
 const {context}=harness();
 for(const comment of ['',' \n ','a'.repeat(201),'😀'.repeat(200),'😀'.repeat(201),'一\r\n二','=1+1','<script>alert(1)</script>']){
  const p={...payload,comment};assert.equal(!validateSubmission(p),context.validate_(p));
 }
 assert.equal(normalize(' \r\n一\r二 '),'一\n二');
 assert.ok(validateSubmission({...payload,movieId:'../../bad'}));
 assert.ok(validateSubmission({...payload,submissionId:'bad'}));
});
test('one row for retries, conflict rejects edits, retry works after unpublish',()=>{
 const h=harness();assert.equal(h.send(payload).status,'created');assert.equal(h.send(payload).status,'already_recorded');assert.equal(h.rows.length,1);
 assert.equal(h.send({...payload,comment:'別の本文'}).code,'CONFLICT');h.unpublish();assert.equal(h.send(payload).status,'already_recorded');assert.equal(h.rows.length,1);assert.equal(h.released,4);
});
test('busy, unavailable and wrong environment cannot append',()=>{
 const h=harness();h.unpublish();assert.equal(h.send(payload).code,'UNAVAILABLE');assert.equal(h.rows.length,0);h.busy();assert.equal(h.send(payload).code,'BUSY');assert.throws(()=>h.context.submitFeedback({...payload,environment:'production'}));
});
test('all comments are passed as literal text; retry preserves exact input',()=>{
 for(const comment of ['=1+1','+123','-2','@SUM(A1)',"'=1+1",'😀\nこんにちは','<img src=x onerror=alert(1)>']){
  const h=harness();assert.equal(h.context.literal_(comment),"'"+comment);assert.equal(h.send({...payload,comment}).status,'created');assert.equal(h.rows[0][0],comment);assert.equal(h.send({...payload,comment}).status,'already_recorded');
 }
});
test('write error releases lock',()=>{
 const h=harness();h.context.SpreadsheetApp.flush=()=>{throw Error('simulated transport failure')};assert.throws(()=>h.send(payload));assert.equal(h.released,1);
 // Simulates a lost response after commit. Same ID discovers existing row.
 assert.equal(h.send(payload).status,'already_recorded');assert.equal(h.rows.length,1);
});
