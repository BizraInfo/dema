import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { homedir } from "node:os";

export async function listReceipts(root = process.env.DEMA_HOME || join(homedir(), ".dema")) {
  const receiptsRoot = join(root, "receipts");
  try {
    const files = await readdir(receiptsRoot, { recursive: true });
    const jsonFiles = files.filter((file) => String(file).endsWith(".json"));
    return Promise.all(jsonFiles.map(async (file) => {
      const path = join(receiptsRoot, file);
      try {
        const data = JSON.parse(await readFile(path, "utf8"));
        return {
          path,
          receipt_id: data.receipt_id,
          artifact_id: data.artifact_id,
          action: data.action,
          truth_label: data.truth_label,
          created_at: data.created_at
        };
      } catch {
        return { path, unreadable: true };
      }
    }));
  } catch {
    return [];
  }
}

export async function readReceipt(selector, root = process.env.DEMA_HOME || join(homedir(), ".dema")) {
  const receipts = await listReceipts(root);
  const match = receipts.find(
    (receipt) =>
      receipt.path === selector ||
      receipt.receipt_id === selector ||
      receipt.artifact_id === selector ||
      basename(receipt.path) === selector
  );

  if (!match) {
    throw new Error(`Receipt not found: ${selector}`);
  }

  return JSON.parse(await readFile(match.path, "utf8"));
}
