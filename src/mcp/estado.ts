// Servidor MCP `estado`: ledger único + máquina de estados do Maestro (C-01).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fail, ok, tool } from "./common.ts";
import { BLOCK_CODES, CHANGE_CONTROL_FIELDS, NodeSchema, STATUSES, STATUS_LABEL, type Decision, type Node } from "../lib/estado/schema.ts";
import { activeNode, findNode, nextEligible, openDeps, progress, transition, TransitionError } from "../lib/estado/machine.ts";
import { loadEstado, newEstado, saveEstado } from "../lib/estado/store.ts";
import { validateEstadoWorkspace } from "../lib/estado/validate.ts";
import { resolveWorkspace } from "../lib/workspace.ts";
import { existsSync, nowIso } from "../lib/util.ts";
import { join } from "node:path";
import { PATHS } from "../lib/workspace.ts";

const VERSION = "0.1.0";
const server = new McpServer({ name: "maestro-estado", version: VERSION });

const ws = () => resolveWorkspace();
const writable = () => {
  const w = ws();
  if (w.readOnly) throw new Error(`workspace somente leitura (${w.root}); abra o Claude Code no projeto ou defina MAESTRO_WORKSPACE`);
  return w;
};

const brief = (n: Node) => ({
  id: n.id,
  trilha: n.trilha,
  tipo: n.tipo,
  titulo: n.titulo,
  status: n.status,
  rotulo: `${STATUS_LABEL[n.status].simbolo} ${STATUS_LABEL[n.status].pt}`,
  lane: n.lane,
  skill: n.skill,
  depends_on: n.depends_on,
  dependencias_abertas: [] as string[],
  motivo_bloqueio: n.motivo_bloqueio,
  dod: n.dod,
  evidencias: n.evidencias.length,
});

const ator = z.string().min(2).describe("Quem age: 'maestro', 'usuario' ou o nome do subagente (ex.: qa-reviewer).");

tool(
  server,
  "estado",
  "state_summary",
  "Resumo do ledger do Maestro: nó ativo (WIP=1), próximo elegível, nós aguardando verificação, bloqueios (incl. USER_ACTION_REQUIRED), decisões abertas e progresso derivado por trilha. Ponto de partida de qualquer sessão. Não altera nada; para detalhes de um nó use node_get.",
  {},
  () => {
    const w = ws();
    const e = loadEstado(w);
    const nx = nextEligible(e);
    const abertas = e.decisoes.filter((d) => d.tipo === "decisao" && (d.status === "ABERTA" || d.status === "PARCIAL"));
    const data = {
      workspace: w.root,
      projeto: e.projeto,
      atualizado_em: e.atualizado_em,
      wip: nx.active ? brief(nx.active) : null,
      proximo_elegivel: nx.next ? brief(nx.next) : null,
      outros_elegiveis: nx.eligible.slice(1).map((n) => n.id),
      aguardando_verificacao: nx.awaitingVerify.map((n) => ({ id: n.id, titulo: n.titulo, dod: n.dod })),
      acao_do_usuario: nx.userAction.map((n) => ({ id: n.id, titulo: n.titulo, detalhe: n.motivo_bloqueio?.detalhe })),
      bloqueados: e.nos.filter((n) => n.status === "BLOCKED").map((n) => ({ id: n.id, codigo: n.motivo_bloqueio?.codigo })),
      decisoes_abertas: abertas.map((d) => ({ id: d.id, titulo: d.titulo, status: d.status, bloqueia: d.bloqueia })),
      progresso: progress(e),
    };
    return ok(data, `WIP: ${nx.active?.id ?? "nenhum"} · próximo: ${nx.next?.id ?? "nenhum"} · ${abertas.length} decisões abertas · ${nx.userAction.length} aguardam usuário`);
  },
);

tool(
  server,
  "estado",
  "node_list",
  "Lista nós do ledger com filtros opcionais (trilha S/L, status, tipo, lane). Retorna visão resumida; para o nó completo (histórico, evidências, dados da FICHA) use node_get.",
  {
    trilha: z.enum(["S", "L"]).optional(),
    status: z.enum(STATUSES).optional(),
    tipo: z.enum(["estagio", "fase", "tarefa", "ficha", "ingestao"]).optional(),
    lane: z.string().optional(),
  },
  (a) => {
    const e = loadEstado(ws());
    const nodes = e.nos
      .filter((n) => (!a.trilha || n.trilha === a.trilha) && (!a.status || n.status === a.status) && (!a.tipo || n.tipo === a.tipo) && (!a.lane || n.lane === a.lane))
      .map((n) => ({ ...brief(n), dependencias_abertas: openDeps(e, n) }));
    return ok({ total: nodes.length, nos: nodes });
  },
);

tool(
  server,
  "estado",
  "node_get",
  "Retorna um nó completo: dod, escopo de escrita, autorização, evidências, gaps, conflitos, histórico de transições, playbook e dados (a FICHA guarda os 22 pontos em dados.pontos).",
  { id: z.string().min(1) },
  (a) => {
    const e = loadEstado(ws());
    const n = findNode(e, a.id);
    return ok({ ...n, dependencias_abertas: openDeps(e, n) });
  },
);

tool(
  server,
  "estado",
  "node_next",
  "Resolve o próximo nó a trabalhar respeitando WIP=1 e dependências (dependência vence ordem numérica). Se houver nó em DOING, ele é o retorno. Não inicia nada — para iniciar use node_transition para DOING.",
  {},
  () => {
    const e = loadEstado(ws());
    const nx = nextEligible(e);
    if (nx.active) return ok({ modo: "continuar", no: nx.active }, `Nó ativo (WIP=1): ${nx.active.id}`);
    if (nx.next) return ok({ modo: "iniciar", no: nx.next, alternativas: nx.eligible.slice(1).map((n) => n.id) }, `Próximo elegível: ${nx.next.id}`);
    return ok(
      { modo: "sem-elegivel", aguardando_verificacao: nx.awaitingVerify.map((n) => n.id), acao_do_usuario: nx.userAction.map((n) => ({ id: n.id, detalhe: n.motivo_bloqueio?.detalhe })) },
      "Nenhum nó elegível — resolva verificações pendentes ou ações do usuário.",
    );
  },
);

tool(
  server,
  "estado",
  "decision_list",
  "Lista decisões (D#), divergências registradas (DIV-###) e mudanças de contrato (CC-###), com filtros por tipo e status.",
  {
    tipo: z.enum(["decisao", "divergencia", "change-control"]).optional(),
    status: z.enum(["ABERTA", "PARCIAL", "RESPONDIDA", "SUPERADA", "REGISTRADA"]).optional(),
  },
  (a) => {
    const e = loadEstado(ws());
    const list = e.decisoes.filter((d) => (!a.tipo || d.tipo === a.tipo) && (!a.status || d.status === a.status));
    return ok({ total: list.length, decisoes: list });
  },
);

tool(
  server,
  "estado",
  "state_validate",
  "Audita o ledger: WIP=1, DONE com evidência e dod, dependências existentes e sem ciclo, histórico coerente, projeção ESTADO.md em dia e ausência de ledger paralelo (EV-012). Somente leitura.",
  {},
  () => {
    const w = ws();
    const f = validateEstadoWorkspace(w.root);
    const errors = f.filter((x) => x.level === "error");
    return ok({ ok: errors.length === 0, erros: errors, avisos: f.filter((x) => x.level === "warning") }, errors.length ? `${errors.length} erro(s) no ledger` : "ledger válido");
  },
);

tool(
  server,
  "estado",
  "state_init",
  "Cria um ledger vazio (07-execucao/estado.json + ESTADO.md) no projeto atual, para operar o Maestro fora do repositório do plugin. Falha se já existir — nunca sobrescreve (I-06).",
  { projeto_id: z.string().min(2), projeto_nome: z.string().min(2) },
  (a) => {
    const w = writable();
    if (existsSync(join(w.root, PATHS.estadoJson))) return fail(`já existe ledger em ${w.root}/${PATHS.estadoJson}`);
    saveEstado(w, newEstado({ id: a.projeto_id, nome: a.projeto_nome }));
    return ok({ criado: `${w.root}/${PATHS.estadoJson}` }, "ledger criado");
  },
);

const nodeInput = {
  id: z.string().regex(/^[A-Z0-9][A-Za-z0-9._-]*$/).describe("Ex.: PEM-D16.F1.editorial.001, ING-0003, E5.T1"),
  trilha: z.enum(["S", "L"]),
  tipo: z.enum(["estagio", "fase", "tarefa", "ficha", "ingestao"]),
  titulo: z.string().min(2),
  dod: z.string().min(1).describe("Critério único de pronto (uma frase). Use 'A DEFINIR' se não houver base — nunca inventar."),
  dono_canonico: z.enum(["repo", "control-center"]).default("repo"),
  lane: z.string().optional(),
  skill: z.string().optional(),
  skill_version: z.string().optional(),
  playbook: z.string().optional(),
  depends_on: z.array(z.string()).default([]),
  efeito_externo: z.boolean().default(false).describe("true se concluir o nó publica/agenda/envia/faz deploy/escreve em conector (I-05)."),
  escopo_escrita: z.array(z.string()).default([]).describe("Globs onde o nó pode escrever (C-04); vazio = sem restrição adicional."),
  gaps: z.array(z.string()).default([]),
};

tool(
  server,
  "estado",
  "node_create",
  "Cria um nó novo em BACKLOG_VALIDATED (ou READY se as dependências já estão DONE). Use para decompor um estágio/fase em tarefas ou abrir o nó de uma ingestão. Não inicia o nó.",
  { ...nodeInput, motivo: z.string().min(3), ator },
  (a) => {
    const w = writable();
    const e = loadEstado(w);
    if (e.nos.some((n) => n.id === a.id)) return fail(`já existe nó ${a.id}`);
    const missing = a.depends_on.filter((d) => !e.nos.some((n) => n.id === d));
    if (missing.length) return fail(`dependências inexistentes: ${missing.join(", ")}`);
    const em = nowIso();
    const node = NodeSchema.parse({
      id: a.id,
      trilha: a.trilha,
      tipo: a.tipo,
      titulo: a.titulo,
      lane: a.lane ?? null,
      skill: a.skill ?? null,
      skill_version: a.skill_version ?? null,
      playbook: a.playbook ?? null,
      status: "BACKLOG_VALIDATED",
      dono_canonico: a.dono_canonico,
      depends_on: a.depends_on,
      dod: a.dod,
      efeito_externo: a.efeito_externo,
      escopo_escrita: a.escopo_escrita,
      gaps: a.gaps,
      historico: [{ em, de: null, para: "BACKLOG_VALIDATED", motivo: a.motivo, ator: a.ator }],
      atualizado_em: em,
    });
    e.nos.push(node);
    if (openDeps(e, node).length === 0) transition(e, { id: node.id, para: "READY", motivo: "dependências concluídas na criação", ator: a.ator });
    saveEstado(w, e);
    return ok(findNode(e, a.id), `nó ${a.id} criado em ${findNode(e, a.id).status}`);
  },
);

tool(
  server,
  "estado",
  "node_update",
  "Atualiza campos descritivos de um nó (dod, lane, skill, skill_version, playbook, output, escopo_escrita, gaps, conflitos, refs, dados). NÃO muda status (use node_transition), NÃO registra evidência (use evidence_add) e NÃO concede autorização (use authorization_grant). Listas substituem os valores; `dados` é mesclado raso.",
  {
    id: z.string().min(1),
    dod: z.string().min(1).optional(),
    lane: z.string().nullable().optional(),
    skill: z.string().nullable().optional(),
    skill_version: z.string().nullable().optional(),
    playbook: z.string().nullable().optional(),
    output: z.array(z.string()).optional(),
    escopo_escrita: z.array(z.string()).optional(),
    gaps: z.array(z.string()).optional(),
    conflitos: z.array(z.string()).optional(),
    refs: z.array(z.string()).optional(),
    dados: z.record(z.string(), z.unknown()).optional(),
    decisao: z.enum(["SKIPPED", "DEPRECATED"]).nullable().optional().describe("Decisão registrada (com evidência), não estado de fluxo."),
    motivo: z.string().min(3),
    ator,
  },
  (a) => {
    const w = writable();
    const e = loadEstado(w);
    const n = findNode(e, a.id);
    const fields = ["dod", "lane", "skill", "skill_version", "playbook", "output", "escopo_escrita", "gaps", "conflitos", "refs", "decisao"] as const;
    const changed: string[] = [];
    for (const k of fields) {
      if (a[k] !== undefined) {
        (n as Record<string, unknown>)[k] = a[k];
        changed.push(k);
      }
    }
    if (a.dados) {
      n.dados = { ...(n.dados ?? {}), ...a.dados };
      changed.push("dados");
    }
    if (!changed.length) return fail("nada para atualizar");
    if (a.decisao && n.evidencias.length === 0) return fail("decisao SKIPPED/DEPRECATED exige evidência registrada antes (C-01)");
    n.atualizado_em = nowIso();
    n.historico.push({ em: n.atualizado_em, de: n.status, para: n.status, motivo: `atualização [${changed.join(", ")}]: ${a.motivo}`, ator: a.ator });
    saveEstado(w, e);
    return ok({ id: n.id, alterados: changed });
  },
);

tool(
  server,
  "estado",
  "node_transition",
  "Move um nó entre estados com as guardas do contrato: WIP=1 ao entrar em DOING; dependências DONE; VERIFY exige output; DONE só a partir de VERIFY, com evidência, dod definido, `verificacao` e ator maestro/usuario; nó com efeito externo sem autorização vai para BLOCKED + USER_ACTION_REQUIRED (I-05). BLOCKED exige bloqueio {codigo, detalhe}.",
  {
    id: z.string().min(1),
    para: z.enum(STATUSES),
    motivo: z.string().min(3),
    ator,
    verificacao: z.string().optional().describe("Obrigatório para DONE: como o dod foi satisfeito, citando a evidência."),
    bloqueio: z.object({ codigo: z.enum(BLOCK_CODES), detalhe: z.string().min(3) }).optional(),
  },
  (a) => {
    const w = writable();
    const e = loadEstado(w);
    try {
      const n = transition(e, a);
      saveEstado(w, e);
      return ok({ id: n.id, status: n.status, historico: n.historico.slice(-3) }, `${n.id} → ${n.status}`);
    } catch (err) {
      if (err instanceof TransitionError) {
        if (err.appliedBlock) saveEstado(w, e);
        return fail(err.message, { codigo: err.code, aplicado: err.appliedBlock ? { id: err.appliedBlock.id, status: err.appliedBlock.status } : null });
      }
      throw err;
    }
  },
);

tool(
  server,
  "estado",
  "evidence_add",
  "Anexa evidência a um nó (arquivo e/ou URL + critério que ela prova + classe A_OBSERVADO…E_INFERIDO). Evidência inferida (E_INFERIDO) não basta sozinha para DONE de fato externo. O caminho do arquivo deve existir no workspace.",
  {
    id: z.string().min(1),
    caminho: z.string().optional(),
    url: z.string().url().optional(),
    criterio: z.string().min(3).describe("Qual parte do dod esta evidência comprova."),
    classe: z.string().regex(/^[A-E]_[A-Z_]+$/).describe("A_OBSERVADO (visto/rodado), D_INTERNO, E_INFERIDO ..."),
    nota: z.string().optional(),
    ator,
  },
  (a) => {
    const w = writable();
    if (!a.caminho && !a.url) return fail("informe caminho e/ou url");
    if (a.caminho && !existsSync(join(w.root, a.caminho))) return fail(`arquivo de evidência não existe: ${a.caminho}`);
    const e = loadEstado(w);
    const n = findNode(e, a.id);
    const ev = { id: `EVD-${n.id}-${n.evidencias.length + 1}`, caminho: a.caminho, url: a.url, criterio: a.criterio, classe: a.classe, registrada_em: nowIso(), ator: a.ator, nota: a.nota };
    n.evidencias.push(ev);
    n.atualizado_em = ev.registrada_em;
    saveEstado(w, e);
    return ok(ev, `evidência ${ev.id} registrada`);
  },
);

tool(
  server,
  "estado",
  "decision_record",
  "Registra ou atualiza uma decisão (D#), divergência entre fontes (DIV-###, I-08) ou mudança de contrato (CC-###, com CURRENT→EVIDENCE→CONFLICT→PROPOSED_CHANGE→IMPACT→REVIEW_REQUIRED→STATUS). RESPONDIDA exige resposta + fonte (decisão do usuário, nunca inferida). Histórico da decisão só cresce.",
  {
    id: z.string().regex(/^(D\d+(-v\d+)?|DIV-\d{3,}|CC-\d{3,})$/),
    tipo: z.enum(["decisao", "divergencia", "change-control"]),
    titulo: z.string().min(3).optional(),
    status: z.enum(["ABERTA", "PARCIAL", "RESPONDIDA", "SUPERADA", "REGISTRADA"]),
    onde: z.string().optional(),
    recomendacao: z.string().optional(),
    opcoes: z.array(z.string()).optional(),
    resposta: z.string().optional(),
    fonte: z.string().optional().describe("De onde veio a resposta (ex.: 'usuário, mensagem de 2026-09-28')."),
    bloqueia: z.array(z.string()).optional(),
    detalhes: z.record(z.string(), z.string()).optional(),
    nota: z.string().min(3),
  },
  (a) => {
    const w = writable();
    const e = loadEstado(w);
    if (a.status === "RESPONDIDA" && (!a.resposta || !a.fonte)) return fail("RESPONDIDA exige resposta e fonte (I-02)");
    if (a.tipo === "change-control") {
      const missing = CHANGE_CONTROL_FIELDS.filter((k) => !a.detalhes?.[k]);
      if (missing.length) return fail(`change control exige detalhes: ${missing.join(", ")}`);
    }
    const em = nowIso();
    let d = e.decisoes.find((x) => x.id === a.id);
    if (!d) {
      if (!a.titulo) return fail("titulo é obrigatório ao criar");
      d = { id: a.id, tipo: a.tipo, titulo: a.titulo, status: a.status, bloqueia: [], historico: [] } as Decision;
      e.decisoes.push(d);
    }
    if (d.tipo !== a.tipo) return fail(`${a.id} é do tipo ${d.tipo}`);
    Object.assign(d, {
      ...(a.titulo ? { titulo: a.titulo } : {}),
      status: a.status,
      ...(a.onde ? { onde: a.onde } : {}),
      ...(a.recomendacao ? { recomendacao: a.recomendacao } : {}),
      ...(a.opcoes ? { opcoes: a.opcoes } : {}),
      ...(a.resposta ? { resposta: a.resposta } : {}),
      ...(a.fonte ? { fonte: a.fonte } : {}),
      ...(a.bloqueia ? { bloqueia: a.bloqueia } : {}),
      ...(a.detalhes ? { detalhes: { ...(d.detalhes ?? {}), ...a.detalhes } } : {}),
      ...(a.status === "RESPONDIDA" ? { data: em.slice(0, 10) } : {}),
    });
    d.historico.push({ em, status: a.status, nota: a.nota });
    saveEstado(w, e);
    return ok(d, `${d.id} → ${d.status}`);
  },
);

tool(
  server,
  "estado",
  "authorization_grant",
  "Registra a AUTORIZAÇÃO EXPLÍCITA DO USUÁRIO para o efeito externo de um nó (publicar, agendar, enviar, deploy, escrita em conector). Só chame depois que o usuário aprovou nesta conversa; a chamada pede confirmação humana. Sem ela, o nó não chega a DONE (I-05).",
  {
    id: z.string().min(1),
    escopo: z.string().min(3).describe("O que exatamente foi autorizado (ex.: 'deploy preview na Vercel do projeto blog')."),
    fonte: z.string().min(3).describe("Citação/referência da aprovação do usuário."),
  },
  (a) => {
    const w = writable();
    const e = loadEstado(w);
    const n = findNode(e, a.id);
    if (!n.efeito_externo) return fail(`${n.id} não está marcado com efeito_externo`);
    n.autorizacao = { escopo: a.escopo, concedida_em: nowIso(), fonte: a.fonte };
    n.historico.push({ em: n.autorizacao.concedida_em, de: n.status, para: n.status, motivo: `autorização concedida: ${a.escopo}`, ator: "usuario" });
    saveEstado(w, e);
    return ok({ id: n.id, autorizacao: n.autorizacao });
  },
);

// Garante que a ordem das transições registradas nunca é reescrita: nada aqui remove histórico (I-10).
void activeNode;

const transport = new StdioServerTransport();
await server.connect(transport);
