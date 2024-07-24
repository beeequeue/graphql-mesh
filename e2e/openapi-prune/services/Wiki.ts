import http from 'node:http';
import { Args } from '@e2e/args';

const args = Args(process.argv);

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/main') {
    if (req.method === 'POST') {
      return res
        .setHeader('content-type', 'application/json')
        .end(JSON.stringify({ apple: 'correct' }));
    } else {
      return res
        .setHeader('content-type', 'application/json')
        .end(JSON.stringify({ apple: 'bad' }));
    }
  }
  return res.writeHead(404).end();
});

server.listen(args.getServicePort('Wiki'));