var MOVIE_HEADERS=['movie_id','sort_order','published','category','problem','title','drive_file_id','drive_resource_key','thumbnail_key','duration_seconds','updated_at'];
function getCatalog() {
 var table=readTable_('CATALOG_SPREADSHEET_ID','Movies',MOVIE_HEADERS), h=table.indices, seen={}, movies=[];
 table.rows.forEach(function(row){var id=row[h.movie_id];if(typeof id==='string')seen[id]=(seen[id]||0)+1;});
 table.rows.forEach(function(row){
  if(row[h.published]!==true)return;
  var id=row[h.movie_id], order=row[h.sort_order], duration=row[h.duration_seconds];
  function text(name,max){var v=row[h[name]];return typeof v==='string'&&v.trim().length>0&&Array.from(v).length<=max;}
  if(typeof id!=='string'||!/^[a-z0-9-]{1,80}$/.test(id)||seen[id]!==1||!Number.isInteger(order)||order<0||!text('category',100)||!text('problem',100)||!text('title',80)||!text('thumbnail_key',80)||!Number.isInteger(duration)||duration<=0||typeof row[h.drive_file_id]!=='string'||!/^[\w-]{10,200}$/.test(row[h.drive_file_id])||(row[h.drive_resource_key]!==''&&!/^[\w-]{1,200}$/.test(row[h.drive_resource_key]))) {
    console.warn(JSON.stringify({movie_id:typeof id==='string'&&/^[a-z0-9-]{1,80}$/.test(id)?id:'(invalid)',reason:'INVALID_ROW'}));return;
  }
  movies.push({id:id,sortOrder:order,category:row[h.category],problem:row[h.problem],title:row[h.title],driveFileId:row[h.drive_file_id],resourceKey:row[h.drive_resource_key]||'',thumbnailKey:row[h.thumbnail_key],durationSeconds:duration,updatedAt:row[h.updated_at] instanceof Date?row[h.updated_at].toISOString():String(row[h.updated_at]||'')});
 });
 movies.sort(function(a,b){return a.sortOrder-b.sortOrder || (a.id<b.id?-1:a.id>b.id?1:0);});
 var counts=typeof playCounts_==='function'?playCounts_():{};
 movies.forEach(function(movie){movie.playCount=counts[movie.id]||0;});
 return {ok:true,version:properties_().getProperty('APP_VERSION')||'0.1.0',fetchedAt:new Date().toISOString(),movies:movies};
}
