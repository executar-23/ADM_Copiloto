# E0 — Verificação e inventário (execução no contêiner cloud)

> **Ambiente desta execução:** contêiner Claude Code na nuvem (sessão de 2026-09-28), **Claude Code 2.1.283**
> (`07-execucao/evidencias/E0/claude-version.txt`), skills da conta do usuário sincronizadas, nenhum plugin instalado.
> **Não é a máquina local do usuário.** Itens que dependem dela (`/mnt/skills/plugins`, cópias "enviadas", registro `exe`)
> ficam `USER_ACTION_REQUIRED` — o nó E0 **não** vai para `DONE` com esta execução (I-03: verificado aqui ≠ verificado lá).
> Playbook: `skills/estagios-bpm/references/E0.md`. Evidências brutas condensadas: `07-execucao/evidencias/E0/`.

Legenda: **CONFIRMADO** (visto/rodado aqui) · **REFUTADO** (evidência contrária aqui) · **NÃO ENCONTRADO** (procurado e não achado — ≠ não existe) · **NÃO DETERMINADO** (sem como provar aqui).

## Resultado por item de `mapa/divergencias-e-lacunas.md`

| § | Item | Status | Fonte (evidência) | Observação |
|---|---|---|---|---|
| §2 | As 4+2 lacunas do SOP-KP-001 (GEO, Topic Pack, arco, nomenclatura, indexação, ciclo de 15 dias) | **CONFIRMADO** | `evidencias/E0/obsidian-sop-grep.txt` (`grep -ril` = 0 arquivos para cada termo) | verificado na cópia `obsidian-editorial-pipeline` 2.3.0 das skills da conta |
| §2 | `source-precedence.md` declara SOP-KP-001 fonte canônica e manda registrar divergência | **CONFIRMADO** | `evidencias/E0/obsidian-sop-grep.txt` | texto: "fonte canônica única de blocos, gates, dependências e critério de pronto. Substitui o antigo Process Doc V02" |
| §2 | Relação Process Doc V01 (docx) × "antigo V02" | **NÃO DETERMINADO** | — | docx `PD-CLB-20260906-F01-DOC-V01` não foi entregue nesta sessão; segue DIV-001/D2 |
| §3 | `executar-block-quick-frameworks`: instalada 162 linhas × enviada 634 | **PARCIAL** | `evidencias/E0/skills-fingerprint.json` | cópia da conta: `SKILL.md` 163 linhas, v1.0.0, 15 arquivos, tree `95aab3fac373812f…` (= a "instalada", atualizada 2026-09-25). A cópia "enviada" não está disponível aqui → drift **NÃO DETERMINADO**; D3 aberta |
| §3 | `executar-solution-store` instalada = enviada | **NÃO DETERMINADO** | `skills-fingerprint.json` | presente na conta (tree `e133da8fb66d6820…`, 66 arquivos); cópia enviada ausente para comparar |
| §3 | `rc-cognitive-risk-expert` instalada | **NÃO ENCONTRADO** (neste ambiente) | `skills-fingerprint.json`, `skills-da-conta.jsonl` | não está nas skills da conta nem em `/mnt/skills` do contêiner. O pacote a viu em `/mnt/skills/plugins` do ambiente de chat. **Impacto alto:** a matriz usa o RC em 4 lanes → verificar localmente |
| §3 | `obsidian-editorial-pipeline` v2.3 **não instalada** | **REFUTADO** (neste ambiente) | `skills-da-conta.jsonl`, `obsidian-sop-grep.txt` (RELEASE.json) | presente nas skills da conta: `SKILL-OBS-EDITORIAL-V2`, 2.3.0, `BUILT`, SOP-KP-001, atualizada 2026-09-22. Registrado **DIV-004**; D5 continua sua (confirmar se a conta = ambiente de trabalho) |
| §4 | Plugin Product Management não instalado | **CONFIRMADO** (neste ambiente) | `evidencias/E0/plugins-instalados.txt` | `claude plugin list` → nenhum plugin; nenhuma skill `product-management:*` na conta. D4 aberta |
| §4 | 34 skills oficiais (Eng/Ops/Mkt/Design) instaladas | **NÃO ENCONTRADO** (neste ambiente) | `plugins-instalados.txt` | aqui nenhum plugin oficial está instalado — o número vale para o ambiente de chat do pacote, não para este contêiner |
| §4 | Sobreposições de nome (`competitive-brief` ×2, `research-synthesis` × `synthesize-research`, `content-creation` × `draft-content`) | **CONFIRMADO** | `evidencias/E0/sobreposicoes-upstream.txt` (upstream @da38ec1e) | regras de desempate em `mapa/roteamento.json` (HIPÓTESE até E2) |
| §5 | Insumos não fornecidos (README do ecossistema, ADRs granulares/fórmula de lançamento, legenda dos 22 pontos, template PRD checklist, definição de "Vera") | **CONFIRMADO** | `ingestion/received/ING-0002/MANIFEST.sha256` (33 arquivos, nenhum deles) | D9 · `USER_ACTION_REQUIRED` |
| §6 | Versão do Claude Code | **CONFIRMADO** 2.1.283 | `claude-version.txt` | — |
| §6 | `claude --agent <nome>` faz a sessão assumir o agente | **CONFIRMADO** | `evidencias/E0/prova-B2.jsonl` | com `--agent maestro:maestro` a sessão consultou o ledger primeiro e respondeu no formato do Maestro |
| §6 | `tools: Agent(a, b)` limita quais subagentes podem ser criados | **CONFIRMADO** + **achado** | `prova-A.jsonl`, `prova-B.jsonl`, `prova-B2.jsonl` | `general-purpose` recusado ("Agent type … not found. Available agents: none"). **Achado:** em plugin os nomes são `maestro:<agent>`; `Agent(qa-reviewer)` sem prefixo deixava a allowlist **vazia**. Corrigido em `agents/maestro.md` e nova regra de lint `AGENT_ALLOWLIST` |
| §6 | Maestro funciona com `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` (EV-009) | **CONFIRMADO** | `prova-B2.jsonl` | delegação ao `maestro:qa-reviewer` com veredito retornado |
| §6 | Relato #80036: subagente `general-purpose` sem a ferramenta `Agent` | **CONFIRMADO** (nesta versão) | `prova-F.jsonl` | o subagente respondeu `SEM_FERRAMENTA_AGENT` (auto-relato do subagente; classe A_OBSERVADO com essa ressalva). Reforça: lanes são folhas; nada depende de aninhamento |
| §6 | Subagente de plugin **ignora** `hooks` no frontmatter | **CONFIRMADO** | `prova-C.jsonl` | agente de prova com hook `exit 2` no frontmatter escreveu o arquivo normalmente. Guardrails do Maestro estão em `hooks/hooks.json` (EV-010) |
| §6 | Hook `PreToolUse` com `exit 2` bloqueia | **CONFIRMADO** | `07-execucao/evidencias/e2e/resultado.json` (caso `guard-write`) | — |
| §6 | Hook `permissionDecision: "ask"` em modo headless (`-p`) | **CONFIRMADO — vira negação** | `prova-D.jsonl` | `git push` negado com a mensagem de I-05. Em sessão interativa vira pedido de confirmação. Documentado em DE-010 |
| §6 | Limite de 20 subagentes simultâneos; aviso acima de 15.000 tokens de descrições | **NÃO DETERMINADO** | — | não testado (custo); `claude plugin details maestro` mostra ~4,1k tokens always-on do plugin inteiro |
| §6 | Estrutura de plugin (manifesto opcional, componentes na raiz, `.mcp.json`) | **CONFIRMADO** | `claude plugin validate --strict`, `claude --plugin-dir . plugin details maestro` | achados: (1) validador só inspeciona componentes sem `marketplace.json`; (2) `README.md` em `agents/`/`commands/` é carregado como componente; (3) `.mcp.json` da raiz também é lido como config de projeto quando raiz = projeto |
| §7 | Leituras de voz ("pluging", "mangemnet", "DRP", "workbook", "CMS", "níveis de consciência", "twland") | D6 **PARCIAL** · demais **ABERTAS** | ledger (D6–D9, D6-v1) | "pluging" = plugin (decisão do usuário nesta sessão); o resto exige o usuário (Regra do 3) |
| §8 | F7-delta contra `EXECUTAR_SKILLS_REGISTRY` | **BLOQUEADO** · `USER_ACTION_REQUIRED` | — | registro do projeto `exe` inacessível daqui. Insumo parcial para o delta: `skills-da-conta.jsonl` (18 skills proprietárias `source: plugin` na conta, 2026-09-28) |
| §8 | Skills candidatas a F8 (`gerar-workbook-deskgo`, `deskgo-business-workbook`) | **NÃO ENCONTRADO** + **achado** | `skills-fingerprint.json`, `skills-da-conta.jsonl` | não existem na conta; `executar-relatorios` (2026-09-25) declara substituir `deskgo-business-workbook` e `executar-mapa-os` → **DIV-005**, evidência para D8 |
| §9 | F0 = handoff v1 (`/mnt/user-data/outputs/handoff`) | **NÃO ENCONTRADO** | — | handoff v1 não entregue nesta sessão; D1-v1…D6-v1 seguem abertas |
| E0.5 | Conectores disponíveis | **CONFIRMADO** (lista) · esquemas **não lidos** | lista de ferramentas da sessão | nesta sessão: Notion, Google Drive, Gmail, Vercel, Railway, Neon, **Cloudflare Developer Platform**, Resend, Expo, Clerk, TickTick, GitHub. **REFUTA** "não há conector Cloudflare" *para esta conta* (DIV-006). Supabase e Linear ausentes aqui → CONF-01 não verificável |

## Decisões que o E0 resolve (recomendação — a decisão é sua)

| Decisão | Evidência nova | Recomendação |
|---|---|---|
| **D4** Product Management | não instalado aqui; skills oficiais só em referência | Instalar `product-management@knowledge-work-plugins` no ambiente de trabalho (1 comando) — o fallback RC depende de `rc-cognitive-risk-expert`, que **não foi encontrado** aqui |
| **D5** obsidian-editorial-pipeline | 2.3.0 presente nas skills da conta (DIV-004) | Considerar **resolvida na conta**; confirmar no ambiente local e fixar `skill_version` = tree `d643e94913e931d1…` |
| **D6** "pluging"/"mangemnet" | usuário: plugin | "pluging" respondido; "mangemnet" = camadas operacional/estratégica/tática? — **pergunta 1** |
| **D7** "DRP" | nenhuma | **pergunta 2**: significado de DRP |
| **D8** workbook final (F8) | `executar-relatorios` substitui `deskgo-business-workbook` (DIV-005) | Recomendo `executar-relatorios` (capacidade 5, workbook Desk&Go) — **pergunta 3**: confirmar |

## Pendências para fechar o E0

1. Rodar o E0 na máquina local: `bash scripts/e2e.sh` e `skill_fingerprint` nas cópias enviadas × instaladas (D3, `rc-cognitive-risk-expert`).
2. Dar acesso ao `EXECUTAR_SKILLS_REGISTRY` (F7-delta).
3. Responder às 3 perguntas acima (D6-mangemnet, D7, D8).
