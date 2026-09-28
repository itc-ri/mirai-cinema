import {gas,mode,reply} from '../../../lib/server';
import {normalize,validateSubmission} from '../../../lib/validation.mjs';
export async function POST(request:Request) {
 let sameOrigin=false;
 try {const origin=new URL(request.headers.get('origin')||'');sameOrigin=origin.host===request.headers.get('host')&&origin.protocol===new URL(request.url).protocol;} catch {}
 if(!sameOrigin) return reply({ok:false,code:'VALIDATION',message:'送信元を確認できません。'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json')) return reply({ok:false,code:'VALIDATION',message:'形式が正しくありません。'},400);
 let body;
 try {
  const reader=request.body?.getReader(); if(!reader) throw new Error();
  let size=0,text=''; const decoder=new TextDecoder();
  while(true) {const {done,value}=await reader.read(); if(done) break; size+=value.length; if(size>4096){await reader.cancel();return reply({ok:false,code:'VALIDATION',message:'入力が長すぎます。'},413)} text+=decoder.decode(value,{stream:true});}
  body=JSON.parse(text+decoder.decode());
 } catch {return reply({ok:false,code:'VALIDATION',message:'入力を確認してください。'},400)}
 const error=validateSubmission(body);
 if(error || body.website) return reply({ok:false,code:'VALIDATION',message:error||'入力を確認してください。'},400);
 try {
  if(mode()==='demo') return reply({ok:false,code:'DEMO_NOT_SAVED',message:'デモのため感想は送信・保存されません。'},409);
  const data=await gas('submitFeedback',{submissionId:body.submissionId,movieId:body.movieId,comment:normalize(body.comment),environment:process.env.SHEETS_ENVIRONMENT});
  if(data.ok && (data.submissionId!==body.submissionId || !['created','already_recorded'].includes(data.status))) throw new Error();
  const statuses:Record<string,number>={VALIDATION:400,CONFLICT:409,UNAVAILABLE:409,BUSY:503,UPSTREAM:503};
  return reply(data,data.ok?200:(statuses[data.code]||503));
 } catch {return reply({ok:false,code:'UPSTREAM',message:'保存結果を確認できません。同じ内容で再確認してください。'},503)}
}
