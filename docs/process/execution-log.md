# Log de execução — sessão de bootstrap (2026-09-28)

> Registro do **processo**, não só do resultado: como o plugin `maestro` v0.1.0 foi planejado, construído,
> verificado e mesclado, para servir de roteiro replicável em futuras sessões de upstream — a próxima
> ingestão de skills/agents/plugins não deveria reinventar este método. Ver também
> [`docs/process/ingestion-pipeline.md`](ingestion-pipeline.md) (RECEIVE→REGISTER, para componentes) e
> [`docs/architecture/decisions.md`](../architecture/decisions.md) (decisões técnicas pontuais, DE-001…011).
> Este documento é sobre a **sequência de trabalho em si**.

## Contexto de partida

Repositório vazio (`executar-23/ADM_Copiloto`), branch designada `claude/plugin-architecture-setup-roe253`.
Dois handoffs em sequência na mesma sessão:
1. Um pacote completo do "Maestro" (HANDOFF, contratos C-00…C-04, mapa, prompts por estágio E0–E9/L,
   `ESTADO.md`) pedindo **Plan Mode** primeiro — planejar bootstrap, arquitetura, ingestão, validação.
2. Um segundo handoff, já em execução, revertendo a ordem: "não é só planejamento — construa a v0.1.0
   completa agora" (plugin funcional, agents, skills, commands, MCP, testes, catálogo, processo de ingestão).

Essa mudança de decisão do usuário **substitui** a decisão do estágio E5 do pacote original ("Modo A, sem
plugin") — registrada como change control `CC-002` no ledger, não aplicada em silêncio (I-08).

## Sequência (o que funcionou, em ordem)

### 1. Plan Mode real antes de qualquer escrita
Leitura completa do pacote (HANDOFF, 5 contratos, mapa, topologia, agent-spec, 11 prompts de estágio) e dos
dois upstreams oficiais citados (`claude-plugins-official`, `knowledge-work-plugins`) **clonados numa área
temporária** (não no repositório) só para leitura, antes de decidir a arquitetura. Fatos verificados na
própria máquina antes de assumir qualquer coisa — ex.: `claude plugin validate --strict` roda sem
credencial; um `vendor/upstream/` com plugin completo dentro **não** é carregado como componente;
`README.md` dentro de `agents/`/`commands/` **é** carregado como componente. Cada fato virou uma linha do
plano, não uma suposição.

**Lição:** gastar chamadas de ferramenta em provar comportamento do Claude Code *antes* de desenhar em cima
dele é mais barato do que descobrir o contrário depois de escrever 20 arquivos.

### 2. Perguntas mínimas, decisão registrada com fonte
Três perguntas de arquitetura (formato de upstream, escopo do handoff, nome do plugin) via `AskUserQuestion`
**antes** de sair do Plan Mode — não durante a execução. Cada resposta virou uma decisão `D#`/`CC-#` no
ledger com `fonte: "usuário, <citação>"` — nunca inferida.

### 3. Bootstrap por camadas, não por arquivo
Ordem que minimizou retrabalho: submodules fixados → `package.json`/`tsconfig` → biblioteca (`src/lib/`,
testável sem MCP) → servidores MCP (fina camada sobre a lib) → hooks → CLI → **só então** agents/skills/
commands (que dependem do manifesto de ferramentas MCP já existir). Regra de negócio na lib significa que
testar a máquina de estados não precisa subir um servidor MCP.

### 4. Ingestão do próprio material de entrada pelo próprio pipeline
O pacote Maestro e os upstreams entraram pelo pipeline de ingestão que o plugin define
(`ingestion_start` → `ING-0001`/`ING-0002`), não por cópia manual. Isso serviu de **primeiro teste real** do
pipeline (nó ponta a ponta) e produziu, de graça, o par original-imutável + registro rastreável que qualquer
ingestão futura também vai gerar.

### 5. Construir com o achado, não ao redor dele
Cada divergência entre o que o pacote assumia e o que a sessão provou virou correção no código, não uma
nota à parte:
- `Agent(qa-reviewer)` sem prefixo `maestro:` deixava a allowlist vazia → corrigido + regra de lint nova
  (`AGENT_ALLOWLIST`), achada rodando `claude -p` de verdade, não lendo a documentação.
- Eval comportamental (`EV-014`) revelou que, sem ledger no projeto, o servidor lia o ledger da **raiz do
  plugin** — um estado paralelo (I-06) que nenhum teste unitário pegava, só o E2E com `--plugin-dir` real.
- `.mcp.json` na raiz é lido duas vezes quando a raiz do repo é também o projeto → `disabledMcpjsonServers`.

**Lição:** eval comportamental com o binário real encontrou um bug de arquitetura que testes determinísticos
não alcançavam. As duas camadas de teste (determinística + comportamental) não são redundantes.

### 6. Evidência real antes de prometer nó `DONE`
Nenhuma transição para `DONE` no ledger foi feita "porque parece pronto" — cada uma citou o arquivo de
evidência (log do `npm run check`, `resultado.json` do E2E, o próprio registro de ingestão) e passou pela
ferramenta MCP `node_transition`, que recusa `DONE` sem evidência (I-04) e sem `dod` definido (I-02).
Isso incluiu o próprio E0: como esta sessão roda num contêiner cloud e não na máquina do usuário, o nó E0
foi para `VERIFY` → evidência → **`BLOCKED` deliberado** (`USER_ACTION_REQUIRED`) em vez de `DONE`, porque
parte da verificação (cópias de skill na máquina local, acesso ao registro `exe`) genuinamente não podia
ser provada daqui.

### 7. Merge sem apagar o que chegou em paralelo
Durante a execução, outra sessão do usuário empurrou 7 commits na mesma branch (`TASK-SPACE/`, ver
`DIV-007` no ledger). Em vez de descartar ou ignorar: `git fetch` + fast-forward local, `npm run check`
para confirmar que nada quebrou, e uma decisão `divergencia` registrada explicando o que é aquele conteúdo
e como ele será tratado — antes de seguir para o merge. Nunca sobrescrever histórico remoto que chegou
enquanto se trabalhava.

## Checklist reproduzível para a próxima sessão de upstream

1. `git fetch` + comparar com `origin` antes de qualquer commit — nunca assumir que o remoto não mudou.
2. Ler o material de entrada por inteiro antes de tocar em código (Plan Mode não é burocracia, é onde as
   perguntas caras acontecem baratas).
3. Provar comportamento do Claude Code/plugin na própria máquina antes de desenhar em cima — não confiar em
   documentação para comportamento versionável (nomes de allowlist, o que é carregado como componente,
   como hooks se propagam a subagentes).
4. Construir a lib antes da casca (MCP/hooks/agents) — regra de negócio testável sem depender de protocolo.
5. Todo componente novo entra pelo pipeline de ingestão (`docs/process/ingestion-pipeline.md`), inclusive
   quando o "componente" é o próprio material do handoff.
6. Rodar a suíte comportamental (`claude plugin eval`) além da determinística — ela pega bugs de estado que
   unit test não alcança.
7. `DONE` só com evidência citada e via `node_transition`; quando a verificação depende de algo fora do
   alcance da sessão (máquina local, credencial, registro externo), o nó correto é `BLOCKED` +
   `USER_ACTION_REQUIRED`, nunca `DONE` por otimismo.
8. Decisão que não é sua para tomar vira `D#` com recomendação e fonte pendente — nunca inferida.
9. Conteúdo que aparece de fora do seu controle (outra sessão, outro processo) na mesma branch: sincronizar,
   confirmar que nada quebrou, registrar como divergência — nunca descartar nem ignorar silenciosamente.
10. Squash de commits de checkpoint local antes do push é aceitável; **nunca** reescrever histórico que já
    foi empurrado por outra sessão (passo 7 acima) — dali em diante só fast-forward/merge.

## O que ficou fora de escopo (por decisão explícita, não por esquecimento)

- Modo B (plugin) do pacote original virou o modo único desta rodada (CC-002) — não há mais um "modo
  projeto" separado para manter.
- Agent SDK (F2/"Vera Agente") permanece fora: é referência (`agent-sdk-dev`), não implementação.
- Conectores externos (Notion, Linear, Vercel, Railway…) entram só quando o esquema de ferramentas for lido
  — nenhum foi assumido.
