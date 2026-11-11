const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
function calc(w1,w2,p,fl,fj,fp){const n1=Math.round(w1-w2),srt=n1*.03,n2=n1-srt,kotor=Math.round(n2*p),tL=Math.round(n1*fl),tP=Math.round(n1*fp),tJ=Math.round(n2*fj);return {n1,srt,n2,kotor,tL,tP,tJ,bersih:kotor-(tL+tP+tJ)};}
test('rumus sama dengan hitungTransaksi Admin v1.44.2',()=>assert.deepEqual(calc(10000,2000,3000,10,20,5),{n1:8000,srt:240,n2:7760,kotor:23280000,tL:80000,tP:40000,tJ:155200,bersih:23004800}));
test('tidak ada penyimpanan transaksi atau cloud',()=>{const s=fs.readFileSync('www/app.js','utf8');assert.equal(/localStorage|sessionStorage|indexedDB/.test(s),false);assert.equal(/fetch\\s*\\(/.test(s),false);});
test('jalur cetak memakai native RawBT bridge',()=>{const s=fs.readFileSync('www/app.js','utf8');assert.match(s,/AndroidRawBT/);});
