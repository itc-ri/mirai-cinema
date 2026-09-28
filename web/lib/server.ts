import 'server-only';
export const demoMovies = [
 {id:'mobility-onsen',sortOrder:10,category:'移動・お出かけ',problem:'免許を返したら、夫婦のお出かけはどうなる？',title:'免許返納・温泉編',driveFileId:'1QOA3MVpYjMQCGzGpW2ble3LzRxYbHrw9',resourceKey:'',thumbnailKey:'mobility',durationSeconds:46},
 {id:'family-robots',sortOrder:20,category:'子育て・家事',problem:'家事に追われて、子どもと遊ぶ時間がない。',title:'あしたも、あそぼうね。',driveFileId:'1RL_hz5r5c_beKwgBrwIgOGVcG5VU2d5M',resourceKey:'',thumbnailKey:'family',durationSeconds:55}
];
export function mode() {
 const source=process.env.DATA_SOURCE || 'demo';
 if (!['demo','sheets'].includes(source)) throw new Error('CONFIG');
 if (process.env.VERCEL_ENV==='production' && source!=='sheets') throw new Error('CONFIG');
 if(source==='sheets' && process.env.SHEETS_ENVIRONMENT !== (process.env.VERCEL_ENV==='production'?'production':'test')) throw new Error('CONFIG');
 return source;
}
export async function gas(action:string,payload:unknown) {
 const url=process.env.GAS_WEB_APP_URL, token=process.env.API_SHARED_SECRET;
 if(!url || !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url) || !token) throw new Error('CONFIG');
 const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action,payload}),redirect:'follow',cache:'no-store',signal:AbortSignal.timeout(18000)});
 if(!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('UPSTREAM');
 const result=await response.json();
 if(typeof result.ok !== 'boolean') throw new Error('UPSTREAM');
 return result;
}
export function reply(data:unknown,status=200) {return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
