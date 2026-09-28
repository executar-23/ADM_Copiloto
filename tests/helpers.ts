// Utilidades de teste: workspaces temporários, execução de hooks e cliente MCP real (stdio).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { NodeSchema, type Estado, type Node } from "../src/lib/estado/schema.ts";
import { newEstado, saveEstado } from "../src/lib/estado/store.ts";

export const REPO = resolve(import.meta.dirname, "..");
export const DIST = join(REPO, "dist");

export function tmpDir(prefix = "maestro-test-"): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function write(root: string, rel: string, content: string): string {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  return p;
}

export function node(partial: Partial<Node> & Pick<Node, "id">): Node {
  const em = new Date().toISOString();
  return NodeSchema.parse({
    trilha: "S",
    tipo: "tarefa",
    titulo: `nó ${partial.id}`,
    status: "BACKLOG_VALIDATED",
    dono_canonico: "repo",
    dod: "arquivo X existe e foi revisado",
    historico: [{ em, de: null, para: partial.status ?? "BACKLOG_VALIDATED", motivo: "teste", ator: "maestro" }],
    atualizado_em: em,
    ...partial,
  });
}

export function estadoWith(nodes: Node[]): Estado {
  const e = newEstado({ id: "TEST", nome: "Teste" });
  e.nos = nodes;
  return e;
}

/** Workspace temporário com ledger (e projeção) já gravados. */
export function makeWorkspace(nodes: Node[] = [node({ id: "A", status: "READY" }), node({ id: "B", depends_on: ["A"] })]): string {
  const root = tmpDir();
  saveEstado(root, estadoWith(nodes));
  mkdirSync(join(root, "catalog", "components"), { recursive: true });
  return root;
}

export function requireDist(rel: string): string {
  const p = join(DIST, rel);
  if (!existsSync(p)) throw new Error(`${p} não existe — rode 'npm run build' antes dos testes`);
  return p;
}

export function runHook(name: string, input: unknown, env: NodeJS.ProcessEnv = {}) {
  const script = requireDist(`hooks/${name}.js`);
  const r = spawnSync(process.execPath, [script], {
    input: JSON.stringify(input),
    encoding: "utf8",
    env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env },
  });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

export async function mcpClient(server: "estado" | "registry", env: Record<string, string>) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [requireDist(`mcp/${server}.js`)],
    env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", ...env },
    stderr: "pipe",
  });
  const client = new Client({ name: "maestro-tests", version: "0.0.0" });
  await client.connect(transport);
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const r = (await client.callTool({ name, arguments: args })) as { isError?: boolean; structuredContent?: Record<string, unknown>; content: Array<{ text?: string }> };
    return { isError: r.isError === true, data: r.structuredContent ?? {}, text: r.content.map((c) => c.text ?? "").join("\n") };
  };
  return { client, call, close: () => client.close() };
}

/** Registro de catálogo válido (skill adaptada) para testes. */
export const skillRecord = (over: Record<string, unknown> = {}) => ({
  id: "skill:exemplo",
  name: "exemplo",
  type: "skill",
  path: "skills/exemplo/SKILL.md",
  origin: { kind: "adapted", source: "ING-0009: lote/exemplo" },
  responsibility: "Faz uma coisa útil para o teste.",
  status: "experimental",
  version: "0.1.0",
  integration: { date: "2026-09-28", reason: "teste de schema", ingestion: "ING-0009" },
  anti_overkill: { reuso: "nada equivalente no catálogo", necessidade: "entrega X exige isto", custo: "1 arquivo", reversao: "apagar o diretório" },
  ...over,
});
