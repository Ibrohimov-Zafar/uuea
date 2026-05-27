import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function readEnvPort() {
  const envPath = path.join(process.cwd(), ".env");
  try {
    const text = fs.readFileSync(envPath, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (key === "API_PORT" && val) {
        const n = Number(val);
        if (Number.isFinite(n) && n > 0) return n;
      }
    }
  } catch {
    // ignore
  }
  return 8787;
}

const port = Number(process.env.API_PORT) || readEnvPort();

let out = "";
try {
  out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
} catch {
  out = "";
}

if (!out) {
  console.log(`[freeport] port ${port} is free`);
  process.exit(0);
}

const pids = Array.from(new Set(out.split(/\s+/).filter(Boolean)));
for (const pid of pids) {
  try {
    execSync(`kill ${pid}`, { stdio: "ignore" });
    console.log(`[freeport] killed pid ${pid} on port ${port}`);
  } catch {
    // if normal kill fails, force kill
    try {
      execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      console.log(`[freeport] force killed pid ${pid} on port ${port}`);
    } catch {
      console.log(`[freeport] failed to kill pid ${pid} (port ${port})`);
    }
  }
}

