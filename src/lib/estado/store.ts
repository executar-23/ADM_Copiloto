// Leitura/escrita do ledger canônico (07-execucao/estado.json) + projeção ESTADO.md.
import { join } from "node:path";
import { EstadoSchema, type Estado } from "./schema.ts";
import { renderEstadoMd } from "./render.ts";
import { PATHS, type Workspace } from "../workspace.ts";
import { existsSync, nowIso, readJson, writeJsonAtomic, writeTextAtomic } from "../util.ts";

export class EstadoError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export function estadoPath(root: string): string {
  return join(root, PATHS.estadoJson);
}

export function loadEstado(ws: Workspace | string): Estado {
  const root = typeof ws === "string" ? ws : ws.root;
  const p = estadoPath(root);
  if (!existsSync(p)) {
    throw new EstadoError(
      `ledger não inicializado em ${root} (falta ${PATHS.estadoJson}). Use a ferramenta state_init.`,
      "NOT_INITIALIZED",
    );
  }
  const parsed = EstadoSchema.safeParse(readJson(p));
  if (!parsed.success) {
    throw new EstadoError(`estado.json inválido: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`, "INVALID");
  }
  return parsed.data;
}

/** Valida, grava o JSON canônico e regenera a projeção ESTADO.md. */
export function saveEstado(ws: Workspace | string, estado: Estado): void {
  const root = typeof ws === "string" ? ws : ws.root;
  if (typeof ws !== "string" && ws.readOnly) throw new EstadoError("workspace somente leitura", "READ_ONLY");
  estado.atualizado_em = nowIso();
  const parsed = EstadoSchema.parse(estado);
  writeJsonAtomic(estadoPath(root), parsed);
  writeTextAtomic(join(root, PATHS.estadoMd), renderEstadoMd(parsed));
}

export function newEstado(projeto: { id: string; nome: string }): Estado {
  return {
    versao_schema: 1,
    projeto,
    vocabulario: "copiloto-executar",
    wip_limite: 1,
    atualizado_em: nowIso(),
    nos: [],
    decisoes: [],
  };
}
