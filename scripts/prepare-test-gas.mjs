// Prepare private deployment inputs. Secrets are never printed or put in Git.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(await fs.readFile(path.join(root,'apps-script/test-connection.json'),'utf8'));
if(config.environment!=='test'||config.catalogSpreadsheetId===config.feedbackSpreadsheetId)throw Error('Test-only configuration required');
const out=path.join(root,'.private/connection-prep/gas');await fs.mkdir(out,{recursive:true});
const secretPath=path.join(root,'.private/api-shared-secret.txt');
let secret;try{secret=(await fs.readFile(secretPath,'utf8')).trim()}catch(e){if(e.code!=='ENOENT')throw e;secret=randomBytes(32).toString('hex');await fs.writeFile(secretPath,secret,{flag:'wx'});}
if(!/^[a-f0-9]{64}$/.test(secret))throw Error('Invalid secret file');
for(const file of ['Code.gs','Catalog.gs','Feedback.gs'])await fs.copyFile(path.join(root,'apps-script/src',file),path.join(out,file));
const properties={CATALOG_SPREADSHEET_ID:config.catalogSpreadsheetId,FEEDBACK_SPREADSHEET_ID:config.feedbackSpreadsheetId,API_SHARED_SECRET:secret,SHEETS_ENVIRONMENT:'test',APP_VERSION:'0.1.0'};
const setup=`function initializeTestEnvironment() {\n var values=${JSON.stringify(properties)};\n var p=PropertiesService.getScriptProperties();\n if(p.getProperty('SHEETS_ENVIRONMENT') && p.getProperty('SHEETS_ENVIRONMENT')!=='test')throw new Error('Test environment only');\n p.setProperties(values);\n var catalog=getCatalog();\n var table=readTable_('FEEDBACK_SPREADSHEET_ID','Feedback',FEEDBACK_HEADERS);\n console.log('Test configuration ready: movies='+catalog.movies.length+', feedback rows='+table.rows.length);\n}\n`;
await fs.writeFile(path.join(out,'Initialize.gs'),setup);
console.log('Prepared test-only source under .private. No secrets printed.');
