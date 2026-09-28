// Frontmatter YAML de agents, skills e commands.
import { parse } from "yaml";

export interface Parsed {
  frontmatter: Record<string, unknown> | null;
  body: string;
  error?: string;
}

export function parseFrontmatter(text: string): Parsed {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { frontmatter: null, body: text };
  try {
    const fm = parse(m[1]!) as unknown;
    if (fm === null || typeof fm !== "object" || Array.isArray(fm)) {
      return { frontmatter: null, body: m[2]!, error: "frontmatter não é um objeto YAML" };
    }
    return { frontmatter: fm as Record<string, unknown>, body: m[2]! };
  } catch (e) {
    return { frontmatter: null, body: m[2]!, error: `YAML inválido: ${(e as Error).message}` };
  }
}

/** Normaliza `tools`/`allowed-tools` (string CSV ou lista) em lista. */
export function toolList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    // separa por vírgula fora de parênteses: "Agent(a, b), Read" → ["Agent(a, b)", "Read"]
    const out: string[] = [];
    let depth = 0;
    let cur = "";
    for (const ch of v) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out.filter(Boolean);
  }
  return [];
}

export function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}
