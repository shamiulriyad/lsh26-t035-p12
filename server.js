/**
 * Production HTTP server for Render.
 *
 * Why a custom server instead of `next start`:
 *  - Guarantees we bind `process.env.PORT` on host 0.0.0.0 (Render requirement).
 *  - Prints an explicit startup log with the resolved port/host.
 *  - Serves GET /health WITHOUT booting Next middleware or touching Supabase,
 *    so the platform health check passes even if the database is unreachable.
 *
 * `next dev` is untouched — local development still runs `npm run dev`.
 * No business logic lives here.
 */
const http = require('http');
const next = require('next');

// Render injects PORT. Never hardcode it. Fall back to 3000 only for bare local runs.
const port = parseInt(process.env.PORT || '3000', 10);
// Must be 0.0.0.0 so Render's proxy can reach the container. Not localhost/127.0.0.1.
const host = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname: host, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      // DB-free liveness probe. Answered before Next / middleware / Supabase.
      if (req.url === '/health' || req.url === '/healthz' || req.url.startsWith('/health?')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }
      handle(req, res);
    });

    server.listen(port, host, () => {
      console.log(
        `[server] TakaRunway up on http://${host}:${port}  ` +
          `(NODE_ENV=${process.env.NODE_ENV || 'undefined'}, ` +
          `supabase=${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'NOT configured'})`
      );
    });

    server.on('error', (err) => {
      console.error('[server] HTTP server error:', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    // A failed Next build/prepare is fatal and must be logged loudly, not swallowed.
    console.error('[server] Failed to prepare Next.js app:', err);
    process.exit(1);
  });
