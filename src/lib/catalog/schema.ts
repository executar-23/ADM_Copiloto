// Esquema do catálogo de componentes — fonte de verdade para expansão (um JSON por componente).
import { z } from "zod";

export const COMPONENT_TYPES = [
  "agent",
  "skill",
  "command",
  "hook",
  "mcp-server",
  "mcp-tool",
  "external-plugin",
  "upstream-reference",
] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

/** Tipos que, quando próprios/adaptados, exigem as 4 respostas anti-overkill (C-02, EV-013). */
export const ANTI_OVERKILL_TYPES: readonly ComponentType[] = ["agent", "skill", "command", "hook", "mcp-server"];

export const ORIGIN_KINDS = ["proprietary", "adapted", "upstream", "third-party"] as const;
export const COMPONENT_STATUS = ["experimental", "active", "deprecated", "reference"] as const;

const NAME = z.string().regex(/^[a-z0-9][a-z0-9._@-]*$/, "name: minúsculas, números, . _ @ -");

export const AntiOverkillSchema = z.object({
  reuso: z.string().min(10, "reuso: diga o que já existe e por que não basta"),
  necessidade: z.string().min(10, "necessidade: qual entrega ficaria impossível/mais lenta"),
  custo: z.string().min(5, "custo: arquivos/linhas/dependências a manter"),
  reversao: z.string().min(5, "reversao: como remover se não render"),
});

export const ComponentSchema = z
  .object({
    id: z.string(),
    name: NAME,
    type: z.enum(COMPONENT_TYPES),
    path: z.string().nullable(),
    parent: z.string().optional(),
    origin: z.object({
      kind: z.enum(ORIGIN_KINDS),
      source: z.string().min(2),
      ref: z.string().optional(),
      sha: z.string().optional(),
      license: z.string().optional(),
    }),
    responsibility: z.string().min(10),
    dependencies: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    related: z
      .object({
        skills: z.array(z.string()).default([]),
        agents: z.array(z.string()).default([]),
        commands: z.array(z.string()).default([]),
      })
      .default({ skills: [], agents: [], commands: [] }),
    status: z.enum(COMPONENT_STATUS),
    version: z.string().min(1),
    integration: z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      reason: z.string().min(5),
      ingestion: z.string().regex(/^ING-\d{4}$/).nullable(),
    }),
    tests: z.array(z.string()).default([]),
    anti_overkill: AntiOverkillSchema.optional(),
    notes: z.string().optional(),
  })
  .superRefine((c, ctx) => {
    if (c.id !== `${c.type}:${c.name}`) {
      ctx.addIssue({ code: "custom", path: ["id"], message: `id deve ser "${c.type}:${c.name}"` });
    }
    const own = c.origin.kind === "proprietary" || c.origin.kind === "adapted";
    if (own && ANTI_OVERKILL_TYPES.includes(c.type) && !c.anti_overkill) {
      ctx.addIssue({
        code: "custom",
        path: ["anti_overkill"],
        message: "componente próprio/adaptado exige as 4 respostas anti-overkill (reuso, necessidade, custo, reversao) — C-02/EV-013",
      });
    }
    if (c.type === "mcp-tool" && !c.parent) {
      ctx.addIssue({ code: "custom", path: ["parent"], message: "mcp-tool exige parent (id do mcp-server)" });
    }
    if (c.type === "upstream-reference" && !c.origin.sha) {
      ctx.addIssue({ code: "custom", path: ["origin", "sha"], message: "upstream-reference exige SHA fixado" });
    }
  });
export type Component = z.infer<typeof ComponentSchema>;
