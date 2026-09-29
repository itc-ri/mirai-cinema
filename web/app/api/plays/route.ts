import {gas,mode,reply} from '../../../lib/server';
export async function POST(request:Request){
 try{
  const origin=new URL(request.headers.get('origin')||'');
  if(origin.host!==request.headers.get('host')||origin.protocol!==new URL(request.url).protocol)return reply({ok:false},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({ok:false},400);
  const reader=request.body?.getReader();if(!reader)return reply({ok:false},400);
  let size=0,text='';const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1024){await reader.cancel();return reply({ok:false},413)}text+=decoder.decode(value,{stream:true});}
  const body=JSON.parse(text+decoder.decode());
  if(typeof body.movieId!=='string'||!/^[a-z0-9-]{1,80}$/.test(body.movieId)||typeof body.playId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.playId))return reply({ok:false},400);
  if(mode()==='demo')return reply({ok:false,code:'DEMO_NOT_SAVED'},409);
  const data=await gas('recordPlay',{movieId:body.movieId,playId:body.playId,environment:process.env.SHEETS_ENVIRONMENT});
  return reply(data,data.ok?200:503);
 }catch{return reply({ok:false},503)}
}
