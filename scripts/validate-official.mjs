// Validador oficial do Claude Code em modo estrito, com lista explícita de avisos aceitos.
// Aceito (DE-001): CLAUDE.md na raiz é memória de PROJETO para desenvolver o plugin (raiz = plugin = projeto),
// não contexto do plugin — o validador avisa, e isso é intencional.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ACCEPTED = [/CLAUDE\.md at the plugin root is not loaded as project context/];

function validate(target, label) {
  let out;
  try {
    out = execFileSync("claude", ["plugin", "validate", "--json", target], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    out = e.stdout?.toString() ?? "";
    if (!out.trim().startsWith("{")) throw new Error(`${label}: ${e.stderr?.toString() || e.message}`);
  }
  const rep = JSON.parse(out);
  const issues = [...(rep.manifest ? [rep.manifest] : []), ...(rep.contents ?? [])].flatMap((c) => [
    ...(c.errors ?? []).map((i) => ({ level: "error", file: c.file, message: i.message })),
    ...(c.warnings ?? []).map((i) => ({ level: "warning", file: c.file, message: i.message })),
  ]);
  const blocking = issues.filter((i) => i.level === "error" || !ACCEPTED.some((re) => re.test(i.message)));
  const accepted = issues.length - blocking.length;
  for (const i of blocking) console.error(`✖ [${label}] ${i.level}: ${i.file}: ${i.message}`);
  console.log(`${blocking.length ? "✖" : "✔"} ${label}: ${issues.length} achado(s), ${accepted} aceito(s) por política, ${blocking.length} bloqueante(s)`);
  return blocking.length === 0;
}

const tmp = mkdtempSync(join(tmpdir(), "maestro-validate-"));
let ok = true;
try {
  ok = validate(".claude-plugin/plugin.json", "manifesto") && ok;
  ok = validate(".", "marketplace") && ok;
  // Sem marketplace.json o validador inspeciona agents/skills/commands (verificado).
  execFileSync("sh", ["-c", `tar --exclude=./vendor --exclude=./node_modules --exclude=./.git --exclude=./.tmp --exclude=./.claude-plugin/marketplace.json -cf - . | tar -xf - -C "${tmp}"`]);
  ok = validate(tmp, "conteúdo") && ok;
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
process.exit(ok ? 0 : 1);
