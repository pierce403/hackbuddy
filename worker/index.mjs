import views from '../build/views.mjs';import {commit} from '../build/version.mjs';import {twitter} from './oauth.mjs';import {query} from './storage.mjs';import {EncryptJWT,jwtDecrypt} from 'jose';
const text=(body,status=200,type='text/plain; charset=utf-8')=>new Response(body,{status,headers:{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
const json=(value,status=200)=>text(JSON.stringify(value),status,'application/json');const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cookie=(name,value,max=900)=>name+'='+encodeURIComponent(value)+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+max;
function cookies(request){return Object.fromEntries((request.headers.get('Cookie')||'').split(';').filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))];}));}
async function encryptionKey(secret){if(!secret)throw new Error('unavailable');return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret)));}
async function identity(request,env){const c=cookies(request);if(!c.twitter_key||!c.twitter_secret)return null;try{const user=await twitter(env,'/1.1/account/verify_credentials.json','GET',c.twitter_key,c.twitter_secret);return typeof user.screen_name==='string'?user.screen_name:null;}catch{return null;}}
function page(name,values,env){let html=views[name];for(const [key,value] of Object.entries(values))html=html.replaceAll('{{'+key+'}}',escape(value));if(env.STAGING==='true')html='<p role="status">Synthetic staging only. Twitter and session data are fixtures.</p>'+html;if(env.READ_ONLY==='true')html=html.replace('<body','<p role="status">The site is temporarily read-only during migration. Existing storage is retained.</p><body');return text(html,200,'text/html; charset=utf-8');}
export default {async fetch(request,env){
 const url=new URL(request.url),path=url.pathname;if(url.protocol!=='https:'){url.protocol='https:';return Response.redirect(url.toString(),308);}if(request.method==='HEAD'){const r=await this.fetch(new Request(request,{method:'GET'}),{...env,READ_ONLY:'true'});await r.body?.cancel();return new Response(null,{status:r.status,headers:r.headers});}
 if(env.READ_ONLY==='true'&&(!['GET','HEAD'].includes(request.method)||['/login','/twitter'].includes(path)))return text('The site is temporarily read-only during migration.',503);
 if(!['GET','HEAD'].includes(request.method)&&request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return text('Request origin does not match this site.',403);
 try{
  if(path==='/deployment.json')return json({repository:'pierce403/hackbuddy',commit,originalHerokuCommit:'3f4ca924b8133648ed986794996c488d5e07d1fc'});
  if(path==='/'&&request.method==='GET')return page('index',{username:await identity(request,env)||'None'},env);
  if(path==='/login'&&request.method==='GET'){
   const result=await twitter(env,'/oauth/request_token','POST','','',{oauth_callback:'https://'+env.AUTH_DOMAIN+'/twitter'});if(result.oauth_callback_confirmed!=='true'||!result.oauth_token||!result.oauth_token_secret)throw new Error('unavailable');
   const pending=await new EncryptJWT({token:result.oauth_token,secret:result.oauth_token_secret}).setProtectedHeader({alg:'dir',enc:'A256GCM'}).setIssuedAt().setExpirationTime('10m').setAudience(env.AUTH_DOMAIN).encrypt(await encryptionKey(env.AUTH_COOKIE_SECRET));const r=Response.redirect('https://api.twitter.com/oauth/authenticate?oauth_token='+encodeURIComponent(result.oauth_token),302);const headers=new Headers(r.headers);headers.append('Set-Cookie',cookie('hackbuddy_oauth',pending,600));headers.set('Cache-Control','no-store');return new Response(null,{status:302,headers});
  }
  if(path==='/twitter'&&request.method==='GET'){
   const c=cookies(request);if(!c.hackbuddy_oauth||!url.searchParams.get('oauth_verifier'))return text('Invalid login callback.',400);let pending;try{pending=(await jwtDecrypt(c.hackbuddy_oauth,await encryptionKey(env.AUTH_COOKIE_SECRET),{audience:env.AUTH_DOMAIN,keyManagementAlgorithms:['dir'],contentEncryptionAlgorithms:['A256GCM']})).payload;}catch{return text('Invalid or expired login callback.',400);}
   if(pending.token!==url.searchParams.get('oauth_token'))return text('Invalid login callback.',400);const access=await twitter(env,'/oauth/access_token','POST',pending.token,pending.secret,{oauth_verifier:url.searchParams.get('oauth_verifier')});if(!access.oauth_token||!access.oauth_token_secret)throw new Error('unavailable');const headers=new Headers({Location:'/','Cache-Control':'no-store'});for(const value of [cookie('twitter_key',access.oauth_token,2592000),cookie('twitter_secret',access.oauth_token_secret,2592000),cookie('hackbuddy_oauth','',0)])headers.append('Set-Cookie',value);return new Response(null,{status:302,headers});
  }
  if(path==='/list'&&request.method==='GET'){
   try{return json(await query(env,'SELECT url,"user",description,count FROM hack_sesh ORDER BY ctime DESC,id DESC'));}catch{return json({error:'Existing session storage is currently unavailable.'},503);}
  }
  if(path==='/host'&&request.method==='GET'){if(!await identity(request,env))return text('NOPE, LOGIN FIRST');return page('host',{desc:url.searchParams.get('desc')||''},env);}
  if(path==='/update'&&request.method==='POST'){
   const user=await identity(request,env);if(!user)return text('NOPE, LOGIN FIRST');if(Number(request.headers.get('Content-Length')||0)>16384)return text('Request too large.',413);const body=await request.text();if(body.length>16384)return text('Request too large.',413);let data;try{data=JSON.parse(body);}catch{return text('Invalid session.',400);}
   if(typeof data.roomName!=='string'||!data.roomName||data.roomName.length>59||typeof data.description!=='string'||data.description.length>80||!Number.isInteger(data.count)||data.count<0||data.count>10000||user.length>80)return text('Invalid session.',400);const room='https://meet.jit.si/'+encodeURIComponent(data.roomName);if(room.length>80)return text('Invalid session.',400);
   try{await query(env,'INSERT INTO hack_sesh("user",url,description,count,ctime,mtime) VALUES($1,$2,$3,$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT("user") DO UPDATE SET url=excluded.url,description=excluded.description,count=excluded.count,mtime=CURRENT_TIMESTAMP',[user,room,data.description,data.count]);return text('GREAT');}catch{return text('Existing session storage is currently unavailable.',503);}
  }
  if(path.startsWith('/static/')||path==='/favicon.ico')return env.ASSETS.fetch(request);return text('Page not found.',404);
 }catch{return text('Authentication provider is currently unavailable.',503);}
}};
