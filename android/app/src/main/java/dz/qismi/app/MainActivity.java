package dz.qismi.app;

import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        Bridge bridge = getBridge();
        WebView webView = bridge.getWebView();
        if (webView != null) {
            webView.getSettings().setUseWideViewPort(false);
            webView.getSettings().setLoadWithOverviewMode(false);
        }

        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri destination = request.getUrl();
                if (isAdminRoute(destination) && isSiteOrigin(destination, bridge.getServerUrl())) {
                    Toast.makeText(
                        MainActivity.this,
                        "لوحة الإدارة غير متاحة في التطبيق",
                        Toast.LENGTH_SHORT
                    ).show();
                    return true;
                }
                return super.shouldOverrideUrlLoading(view, request);
            }
        });
    }

    private boolean isAdminRoute(Uri uri) {
        String path = uri.getPath();
        if (path == null) return false;

        for (String segment : path.split("/")) {
            if ("admin".equals(segment)) return true;
        }
        return false;
    }

    private boolean isSiteOrigin(Uri destination, String configuredSiteUrl) {
        Uri site = Uri.parse(configuredSiteUrl);
        return site.getScheme().equals(destination.getScheme())
            && site.getHost().equalsIgnoreCase(destination.getHost())
            && site.getPort() == destination.getPort();
    }
}
