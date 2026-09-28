# Rota MCP remota do Maestro (Cloudflare Workers)

Espelho público **somente leitura** do ledger (`07-execucao/estado.json`) e do roteamento
(`mapa/roteamento.json`), servido como um servidor MCP remoto (streamable HTTP) — para adicionar
diretamente como conector em `claude.ai` (ou qualquer cliente MCP), sem clonar o repositório.

**Não é** o Maestro operacional: não WIP=1, não promove nó, não escreve nada. Para operar o Maestro
de verdade, use o plugin local (`claude --plugin-dir .` na raiz do repo, servidores `estado`/`registry`).

## Por que existe / por que é só leitura

Um Cloudflare Worker não tem filesystem nem git. Os servidores locais (`estado`, `registry`) operam
sobre arquivos em disco — não dá para portá-los direto. Esta rota busca `07-execucao/estado.json` e
`mapa/roteamento.json` via `raw.githubusercontent.com` (repositório público, sem credencial) a cada
chamada e reaplica as **mesmas funções puras** de `../src/lib/estado/machine.ts` e
`../src/lib/routing/routing.ts` que os 76 testes da suíte principal já cobrem — o código de negócio
não é duplicado, só o transporte muda.

## Ferramentas (4, todas `readOnlyHint: true`)

`state_summary` · `node_get` · `decision_list` · `routing_lookup` — descrições completas em `src/index.ts`
e no catálogo (`../catalog/components/mcp-tool/remote.*.json`).

## Testado, mas **não implantado** por esta sessão

O código foi verificado de ponta a ponta nesta máquina: `tsc --noEmit` limpo, `wrangler deploy --dry-run`
empacota (4 MB / 725 KB gzip), e um handshake MCP completo via `wrangler dev` local — `initialize`,
`tools/list` e chamadas reais a `state_summary`/`routing_lookup` buscando o ledger/roteamento verdadeiros
do GitHub retornaram corretamente. Evidência: `07-execucao/evidencias/cloudflare-worker/dry-run-e-dev.txt`.

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

## Desenvolvimento local

```bash
npm run dev     # wrangler dev — http://localhost:8787 (info) e /mcp (protocolo MCP)
npm run check   # tsc --noEmit + wrangler deploy --dry-run (sem publicar, sem credencial)
```

## Atualizar depois de mudar o ledger/roteamento

Nada a fazer no Worker — ele busca a versão mais recente da branch `main` a cada chamada (cache de 60s).
Só republique (`npm run deploy`) se o **código** do Worker mudar.
