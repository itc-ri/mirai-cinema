var PLAY_HEADERS=['play_id','started_at','movie_id'];
function playTable_(){
 var book=SpreadsheetApp.openById(properties_().getProperty('CATALOG_SPREADSHEET_ID'));
 var sheet=book.getSheetByName('Plays');
 if(!sheet){sheet=book.insertSheet('Plays');sheet.getRange(1,1,1,3).setValues([PLAY_HEADERS]);sheet.setFrozenRows(1);}
 return readTable_('CATALOG_SPREADSHEET_ID','Plays',PLAY_HEADERS);
}
function playCounts_(){
 var book=SpreadsheetApp.openById(properties_().getProperty('CATALOG_SPREADSHEET_ID')),sheet=book.getSheetByName('Plays'),counts={};
 if(!sheet)return counts;
 var t=readTable_('CATALOG_SPREADSHEET_ID','Plays',PLAY_HEADERS),seen={};
 t.rows.forEach(function(r){var id=r[t.indices.play_id],movie=r[t.indices.movie_id];if(id&&!seen[id]){seen[id]=true;counts[movie]=(counts[movie]||0)+1;}});
 return counts;
}
function recordPlay(p){
 if(!p||typeof p.playId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.playId)||typeof p.movieId!=='string'||!/^[a-z0-9-]{1,80}$/.test(p.movieId))return fail_('VALIDATION','再生情報が正しくありません。');
 if(p.environment!==properties_().getProperty('SHEETS_ENVIRONMENT'))return fail_('CONFIG','環境が一致しません。');
 var lock=LockService.getScriptLock();if(!lock.tryLock(5000))return fail_('BUSY','再試行してください。');
 try{
  if(!getCatalog().movies.some(function(m){return m.id===p.movieId;}))return fail_('UNAVAILABLE','作品を確認できません。');
  var t=playTable_(),h=t.indices,existing=t.rows.find(function(r){return r[h.play_id]===p.playId;});
  if(existing&&existing[h.movie_id]!==p.movieId)return fail_('CONFLICT','受付IDが重複しています。');
  if(!existing){var row=Array(t.width).fill('');row[h.play_id]=literal_(p.playId);row[h.started_at]=new Date();row[h.movie_id]=literal_(p.movieId);t.sheet.getRange(t.sheet.getLastRow()+1,1,1,t.width).setValues([row]);SpreadsheetApp.flush();}
  return {ok:true,movieId:p.movieId,playCount:playCounts_()[p.movieId]||0};
 }finally{lock.releaseLock();}
}
