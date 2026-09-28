// SessionStart: injeta o estado do Maestro para o usuário não precisar explicar nada (EV-014).
import { readInput, maestroWorkspace } from "./io.ts";
import { loadEstado } from "../lib/estado/store.ts";
import { nextEligible } from "../lib/estado/machine.ts";
import { loadCatalog } from "../lib/catalog/store.ts";

const input = readInput();
const ws = maestroWorkspace(input);
if (!ws) process.exit(0);

const lines: string[] = [`Maestro (plugin) ativo neste workspace: ${ws.root}`];
try {
  if (ws.hasEstado) {
    const e = loadEstado(ws);
    const nx = nextEligible(e);
    const abertas = e.decisoes.filter((d) => d.tipo === "decisao" && (d.status === "ABERTA" || d.status === "PARCIAL"));
    lines.push(
      `- Ledger canônico: 07-execucao/estado.json (vocabulário BACKLOG_VALIDATED·READY·DOING·VERIFY·DONE·BLOCKED; WIP=1).`,
      `- Nó ativo (WIP): ${nx.active ? `${nx.active.id} — ${nx.active.titulo}` : "nenhum"}.`,
      `- Próximo elegível: ${nx.next ? `${nx.next.id} — ${nx.next.titulo}` : "nenhum"}.`,
      `- Aguardando verificação: ${nx.awaitingVerify.map((n) => n.id).join(", ") || "nenhum"}.`,
      `- Aguardando ação do usuário: ${nx.userAction.map((n) => n.id).join(", ") || "nenhum"}.`,
      `- Decisões abertas: ${abertas.map((d) => d.id).join(", ") || "nenhuma"}.`,
    );
  }
  if (ws.hasCatalog) lines.push(`- Catálogo: ${loadCatalog(ws.root).entries.length} componentes (catalog/CATALOG.md).`);
  lines.push(
    "Comandos: /maestro:estado · /maestro:executar [nó|intenção] · /maestro:verificar <nó> · /maestro:decidir <D#> · /maestro:ingerir <caminho> · /maestro:validar · /maestro:catalogo.",
    "Regras invioláveis: contratos/C-00-invariantes-comuns.md (nunca inventar → 'A DEFINIR'; DONE exige evidência; ação externa exige aprovação explícita).",
  );
} catch (e) {
  lines.push(`- Aviso: não foi possível ler o estado (${(e as Error).message}). Rode /maestro:validar.`);
}
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: lines.join("\n") } }));
