/** Official HMRC commodity reference lookup. Never selects an applicable tax rate. */
export const ADAPTER_VERSION='hmrc-reference-2026.10.09.1';
const ACCEPT='application/vnd.hmrc.2.0+json';
const publicBase='https://www.trade-tariff.service.gov.uk/uk/api/commodities/';
const managedBase='https://api.trade-tariff.service.gov.uk/uk/api/commodities/';
const tokenEndpoint='https://auth.id.trade-tariff.service.gov.uk/oauth2/token';
const clean=value=>String(value??'').replace(/<[^>]*>/g,'').slice(0,1500);
export function normalizeCommodity(payload,code,retrievedAt=new Date().toISOString()){
 if(payload?.data?.type!=='commodity'||payload.data.attributes?.goods_nomenclature_item_id!==code||!Array.isArray(payload.included))throw Error('invalid_upstream');
 const included=new Map(payload.included.map(item=>[`${item.type}:${item.id}`,item]));
 const ref=(item,key)=>{const link=item?.relationships?.[key]?.data;return link&&!Array.isArray(link)?included.get(`${link.type}:${link.id}`):null;};
 const refs=payload.data.relationships?.import_measures?.data;
 if(!Array.isArray(refs))throw Error('invalid_upstream');
 if(refs.some(link=>!included.has(`${link.type}:${link.id}`)))throw Error('invalid_upstream');
 const measures=refs.map(link=>included.get(`${link.type}:${link.id}`)).filter(Boolean).map(item=>({
  id:clean(item.id),type:clean(ref(item,'measure_type')?.attributes?.description),
  area:clean(ref(item,'geographical_area')?.attributes?.description),areaId:clean(ref(item,'geographical_area')?.id),
  expression:clean(ref(item,'duty_expression')?.attributes?.base),
  starts:clean(item.attributes?.effective_start_date),ends:clean(item.attributes?.effective_end_date),
  conditions:(item.relationships?.measure_conditions?.data||[]).length,
  exclusions:(item.relationships?.excluded_countries?.data||[]).map(r=>clean(r.id)),
  additionalCode:clean(ref(item,'additional_code')?.attributes?.code),
 }));
 return {code,description:clean(payload.data.attributes.description_plain||payload.data.attributes.description),declarable:payload.data.attributes.declarable===true,measures,measureCount:refs.length,retrievedAt,adapterVersion:ADAPTER_VERSION,source:`https://www.trade-tariff.service.gov.uk/commodities/${code}`,scope:'gb-current-reference-only',applicabilityDetermined:false};
}
export function createTariffClient({fetchImpl=fetch,env=process.env,now=()=>Date.now()}={}){
 const cache=new Map();let token=null,tokenExpiry=0;let lastMiss=-Infinity;
 const managed=Boolean(env.TARIFF_CLIENT_ID&&env.TARIFF_CLIENT_SECRET);
 async function getToken(){
  if(token&&now()<tokenExpiry)return token;
  const res=await fetchImpl(tokenEndpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',client_id:env.TARIFF_CLIENT_ID,client_secret:env.TARIFF_CLIENT_SECRET})});
  if(!res.ok)throw Error('authentication_unavailable');const body=await res.json();
  if(typeof body.access_token!=='string'||!Number.isFinite(Number(body.expires_in)))throw Error('authentication_unavailable');
  token=body.access_token;tokenExpiry=now()+Math.max(0,Number(body.expires_in)-60)*1000;return token;
 }
 return async code=>{
  if(!/^\d{10}$/.test(code))throw Error('invalid_code');
  const saved=cache.get(code);if(saved&&now()-saved.time<86400000)return {...saved.data,cached:true};
  if(now()-lastMiss<1000)throw Error('rate_limited');lastMiss=now();
  const headers={Accept:ACCEPT};if(managed)headers.Authorization=`Bearer ${await getToken()}`;
  let res=await fetchImpl((managed?managedBase:publicBase)+code,{headers,redirect:'error',signal:AbortSignal.timeout(15000)});
  if(res.status===401&&managed){token=null;headers.Authorization=`Bearer ${await getToken()}`;res=await fetchImpl(managedBase+code,{headers,redirect:'error',signal:AbortSignal.timeout(15000)});}
  if(res.status===404)throw Error('not_found');if(res.status===429)throw Error('rate_limited');if(!res.ok)throw Error('upstream_unavailable');
  const raw=await res.text();if(raw.length>5000000)throw Error('invalid_upstream');
  const data=normalizeCommodity(JSON.parse(raw),code,new Date(now()).toISOString());
  if(cache.size>=200)cache.delete(cache.keys().next().value);cache.set(code,{time:now(),data});return {...data,cached:false};
 };
}
