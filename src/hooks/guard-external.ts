// PreToolUse (Bash e ferramentas MCP): efeito externo exige aprovação explícita do usuário (I-05).
import { ask, maestroWorkspace, pass, readInput } from "./io.ts";
import { loadEstado } from "../lib/estado/store.ts";
import { activeNode } from "../lib/estado/machine.ts";
import { classifyExternal } from "../lib/external.ts";

const input = readInput();
if (process.env.MAESTRO_EXTERNAL_GUARD === "off") pass();
const ws = maestroWorkspace(input);
if (!ws || !ws.hasEstado) pass();
const command = typeof input.tool_input?.command === "string" ? (input.tool_input.command as string) : undefined;
const label = classifyExternal(input.tool_name ?? "", command);
if (!label) pass();

if (label !== "concessão de autorização (exige o humano)") {
  try {
    const n = activeNode(loadEstado(ws!));
    if (n?.efeito_externo && n.autorizacao) pass();
  } catch {
    // sem ledger legível → pede confirmação
  }
}
ask(
  `Ação externa detectada: ${label}. I-05: publicar/agendar/enviar/deploy/escrever em conector exige aprovação explícita do usuário ` +
    `(ou nó ativo com efeito_externo + autorização registrada via authorization_grant).`,
);
