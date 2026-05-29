#!/usr/bin/env node
/**
 * .env (ildiz) + backend/.env dan Docker Compose uchun .env.compose yaratadi.
 * Alohida .env.docker kerak emas.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootEnvPath = path.join(root, '.env');
const backendEnvPath = path.join(root, 'backend', '.env');
const outPath = path.join(root, '.env.compose');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const vars = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function missingHint(name, examplePath) {
  console.error(`Xatolik: ${name} topilmadi.`);
  console.error(`  cp ${examplePath} ${name}`);
  process.exit(1);
}

const rootEnv = parseEnvFile(rootEnvPath);
const backendEnv = parseEnvFile(backendEnvPath);

if (!rootEnv) missingHint('.env', '.env.example');
if (!backendEnv) missingHint('backend/.env', 'backend/.env.example');

const apiPort = backendEnv.API_PORT || rootEnv.API_PORT || '8787';
const webPort = rootEnv.WEB_PORT || '8080';
const viteApi =
  rootEnv.VITE_API_URL || `http://127.0.0.1:${apiPort}`;
const frontendOrigin =
  rootEnv.FRONTEND_ORIGIN || `http://localhost:${webPort}`;

const lines = [
  '# Avtomatik: scripts/docker-env.mjs (.env + backend/.env)',
  `API_PORT=${apiPort}`,
  `WEB_PORT=${webPort}`,
  `VITE_API_URL=${viteApi}`,
  `FRONTEND_ORIGIN=${frontendOrigin}`,
  `JWT_SECRET=${backendEnv.JWT_SECRET || 'dev_change_me'}`,
  `STRIPE_SECRET_KEY=${backendEnv.STRIPE_SECRET_KEY || ''}`,
  '',
];

fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('[docker] .env.compose yaratildi (.env + backend/.env)');
