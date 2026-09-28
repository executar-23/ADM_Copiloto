# E2 — Desenho e modelagem  (BPM fases 2–3 · Process Design + BPMN + topologia)

## OBJECTIVE
Desenhar o processo do lançamento e a topologia do Maestro; **decidir** D1, D2, D3, D10, D11 por ADR.

## CONTEXT
Hipóteses a validar: H-arq-1 (`03-arquitetura-alvo/maestro-topologia.md`), H-est-1 (`C-01`), correspondência Tarefas×Etapas (§2).

## INPUT
`E1-*`, `01-contratos/*`, `03-arquitetura-alvo/*`, `02-mapa/*`.

## CONSTRAINTS
- Skills: `engineering:system-design`, `engineering:architecture`; formato de ADR **único** (oficial × RC — escolher e registrar).
- Fluxos em Mermaid `flowchart TD` (vertical).
- Anti-overkill (C-02) antes de propor qualquer agente/skill/arquivo novo.
- **Não depender de spawn aninhado** (resultado de E0).

## EXECUTION
1. Process Design + modelo do fluxo do lançamento (dependências F0–F8 validadas).
2. Tabela de roteamento final: para cada linha da matriz, **uma** skill vencedora + motivo; resolver sobreposições (`inventario-skills.md` §D).
3. Aplicar o **Overkill Gate** às lanes; decidir folhas (teto 4).
4. Validar H-est-1 contra `state-contract.json` do Copiloto e `RUN_STATE.yaml`; decidir D1.
5. D2: implementar por **change control** as 4 lacunas do SOP (GEO, Topic Pack, arco, nomenclatura) — ou registrar a escolha contrária.
6. D3: definir a versão canônica de `executar-block-quick-frameworks` e onde mora a identidade visual.
7. D11: fronteira Maestro × Copiloto.

## OUTPUT CONTRACT
`07-execucao/E2-desenho.md`, `02-adr/ADR-M001…` (uma decisão por ADR, ≥ 2 opções + trade-off), roteamento em `mapa/roteamento.md`.

## VALIDATION
Toda linha de `matriz-entregas-x-lanes.md` tem skill vencedora ou lacuna declarada; nenhuma decisão `D#` fica implícita.

## STOP CONDITIONS
D1 ou D3 sem decisão do usuário → parar (mudam contrato e fonte de skill).
