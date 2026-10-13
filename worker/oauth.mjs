import {createHmac,randomBytes} from 'node:crypto';
const encode=value=>encodeURIComponent(String(value)).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
export function authorization(method,url,key,secret,token='',tokenSecret='',extra={},fixed={}){
 const oauth={oauth_consumer_key:key,oauth_nonce:fixed.nonce||randomBytes(24).toString('hex'),oauth_signature_method:'HMAC-SHA1',oauth_timestamp:String(fixed.timestamp||Math.floor(Date.now()/1000)),oauth_version:'1.0',...extra};if(token)oauth.oauth_token=token;
 const uri=new URL(url),params=[...uri.searchParams,...Object.entries(oauth)].map(([k,v])=>[encode(k),encode(v)]).sort(([a,b],[c,d])=>a<c?-1:a>c?1:b<d?-1:b>d?1:0);const base=method.toUpperCase()+'&'+encode(uri.origin+uri.pathname)+'&'+encode(params.map(([k,v])=>k+'='+v).join('&'));oauth.oauth_signature=createHmac('sha1',encode(secret)+'&'+encode(tokenSecret)).update(base).digest('base64');return 'OAuth '+Object.entries(oauth).sort().map(([k,v])=>encode(k)+'="'+encode(v)+'"').join(', ');
}
export async function twitter(env,path,method='GET',token='',tokenSecret='',extra={}){
 if(env.STAGING==='true'){
  if(path==='/oauth/request_token')return {oauth_token:'synthetic-request-token',oauth_token_secret:'synthetic-request-secret',oauth_callback_confirmed:'true'};
  if(path==='/oauth/access_token')return {oauth_token:'synthetic-access-key',oauth_token_secret:'synthetic-access-secret'};
  if(token==='synthetic-access-key'&&tokenSecret==='synthetic-access-secret')return {screen_name:'synthetic_user'};throw new Error('unauthorized');
 }
 if(!env.TWITTER_KEY||!env.TWITTER_SECRET)throw new Error('unavailable');const url='https://api.twitter.com'+path;const r=await fetch(url,{method,headers:{Authorization:authorization(method,url,env.TWITTER_KEY,env.TWITTER_SECRET,token,tokenSecret,extra)},redirect:'manual',signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('unavailable');return path.startsWith('/oauth/')?Object.fromEntries(new URLSearchParams(await r.text())):r.json();
}
