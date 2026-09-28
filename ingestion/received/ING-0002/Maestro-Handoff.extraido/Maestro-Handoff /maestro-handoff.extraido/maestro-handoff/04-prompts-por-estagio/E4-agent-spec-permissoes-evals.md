# E4 — Agent Spec, Tool/Permission Matrix e Eval Suite  (extensão agêntica do BPM)

## OBJECTIVE
Especificar **antes de construir**: contrato de cada agente (9 camadas), matriz de permissões e suíte de evals executável.

## CONTEXT
"Não basta 'funcionou'": casos, métricas e thresholds definidos antes do deploy. Ponto de partida: `03-arquitetura-alvo/maestro.agent-spec.md`.

## INPUT
`E2-*`, `E3-fmea.md`, `C-02`, `C-03`, `C-04`.

## CONSTRAINTS
- **Um** Agent Spec por agente aprovado em E2 (Maestro + folhas) e um resumido por skill integrada.
- Menor privilégio por linha da matriz; ferramentas de efeito externo com aprovação humana.
- Guardrails no nível do projeto/plugin, **não** só no frontmatter (EV-010).
- Skill: `engineering:testing-strategy` (pirâmide) para a suíte.

## EXECUTION
1. Preencher C-02 para cada agente; `A DEFINIR` onde faltar evidência.
2. Fechar a Tool/Permission Matrix; listar conectores com esquema **não lido** como lacuna.
3. Expandir C-03: um caso por risco P0/P1 do FMEA; transformar casos em arquivos executáveis (`evals/`).
4. Definir thresholds e métricas (reuso÷criação, retrabalho, perguntas/estágio, tempo/nó).
5. Definir o adaptador de skill (C-01) como **instrução**, não código, salvo necessidade provada.

## OUTPUT CONTRACT
`07-execucao/E4-agent-specs/*.md`, `E4-tool-permission-matrix.md`, `evals/*` (executáveis), `E4-eval-suite.md` (thresholds).

## VALIDATION
Nenhum agente sai de `DRAFT` sem eval P0/P1 vinculado; toda ferramenta de escrita externa tem aprovação definida.

## STOP CONDITIONS
Threshold indefinido → parar (não há como aprovar depois).
