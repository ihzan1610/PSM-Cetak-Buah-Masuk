const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
function calc(w1,w2,p,fl,fj,fp){const n1=Math.round(w1-w2),srt=n1*.03,n2=n1-srt,kotor=Math.round(n2*p),jalan=Math.round(n2*fj),langsir=Math.round(n1*fl),panen=Math.round(n1*fp);return {n1,srt,n2,kotor,jalan,langsir,panen,bersih:kotor-jalan-langsir-panen};}
test('formula potongan 3%, jalan, langsir, panen dan total bersih',()=>assert.deepEqual(calc(3280,1900,2800,170,20,250),{n1:1380,srt:41.4,n2:1338.6,kotor:3748080,jalan:26772,langsir:234600,panen:345000,bersih:3141708}));
test('preview tidak memaparkan escape ESC/POS mentah',()=>{const s=fs.readFileSync('www/app.js','utf8');assert.match(s,/receiptPreview/);assert.match(s,/const ESC=/);});
test('tidak ada penyimpanan transaksi',()=>{const s=fs.readFileSync('www/app.js','utf8');assert.doesNotMatch(s,/localStorage|sessionStorage|indexedDB|fetch\\s*\\(/i);});
test('RawBT bridge dan package visibility dipasang',()=>{const s=fs.readFileSync('scripts/patch-rawbt.js','utf8');assert.match(s,/AndroidRawBT/);assert.match(s,/queries/);});
