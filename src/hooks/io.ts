// Entrada/saída comuns dos hooks (protocolo de hooks do Claude Code).
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { resolveWorkspace, type Workspace } from "../lib/workspace.ts";
import { toPosix } from "../lib/util.ts";

export interface HookInput {
  session_id?: string;
  cwd?: string;
  hook_event_name?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  agent_id?: string;
  agent_type?: string;
  source?: string;
}

export function readInput(): HookInput {
  try {
    const raw = readFileSync(0, "utf8");
    return raw.trim() ? (JSON.parse(raw) as HookInput) : {};
  } catch {
    return {};
  }
}

/** Workspace do Maestro para este evento — null se o projeto não é um workspace do Maestro. */
export function maestroWorkspace(input: HookInput): Workspace | null {
  const ws = resolveWorkspace({ cwd: input.cwd ?? process.cwd(), env: { ...process.env, MAESTRO_WORKSPACE: process.env.MAESTRO_WORKSPACE } });
  if (ws.source === "plugin-root" || ws.source === "cwd-uninitialized") return null;
  return ws.hasEstado || ws.hasCatalog ? ws : null;
}

export function relToWorkspace(ws: Workspace, file: string, cwd?: string): string | null {
  const abs = resolve(cwd ?? ws.root, file);
  const rel = toPosix(relative(ws.root, abs));
  if (rel.startsWith("..")) return null;
  return rel;
}

export function targetPath(input: HookInput): string | null {
  const ti = input.tool_input ?? {};
  const p = ti.file_path ?? ti.notebook_path ?? ti.path;
  return typeof p === "string" ? p : null;
}

/** Bloqueia a chamada: exit 2 + motivo em stderr (Claude recebe o motivo). */
export function block(reason: string): never {
  process.stderr.write(`[maestro] ${reason}\n`);
  process.exit(2);
}

/** Força confirmação humana para esta chamada, mesmo quando o modo de permissão a liberaria. */
export function ask(reason: string): never {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: `[maestro] ${reason}` } }),
  );
  process.exit(0);
}

export function pass(): never {
  process.exit(0);
}
