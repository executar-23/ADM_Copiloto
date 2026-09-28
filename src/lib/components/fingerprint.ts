// skill_version e detecção de drift entre cópias de uma skill (EV-008).
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { parseFrontmatter } from "./frontmatter.ts";
import { existsSync, isDir, isFile, readText, treeHash, walkFiles } from "../util.ts";

export interface SkillCopy {
  path: string;
  tree_sha256: string;
  files: number;
  skill_md_lines: number;
  declared_version: string | null;
}

export function defaultSkillRoots(root: string, env: NodeJS.ProcessEnv = process.env): string[] {
  const home = env.HOME ?? homedir();
  const extra = (env.MAESTRO_SKILL_ROOTS ?? "").split(":").filter(Boolean);
  return [join(root, "skills"), join(root, ".claude", "skills"), join(home, ".claude", "skills"), join(home, ".claude", "plugins"), "/mnt/skills", ...extra].filter(
    (p, i, a) => a.indexOf(p) === i && isDir(p),
  );
}

export function describeCopy(dir: string): SkillCopy {
  const skillMd = join(dir, "SKILL.md");
  const text = isFile(skillMd) ? readText(skillMd) : "";
  const fm = parseFrontmatter(text).frontmatter;
  const th = treeHash(dir);
  const v = fm?.version ?? (fm?.metadata as Record<string, unknown> | undefined)?.version;
  return { path: dir, tree_sha256: th.hash, files: th.files, skill_md_lines: text ? text.split("\n").length : 0, declared_version: v ? String(v) : null };
}

export function locateSkill(name: string, roots: string[]): string[] {
  const found: string[] = [];
  for (const r of roots) {
    for (const f of walkFiles(r, { maxDepth: 7 })) {
      if (basename(f) === "SKILL.md" && basename(dirname(f)) === name) found.push(dirname(f));
    }
  }
  return [...new Set(found)].sort();
}

/** Compara cópias: drift = mais de um hash distinto entre as cópias encontradas/fornecidas. */
export function fingerprint(opts: { name?: string; paths?: string[]; roots: string[] }) {
  const dirs = [...(opts.paths ?? []).map((p) => (basename(p) === "SKILL.md" ? dirname(p) : p)), ...(opts.name ? locateSkill(opts.name, opts.roots) : [])];
  const unique = [...new Set(dirs)].filter((d) => existsSync(d));
  const copies = unique.map(describeCopy);
  const hashes = new Set(copies.map((c) => c.tree_sha256));
  return {
    name: opts.name ?? null,
    searched_roots: opts.roots,
    copies,
    distinct_versions: hashes.size,
    drift: hashes.size > 1,
    skill_version: hashes.size === 1 ? `sha256:${[...hashes][0]!.slice(0, 16)}` : null,
    note:
      copies.length === 0
        ? "nenhuma cópia encontrada — 'não achei' ≠ 'não existe' (I-02); informe paths ou MAESTRO_SKILL_ROOTS"
        : hashes.size > 1
          ? "DRIFT: cópias divergem — registre decisão (qual é canônica) antes de usar; não escolher em silêncio (I-08)"
          : "cópias idênticas",
  };
}
