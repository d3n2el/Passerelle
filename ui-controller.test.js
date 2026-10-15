/** Controller/render integration with a minimal DOM port, NOT a browser/layout test. */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {standaloneScript} from '../scripts/standalone.mjs';
const code=await standaloneScript();
function app(){
 const listeners={},store=new Map(),node={focus(){},remove(){},click(){},showModal(){},addEventListener(){},scrollIntoView(){}};
 const root={innerHTML:'',addEventListener(type,fn){listeners[type]=fn;}};
 const context=vm.createContext({Intl,Date,URL,Blob,console,setTimeout:()=>0,clearTimeout(){},matchMedia:()=>({matches:true}),localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},document:{title:'',documentElement:{lang:'fr'},querySelector:s=>s==='#app'?root:node,getElementById:()=>node,body:{append(){}},createElement:()=>node},window:{scrollTo(){},print(){}}});
 vm.runInContext(code,context);
 return {root,store,context,click(action){listeners.click({target:{closest:s=>s==='[data-action]'?{dataset:{action}}:null}});},lang(lang){listeners.click({target:{closest:s=>s==='[data-lang]'?{dataset:{lang}}:null}});},input(field,value){listeners.input({target:{dataset:{field},value}});},contact(field,value){listeners.input({target:{dataset:{contact:field},value,type:field==='consent'?'checkbox':'text',checked:value}});},submit(id='shipment-form'){listeners.submit({preventDefault(){},target:{id}});}};
}
test('real UI controller renders FR then EN and preserves data through full sample journey',()=>{
 const a=app();assert.match(a.root.innerHTML,/Votre prochain marché/);a.click('sample');a.input('company','Sample <test>');a.lang('en');assert.match(a.root.innerHTML,/value="Sample &lt;test&gt;"/);for(let i=0;i<4;i++)a.submit();
 assert.match(a.root.innerHTML,/Your estimate, line by line/);assert.match(a.root.innerHTML,/€6,614.64/);assert.match(a.root.innerHTML,/5,512.20.*20 %/);assert.doesNotMatch(a.root.innerHTML,/undefined|NaN/);
});
test('guest form validates required fields and reaches an honest partial estimate',()=>{
 const a=app();a.click('start');a.submit();a.submit();assert.match(a.root.innerHTML,/aria-invalid="true"/);a.input('description','Pièces');a.input('quantity','2');a.input('goodsValue','300');for(let i=0;i<3;i++)a.submit();assert.match(a.root.innerHTML,/Sous-total des montants connus/);assert.match(a.root.innerHTML,/Non calculé/);assert.match(a.root.innerHTML,/product-review/);assert.doesNotMatch(a.root.innerHTML,/undefined|NaN/);
});
test('contact requests require renewed consent after shipment edits and never enter saved drafts',()=>{
 const a=app();a.click('sample');for(let i=0;i<4;i++)a.submit();a.click('contact');a.contact('name','Demo');a.contact('email','demo@example.test');a.contact('consent',true);a.submit('contact-form');assert.match(a.root.innerHTML,/Votre fiche est prête/);
 a.click('results');a.click('save');assert.doesNotMatch(a.store.get('passerelle.shipment.v1'),/demo@example|consent/);a.click('edit');a.input('company','Nouvelle entreprise');for(let i=0;i<4;i++)a.submit();a.click('contact');assert.match(a.root.innerHTML,/id="contact-form"/);a.submit('contact-form');assert.match(a.root.innerHTML,/id="consent-error"/);
});
test('reset erases memory and saved draft; Northern Ireland keeps tax unknown',()=>{
 const a=app();a.click('sample');a.input('destinationArea','ni');for(let i=0;i<4;i++)a.submit();assert.match(a.root.innerHTML,/route-review/);assert.match(a.root.innerHTML,/Estimation partielle/);a.click('save');assert.ok(a.store.size);a.click('confirm-reset');assert.equal(a.store.size,0);a.click('start');assert.match(a.root.innerHTML,/name="company"[^>]*value=""/);
});
test('live lookup has validation, remains GB-only, and real directories are labelled as non-partners',()=>{
 const a=app();a.click('sample');for(let i=0;i<3;i++)a.submit();assert.match(a.root.innerHTML,/id="tariff-code"/);a.click('tariff-lookup');assert.match(a.root.innerHTML,/exactement 10 chiffres/);a.submit();a.click('contact');assert.match(a.root.innerHTML,/www.gov.uk\/guidance\/list-of-customs-agents/);assert.match(a.root.innerHTML,/pas des partenaires contractuels/);
 const b=app();b.click('sample');b.input('destinationArea','ni');for(let i=0;i<3;i++)b.submit();assert.doesNotMatch(b.root.innerHTML,/id="tariff-code"/);
});
