import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('play retries count once; conflicts and wrong environment cannot write',()=>{
 const rows=[];let released=0;
 const sheet={getLastRow:()=>rows.length+1,getRange:()=>({setValues:values=>rows.push(values[0].map(v=>typeof v==='string'&&v.startsWith("'")?v.slice(1):v))})};
 const table=()=>({sheet,rows,width:3,indices:{play_id:0,started_at:1,movie_id:2}});
 const ctx=vm.createContext({properties_:()=>({getProperty:key=>key==='SHEETS_ENVIRONMENT'?'test':'catalog'}),SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>{}},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released++})},readTable_:table,getCatalog:()=>({movies:[{id:'family-robots'},{id:'mobility-onsen'}]}),literal_:s=>"'"+s,fail_:code=>({ok:false,code})});
 vm.runInContext(fs.readFileSync(new URL('../apps-script/src/Plays.gs',import.meta.url),'utf8'),ctx);
 const p={playId:'f1eab34a-85f2-4636-8dd7-a06a8d87e180',movieId:'family-robots',environment:'test'};
 assert.equal(ctx.recordPlay(p).playCount,1);assert.equal(ctx.recordPlay(p).playCount,1);assert.equal(rows.length,1);
 assert.equal(ctx.recordPlay({...p,movieId:'mobility-onsen'}).code,'CONFLICT');
 assert.equal(ctx.recordPlay({...p,environment:'production'}).code,'CONFIG');
 assert.equal(ctx.recordPlay({...p,playId:'invalid'}).code,'VALIDATION');assert.equal(rows.length,1);assert.equal(released,3);
});
