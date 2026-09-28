// VALIDATE: agrega todas as verificações do workspace (usado por MCP, CLI, hooks e testes).
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { catalogMdInSync, loadCatalog } from "./catalog/store.ts";
import { discoverPluginComponents } from "./components/discover.ts";
import { lintComponent } from "./components/lint.ts";
import { validateEstadoWorkspace, type Finding } from "./estado/validate.ts";
import { validateRecords } from "./ingestion/ingestion.ts";
import { validateRouting } from "./routing/routing.ts";
import { PATHS } from "./workspace.ts";
import { existsSync, readJson } from "./util.ts";
import { PLUGIN_NAME } from "../mcp/manifest.ts";

export interface ValidationReport {
  ok: boolean;
  root: string;
  is_plugin_root: boolean;
  errors: Finding[];
  warnings: Finding[];
  summary: Record<string, number | string>;
}

function gitlinkSha(root: string, path: string): string | null {
  try {
    const out = execFileSync("git", ["-C", root, "ls-files", "-s", path], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const m = /^160000 ([0-9a-f]{40}) /.exec(out);
    return m ? m[1]! : null;
  } catch {
    return null;
  }
}

export function isPluginRoot(root: string): boolean {
  const p = join(root, PATHS.pluginJson);
  if (!existsSync(p)) return false;
  try {
    return readJson<{ name?: string }>(p).name === PLUGIN_NAME;
  } catch {
    return false;
  }
}

export function validateWorkspace(root: string): ValidationReport {
  const all: Finding[] = [];
  const pluginRoot = isPluginRoot(root);
  const { entries, findings: catFindings } = loadCatalog(root);
  all.push(...catFindings);

  let disk = 0;
  if (pluginRoot) {
    const { components, findings } = discoverPluginComponents(root);
    disk = components.length;
    all.push(...findings);
    const byId = new Map(entries.map((e) => [e.record.id, e.record]));
    for (const c of components) {
      const rec = byId.get(c.id);
      if (!rec) {
        all.push({ level: "error", code: "UNREGISTERED", message: `${c.id} (${c.path}) existe no plugin mas não está no catálogo — passe pelo pipeline (REGISTER)`, ref: c.path });
        continue;
      }
      if (rec.status === "deprecated" || rec.status === "reference") {
        all.push({ level: "warning", code: "STATUS_MISMATCH", message: `${c.id} carregado pelo plugin mas catalogado como ${rec.status}`, ref: c.path });
      }
      if (["agent", "skill", "command"].includes(c.type) && rec.path !== c.path) {
        all.push({ level: "error", code: "PATH_MISMATCH", message: `${c.id}: catálogo diz ${rec.path}, disco tem ${c.path}`, ref: c.path });
      }
      if (c.type === "agent" || c.type === "skill" || c.type === "command") {
        all.push(...lintComponent(c.type, join(root, c.path), { pluginRoot: root, label: c.path }));
      }
    }
    const diskIds = new Set(components.map((c) => c.id));
    for (const { record: r } of entries) {
      const loadable = ["agent", "skill", "command", "hook", "mcp-server", "mcp-tool"].includes(r.type);
      if (loadable && (r.status === "active" || r.status === "experimental") && !diskIds.has(r.id)) {
        all.push({ level: "error", code: "MISSING_ON_DISK", message: `${r.id} está ${r.status} no catálogo mas não é carregado pelo plugin`, ref: r.id });
      }
      if (r.type === "upstream-reference" && r.path) {
        const sha = gitlinkSha(root, r.path);
        if (sha && r.origin.sha !== sha) {
          all.push({ level: "error", code: "UPSTREAM_PIN", message: `${r.id}: catálogo fixa ${r.origin.sha}, submodule aponta ${sha} — rode o COMPARE da atualização e atualize o registro`, ref: r.id });
        }
      }
    }
    const pj = readJson<{ version?: string }>(join(root, PATHS.pluginJson));
    const pkgPath = join(root, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = readJson<{ version?: string }>(pkgPath);
      if (pkg.version !== pj.version) all.push({ level: "error", code: "VERSION", message: `plugin.json ${pj.version} ≠ package.json ${pkg.version}` });
    }
  }
  if (existsSync(join(root, PATHS.catalogDir)) && !catalogMdInSync(root)) {
    all.push({ level: "error", code: "CATALOG_PROJECTION", message: `${PATHS.catalogMd} ausente ou divergente — rode \`npm run render\`` });
  }
  all.push(...validateEstadoWorkspace(root));
  all.push(...validateRouting(root));
  all.push(...validateRecords(root));

  const errors = all.filter((f) => f.level === "error");
  const warnings = all.filter((f) => f.level === "warning");
  return {
    ok: errors.length === 0,
    root,
    is_plugin_root: pluginRoot,
    errors,
    warnings,
    summary: { catalogo: entries.length, componentes_no_disco: disk, erros: errors.length, avisos: warnings.length },
  };
}
