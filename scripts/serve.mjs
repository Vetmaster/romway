import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep,extname} from 'node:path';
const root = fileURLToPath(new URL('../web/',import.meta.url));
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
const server = createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path = resolve(root,'.'+(pathname.endsWith('/') ? pathname+'index.html' : pathname));
    if (!path.startsWith(root.endsWith(sep) ? root : root+sep)) throw new Error();
    const file = path.endsWith(sep) ? path+'index.html' : path;
    if (!mime[extname(file)] || !['GET','HEAD'].includes(req.method)) throw new Error();
    const data = await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(8000,'127.0.0.1',() => console.log('Romway preview: http://localhost:8000 (web/ only)'));
