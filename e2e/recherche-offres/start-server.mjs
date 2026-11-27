import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const port = await new Promise((resolve, reject) => {
  const listener = createServer();
  listener.on('error', reject);
  listener.listen(0, () => {
    const address = listener.address();
    listener.close((error) => {
      if (error) reject(error);
      else if (address && typeof address !== 'string') resolve(address.port);
      else reject(new Error('Impossible de réserver un port pour l’API.'));
    });
  });
});

const directory = mkdtempSync(join(tmpdir(), 'gesta-e2e-'));
const database = join(directory, 'gesta.db');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const server = spawn(npm, ['run', 'dev', '--', '--kill-others-on-fail'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_PATH: database,
    API_PORT: String(port),
    DEMO_AUTH_ENABLED: 'true',
    JWT_SECRET: 'cle-de-test-e2e-sans-valeur-secrete',
    NODE_ENV: 'development',
  },
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}

server.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});

server.on('close', (code) => {
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    rmSync(`${database}${suffix}`, { force: true });
  }
  rmdirSync(directory);
  process.exitCode = code ?? 1;
});
