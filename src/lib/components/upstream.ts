// COMPARE: índice dos componentes dos upstreams oficiais (vendor/upstream, somente leitura).
import { execFileSync } from "node:child_process";
import { basename, dirname, join, relative } from "node:path";
import { readdirSync } from "node:fs";
import { parseFrontmatter } from "./frontmatter.ts";
import { PATHS } from "../workspace.ts";
import { existsSync, isDir, queryScore, readText, toPosix, truncate, walkFiles } from "../util.ts";

export interface UpstreamItem {
  repo: string;
  sha: string | null;
  plugin: string | null;
  type: "skill" | "agent" | "command";
  name: string;
  path: string;
  description: string;
}

export class UpstreamNotInitialized extends Error {}

export function upstreamRepos(root: string): { repo: string; dir: string; initialized: boolean; sha: string | null }[] {
  const base = join(root, PATHS.upstreamDir);
  if (!isDir(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const dir = join(base, e.name);
      const initialized = readdirSync(dir).length > 0;
      let sha: string | null = null;
      if (initialized) {
        try {
          sha = execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
        } catch {
          sha = null;
        }
      }
      return { repo: e.name, dir, initialized, sha };
    });
}

const cache = new Map<string, UpstreamItem[]>();

export function buildUpstreamIndex(root: string): UpstreamItem[] {
  const key = root;
  const hit = cache.get(key);
  if (hit) return hit;
  const repos = upstreamRepos(root);
  if (!repos.length || repos.every((r) => !r.initialized)) {
    throw new UpstreamNotInitialized("upstream não inicializado em vendor/upstream — rode `npm run upstream:sync` (git submodule update --init --depth 1)");
  }
  const items: UpstreamItem[] = [];
  for (const r of repos.filter((x) => x.initialized)) {
    for (const f of walkFiles(r.dir, { maxDepth: 8 })) {
      const rel = toPosix(relative(r.dir, f));
      const b = basename(f);
      let type: UpstreamItem["type"] | null = null;
      if (b === "SKILL.md") type = "skill";
      else if (b.endsWith(".md") && basename(dirname(f)) === "agents") type = "agent";
      else if (b.endsWith(".md") && basename(dirname(f)) === "commands") type = "command";
      if (!type) continue;
      const { frontmatter: fm } = parseFrontmatter(readText(f));
      const name = type === "skill" ? basename(dirname(f)) : basename(f, ".md");
      const m = /^(?:plugins\/|external_plugins\/)?([^/]+)\//.exec(rel);
      items.push({
        repo: r.repo,
        sha: r.sha,
        plugin: m ? m[1]! : null,
        type,
        name,
        path: toPosix(join(PATHS.upstreamDir, r.repo, rel)),
        description: truncate(typeof fm?.description === "string" ? fm.description.replace(/\s+/g, " ") : "", 400),
      });
    }
  }
  cache.set(key, items);
  return items;
}

export function searchUpstream(root: string, query: string, opts: { type?: string; repo?: string; limit?: number } = {}) {
  const idx = buildUpstreamIndex(root);
  return idx
    .filter((i) => (!opts.type || i.type === opts.type) && (!opts.repo || i.repo === opts.repo))
    .map((i) => ({ ...i, score: Math.round(queryScore(query, `${i.name.replace(/-/g, " ")} ${i.plugin ?? ""} ${i.description}`) * 100) / 100 }))
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit ?? 10);
}

export { existsSync };
