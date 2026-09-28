// Manifesto das ferramentas MCP do plugin. Fonte única para: registro nos servidores,
// validação de `tools:` em agents/commands e consistência com o catálogo.
export const PLUGIN_NAME = "maestro";

export interface ToolMeta {
  server: "estado" | "registry";
  name: string;
  title: string;
  readOnly: boolean;
  destructive: boolean;
}

export const TOOLS: readonly ToolMeta[] = [
  // estado — ledger + máquina de estados (C-01)
  { server: "estado", name: "state_summary", title: "Resumo do estado", readOnly: true, destructive: false },
  { server: "estado", name: "node_list", title: "Listar nós", readOnly: true, destructive: false },
  { server: "estado", name: "node_get", title: "Obter nó", readOnly: true, destructive: false },
  { server: "estado", name: "node_next", title: "Próximo nó elegível", readOnly: true, destructive: false },
  { server: "estado", name: "decision_list", title: "Listar decisões", readOnly: true, destructive: false },
  { server: "estado", name: "state_validate", title: "Validar ledger", readOnly: true, destructive: false },
  { server: "estado", name: "state_init", title: "Inicializar ledger", readOnly: false, destructive: false },
  { server: "estado", name: "node_create", title: "Criar nó", readOnly: false, destructive: false },
  { server: "estado", name: "node_update", title: "Atualizar campos do nó", readOnly: false, destructive: false },
  { server: "estado", name: "node_transition", title: "Transicionar nó", readOnly: false, destructive: false },
  { server: "estado", name: "evidence_add", title: "Registrar evidência", readOnly: false, destructive: false },
  { server: "estado", name: "decision_record", title: "Registrar decisão/divergência/change control", readOnly: false, destructive: false },
  { server: "estado", name: "authorization_grant", title: "Conceder autorização externa (humano)", readOnly: false, destructive: true },
  // registry — componentes, ingestão, roteamento, skills
  { server: "registry", name: "catalog_list", title: "Listar catálogo", readOnly: true, destructive: false },
  { server: "registry", name: "catalog_get", title: "Obter componente", readOnly: true, destructive: false },
  { server: "registry", name: "catalog_search", title: "Buscar no catálogo", readOnly: true, destructive: false },
  { server: "registry", name: "component_inspect", title: "Inspecionar componente recebido", readOnly: true, destructive: false },
  { server: "registry", name: "conflict_check", title: "Checar conflitos e duplicações", readOnly: true, destructive: false },
  { server: "registry", name: "upstream_search", title: "Buscar nos upstreams oficiais", readOnly: true, destructive: false },
  { server: "registry", name: "routing_lookup", title: "Consultar roteamento de lanes", readOnly: true, destructive: false },
  { server: "registry", name: "skill_fingerprint", title: "Localizar skill e medir drift", readOnly: true, destructive: false },
  { server: "registry", name: "workspace_validate", title: "Validar workspace", readOnly: true, destructive: false },
  { server: "registry", name: "ingestion_list", title: "Listar ingestões", readOnly: true, destructive: false },
  { server: "registry", name: "ingestion_start", title: "Abrir ingestão (RECEIVE)", readOnly: false, destructive: false },
  { server: "registry", name: "catalog_register", title: "Registrar componente no catálogo", readOnly: false, destructive: false },
];

export const fullToolName = (t: Pick<ToolMeta, "server" | "name">) => `mcp__plugin_${PLUGIN_NAME}_${t.server}__${t.name}`;
export const FULL_TOOL_NAMES = new Set(TOOLS.map(fullToolName));
export const toolMeta = (server: ToolMeta["server"], name: string): ToolMeta => {
  const t = TOOLS.find((x) => x.server === server && x.name === name);
  if (!t) throw new Error(`ferramenta fora do manifesto: ${server}.${name}`);
  return t;
};
