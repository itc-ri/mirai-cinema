var FEEDBACK_HEADERS=['submission_id','submitted_at','movie_id','movie_title_snapshot','comment','review_status','app_version'];
function normalize_(value){return value.replace(/\r\n?/g,'\n').trim();}
function validate_(p){
 if(!p||typeof p.submissionId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.submissionId))return false;
 if(typeof p.movieId!=='string'||!/^[a-z0-9-]{1,80}$/.test(p.movieId)||typeof p.comment!=='string')return false;
 var n=Array.from(normalize_(p.comment)).length;return n>=1&&n<=200;
}
// A leading apostrophe is a Sheets literal-text marker. Escape all strings,
// including those starting with an apostrophe, to preserve the original value.
function literal_(text){return "'"+String(text);}
function submitFeedback(p){
 if(!validate_(p))return fail_('VALIDATION','作品と1～200文字の感想を確認してください。');
 var environment=properties_().getProperty('SHEETS_ENVIRONMENT');
 if(!environment||environment!==p.environment||!['test','production'].includes(environment))throw new Error('CONFIG');
 var comment=normalize_(p.comment), lock=LockService.getScriptLock();
 if(!lock.tryLock(5000))return fail_('BUSY','混み合っています。同じ内容で再確認してください。');
 try {
  var table=readTable_('FEEDBACK_SPREADSHEET_ID','Feedback',FEEDBACK_HEADERS),h=table.indices;
  var existing=table.rows.find(function(row){return row[h.submission_id]===p.submissionId;});
  if(existing){
   if(existing[h.movie_id]!==p.movieId||existing[h.comment]!==comment)return fail_('CONFLICT','同じ受付IDで異なる内容が送信されています。');
   return {ok:true,status:'already_recorded',submissionId:p.submissionId};
  }
  var movie=getCatalog().movies.find(function(m){return m.id===p.movieId;});
  if(!movie)return fail_('UNAVAILABLE','この作品の感想受付は終了しました。');
  var row=Array(table.width).fill('');
  row[h.submission_id]=literal_(p.submissionId);row[h.submitted_at]=new Date();row[h.movie_id]=literal_(movie.id);
  row[h.movie_title_snapshot]=literal_(movie.title);row[h.comment]=literal_(comment);row[h.review_status]=literal_('未確認');row[h.app_version]=literal_(properties_().getProperty('APP_VERSION')||'0.1.0');
  var index=table.sheet.getLastRow()+1;
  table.sheet.getRange(index,1,1,table.width).setValues([row]);SpreadsheetApp.flush();
  var saved=table.sheet.getRange(index,1,1,table.width).getValues()[0];
  if(saved[h.submission_id]!==p.submissionId||saved[h.movie_id]!==p.movieId||saved[h.comment]!==comment)throw new Error('VERIFY');
  return {ok:true,status:'created',submissionId:p.submissionId};
 } finally {lock.releaseLock();}
}
