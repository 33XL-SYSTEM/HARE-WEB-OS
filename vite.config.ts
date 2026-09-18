import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import https from 'https'
import http from 'http'
import { URL } from 'url'

function hareProxyPlugin(): Plugin {
  return {
    name: 'hare-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/proxy', (req, res) => {
        const urlStr = req.url?.replace('/?url=', '') || '';
        if (!urlStr) {
          res.statusCode = 400;
          res.end('Missing url parameter');
          return;
        }

        const targetUrl = decodeURIComponent(urlStr);
        let parsedUrl;
        try {
          parsedUrl = new URL(targetUrl);
        } catch {
          res.statusCode = 400;
          res.end('Invalid URL');
          return;
        }

        const requestLib = parsedUrl.protocol === 'https:' ? https : http;
        
        // Prepare headers for the upstream request
        const reqHeaders = { ...req.headers };
        // Delete accept-encoding so we get plain text (makes injecting <base> possible without gzip decoding)
        delete reqHeaders['accept-encoding'];
        // Update host to match the target
        reqHeaders['host'] = parsedUrl.host;
        // Provide a realistic User-Agent
        reqHeaders['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        requestLib.get(targetUrl, {
          headers: reqHeaders
        }, (proxyRes) => {
          res.statusCode = proxyRes.statusCode || 200;
          
          let isHtml = false;

          for (const [key, value] of Object.entries(proxyRes.headers)) {
            const lowerKey = key.toLowerCase();
            
            // Drop security headers
            if (['x-frame-options', 'content-security-policy', 'strict-transport-security'].includes(lowerKey)) {
              continue;
            }
            
            if (lowerKey === 'content-type' && value && value.toString().includes('text/html')) {
              isHtml = true;
            }

            // Rewrite Location header for redirects so they pass through the proxy again
            if (lowerKey === 'location' && value) {
              const locationUrl = Array.isArray(value) ? value[0] : value;
              const absoluteLocation = new URL(locationUrl, targetUrl).href;
              res.setHeader(key, `/api/proxy?url=${encodeURIComponent(absoluteLocation)}`);
              continue;
            }
            
            if (value) res.setHeader(key, value);
          }
          
          res.setHeader('Access-Control-Allow-Origin', '*');
          
          if (isHtml) {
            // Inject <base> tag to force relative URLs to load from the target origin instead of our Vite SPA fallback
            const baseTag = `<base href="${parsedUrl.origin}${parsedUrl.pathname}">\n`;
            res.write(baseTag);
          }

          proxyRes.pipe(res);
        }).on('error', (err) => {
          console.error('[Hare Proxy Error]', err.message);
          res.statusCode = 500;
          res.end('Proxy Error: ' + err.message);
        });
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), hareProxyPlugin()],
})
