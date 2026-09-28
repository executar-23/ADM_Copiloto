// Resolução do workspace do Maestro: onde vivem ledger, catálogo, mapa e ingestão.
import { dirname, join, resolve } from "node:path";
import { existsSync } from "node:fs";

export const PATHS = {
  estadoJson: "07-execucao/estado.json",
  estadoMd: "07-execucao/ESTADO.md",
  execucaoDir: "07-execucao",
  catalogDir: "catalog/components",
  catalogMd: "catalog/CATALOG.md",
  catalogSchemaDir: "catalog/schema",
  routingJson: "mapa/roteamento.json",
  routingMd: "mapa/roteamento.md",
  ingestionInbox: "ingestion/inbox",
  ingestionReceived: "ingestion/received",
  ingestionRecords: "ingestion/records",
  ingestionTemplate: "ingestion/TEMPLATE.md",
  upstreamDir: "vendor/upstream",
  contratosDir: "contratos",
  mcpJson: ".mcp.json",
  hooksJson: "hooks/hooks.json",
  pluginJson: ".claude-plugin/plugin.json",
} as const;

/** Arquivos gerados a partir de uma fonte canônica — nunca editar à mão. */
export const GENERATED_FILES = [PATHS.estadoMd, PATHS.catalogMd, PATHS.routingMd] as const;

export interface Workspace {
  root: string;
  /** De onde veio a resolução — útil para diagnosticar. */
  source: "env" | "cwd" | "plugin-root" | "cwd-uninitialized";
  readOnly: boolean;
  hasEstado: boolean;
  hasCatalog: boolean;
}

function markers(dir: string) {
  return {
    hasEstado: existsSync(join(dir, PATHS.estadoJson)),
    hasCatalog: existsSync(join(dir, PATHS.catalogDir)),
  };
}

function findUp(start: string): string | null {
  let dir = resolve(start);
  for (;;) {
    const m = markers(dir);
    if (m.hasEstado || m.hasCatalog) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Ordem: MAESTRO_WORKSPACE → cwd (subindo diretórios) → CLAUDE_PROJECT_DIR →
 * CLAUDE_PLUGIN_ROOT (somente leitura) → cwd não inicializado.
 */
export function resolveWorkspace(opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): Workspace {
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  if (env.MAESTRO_WORKSPACE) {
    const root = resolve(env.MAESTRO_WORKSPACE);
    return { root, source: "env", readOnly: false, ...markers(root) };
  }
  for (const start of [cwd, env.CLAUDE_PROJECT_DIR].filter(Boolean) as string[]) {
    const found = findUp(start);
    if (found) return { root: found, source: "cwd", readOnly: false, ...markers(found) };
  }
  if (env.CLAUDE_PLUGIN_ROOT && existsSync(join(env.CLAUDE_PLUGIN_ROOT, PATHS.catalogDir))) {
    const root = resolve(env.CLAUDE_PLUGIN_ROOT);
    return { root, source: "plugin-root", readOnly: true, ...markers(root) };
  }
  const root = resolve(env.CLAUDE_PROJECT_DIR ?? cwd);
  return { root, source: "cwd-uninitialized", readOnly: false, ...markers(root) };
}

export function wsPath(ws: Workspace | string, rel: string): string {
  return join(typeof ws === "string" ? ws : ws.root, rel);
}
