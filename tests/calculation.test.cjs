const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function loadApp(){
 const elements=new Map();
 const get=id=>{if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){}},addEventListener(type,fn){this['on'+type]=fn;},scrollIntoView(){}});return elements.get(id);};
 const document={getElementById:get};
 const window={scrollTo(){},AndroidRawBT:null};
 const context={document,window,Number,Math,Date,setTimeout(){},JSON};
 vm.runInNewContext(fs.readFileSync('www/app.js','utf8')+';globalThis.__calculate=calculate;globalThis.__valid=valid;',context);
 return {context,get};
}
test('rumus hitung cocok dengan acuan Admin v1.44.2',()=>{
 const {context,get}=loadApp();
 get('owner').value='Pemilik';get('driver').value='Supir';
 get('w1').value='10000';get('w2').value='2000';get('price').value='3000';
 get('fl').value='10';get('fj').value='20';get('fp').value='5';
 const d=context.__calculate();
 assert.equal(d.n1,8000);assert.equal(d.srt,240);assert.equal(d.n2,7760);
 assert.equal(d.kotor,23280000);assert.equal(d.jalan,155200);
 assert.equal(d.langsir,80000);assert.equal(d.panen,40000);
 assert.equal(d.bersih,23004800);assert.equal(context.__valid(d),'');
});
test('menolak T1 <= T2, harga nol, dan data pemilik/supir kosong',()=>{
 const {context,get}=loadApp();
 const d=context.__calculate();
 assert.match(context.__valid(d),/Pemilik dan Supir/);
 get('owner').value='A';get('driver').value='B';get('w1').value='100';get('w2').value='100';get('price').value='1000';
 assert.match(context.__valid(context.__calculate()),/T1 harus lebih besar/);
 get('w1').value='200';get('price').value='0';
 assert.match(context.__valid(context.__calculate()),/Harga/);
});
test('aplikasi tidak menyimpan transaksi dan tidak mengakses cloud',()=>{
 const app=fs.readFileSync('www/app.js','utf8');
 for(const term of ['localStorage','sessionStorage','indexedDB','fetch('])assert.equal(app.includes(term),false,'ditemukan '+term);
});
test('RawBT bridge memeriksa aplikasi tujuan dan mengembalikan error jika tidak tersedia',()=>{
 const bridge=fs.readFileSync('scripts/patch-rawbt.js','utf8');
 assert.ok(bridge.includes('intent.resolveActivity(pm)'));
 assert.ok(bridge.includes('RawBT tidak ditemukan'));
 assert.ok(bridge.includes('AndroidRawBT'));
});
