const fs=require('fs'),path=require('path');
const config=JSON.parse(fs.readFileSync('capacitor.config.json','utf8'));
const appId=config.appId,packagePath=appId.split('.').join(path.sep);
const dir=path.join('android','app','src','main','java',packagePath);
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'MainActivity.java'),`package ${appId};
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
 @Override public void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  getBridge().getWebView().addJavascriptInterface(new RawBTBridge(this), "AndroidRawBT");
 }
}`);
fs.writeFileSync(path.join(dir,'RawBTBridge.java'),`package ${appId};
import android.app.Activity;import android.content.Intent;import android.content.pm.PackageManager;import android.net.Uri;import android.util.Base64;import android.webkit.JavascriptInterface;import org.json.JSONObject;import java.nio.charset.Charset;
public class RawBTBridge {
 private static final String RAWBT_PACKAGE="ru.a402d.rawbtprinter";
 private final Activity activity; RawBTBridge(Activity a){activity=a;}
 private String result(boolean ok,String message){try{JSONObject j=new JSONObject();j.put("ok",ok);j.put("message",message);return j.toString();}catch(Exception e){return "{\\"ok\\":"+ok+"}";}}
 @JavascriptInterface public String print(String text){try{
  if(text==null||text.trim().isEmpty())return result(false,"Data cetak kosong.");
  Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse("rawbt:base64,"+Base64.encodeToString(text.getBytes(Charset.forName("CP437")),Base64.NO_WRAP)));
  i.setPackage(RAWBT_PACKAGE);i.addCategory(Intent.CATEGORY_DEFAULT);
  PackageManager pm=activity.getPackageManager();
  if(i.resolveActivity(pm)==null)return result(false,"RawBT tidak ditemukan. Pastikan aplikasi RawBT terpasang.");
  activity.startActivity(i);return result(true,"Perintah cetak diteruskan ke RawBT.");
 }catch(Exception e){return result(false,e.getMessage()==null?"Gagal membuka RawBT":e.getMessage());}}
}`);
const manifest=path.join('android','app','src','main','AndroidManifest.xml');
let xml=fs.readFileSync(manifest,'utf8');
if(!xml.includes('ru.a402d.rawbtprinter')) {
 const end=xml.indexOf('>');
 if(end<0)throw new Error('Tag manifest tidak ditemukan');
 xml=xml.slice(0,end+1)+'\\n    <queries><package android:name="ru.a402d.rawbtprinter" /></queries>'+xml.slice(end+1);
 fs.writeFileSync(manifest,xml);
}
console.log('RawBT bridge and package visibility configured');