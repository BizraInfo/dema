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

export async function runSetup(root = process.env.DEMA_HOME || join(homedir(), ".dema")) {
  await mkdir(root, { recursive: true });
  await mkdir(join(root, "receipts"), { recursive: true });
  await mkdir(join(root, "memory"), { recursive: true });
  await mkdir(join(root, "logs"), { recursive: true });
  await mkdir(join(root, "skills"), { recursive: true });

  const profilePath = join(root, "profile.json");
  if (!(await exists(profilePath))) {
    await writeFile(profilePath, JSON.stringify({
      schema: "bizra.dema.profile.v0.1",
      preferred_name: null,
      memory_consent: "local",
      hidden_autonomy: false,
      created_at: new Date().toISOString()
    }, null, 2));
  }

  const configPath = join(root, "config.local.json");
  if (!(await exists(configPath))) {
    await writeFile(configPath, `${JSON.stringify({
      schema: "bizra.dema.local_config.v0.1",
      mode: "local",
      noHiddenDaemon: true,
      requireExplicitConsent: true,
      nextArtifact: "ARTIFACT-011"
    }, null, 2)}\n`);
  }

  return {
    schema: "bizra.dema.setup.v0.1",
    root,
    os: { platform: platform(), arch: arch() },
    created: true,
    folders: ["receipts", "memory", "logs", "skills"],
    profilePath,
    configPath,
    next: "Run `dema status`."
  };
}
