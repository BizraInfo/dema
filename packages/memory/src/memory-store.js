import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const PROFILE_FILE = "profile.json";
const MEMORY_DIR = "memory";
// today.json is the continuity tick written by `dema today`; it is operational
// state, not a memory entry, and is intentionally excluded from listings.
const SKIP_MEMORY_FILES = new Set(["today.json"]);

function defaultRoot() {
  return process.env.DEMA_HOME || join(homedir(), ".dema");
}

function entryPath(name, root) {
  if (name === "profile") {
    return join(root, PROFILE_FILE);
  }
  return join(root, MEMORY_DIR, `${name}.json`);
}

export async function listMemoryEntries(root = defaultRoot()) {
  const entries = [];

  // Profile lives at ~/.dema/profile.json (alongside config.local.json).
  try {
    await readFile(join(root, PROFILE_FILE), "utf8");
    entries.push({ name: "profile", path: join(root, PROFILE_FILE) });
  } catch {
    // profile not yet written — Dema is not yet aware of the user.
  }

  // Other memory entries live at ~/.dema/memory/<name>.json.
  try {
    const memoryRoot = join(root, MEMORY_DIR);
    const files = await readdir(memoryRoot);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      if (SKIP_MEMORY_FILES.has(file)) continue;
      const name = file.slice(0, -".json".length);
      entries.push({ name, path: join(memoryRoot, file) });
    }
  } catch {
    // memory dir absent — leave the list as-is.
  }

  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return entries;
}

export async function readMemoryEntry(name, root = defaultRoot()) {
  if (!name || typeof name !== "string") {
    throw new Error("Memory entry name is required.");
  }
  const path = entryPath(name, root);
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      throw new Error(`Memory entry not found: ${name}`);
    }
    throw err;
  }
}

export async function summarizeMemory(root = defaultRoot()) {
  const entries = await listMemoryEntries(root);
  return {
    schema: "bizra.dema.memory_index.v0.1",
    root,
    count: entries.length,
    entries
  };
}
