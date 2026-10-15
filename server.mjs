import http from 'node:http';
import {createTariffClient} from './integrations/tariff.mjs';
const lookupTariff=createTariffClient();
import { createHash } from 'node:crypto';
import { reportStyles } from './src/report.js';
const styleHash=createHash('sha256').update(reportStyles).digest('base64');
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.env.SERVE_DIST === '1' ? 'dist' : '.');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
const allowed = path => path === '/index.html' || path === '/Passerelle.html' || path.startsWith('/src/') || path.startsWith('/public/');
const server = http.createServer(async (req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self'; style-src 'self' 'sha256-${styleHash}'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`);
  res.setHeader('Cache-Control','no-store');
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
  try {
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path==='/') path='/index.html';
    if(path==='/api/tariff'){
      const url=new URL(req.url,'http://localhost');const code=url.searchParams.get('code')||'';
      if(req.method==='HEAD'){res.writeHead(405);res.end();return;}
      try{const data=await lookupTariff(code);res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));}
      catch(error){const known=['invalid_code','not_found','rate_limited','authentication_unavailable','upstream_unavailable','invalid_upstream'];const reason=known.includes(error.message)?error.message:'upstream_unavailable';res.writeHead(reason==='invalid_code'?400:reason==='not_found'?404:reason==='rate_limited'?429:503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:reason}));}
      return;
    }
    if(!allowed(path)) {res.writeHead(404);res.end('Not found');return;}
    const filename=resolve(root, '.'+path);
    if(!filename.startsWith(root+sep) || !(await stat(filename)).isFile()) throw Error();
    const body=await readFile(filename);
    res.writeHead(200,{'Content-Type':types[extname(filename)] || 'application/octet-stream'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log(`Passerelle ready on http://localhost:${server.address().port}`));
