export function storageFailure(error,phase){
 const allowed=new Set(['ETIMEDOUT','ECONNREFUSED','ENOTFOUND','EAI_AGAIN','ECONNRESET','CERT_HAS_EXPIRED','DEPTH_ZERO_SELF_SIGNED_CERT','SELF_SIGNED_CERT_IN_CHAIN','UNABLE_TO_VERIFY_LEAF_SIGNATURE','ERR_TLS_CERT_ALTNAME_INVALID','28P01','3D000','42P01']);
 return {event:'hackbuddy_storage_unavailable',phase:phase==='query'?'query':'connect',code:allowed.has(error?.code)?error.code:'UNCLASSIFIED'};
}
export async function query(env,sql,params=[]){
 const db=env.STAGING==='true'?env.STAGING_DB:env.DB;
 if(!db)throw new Error('storage_unavailable');
 try{return (await db.prepare(sql.replace(/\$[0-9]+/g,'?')).bind(...params).all()).results;}
 catch(error){console.warn(JSON.stringify(storageFailure(error,'query')));throw error;}
}
