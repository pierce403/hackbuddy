import pg from 'pg';
export function storageFailure(error,phase){
 const allowed=new Set(['ETIMEDOUT','ECONNREFUSED','ENOTFOUND','EAI_AGAIN','ECONNRESET','CERT_HAS_EXPIRED','DEPTH_ZERO_SELF_SIGNED_CERT','SELF_SIGNED_CERT_IN_CHAIN','UNABLE_TO_VERIFY_LEAF_SIGNATURE','ERR_TLS_CERT_ALTNAME_INVALID','28P01','3D000','42P01']);
 return {event:'hackbuddy_storage_unavailable',phase:phase==='query'?'query':'connect',code:allowed.has(error?.code)?error.code:'UNCLASSIFIED'};
}
export async function query(env,sql,params=[]){
 if(env.STAGING==='true')return (await env.STAGING_DB.prepare(sql.replace(/\$[0-9]+/g,'?')).bind(...params).all()).results;
 if(!env.DATABASE_URL2)throw new Error('unavailable');const uri=new URL(env.DATABASE_URL2);if(!['postgres:','postgresql:'].includes(uri.protocol))throw new Error('unavailable');const client=new pg.Client({host:uri.hostname,port:Number(uri.port||5432),database:decodeURIComponent(uri.pathname.slice(1)),user:decodeURIComponent(uri.username),password:decodeURIComponent(uri.password),ssl:true,connectionTimeoutMillis:8000,query_timeout:8000});client.on('error',()=>{});
 let phase='connect';try{await client.connect();phase='query';return (await client.query(sql,params)).rows;}catch(error){console.warn(JSON.stringify(storageFailure(error,phase)));throw error;}finally{await client.end().catch(()=>{});}
}
