// PreToolUse (Write|Edit|MultiEdit|NotebookEdit): caminhos protegidos e escopo do nó ativo (C-04).
import { ask, block, maestroWorkspace, pass, readInput, relToWorkspace, targetPath } from "./io.ts";
import { GENERATED_FILES, PATHS } from "../lib/workspace.ts";
import { loadEstado } from "../lib/estado/store.ts";
import { activeNode } from "../lib/estado/machine.ts";
import { matchesAnyGlob } from "../lib/util.ts";

const input = readInput();
const ws = maestroWorkspace(input);
const file = targetPath(input);
if (!ws || !file) pass();

const rel = relToWorkspace(ws!, file!, input.cwd);
if (rel === null) pass();
const r = rel!;
const who = input.agent_type ? ` (subagente ${input.agent_type})` : "";

if (r.startsWith(`${PATHS.upstreamDir}/`)) {
  block(`${r}: upstream oficial é somente leitura${who}. Adapte num componente próprio via /maestro:ingerir; atualizar upstream = npm run upstream:sync + COMPARE.`);
}
if (r.startsWith(`${PATHS.ingestionReceived}/`)) {
  block(`${r}: originais recebidos são imutáveis (RECEIVE)${who}. Trabalhe no destino final durante ADAPT.`);
}
if (r === PATHS.estadoJson) {
  block(`${r}: o ledger canônico só muda pelas ferramentas MCP do servidor 'estado' (node_transition, evidence_add, …) — elas aplicam WIP=1 e I-04.`);
}
if ((GENERATED_FILES as readonly string[]).includes(r)) {
  block(`${r}: arquivo gerado a partir de uma fonte canônica — edite a fonte e rode 'npm run render'.`);
}
if (r.startsWith(`${PATHS.contratosDir}/`)) {
  ask(`${r}: mudança de contrato exige change control (decision_record tipo change-control com CURRENT→…→STATUS). Confirme que há um CC registrado.`);
}

try {
  if (ws!.hasEstado) {
    const n = activeNode(loadEstado(ws!));
    if (n && n.escopo_escrita.length && !r.startsWith(`${PATHS.execucaoDir}/`) && !matchesAnyGlob(r, n.escopo_escrita)) {
      block(`${r}: fora do escopo de escrita do nó ativo ${n.id} [${n.escopo_escrita.join(", ")}]${who} (C-04). Amplie o escopo com node_update ou bloqueie o nó.`);
    }
  }
} catch {
  // ledger ilegível não deve travar a edição; /maestro:validar reporta o problema.
}
pass();
