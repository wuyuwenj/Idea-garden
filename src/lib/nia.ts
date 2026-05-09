import { execFile, exec } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

export interface NiaContextInput {
  title: string;
  summary: string;
  content: string;
  tags?: string[];
  workspace?: string;
  agent?: string;
}

export async function createVault(
  name: string,
  description?: string
): Promise<{ vaultId?: string; error?: string }> {
  const args = ["vault", "create", name];

  if (description) {
    args.push("--description", description);
  }

  try {
    const { stdout } = await execFileAsync("nia", args, {
      timeout: 15000,
    });

    const idMatch = stdout.match(/^id:\s+([a-f0-9-]+)/im);
    return { vaultId: idMatch?.[1] ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[nia] Failed to create vault:", message);
    return { error: message };
  }
}

export async function writeVaultSeedPage(
  vaultId: string,
  seed: {
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    tags: string[];
    created_at: string;
  }
): Promise<{ error?: string }> {
  const slug = seed.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const content = [
    `# ${seed.title}`,
    "",
    `**Priority:** ${seed.priority} | **Status:** ${seed.status} | **Tags:** ${seed.tags.join(", ") || "none"}`,
    "",
    "## Description",
    seed.description || "No description.",
    "",
    "---",
    "## Timeline",
    `- **${new Date(seed.created_at).toISOString().split("T")[0]}** | Seed planted [Source: idea-garden]`,
  ].join("\n");

  try {
    const cmd = `nia vault open ${vaultId} --c "$(cat <<'OUTER'
mkdir -p entities && cat > entities/${slug}.md << 'SEEDEOF'
${content}
SEEDEOF
OUTER
)"`;
    await execAsync(cmd, { timeout: 15000 });
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[nia] Failed to write vault seed page:", message);
    return { error: message };
  }
}

export async function appendVaultSeedComment(
  vaultId: string,
  seedTitle: string,
  comment: {
    userName: string;
    content: string;
    commentType: string;
    date: string;
  }
): Promise<{ error?: string }> {
  const slug = seedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const typeLabel = comment.commentType === "discussion" ? "" : ` [${comment.commentType}]`;
  const line = `- **${comment.date} | @${comment.userName}**${typeLabel}: ${comment.content}`;

  try {
    const cmd = `nia vault open ${vaultId} --c "$(cat <<'OUTER'
if ! grep -q '## Discussion' seeds/${slug}.md 2>/dev/null; then
  echo '' >> seeds/${slug}.md
  echo '## Discussion' >> seeds/${slug}.md
fi
cat >> seeds/${slug}.md << 'COMMENTEOF'
${line}
COMMENTEOF
OUTER
)"`;
    await execAsync(cmd, { timeout: 15000 });
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[nia] Failed to append vault comment:", message);
    return { error: message };
  }
}

export async function saveNiaContext(
  input: NiaContextInput
): Promise<{ contextId?: string; error?: string }> {
  const args = [
    "contexts",
    "save",
    input.title,
    "--summary",
    input.summary,
    "--content",
    input.content,
    "--agent",
    input.agent || "idea-garden",
    "--memory-type",
    "episodic",
  ];

  if (input.tags?.length) {
    args.push("--tags", input.tags.join(","));
  }

  if (input.workspace) {
    args.push("--workspace", input.workspace);
  }

  try {
    const { stdout } = await execFileAsync("nia", args, {
      timeout: 15000,
    });

    // Try to extract context ID from output
    const idMatch = stdout.match(/Context ID:\s+([a-f0-9-]+)/i);
    return { contextId: idMatch?.[1] ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[nia] Failed to save context:", message);
    return { error: message };
  }
}

export async function indexUrl(
  url: string,
  name?: string
): Promise<{ sourceId?: string; error?: string }> {
  const args = ["sources", "index", url];
  if (name) {
    args.push("--name", name);
  }

  try {
    const { stdout } = await execFileAsync("nia", args, {
      timeout: 30000,
    });

    const idMatch = stdout.match(/(?:id|source_id|Source ID):\s+([a-f0-9-]+)/i);
    return { sourceId: idMatch?.[1] ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[nia] Failed to index URL:", message);
    return { error: message };
  }
}

export async function addSourceToVault(
  vaultId: string,
  sourceId: string
): Promise<{ error?: string }> {
  try {
    await execFileAsync("nia", ["vault", "add-source", vaultId, sourceId], {
      timeout: 15000,
    });
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[nia] Failed to add source to vault:", message);
    return { error: message };
  }
}

export async function ingestVault(
  vaultId: string
): Promise<{ error?: string }> {
  try {
    await execFileAsync("nia", ["vault", "ingest", vaultId], {
      timeout: 30000,
    });
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[nia] Failed to ingest vault:", message);
    return { error: message };
  }
}

export interface VaultSearchMatch {
  filePath: string;
  content: string;
  lineNumber: number;
}

export async function searchVault(
  vaultId: string,
  query: string,
  topK: number = 10
): Promise<{ matches: VaultSearchMatch[]; error?: string }> {
  try {
    const { stdout } = await execFileAsync(
      "nia",
      ["vault", "search", vaultId, query, "--top-k", String(topK)],
      { timeout: 15000 }
    );

    const matches: VaultSearchMatch[] = [];
    const blocks = stdout.split(/\[\d+\]/g).slice(1);

    for (const block of blocks) {
      const fileMatch = block.match(/file_path:\s*(.+)/);
      const contentMatch = block.match(/content:\s*(.+)/);
      const lineMatch = block.match(/line_number:\s*(\d+)/);

      if (fileMatch) {
        matches.push({
          filePath: fileMatch[1].trim(),
          content: contentMatch?.[1]?.trim() || "",
          lineNumber: parseInt(lineMatch?.[1] || "0", 10),
        });
      }
    }

    // Deduplicate by file path, keep first match per file
    const seen = new Set<string>();
    const deduped = matches.filter((m) => {
      if (seen.has(m.filePath)) return false;
      seen.add(m.filePath);
      return true;
    });

    // Only return seeds/ matches
    return { matches: deduped.filter((m) => m.filePath.startsWith("/entities/")) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[nia] Failed to search vault:", message);
    return { matches: [], error: message };
  }
}
