import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { arch, homedir, platform } from "node:os";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(path) {
  const alreadyExists = await exists(path);
  await mkdir(path, { recursive: true });
  return { path, status: alreadyExists ? "existing" : "created" };
}

async function writeJsonIfMissing(path, value) {
  if (await exists(path)) return { path, status: "existing" };
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return { path, status: "created" };
}

export async function runSetup(root = process.env.DEMA_HOME || join(homedir(), ".dema")) {
  const entries = [];
  entries.push(await ensureDir(root));
  entries.push(await ensureDir(join(root, "receipts")));
  entries.push(await ensureDir(join(root, "memory")));
  entries.push(await ensureDir(join(root, "logs")));
  entries.push(await ensureDir(join(root, "skills")));

  const profilePath = join(root, "profile.json");
  entries.push(
    await writeJsonIfMissing(profilePath, {
      schema: "bizra.dema.profile.v0.1",
      preferred_name: null,
      memory_consent: "local",
      hidden_autonomy: false,
      created_at: new Date().toISOString()
    })
  );

  const configPath = join(root, "config.local.json");
  entries.push(
    await writeJsonIfMissing(configPath, {
      schema: "bizra.dema.local_config.v0.1",
      mode: "local",
      noHiddenDaemon: true,
      requireExplicitConsent: true,
      nextArtifact: "ARTIFACT-011"
    })
  );

  const createdPaths = entries.filter((entry) => entry.status === "created").map((entry) => entry.path);
  const existingPaths = entries.filter((entry) => entry.status === "existing").map((entry) => entry.path);

  return {
    schema: "bizra.dema.setup.v0.1",
    root,
    os: { platform: platform(), arch: arch() },
    created: createdPaths.length > 0,
    paths: {
      home: root,
      profile: profilePath,
      config: configPath,
      receipts: join(root, "receipts"),
      memory: join(root, "memory"),
      logs: join(root, "logs"),
      skills: join(root, "skills")
    },
    createdPaths,
    existingPaths,
    untouched: [
      "daemon state",
      "mission runtime",
      "runtime pulse",
      "receipt history",
      "external provider settings"
    ],
    boundaries: {
      noHiddenDaemon: true,
      missionExecuted: false,
      artifact011Issued: false,
      localFirst: true
    },
    next: [
      "Run `dema status`.",
      "Run `dema doctor`.",
      "Preview with `dema mission propose`."
    ]
  };
}
