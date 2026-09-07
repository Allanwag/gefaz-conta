const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function worker({failInstall=false,status=200}={}){
  const handlers={},deleted=[];let activated=false;
  const offline={offline:true};
  const cache={addAll:async()=>{if(failInstall)throw Error('offline');},match:async()=>offline,put:async()=>{}};
  const context={URL,Request:class {},Response, setTimeout,clearTimeout,
    fetch:async()=>new Response('page',{status}),
    caches:{open:async()=>cache,keys:async()=>['gefaz-conta-v15','gefaz-conta-v16','another-app'],delete:async k=>deleted.push(k)},
    self:{location:{origin:'https://example.com'},registration:{scope:'https://example.com/gefaz-conta/'},
      addEventListener:(k,fn)=>handlers[k]=fn,skipWaiting:async()=>{activated=true;},clients:{claim:async()=>{}}}};
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8'),context);
  return {handlers,deleted,offline,activated:()=>activated};
}
test('activation removes only old caches belonging to this app',async()=>{
  const w=worker();let pending;w.handlers.activate({waitUntil:p=>pending=p});await pending;
  assert.deepEqual(w.deleted,['gefaz-conta-v15']);
});
test('incomplete installation never activates',async()=>{
  const w=worker({failInstall:true});let pending;w.handlers.install({waitUntil:p=>pending=p});
  await assert.rejects(pending);assert.equal(w.activated(),false);
});
test('HTTP errors fall back to cached page',async()=>{
  const w=worker({status:503});let response;
  w.handlers.fetch({request:{url:'https://example.com/gefaz-conta/index.html',method:'GET',mode:'navigate'},respondWith:p=>response=p,waitUntil(){}});
  assert.equal(await response,w.offline);
});
test('requests outside app scope are not intercepted',()=>{
  const w=worker();let intercepted=false;
  w.handlers.fetch({request:{url:'https://example.com/other/',method:'GET',mode:'navigate'},respondWith(){intercepted=true;}});
  assert.equal(intercepted,false);
});
