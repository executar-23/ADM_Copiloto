// CLI de desenvolvimento/CI: `node dist/cli/maestro.js <comando>`.
import { resolve } from "node:path";
import { z } from "zod";
import { validateWorkspace } from "../lib/validate.ts";
import { renderAll } from "../lib/render.ts";
import { resolveWorkspace, PATHS } from "../lib/workspace.ts";
import { loadEstado } from "../lib/estado/store.ts";
import { nextEligible, progress } from "../lib/estado/machine.ts";
import { loadCatalog } from "../lib/catalog/store.ts";
import { ComponentSchema } from "../lib/catalog/schema.ts";
import { EstadoSchema } from "../lib/estado/schema.ts";
import { RoutingSchema } from "../lib/routing/routing.ts";
import { writeJsonAtomic } from "../lib/util.ts";

const [cmd = "help", ...args] = process.argv.slice(2);
const flag = (f: string) => args.includes(f);
const rootArg = args.find((a) => !a.startsWith("--"));
const root = rootArg ? resolve(rootArg) : resolveWorkspace().root;

function printFindings(title: string, list: { code: string; message: string }[]) {
  if (!list.length) return;
  console.log(`\n${title} (${list.length}):`);
  for (const f of list) console.log(`  [${f.code}] ${f.message}`);
}

switch (cmd) {
  case "validate": {
    const rep = validateWorkspace(root);
    if (flag("--json")) console.log(JSON.stringify(rep, null, 2));
    else {
      console.log(`maestro validate — ${root}`);
      console.log(`catálogo: ${rep.summary.catalogo} · componentes no disco: ${rep.summary.componentes_no_disco}`);
      printFindings("ERROS", rep.errors);
      printFindings("avisos", rep.warnings);
      console.log(rep.ok ? "\n✔ workspace válido" : "\n✖ workspace inválido");
    }
    process.exit(rep.ok ? 0 : 1);
  }
  case "render": {
    const done = renderAll(root);
    console.log(`projeções regeneradas: ${done.join(", ") || "nenhuma"}`);
    break;
  }
  case "schema": {
    const out = resolve(root, PATHS.catalogSchemaDir);
    writeJsonAtomic(`${out}/component.schema.json`, z.toJSONSchema(ComponentSchema, { io: "input", unrepresentable: "any" }));
    writeJsonAtomic(`${out}/estado.schema.json`, z.toJSONSchema(EstadoSchema, { io: "input", unrepresentable: "any" }));
    writeJsonAtomic(`${out}/roteamento.schema.json`, z.toJSONSchema(RoutingSchema, { io: "input", unrepresentable: "any" }));
    console.log(`JSON Schemas exportados em ${PATHS.catalogSchemaDir}/`);
    break;
  }
  case "estado": {
    const e = loadEstado(root);
    const nx = nextEligible(e);
    console.log(JSON.stringify({ wip: nx.active?.id ?? null, proximo: nx.next?.id ?? null, verificar: nx.awaitingVerify.map((n) => n.id), usuario: nx.userAction.map((n) => n.id), progresso: progress(e) }, null, 2));
    break;
  }
  case "catalog": {
    for (const { record: r } of loadCatalog(root).entries) console.log(`${r.id.padEnd(48)} ${r.status.padEnd(12)} ${r.version}`);
    break;
  }
  default:
    console.log("uso: maestro <validate [--json] | render | schema | estado | catalog> [raiz]");
}
