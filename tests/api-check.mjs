import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
const p={submissionId:crypto.randomUUID(),movieId:'family-robots',comment:'ローカル検証'};
const catalog=await fetch(base+'/api/movies');assert.equal(catalog.headers.get('cache-control'),'no-store');const data=await catalog.json();assert.equal(data.mode,'demo');assert.equal(data.movies.length,2);
async function post(body,origin=base){return fetch(base+'/api/feedback',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)})}
assert.equal((await post(p,'https://invalid.example')).status,403);
assert.equal((await post({...p,comment:' '.repeat(3)})).status,400);
assert.equal((await post({...p,comment:'😀'.repeat(201)})).status,400);
assert.equal((await post({...p,comment:'x'.repeat(5000)})).status,413);
assert.equal((await post({...p,website:'bot.example'})).status,400);
const res=await post({...p,comment:'😀'.repeat(200)});assert.equal(res.status,409);assert.equal((await res.json()).code,'DEMO_NOT_SAVED');
console.log('PASS: no-store, 2 mapped movies, origin, empty/201/size/bot validation, 200 Unicode, demo never reports saved');
