const fs=require('fs'),path=require('path');
const config=JSON.parse(fs.readFileSync('capacitor.config.json','utf8'));
const appId=config.appId,pkg=appId.split('.').join(path.sep),dir=path.join('android','app','src','main','java',pkg);
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'MainActivity.java'),`package ${appId};
import android.os.Bundle;import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
 @Override public void onCreate(Bundle savedInstanceState){super.onCreate(savedInstanceState);getBridge().getWebView().addJavascriptInterface(new RawBTBridge(this),"AndroidRawBT");}
}`);
fs.writeFileSync(path.join(dir,'RawBTBridge.java'),`package ${appId};
import android.app.Activity;import android.content.Intent;import android.content.pm.PackageManager;import android.net.Uri;import android.util.Base64;import android.webkit.JavascriptInterface;import org.json.JSONObject;
public class RawBTBridge {
 private static final String RAWBT_PACKAGE="ru.a402d.rawbtprinter";private final Activity activity;RawBTBridge(Activity a){activity=a;}
 private String result(boolean ok,String msg){try{JSONObject j=new JSONObject();j.put("ok",ok);j.put("message",msg);return j.toString();}catch(Exception e){return "{\\"ok\\":"+ok+"}";}}
 @JavascriptInterface public String printImage(String base64){try{
 if(base64==null||base64.isEmpty())return result(false,"Gambar nota kosong.");
 Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse("rawbt:data:image/png;base64,"+base64));i.setPackage(RAWBT_PACKAGE);
 if(i.resolveActivity(activity.getPackageManager())==null)return result(false,"RawBT tidak ditemukan. Pastikan RawBT versi terbaru terpasang.");
 activity.startActivity(i);return result(true,"Gambar nota dikirim ke RawBT.");
 }catch(Exception e){return result(false,e.getMessage()==null?"Gagal membuka RawBT":e.getMessage());}}
}
`);
const manifest=path.join('android','app','src','main','AndroidManifest.xml');let xml=fs.readFileSync(manifest,'utf8');
if(!xml.includes('ru.a402d.rawbtprinter')){const start=xml.indexOf('<manifest'),end=xml.indexOf('>',start);if(end<0)throw new Error('Manifest root tidak ditemukan');xml=xml.slice(0,end+1)+String.fromCharCode(10)+'    <queries><package android:name="ru.a402d.rawbtprinter" /></queries>'+xml.slice(end+1);fs.writeFileSync(manifest,xml);}
console.log('RawBT image printing bridge configured');