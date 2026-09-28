import {demoMovies,gas,mode,reply} from '../../../lib/server';
export async function GET() {
 try {
  if(mode()==='demo') return reply({ok:true,mode:'demo',version:process.env.APP_VERSION||'0.1.0',fetchedAt:new Date().toISOString(),movies:demoMovies});
  const data=await gas('getCatalog',{});
  if(!data.ok || !Array.isArray(data.movies)) throw new Error('UPSTREAM');
  return reply({...data,mode:'sheets',environment:process.env.SHEETS_ENVIRONMENT});
 } catch {return reply({ok:false,code:'UPSTREAM',message:'作品を読み込めませんでした。接続設定を確認してください。'},503)}
}
