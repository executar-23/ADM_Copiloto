import { test } from "node:test";
import assert from "node:assert/strict";
import { globToRegExp, jaccard, matchesAnyGlob, tokens } from "../../src/lib/util.ts";
import { classifyExternal } from "../../src/lib/external.ts";

test("glob: **, *, ? e diretório com barra final", () => {
  assert.ok(globToRegExp("skills/**").test("skills/a/b/SKILL.md"));
  assert.ok(globToRegExp("docs/*.md").test("docs/x.md"));
  assert.ok(!globToRegExp("docs/*.md").test("docs/a/x.md"));
  assert.ok(globToRegExp("src/**/*.ts").test("src/x.ts"));
  assert.ok(globToRegExp("07-execucao/").test("07-execucao/E0.md"));
  assert.ok(matchesAnyGlob("./ingestion/records/ING-0001-x.md", ["ingestion/records/**"]));
});

test("tokens ignoram acentos e stopwords; jaccard", () => {
  assert.deepEqual([...tokens("Análise de Riscos e FMEA")].sort(), ["analise", "fmea", "riscos"]);
  assert.equal(jaccard(tokens("roteia lane skill"), tokens("lane skill roteia")), 1);
});

test("I-05: classifica efeito externo em Bash e MCP", () => {
  const ext = [
    ["Bash", "git push -u origin main"],
    ["Bash", "npm publish"],
    ["Bash", "npx vercel deploy --prod"],
    ["Bash", "wrangler pages deploy dist"],
    ["Bash", "curl -X POST https://api.x/y -d '{}'"],
    ["Bash", "gh pr create --draft"],
    ["mcp__Notion__notion-create-pages", undefined],
    ["mcp__Vercel__create_deployment", undefined],
    ["mcp__plugin_maestro_estado__authorization_grant", undefined],
  ] as const;
  for (const [tool, cmd] of ext) assert.ok(classifyExternal(tool, cmd), `${tool} ${cmd ?? ""}`);
  const internal = [
    ["Bash", "git status && git commit -m x"],
    ["Bash", "curl -s https://example.com"],
    ["Bash", "vercel env ls"],
    ["mcp__Notion__notion-search", undefined],
    ["mcp__plugin_maestro_estado__node_transition", undefined],
  ] as const;
  for (const [tool, cmd] of internal) assert.equal(classifyExternal(tool, cmd), null, `${tool} ${cmd ?? ""}`);
});
