const fs=require('fs'),path=require('path');
const config=JSON.parse(fs.readFileSync('capacitor.config.json','utf8'));
const appId=config.appId,pkg=appId.split('.').join(path.sep),dir=path.join('android','app','src','main','java',pkg);
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'MainActivity.java'),`package ${appId};
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
 @Override public void onCreate(Bundle savedInstanceState){super.onCreate(savedInstanceState);getBridge().getWebView().addJavascriptInterface(new RawBTBridge(this),"AndroidRawBT");}
}`);
fs.writeFileSync(path.join(dir,'RawBTBridge.java'),`package ${appId};
import android.app.Activity;import android.content.*;import android.net.Uri;import android.util.Base64;import android.webkit.JavascriptInterface;import java.nio.charset.Charset;
public class RawBTBridge {private final Activity activity;RawBTBridge(Activity a){activity=a;}
 @JavascriptInterface public String print(String text){try{if(text==null)text="";byte[] bytes=text.getBytes(Charset.forName("CP437"));String data=Base64.encodeToString(bytes,Base64.NO_WRAP);Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse("rawbt:base64,"+data));i.setPackage("ru.a402d.rawbtprinter");i.addCategory(Intent.CATEGORY_DEFAULT);activity.runOnUiThread(()->{try{activity.startActivity(i);}catch(Exception ignored){}});return "{\\"ok\\":true,\\"message\\":\\"Perintah dikirim ke RawBT\\"}";}catch(Exception e){return "{\\"ok\\":false,\\"message\\":\\""+e.getMessage()+"\\"}";}}
}`);
console.log('RawBT native bridge generated');