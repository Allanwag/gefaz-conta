const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function app(){
  const store=new Map();let fail=false;
  const element={classList:{add(){},remove(){},toggle(){}},addEventListener(){},focus(){}};
  const context=vm.createContext({console,Date,Blob,URL,setTimeout:()=>0,clearTimeout(){},alert(){},
    document:{getElementById:()=>element,querySelectorAll:()=>[]},navigator:{},window:{addEventListener(){}},
    localStorage:{getItem:k=>store.get(k)||null,setItem(k,v){if(fail)throw Error('Quota');store.set(k,v);}}});
  const run=code=>vm.runInContext(code,context);
  run(source);
  return {run,fail:()=>{fail=true;}};
}
const backup=(records,extra={})=>({app:'gefaz-conta',v:1,talhoes:[{id:'tal',nome:'Velho'}],registros:records,...extra});
const record=(extra={})=>({id:'r1',talhaoId:'tal',origem:'arvore',carretas:1,data:'2026-09-07',passada:1,...extra});
const textReport=`Gefaz Conta — Carretas de café
30/07/26 a 11/08/26
Operador: Jean

Velho: Árvore 11,0 · Chão 0,0 = 11,0
144 Gordura: Árvore 12,0 · Chão 0,0 = 12,0
Topázio Ruziziensis: Árvore 5,5 · Chão 0,0 = 5,5
Topázio Rocinha: Árvore 3,0 · Chão 0,0 = 3,0
144 Rocinha: Árvore 1,0 · Chão 0,0 = 1,0

Por passada: 1ª 32,5 · 2ª 0,0

Por máquina:
Colhedeira Adriano: 23,0
Cristiano: 2,0
Jacto Cristiano: 6,5
Sem máquina anotada: 1,0
TOTAL: Árvore 32,5 + Chão 0,0 = 32,5 carretas`;
test('repeat imports preserve totals and stable IDs',()=>{
  const {run}=app();const d=JSON.stringify(backup([record()]));
  run(`juntaBackup(${d});juntaBackup(${d})`);
  assert.equal(run('db.registros.length'),1);assert.equal(run('somaReg(db.registros)'),1);
});
test('correction revisions propagate and old backups cannot undo them',()=>{
  const {run}=app();const d=JSON.stringify(backup([record()]));
  run(`juntaBackup(${d});mexe(()=>{db.registros[0].carretas=0.5})`);
  assert.equal(run('db.registros[0].revisao'),1);
  run(`juntaBackup(${d})`);assert.equal(run('somaReg(db.registros)'),0.5);
  const target=app();target.run(`juntaBackup(${JSON.stringify(backup([record({carretas:0.5,revisao:1})]))})`);
  assert.equal(target.run('somaReg(db.registros)'),0.5);
});
test('deleted records stay deleted when old backups return or travel to another device',()=>{
  const {run}=app();const d=JSON.stringify(backup([record()]));
  run(`juntaBackup(${d});mexe(()=>{db.registros=[]});juntaBackup(${d})`);
  assert.equal(run('db.registros.length'),0);
  const other=app();other.run(`juntaBackup(${d});juntaBackup(${JSON.stringify(backup([],{excluidos:['r1']}))});juntaBackup(${d})`);
  assert.equal(other.run('db.registros.length'),0);
});
test('invalid import is atomic: missing IDs, bad dates, origins, values and duplicate IDs',()=>{
  for(const bad of [record({id:''}),record({data:'2026-02-30'}),record({origem:'outro'}),record({carretas:null}),record({passada:'2'})]){
    const {run}=app();const before=run('JSON.stringify(db)');
    assert.throws(()=>run(`juntaBackup(${JSON.stringify(backup([record({id:'good'}),bad]))})`));
    assert.equal(run('JSON.stringify(db)'),before);
  }
  assert.throws(()=>app().run(`juntaBackup(${JSON.stringify(backup([record(),record()]))})`));
});
test('failed persistence rolls back memory as well as stored data',()=>{
  const a=app();a.run(`juntaBackup(${JSON.stringify(backup([record()]))})`);
  const before=a.run('JSON.stringify(db)');a.fail();
  assert.throws(()=>a.run('mexe(()=>{db.registros=[]})'));
  assert.equal(a.run('JSON.stringify(db)'),before);
});
test('prototype-like IDs cannot corrupt report grouping or import mapping',()=>{
  const {run}=app();run(`juntaBackup(${JSON.stringify(backup([record({talhaoId:'__proto__'})],{talhoes:[]}))})`);
  assert.equal(typeof run('pgRelatorio()'),'string');
});
test('concurrent revision tie converges regardless of import order',()=>{
  const a=app(),b=app();
  const x=JSON.stringify(backup([record({carretas:0.5,revisao:1})]));
  const y=JSON.stringify(backup([record({carretas:2,revisao:1})]));
  a.run(`juntaBackup(${x});juntaBackup(${y})`);b.run(`juntaBackup(${y});juntaBackup(${x})`);
  assert.equal(a.run('somaReg(db.registros)'),b.run('somaReg(db.registros)'));
});
test('operator report contains only the selected period and remains idempotent',()=>{
  const source=app();
  source.run(`operador='João';juntaBackup(${JSON.stringify(backup([
    record({id:'old',data:'2026-09-06'}),record({id:'today'}),record({id:'new',data:'2026-09-08'})
  ]))});repDe='2026-09-07';repAte='2026-09-07'`);
  const report=source.run('JSON.stringify(backupPeriodo())');
  const parsed=JSON.parse(report);
  assert.equal(parsed.tipo,'relatorio-operador');assert.equal(parsed.operador,'João');
  assert.deepEqual(parsed.registros.map(r=>r.id),['today']);
  const target=app();target.run(`juntaBackup(${report});juntaBackup(${report})`);
  assert.equal(target.run('db.registros.length'),1);assert.equal(target.run('somaReg(db.registros)'),1);
});
test('pasted WhatsApp summary preserves every reported marginal total',()=>{
  const {run}=app();run(`var parsed=parseRelatorioTexto(${JSON.stringify(textReport)});aplicaRelatorioTexto(parsed)`);
  assert.equal(run('somaReg(db.registros)'),32.5);
  assert.equal(run("somaReg(db.registros.filter(r=>r.operador==='Jean'))"),32.5);
  assert.equal(run("somaReg(db.registros.filter(r=>PASS(r)===1))"),32.5);
  assert.equal(run("somaReg(db.registros.filter(r=>r.maquina==='Colhedeira Adriano'))"),23);
  assert.equal(run("somaReg(db.registros.filter(r=>talNome(r.talhaoId)==='Topázio Ruziziensis'))"),5.5);
  assert.equal(run("new Set(db.registros.map(r=>r.data)).size"),1);
  assert.equal(run("db.registros[0].data"),'2026-08-11');
});
test('same operator and period replaces the previous pasted summary without duplication',()=>{
  const {run}=app();run(`var first=parseRelatorioTexto(${JSON.stringify(textReport)});aplicaRelatorioTexto(first);aplicaRelatorioTexto(first)`);
  assert.equal(run('somaReg(db.registros)'),32.5);
  const revised=textReport.replace(/11,0/g,'10,0').replace(/32,5/g,'31,5').replace('23,0','22,0');
  run(`var revised=parseRelatorioTexto(${JSON.stringify(revised)});aplicaRelatorioTexto(revised)`);
  assert.equal(run('somaReg(db.registros)'),31.5);
});
test('pasted summary is rejected atomically when totals do not close',()=>{
  const {run}=app(),before=run('JSON.stringify(db)');
  const bad=textReport.replace('TOTAL: Árvore 32,5','TOTAL: Árvore 99,0');
  assert.throws(()=>run(`aplicaRelatorioTexto(parseRelatorioTexto(${JSON.stringify(bad)}))`));
  assert.equal(run('JSON.stringify(db)'),before);
});
