// Punto de entrada para desarrollo local.
// En Vercel, el servidor se levanta desde api/server.ts (serverless).
import app           from './app';
import { config }    from './config';
import { readStore } from './db/store';

async function start() {
  await readStore();   // garantiza que existe el admin por defecto en el JSON store

  app.listen(config.port, () => {
    console.log(`\n✅  EnviroGest API  →  http://localhost:${config.port}/api`);
    console.log(`    Mode   : ${config.isProd ? 'production' : 'development'}`);
    console.log(`    CORS   : ${config.corsOrigin}`);
    console.log(`    Cookie : ${config.cookieName}  (httpOnly · SameSite=Strict)\n`);
  });
}

start().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
