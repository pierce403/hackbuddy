import fs from 'node:fs';import {execFileSync} from 'node:child_process';
fs.mkdirSync('build/assets/static',{recursive:true});fs.cpSync('static','build/assets/static',{recursive:true});const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();const views={};for(const name of ['index','host'])views[name]=fs.readFileSync('templates/'+name+'.html','utf8');fs.writeFileSync('build/views.mjs','export default '+JSON.stringify(views)+';\n');fs.writeFileSync('build/version.mjs','export const commit='+JSON.stringify(commit)+';\n');

if(fs.existsSync('static/favicon.ico'))fs.copyFileSync('static/favicon.ico','build/assets/favicon.ico');
