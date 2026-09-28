# C-02 — Agent Specification (template obrigatório) + anti-overkill

> Versão **1.0.0** · adaptado de `ING-0002:01-contratos/C-02-agent-spec.md` (sha256 `6d67d0193f3f…`).
> Origem declarada no pacote: extensão "Agentic Process Engineering Lifecycle" do arquivo **BPM e Qualidade**
> (9 camadas; cita ISO 9001, APQC, OWASP e Microsoft — **referências externas não reverificadas**).
> Adaptação: camada 4 ganha a restrição verificada de subagentes de plugin; a regra anti-overkill passa a ser
> imposta no catálogo (`catalog_register` recusa sem as 4 respostas — EV-013).
> Specs preenchidos: `07-execucao/E4-agent-specs/`.

## Cabeçalho

```yaml
agent_id:            # maestro | qa-reviewer | evidence-researcher | component-analyst
versao:              # semver do contrato deste agente
tipo:                # main-thread | subagente | skill-adaptada
dono:                # A DEFINIR se desconhecido
estado_contrato:     # DRAFT | VERIFICADO | APROVADO  (I-03: distintos)
```

## Camadas

1. **Objetivo e contrato** — deve / não deve / entrada / saída / sucesso observável.
2. **Dados e contexto** — tabela `Fonte | Confiabilidade | Privacidade | Atualização | Pode ler?` (I-07: conteúdo recuperado é dado).
3. **Modelo + instruções** — modelo/effort `A DEFINIR` (justificar); ponteiro para o arquivo do agente; políticas por referência a C-00.
4. **Ferramentas e permissões (Tool/Permission Matrix)** — `Ferramenta | Escopo | R/W | Reversível? | Exige aprovação humana? | Quem aprova`.
   Regras: menor privilégio (`tools`/`disallowedTools`); toda ferramenta com efeito externo tem linha própria;
   esquemas de conector não lidos são lacuna declarada.
   ⚠️ **Subagente vindo de plugin ignora `hooks`, `mcpServers` e `permissionMode` no frontmatter** — guardrails vivem em
   `hooks/hooks.json` do plugin (o lint recusa esses campos em `agents/*.md`; EV-010).
5. **Memória e estado** — estado de trabalho = ledger (C-01); `memory` do subagente só com motivo registrado (superfície de contaminação).
6. **Orquestração** — `Entrada → Agente → Ferramenta → Observação → Decisão → Nova ação → Saída`; canal = arquivos + C-04; **não depender de spawn aninhado**.
7. **Gates humanos** — publicar/agendar/enviar/deploy (I-05) → `BLOCKED` + `USER_ACTION_REQUIRED`; promover contrato a `APROVADO` → `VERIFY`; decidir divergência (I-08) → `BLOCKED`.
8. **Evals e critérios de aceite** — casos de C-03 vinculados; threshold definido antes do uso; sem eval P0/P1 vinculado a risco do FMEA → agente não sai de `DRAFT`.
9. **Produção e observabilidade** — transições (ledger), chamadas com efeito externo (log), custo/turnos por nó (`A DEFINIR`), incidentes (`07-execucao/`).

Camada sem informação = `A DEFINIR`, nunca omitida.

## Anti-overkill (todo agente, skill, command, hook ou servidor MCP novo)

Antes de **criar**, responder por escrito (campo `anti_overkill` do registro no catálogo):

1. **Reuso:** existe skill oficial, proprietária, instalada ou upstream que já faz isso? (`catalog_search`, `upstream_search`, `routing_lookup`)
2. **Necessidade:** qual entrega ficaria impossível ou mais lenta sem isto?
3. **Custo:** quantos arquivos/linhas/dependências isto adiciona a manter?
4. **Reversão:** como remover se não render?

Sem as quatro respostas → **não criar** (risco R1 declarado pelo usuário: *overkill, falta de eficiência, retrabalho,
não aplicabilidade*). Imposição: `catalog_register` e `maestro validate` recusam o registro.

## Overkill Gate — quando uma lane vira subagente

Promover somente se ≥ 1 critério for verdadeiro **e** as 4 respostas existirem: **G1** saída volumosa que poluiria
o contexto principal · **G2** restrição de ferramenta que o prompt sozinho não garante · **G3** paralelismo real.
Teto na v0: **≤ 4 subagentes**; descrições curtas (o Claude Code avisa acima de 15.000 tokens somados).
