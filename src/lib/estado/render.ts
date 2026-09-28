// Projeção legível do ledger. É derivada: nunca editar ESTADO.md à mão (I-06).
import { STATUS_LABEL, type Estado, type Node } from "./schema.ts";
import { nextEligible, progress } from "./machine.ts";

const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

function statusCell(n: Node): string {
  const l = STATUS_LABEL[n.status];
  let s = `${l.simbolo} ${l.pt}`;
  if (n.status === "BLOCKED" && n.motivo_bloqueio) s += ` · \`${n.motivo_bloqueio.codigo}\``;
  if (n.decisao) s += ` · ${n.decisao}`;
  return s;
}

function evidenceCell(n: Node): string {
  if (!n.evidencias.length) return "";
  return n.evidencias.map((e) => e.caminho ?? e.url ?? e.id).map((x) => `\`${esc(x)}\``).join(", ");
}

function nodeTable(nodes: Node[], withLiteral: boolean): string {
  const head = withLiteral
    ? "| Nó | Literal | Status | Dono | Depende de | Skill | Evidência |\n|---|---|---|---|---|---|---|"
    : "| Nó | Título | Status | Dono | Depende de | Skill | Evidência |\n|---|---|---|---|---|---|---|";
  const rows = nodes.map(
    (n) =>
      `| ${n.id} | ${esc(withLiteral ? (n.literal ?? n.titulo) : n.titulo)} | ${statusCell(n)} | ${n.dono_canonico} | ${n.depends_on.join(", ") || "—"} | ${n.skill ? `\`${esc(n.skill)}\`` : "—"} | ${evidenceCell(n)} |`,
  );
  return [head, ...rows].join("\n");
}

export function renderEstadoMd(estado: Estado): string {
  const { active, next, userAction, awaitingVerify } = nextEligible(estado);
  const prog = progress(estado);
  const out: string[] = [];
  out.push(`# ESTADO DO MAESTRO — ${esc(estado.projeto.nome)}`);
  out.push("");
  out.push("> **Projeção gerada de `07-execucao/estado.json` (fonte canônica, C-01). Não editar à mão** — use as ferramentas MCP do servidor `estado` ou `/maestro:*`.");
  out.push("> Vocabulário canônico: `BACKLOG_VALIDATED · READY · DOING · VERIFY · DONE · BLOCKED` (rótulos PT: VALIDADO ⬜ · PRONTO ⬜ · EM EXECUÇÃO 🔄 · VERIFICAR 🔎 · CONCLUÍDO ✅ · BLOQUEADO ⛔).");
  out.push("> **WIP = 1.** Nenhum nó vira ✅ sem evidência (I-04). Progresso é derivado (I-09).");
  out.push("");
  out.push(`**Última atualização:** ${estado.atualizado_em}`);
  out.push(`**Nó ativo (WIP):** ${active ? `${active.id} — ${esc(active.titulo)}` : "nenhum"}`);
  out.push(`**Próximo elegível:** ${next ? `${next.id} — ${esc(next.titulo)}` : "nenhum (ver bloqueios)"}`);
  out.push(
    `**Progresso derivado:** Trilha S ${prog.S!.concluidos}/${prog.S!.habilitados} (${prog.S!.percentual}%) · Trilha L ${prog.L!.concluidos}/${prog.L!.habilitados} (${prog.L!.percentual}%)`,
  );
  out.push("");

  const groups: [string, (n: Node) => boolean, boolean][] = [
    ["Trilha S — Construir o Maestro", (n) => n.trilha === "S" && n.tipo === "estagio", false],
    ["Trilha S — Ingestões e tarefas", (n) => n.trilha === "S" && (n.tipo === "ingestao" || n.tipo === "tarefa"), false],
    ["Trilha L — Operar o lançamento (PEM-D16) — abre só após gate de E6", (n) => n.trilha === "L" && n.tipo !== "ficha", true],
  ];
  for (const [title, pred, lit] of groups) {
    const nodes = estado.nos.filter(pred);
    if (!nodes.length) continue;
    out.push(`## ${title}`, "", nodeTable(nodes, lit), "");
  }

  const ficha = estado.nos.find((n) => n.tipo === "ficha");
  if (ficha) {
    out.push(`## Ficha de caracterização — nó \`${ficha.id}\` (${statusCell(ficha)})`, "");
    const pontos = (ficha.dados?.pontos as Array<Record<string, string>> | undefined) ?? [];
    if (pontos.length) {
      out.push("| # | Resumo | Status | Fonte | Classe | Depende de |", "|---|---|---|---|---|---|");
      for (const p of pontos) {
        out.push(
          `| ${esc(p.ponto ?? "")} | ${esc(p.resumo ?? "")} | ${esc(p.status ?? "")} | ${esc(p.fonte ?? "")} | ${esc(p.classe_evidencia ?? "")} | ${esc(p.depende_de ?? "—")} |`,
        );
      }
      out.push("");
    }
  }

  if (awaitingVerify.length) {
    out.push("## Aguardando verificação 🔎", "");
    for (const n of awaitingVerify) out.push(`- **${n.id}** — ${esc(n.titulo)} · dod: ${esc(n.dod)}`);
    out.push("");
  }

  out.push("## Bloqueios", "");
  const blocked = estado.nos.filter((n) => n.status === "BLOCKED");
  if (!blocked.length) out.push("(nenhum)");
  for (const n of blocked) {
    out.push(`- **${n.id}** \`${n.motivo_bloqueio?.codigo ?? "?"}\` — ${esc(n.motivo_bloqueio?.detalhe ?? "")}`);
  }
  if (userAction.length) out.push("", `> ${userAction.length} nó(s) aguardam **ação do usuário**.`);
  out.push("");

  const byTipo = (t: string) => estado.decisoes.filter((d) => d.tipo === t);
  const decisions = byTipo("decisao");
  if (decisions.length) {
    out.push("## Decisões", "", "| # | Decisão | Onde | Status | Resposta / recomendação | Fonte | Data |", "|---|---|---|---|---|---|---|");
    for (const d of decisions) {
      const resp = d.resposta ? `**${esc(d.resposta)}**` : d.recomendacao ? `_recomendação:_ ${esc(d.recomendacao)}` : "";
      out.push(`| ${d.id} | ${esc(d.titulo)} | ${esc(d.onde ?? "")} | ${d.status} | ${resp} | ${esc(d.fonte ?? "")} | ${d.data ?? ""} |`);
    }
    out.push("");
  }
  const divs = byTipo("divergencia");
  if (divs.length) {
    out.push("## Divergências registradas (I-08)", "");
    for (const d of divs) out.push(`- **${d.id}** (${d.status}) — ${esc(d.titulo)}${d.resposta ? ` → ${esc(d.resposta)}` : ""}`);
    out.push("");
  }
  const ccs = byTipo("change-control");
  out.push("## Log de mudanças de contrato (change control)", "");
  if (!ccs.length) out.push("(vazio)");
  for (const d of ccs) {
    out.push(`### ${d.id} — ${esc(d.titulo)} (${d.status})`, "");
    for (const [k, v] of Object.entries(d.detalhes ?? {})) out.push(`- **${k}:** ${esc(v)}`);
    out.push("");
  }
  return `${out.join("\n").trimEnd()}\n`;
}
