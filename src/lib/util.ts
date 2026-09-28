// Utilitários sem dependência de domínio: arquivos, hashing, glob, texto.
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";

export const nowIso = (): string => new Date().toISOString();
export const today = (): string => new Date().toISOString().slice(0, 10);

export function readText(path: string): string {
  return readFileSync(path, "utf8");
}

export function readJson<T = unknown>(path: string): T {
  return JSON.parse(readText(path)) as T;
}

/** Escrita atômica (tmp + rename) para nunca deixar um JSON pela metade. */
export function writeTextAtomic(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, content, "utf8");
  renameSync(tmp, path);
}

export function writeJsonAtomic(path: string, data: unknown): void {
  writeTextAtomic(path, `${JSON.stringify(data, null, 2)}\n`);
}

export function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

export function isDir(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export { existsSync };

const SKIP_DIRS = new Set([".git", "node_modules", "__MACOSX", ".tmp"]);

/** Lista arquivos recursivamente (caminhos absolutos), ordenados, ignorando .git/node_modules. */
export function walkFiles(root: string, opts: { maxDepth?: number; skip?: Set<string> } = {}): string[] {
  const out: string[] = [];
  const maxDepth = opts.maxDepth ?? 32;
  const skip = opts.skip ?? SKIP_DIRS;
  const visit = (dir: string, depth: number) => {
    if (depth > maxDepth) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (skip.has(e.name) || e.name === ".DS_Store") continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) visit(full, depth + 1);
      else if (e.isFile()) out.push(full);
    }
  };
  if (isFile(root)) return [root];
  visit(root, 0);
  return out;
}

/** Hash determinístico de uma árvore: sha256 de "caminho-relativo\0sha256(conteúdo)\n" ordenado. */
export function treeHash(root: string): { hash: string; files: number } {
  const files = walkFiles(root);
  const base = isFile(root) ? dirname(root) : root;
  const lines = files.map((f) => `${toPosix(relative(base, f))}\0${sha256(readFileSync(f))}`);
  return { hash: sha256(lines.join("\n")), files: files.length };
}

export function toPosix(p: string): string {
  return p.split(sep).join("/");
}

/** Converte glob simples (`**`, `*`, `?`) em RegExp ancorada. */
export function globToRegExp(glob: string): RegExp {
  let re = "";
  const g = toPosix(glob).replace(/^\.\//, "");
  for (let i = 0; i < g.length; i++) {
    const c = g[i]!;
    if (c === "*") {
      if (g[i + 1] === "*") {
        const slash = g[i + 2] === "/";
        re += slash ? "(?:.*/)?" : ".*";
        i += slash ? 2 : 1;
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else if ("\\^$+.()|{}[]".includes(c)) {
      re += `\\${c}`;
    } else {
      re += c;
    }
  }
  // "dir/" casa com tudo abaixo de dir
  if (g.endsWith("/")) re += ".*";
  return new RegExp(`^${re}$`);
}

export function matchesAnyGlob(relPath: string, globs: readonly string[]): boolean {
  const p = toPosix(relPath).replace(/^\.\//, "");
  return globs.some((g) => globToRegExp(g).test(p));
}

const STOPWORDS = new Set(
  (
    "a o e de da do das dos em para por com sem um uma uns umas que se no na nos nas ao aos " +
    "the and or of to in for with on by is are be this that use when used using an as it from " +
    "skill agent command should user asks asked must can will ou mas como mais quando usar use"
  ).split(" "),
);

export function tokens(text: string): Set<string> {
  const norm = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ");
  return new Set(norm.split(" ").filter((t) => t.length > 2 && !STOPWORDS.has(t)));
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

/** Pontuação de busca: fração dos termos da consulta presentes no texto. */
export function queryScore(query: string, text: string): number {
  const q = tokens(query);
  if (q.size === 0) return 0;
  const t = tokens(text);
  let hit = 0;
  for (const w of q) if (t.has(w)) hit++;
  return hit / q.size;
}

export function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
