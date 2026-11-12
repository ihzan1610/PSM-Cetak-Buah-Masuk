'use strict';
const $ = id => document.getElementById(id);
const fmt = n => Math.round(n || 0).toLocaleString('id-ID');
const rupiah = n => 'Rp ' + fmt(n);
const INPUTS = ['owner','driver','w1','w2','price','fj','fl','fp'];
function readNumber(id) { const raw=$(id).value.trim(); return raw===''?0:Number(raw); }
function calculate() {
 const w1=readNumber('w1'),w2=readNumber('w2'),n1=Math.round(w1-w2),srt=n1*0.03,n2=n1-srt;
 const price=readNumber('price'),fj=readNumber('fj'),fl=readNumber('fl'),fp=readNumber('fp');
 const kotor=Math.round(n2*price),jalan=Math.round(n2*fj),langsir=Math.round(n1*fl),panen=Math.round(n1*fp);
 return {w1,w2,n1,srt,n2,price,fj,fl,fp,kotor,jalan,langsir,panen,bersih:kotor-jalan-langsir-panen,owner:$('owner').value.trim().toUpperCase(),driver:$('driver').value.trim().toUpperCase()};
}
function valid(d) {
 if(!d.owner||!d.driver)return 'Pemilik dan Supir wajib diisi.';
 if(!Number.isFinite(d.w1)||!Number.isFinite(d.w2)||d.w1<=0||d.w2<0||d.w1<=d.w2)return 'T1 harus lebih besar dari T2.';
 if(!Number.isFinite(d.price)||d.price<=0)return 'Harga per kg wajib lebih dari nol.';
 for(const k of ['fj','fl','fp'])if(!Number.isFinite(d[k])||d[k]<0)return 'Biaya Jalan, Langsir, dan Panen tidak boleh negatif.';
 if([d.kotor,d.jalan,d.langsir,d.panen,d.bersih,d.n1,d.n2].some(x=>!Number.isFinite(x)))return 'Angka tidak valid.';
 return '';
}
function render() {
 const d=calculate(),rows=[['Nett',fmt(d.n1)+' Kg'],['Potongan 3%',fmt(d.srt)+' Kg'],['Nett setelah 3%',fmt(d.n2)+' Kg'],['Harga / Kg',rupiah(d.price)],['Kotor',rupiah(d.kotor)],['Biaya Jalan',rupiah(d.jalan)],['Biaya Langsir',rupiah(d.langsir)],['Biaya Panen',rupiah(d.panen)],['Total Bersih',rupiah(d.bersih)]];
 $('results').innerHTML=rows.map((r,i)=>'<div class="line '+(i===8?'total':'')+'"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');
}
let active=null;
function stamp(){const d=new Date();return {date:d.toLocaleDateString('id-ID'),time:d.toLocaleTimeString('id-ID',{hour12:false})};}
function pair(label,value,width=32){label=String(label);value=String(value);return label+' '.repeat(Math.max(1,width-label.length-value.length))+value;}
function receiptPreview(d,when) {
 return [
 '          NOTA TIMBANGAN','================================',
 'Pemilik : '+d.owner,'Supir   : '+d.driver,'Tanggal : '+when.date,'Waktu   : '+when.time,
 '--------------------------------',pair('T1 / Bruto',fmt(d.w1)),pair('T2 / Tara',fmt(d.w2)),
 pair('Nett',fmt(d.n1)+' Kg'),pair('Potongan 3%',fmt(d.srt)+' Kg'),
 pair('Nett setelah 3%',fmt(d.n2)+' Kg'),pair('Harga / Kg',rupiah(d.price)),
 pair('KOTOR',rupiah(d.kotor)),'--------------------------------','POTONGAN:',
 pair('Jalan ('+fmt(d.fj)+'/Kg)','- '+rupiah(d.jalan)),
 pair('Langsir ('+fmt(d.fl)+'/Kg)','- '+rupiah(d.langsir)),
 pair('Panen ('+fmt(d.fp)+'/Kg)','- '+rupiah(d.panen)),
 '--------------------------------',pair('TOTAL BERSIH',rupiah(d.bersih)),
 '================================','       Terima kasih','','',''
 ].join('\n');
}
function thermal(d,when) {
 const ESC='\x1B',lines=[
 ESC+'@'+ESC+'a'+String.fromCharCode(1)+ESC+'E'+String.fromCharCode(1)+'NOTA TIMBANGAN'+ESC+'E'+String.fromCharCode(0),
 ESC+'a'+String.fromCharCode(0)+'================================',
 'Pemilik : '+d.owner,'Supir   : '+d.driver,'Tanggal : '+when.date,'Waktu   : '+when.time,
 '--------------------------------',pair('T1 / Bruto',fmt(d.w1)),pair('T2 / Tara',fmt(d.w2)),
 pair('Nett',fmt(d.n1)+' Kg'),pair('Potongan 3%',fmt(d.srt)+' Kg'),
 pair('Nett setelah 3%',fmt(d.n2)+' Kg'),pair('Harga / Kg',rupiah(d.price)),
 ESC+'E'+String.fromCharCode(1)+pair('KOTOR',rupiah(d.kotor))+ESC+'E'+String.fromCharCode(0),
 '--------------------------------','POTONGAN:',
 pair('Jalan ('+fmt(d.fj)+'/Kg)','- '+rupiah(d.jalan)),
 pair('Langsir ('+fmt(d.fl)+'/Kg)','- '+rupiah(d.langsir)),
 pair('Panen ('+fmt(d.fp)+'/Kg)','- '+rupiah(d.panen)),
 '--------------------------------',ESC+'E'+String.fromCharCode(1)+pair('TOTAL BERSIH',rupiah(d.bersih))+ESC+'E'+String.fromCharCode(0),
 '================================',ESC+'a'+String.fromCharCode(1)+'Terima kasih'+ESC+'a'+String.fromCharCode(0)+'\n\n\n'
 ];
 return lines.join('\n');
}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3000);}
INPUTS.forEach(id=>$(id).addEventListener('input',render));render();
$('preview').onclick=()=>{const d=calculate(),problem=valid(d);if(problem){toast(problem);return;}active={d,when:stamp()};$('receipt').textContent=receiptPreview(d,active.when);$('previewBox').classList.remove('hidden');$('previewBox').scrollIntoView({behavior:'smooth'});};
$('print').onclick=()=>{if(!active){toast('Buat pratinjau nota terlebih dahulu.');return;}const bridge=window.AndroidRawBT;if(!bridge||typeof bridge.print!=='function'){toast('Jembatan cetak tidak aktif. Tutup dan buka ulang APK terbaru.');return;}try{const response=JSON.parse(bridge.print(thermal(active.d,active.when)));toast(response.ok?'Perintah diteruskan ke RawBT. Periksa printer.':'RawBT: '+(response.message||'Tidak dapat membuka RawBT.'));}catch(error){toast('Gagal mengirim ke RawBT: '+error.message);}};
$('clear').onclick=()=>{INPUTS.forEach(id=>$(id).value='');active=null;$('previewBox').classList.add('hidden');$('receipt').textContent='';render();window.scrollTo({top:0,behavior:'smooth'});};
