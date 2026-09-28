import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
test('catalog only returns valid published rows sorted deterministically',()=>{
 const context=vm.createContext({console:{warn:()=>{}},properties_:()=>({getProperty:()=> 'test'})});
 vm.runInContext(fs.readFileSync(new URL('../apps-script/src/Catalog.gs',import.meta.url),'utf8'),context);
 const headers=Array.from(context.MOVIE_HEADERS).reverse(),indices=Object.fromEntries(headers.map((h,i)=>[h,i]));
 const row=(id,order,published=true,more={})=>headers.map(key=>({movie_id:id,sort_order:order,published,category:'家事',problem:'お悩み',title:'作品',drive_file_id:'abcdefghijklmno',drive_resource_key:'',thumbnail_key:'family',duration_seconds:42,updated_at:'',...more})[key]);
 context.readTable_=()=>({indices,rows:[row('b',10),row('a',10),row('hidden',0,false),row('invalid',1,true,{duration_seconds:''}),row('duplicate',2),row('duplicate',3)]});
 assert.deepEqual(Array.from(context.getCatalog().movies,m=>m.id),['a','b']);
});
