// CHECK CONFLICTS / COMPARE: colisões de nome e namespace + candidatos a duplicação.
import { jaccard, tokens } from "../util.ts";
import type { Component } from "../catalog/schema.ts";

export interface Candidate {
  type: string;
  name: string;
  description?: string;
}

export interface ConflictReport {
  candidate: Candidate;
  collisions: { id: string; kind: "mesmo-id" | "namespace-slash" | "mesmo-nome-outro-tipo"; detail: string }[];
  duplicates: { id: string; score: number; responsibility: string }[];
  verdict: "sem-conflito" | "revisar" | "conflito";
}

/** Skills e commands compartilham o namespace `/maestro:<nome>`. */
const SLASH_TYPES = new Set(["skill", "command"]);

export function checkConflicts(candidates: Candidate[], catalog: Component[], threshold = 0.3): ConflictReport[] {
  const reports: ConflictReport[] = [];
  const batchNames = new Map<string, Candidate>();
  for (const c of candidates) {
    const collisions: ConflictReport["collisions"] = [];
    for (const r of catalog) {
      if (r.name !== c.name) continue;
      if (r.type === c.type) collisions.push({ id: r.id, kind: "mesmo-id", detail: `já existe ${r.id} (${r.status})` });
      else if (SLASH_TYPES.has(r.type) && SLASH_TYPES.has(c.type)) {
        collisions.push({ id: r.id, kind: "namespace-slash", detail: `/${"maestro"}:${c.name} já é usado por ${r.id}` });
      } else collisions.push({ id: r.id, kind: "mesmo-nome-outro-tipo", detail: `nome também usado por ${r.id}` });
    }
    const key = `${SLASH_TYPES.has(c.type) ? "slash" : c.type}:${c.name}`;
    const prior = batchNames.get(key);
    if (prior) collisions.push({ id: `${prior.type}:${prior.name}`, kind: "mesmo-id", detail: "nome repetido dentro do próprio lote" });
    batchNames.set(key, c);

    const dt = tokens(`${c.name.replace(/-/g, " ")} ${c.description ?? ""}`);
    const duplicates = catalog
      .filter((r) => r.type !== "mcp-tool" && r.name !== c.name)
      .map((r) => ({ id: r.id, score: jaccard(dt, tokens(`${r.name.replace(/-/g, " ")} ${r.responsibility}`)), responsibility: r.responsibility }))
      .filter((d) => d.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((d) => ({ ...d, score: Math.round(d.score * 100) / 100 }));
    const hard = collisions.some((x) => x.kind !== "mesmo-nome-outro-tipo");
    reports.push({ candidate: c, collisions, duplicates, verdict: hard ? "conflito" : duplicates.length || collisions.length ? "revisar" : "sem-conflito" });
  }
  return reports;
}
