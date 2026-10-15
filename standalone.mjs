import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const modules=['connections','domain','checklist','i18n','icons','report','app'];
/** Bundle the deliberately small native-module graph without runtime dependencies. */
export async function standaloneScript(){
 const chunks=['const modules=Object.create(null);'];
 for(const name of modules){
  let source=await readFile(resolve(root,'src',name+'.js'),'utf8');
  const exports=[...source.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)].map(m=>m[1]);
  source=source.replace(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/([^'"]+)['"];?/g,(_,bindings,path)=>`const {${bindings.replace(/\bas\b/g,':')}}=modules[${JSON.stringify(path)}];`);
  source=source.replace(/\bexport\s+(?=(?:async\s+)?(?:function|const|let|class)\s)/g,'');
  chunks.push(`modules[${JSON.stringify(name+'.js')}]=(()=>{\n${source}\nreturn {${exports.join(',')}};\n})();`);
 }
 const script=chunks.join('\n');new Script(script,{filename:'Passerelle.html inline script'});return script;
}
export async function buildStandalone(destination){
 let html=await readFile(resolve(root,'index.html'),'utf8');
 const css=await readFile(resolve(root,'src/styles.css'),'utf8');
 const favicon=await readFile(resolve(root,'public/favicon.svg'),'utf8');
 html=html.replace('<link rel="stylesheet" href="/src/styles.css">',`<style>${css}</style>`)
 .replace('<script type="module" src="/src/app.js"></script>',`<script type="module">${(await standaloneScript()).replace(/<\/script/gi,'<\\/script')}</script>`)
 .replace('href="/public/favicon.svg"',`href="data:image/svg+xml,${encodeURIComponent(favicon)}"`);
 await writeFile(destination,html);
}
