#!/usr/bin/env node
/**
 * Ensures .env.docker exists (copies from .env.docker.example if missing).
 * Used by pnpm docker:* scripts on VPS/local.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, '.env.docker');
const example = path.join(root, '.env.docker.example');

if (!fs.existsSync(target)) {
  if (!fs.existsSync(example)) {
    console.error('Xatolik: .env.docker.example topilmadi');
    process.exit(1);
  }
  fs.copyFileSync(example, target);
  console.log('[docker] .env.docker yaratildi (.env.docker.example dan). JWT/Stripe ni tahrirlang.');
}
