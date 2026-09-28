// PostToolUse (Write|Edit|MultiEdit): valida na hora o que acabou de ser escrito.
import { join } from "node:path";
import { block, maestroWorkspace, pass, readInput, relToWorkspace, targetPath } from "./io.ts";
import { ComponentSchema } from "../lib/catalog/schema.ts";
import { lintComponent } from "../lib/components/lint.ts";
import { parseFrontmatter } from "../lib/components/frontmatter.ts";
import { RoutingSchema } from "../lib/routing/routing.ts";
import { PATHS } from "../lib/workspace.ts";
import { readText } from "../lib/util.ts";

const input = readInput();
const ws = maestroWorkspace(input);
const file = targetPath(input);
if (!ws || !file) pass();
const rel = relToWorkspace(ws!, file!, input.cwd);
if (rel === null) pass();
const r = rel!;
const abs = join(ws!.root, r);
const problems: string[] = [];

try {
  if (r.startsWith(`${PATHS.catalogDir}/`) && r.endsWith(".json")) {
    const res = ComponentSchema.safeParse(JSON.parse(readText(abs)));
    if (!res.success) problems.push(...res.error.issues.map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`));
  } else if (/^agents\/[^/]+\.md$/.test(r)) {
    problems.push(...lintComponent("agent", abs, { pluginRoot: ws!.root, label: r }).filter((f) => f.level === "error").map((f) => f.message));
  } else if (/^commands\/[^/]+\.md$/.test(r)) {
    problems.push(...lintComponent("command", abs, { pluginRoot: ws!.root, label: r }).filter((f) => f.level === "error").map((f) => f.message));
  } else if (/^skills\/[^/]+\/SKILL\.md$/.test(r)) {
    problems.push(...lintComponent("skill", abs, { pluginRoot: ws!.root, label: r }).filter((f) => f.level === "error").map((f) => f.message));
  } else if (r === PATHS.routingJson) {
    const res = RoutingSchema.safeParse(JSON.parse(readText(abs)));
    if (!res.success) problems.push(...res.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
  } else if (r.startsWith(`${PATHS.ingestionRecords}/`) && r.endsWith(".md")) {
    const { frontmatter, error } = parseFrontmatter(readText(abs));
    if (!frontmatter || error) problems.push(`frontmatter do registro inválido ${error ?? ""}`);
  } else pass();
} catch (e) {
  problems.push((e as Error).message);
}
if (problems.length) block(`${r} viola o contrato:\n- ${problems.join("\n- ")}\nCorrija antes de seguir (VALIDATE).`);
pass();
