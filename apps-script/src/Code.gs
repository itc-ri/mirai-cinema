function fail_(code,message) { return {ok:false,code:code,message:message}; }
function properties_() { return PropertiesService.getScriptProperties(); }
function doPost(e) {
  var result;
  try {
    if(!e || !e.postData || e.postData.contents.length>8192) throw new Error('VALIDATION');
    var body=JSON.parse(e.postData.contents), secret=properties_().getProperty('API_SHARED_SECRET');
    if(!secret || typeof body.token!=='string' || body.token!==secret) result=fail_('AUTH','認証できません。');
    else if(body.action==='getCatalog') result=getCatalog();
    else if(body.action==='submitFeedback') result=submitFeedback(body.payload);
    else result=fail_('VALIDATION','操作が正しくありません。');
  } catch(e) { result=fail_('UPSTREAM','処理結果を確認できません。同じ受付IDで再確認してください。'); }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
function readTable_(property,tab,required) {
  var id=properties_().getProperty(property);
  if(!id) throw new Error('CONFIG');
  var sheet=SpreadsheetApp.openById(id).getSheetByName(tab);
  if(!sheet) throw new Error('CONFIG');
  var rows=sheet.getDataRange().getValues(), headers=rows[0], indices={};
  required.forEach(function(name){var i=headers.indexOf(name);if(i<0 || headers.lastIndexOf(name)!==i)throw new Error('CONFIG');indices[name]=i;});
  return {sheet:sheet,rows:rows.slice(1),indices:indices,width:headers.length};
}
