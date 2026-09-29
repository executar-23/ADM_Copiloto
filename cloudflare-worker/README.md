# Rota MCP remota do Maestro (Cloudflare Workers)

Este Worker hospeda **duas** superfícies MCP:

- **`/mcp`** — espelho público **somente leitura** do ledger (`07-execucao/estado.json`) e do
  roteamento (`mapa/roteamento.json`), sem autenticação (DE-012). Para adicionar diretamente como
  conector em `claude.ai` (ou qualquer cliente MCP), sem clonar o repositório.
- **`/mcp/auth`** — gateway MCP **autenticado** (OAuth 2.1 + CIMD), **EXPERIMENTAL, Fase 1** da
  ADR-MCP-REMOTE-001 (ver `CC-003` no ledger). Por enquanto só prova o fluxo OAuth ponta a ponta com
  uma única ferramenta (`whoami`) — sem integração com Blog/CMS (Fases 2/3, ainda não aprovadas).

**Não é** o Maestro operacional: não WIP=1, não promove nó, não escreve nada. Para operar o Maestro
de verdade, use o plugin local (`claude --plugin-dir .` na raiz do repo, servidores `estado`/`registry`).

## Por que existe / por que é só leitura

Um Cloudflare Worker não tem filesystem nem git. Os servidores locais (`estado`, `registry`) operam
sobre arquivos em disco — não dá para portá-los direto. Esta rota busca `07-execucao/estado.json` e
`mapa/roteamento.json` via `raw.githubusercontent.com` (repositório público, sem credencial) a cada
chamada e reaplica as **mesmas funções puras** de `../src/lib/estado/machine.ts` e
`../src/lib/routing/routing.ts` que os 76 testes da suíte principal já cobrem — o código de negócio
não é duplicado, só o transporte muda.

## Ferramentas de `/mcp` (4, todas `readOnlyHint: true`, sem autenticação)

`state_summary` · `node_get` · `decision_list` · `routing_lookup` — descrições completas em `src/index.ts`
e no catálogo (`../catalog/components/mcp-tool/remote.*.json`).

## `/mcp/auth` — gateway OAuth (Fase 1, experimental)

Implementado com [`@cloudflare/workers-oauth-provider`](https://www.npmjs.com/package/@cloudflare/workers-oauth-provider)
(biblioteca oficial da Cloudflare). Identidade via **Cloudflare Access** (decisão `D15`):

- Primário: `ctx.access` — a integração nativa do runtime, populada quando o toggle "Protect this
  Worker" (ou uma rota específica) está ativado no dashboard.
- Fallback: validação manual do header `Cf-Access-Jwt-Assertion` via JWKS do team domain (`jose`),
  para quando a Access application é do tipo "self-hosted" apontando a um hostname/path em vez do
  toggle nativo. Exige os secrets `CF_ACCESS_TEAM_DOMAIN`/`CF_ACCESS_AUD` (nunca inventados — se
  ausentes e o fallback for necessário, falha com erro claro, não com acesso liberado).

**Falta antes de qualquer uso real:**

1. Você criar a Access application que protege `/authorize` (Zero Trust → Access → Applications, ou
   Workers & Pages → este Worker → aba Access → "Protect this Worker") — decisão `D15` ainda depende
   disso. Sem isso, `/authorize` responde `401` (falha fechada, não aberta).
2. Publicar de verdade (ver seção seguinte) e testar o fluxo completo com um cliente MCP real.

Ferramenta única por enquanto: `whoami` (retorna a identidade capturada no consentimento — prova que
o OAuth funciona, nada além disso). Catálogo: `../catalog/components/mcp-tool/remote-auth.whoami.json`.

Testado localmente via `wrangler dev` (discovery, challenge `401`, identidade simulada via
`wrangler.jsonc` `access.dev`): `07-execucao/evidencias/cloudflare-worker/fase1-oauth-dev.txt`.

## Testado, mas **não implantado** por esta sessão

O código foi verificado de ponta a ponta nesta máquina: `tsc --noEmit` limpo, `wrangler deploy --dry-run`
empacota, e um handshake MCP completo via `wrangler dev` local — `initialize`, `tools/list` e chamadas
reais a `state_summary`/`routing_lookup` buscando o ledger/roteamento verdadeiros do GitHub retornaram
corretamente. Evidências: `07-execucao/evidencias/cloudflare-worker/dry-run-e-dev.txt` (rota `/mcp`) e
`07-execucao/evidencias/cloudflare-worker/fase1-oauth-dev.txt` (rota `/mcp/auth`, Fase 1 OAuth).

**O que faltou:** publicar de verdade. O conector Cloudflare disponível nesta sessão (`Cloudflare Developer
Platform`) só lista/lê Workers e gerencia D1/KV/R2/Hyperdrive — não tem uma ferramenta de deploy. E não há
`CLOUDFLARE_API_TOKEN` neste ambiente para o `wrangler` publicar na sua conta (`wrangler whoami` confirma:
não autenticado). Publicar exige alguém com a credencial real da conta — decisão `D14` no ledger.

## Deploy (você, ou uma sessão com acesso de escrita à conta Cloudflare)

```bash
cd cloudflare-worker
npm install
npx wrangler login          # ou: export CLOUDFLARE_API_TOKEN=...
npm run deploy               # = wrangler deploy
```

O comando imprime a URL final (`https://maestro-mcp-remote.<seu-subdomínio>.workers.dev`). Depois:

```bash
cd ..   # raiz do repo
node scripts/configure-cloudflare-route.mjs <URL-impressa-pelo-deploy>
npm run check
git add .mcp.json 07-execucao/estado.json 07-execucao/ESTADO.md && git commit -m "chore: registra a URL real da rota MCP remota (D14)"
```

Isso preenche a URL real em `.mcp.json` (como um servidor `remote` adicional, tipo `http`) e fecha a
decisão `D14` no ledger com a URL como evidência — nunca uma URL adivinhada (I-02).

**Para usar `/mcp/auth` de verdade** (além do deploy acima):

1. Crie a Access application que protege `/authorize` (Zero Trust → Access → Applications, ou
   Workers & Pages → este Worker → aba Access) — decisão `D15`.
2. Só se a Access application for do tipo "self-hosted" (hostname/path específico, não o toggle
   nativo "Protect this Worker"): `npx wrangler secret put CF_ACCESS_TEAM_DOMAIN` (algo como
   `https://<seu-team>.cloudflareaccess.com`) e `npx wrangler secret put CF_ACCESS_AUD` (o AUD tag
   da Access application). Com o toggle nativo, `ctx.access` já resolve isso sozinho — não precisa
   dos secrets.

## Desenvolvimento local

```bash
npm run dev     # wrangler dev — http://localhost:8787 (info), /mcp (público) e /mcp/auth (OAuth)
npm run check   # tsc --noEmit + wrangler deploy --dry-run (sem publicar, sem credencial)
```

Para `/mcp/auth`, `wrangler.jsonc` já traz um bloco `access.dev` que simula uma identidade Cloudflare
Access (só em `wrangler dev` — nunca afeta produção) para testar sem uma Access application real.
Comente/remova esse bloco para testar o caminho "sem identidade" (deve responder `401`).

## Atualizar depois de mudar o ledger/roteamento

Nada a fazer no Worker — ele busca a versão mais recente da branch `main` a cada chamada (cache de 60s).
Só republique (`npm run deploy`) se o **código** do Worker mudar.
