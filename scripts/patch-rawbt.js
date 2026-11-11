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
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;
import java.nio.charset.Charset;
public class RawBTBridge {
 private static final String RAWBT_PACKAGE = "ru.a402d.rawbtprinter";
 private final Activity activity;
 RawBTBridge(Activity a) { activity=a; }
 private String result(boolean ok,String message) {
  try { JSONObject json=new JSONObject(); json.put("ok",ok); json.put("message",message); return json.toString(); }
  catch(Exception ignored) { return "{\\\"ok\\\":"+ok+",\\\"message\\\":\\\""+message.replace("\\\"","'")+"\\\"}"; }
 }
 @JavascriptInterface public String print(String text) {
  try {
   if(text==null || text.trim().isEmpty()) return result(false,"Data cetak kosong.");
   PackageManager pm=activity.getPackageManager();
   Intent intent=new Intent(Intent.ACTION_VIEW, Uri.parse("rawbt:base64,"+Base64.encodeToString(text.getBytes(Charset.forName("CP437")),Base64.NO_WRAP)));
   intent.setPackage(RAWBT_PACKAGE);
   intent.addCategory(Intent.CATEGORY_DEFAULT);
   if(intent.resolveActivity(pm)==null) return result(false,"RawBT tidak ditemukan. Pasang dan buka RawBT terlebih dahulu.");
   activity.runOnUiThread(() -> {
    try { activity.startActivity(intent); }
    catch(Exception e) { android.util.Log.e("PSMRawBT","Gagal membuka RawBT",e); }
   });
   return result(true,"Perintah diteruskan ke aplikasi RawBT. Pastikan printer terhubung.");
  } catch(Exception e) {
   String message=e.getMessage()==null?"Kesalahan tidak diketahui":e.getMessage();
   return result(false,message);
  }
 }
}`);
console.log('RawBT native bridge generated');
