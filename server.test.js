import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
test('HTTP serves application assets with CSP and never exposes project files or accepts submissions',async()=>{
 const server=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:'0',HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
 const exited=once(server,'exit');
 try{
  const output=await Promise.race([once(server.stdout,'data').then(([bytes])=>String(bytes)),once(server.stderr,'data').then(([bytes])=>{throw Error(String(bytes));})]);
  const port=output.match(/localhost:(\d+)/)?.[1];assert.ok(port,output);const base=`http://127.0.0.1:${port}`;
  for(const path of ['/','/src/app.js','/src/styles.css','/src/report.js','/public/favicon.svg']){const r=await fetch(base+path);assert.equal(r.status,200,path);assert.match(r.headers.get('content-security-policy'),/sha256-/);}
  for(const path of ['/README.md','/package.json','/upload/example.pdf','/%2e%2e/server.mjs'])assert.equal((await fetch(base+path)).status,404,path);
  assert.equal((await fetch(base,{method:'POST',body:'test'})).status,405);
 }finally{server.kill();await exited;}
});
