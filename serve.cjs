// Optional preview server; the app itself also works directly from index.html.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const port = Number(process.env.PORT || 8786);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml' };
const allowed = new Set(['/index.html','/favicon.svg','/src/math.js','/src/state.js','/src/app.js','/src/styles.css']);
const server = http.createServer((req,res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  const pathname = new URL(req.url,'http://127.0.0.1').pathname;
  const resource = pathname === '/' ? '/index.html' : pathname;
  if (!allowed.has(resource)) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(__dirname,resource), (error,data) => {
    if (error) { res.writeHead(500); return res.end('Unable to read local asset'); }
    res.writeHead(200,{'Content-Type':types[path.extname(resource)],'Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});
server.on('error', error => { console.error(`Could not start local server: ${error.message}`); process.exitCode=1; });
server.listen(port,'127.0.0.1',() => console.log(`QUOTIENT local: http://127.0.0.1:${port}\nCtrl+C to stop. OPEN-CALCULATOR.bat also works without a server.`));
