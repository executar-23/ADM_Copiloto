---
id: {{ID}}
titulo: "{{TITULO}}"
status: aberta            # aberta | integrada | parcial | rejeitada
estagio_atual: RECEIVE    # RECEIVE … REGISTER (atualize a cada estágio)
recebido_em: {{DATA}}
origem: "{{ORIGEM}}"
received_dir: {{RECEIVED_DIR}}
componentes: []           # [{nome, tipo, decisao: pendente|adaptar|reutilizar|rejeitar|referenciar, destino, catalog_id}]
---

# {{ID}} — {{TITULO}}

> Registro permanente do pipeline de ingestão (`docs/process/ingestion-pipeline.md`).
> Cada seção é preenchida no seu estágio. Enquanto não houver conteúdo, escreva `PENDENTE`.
> Nada é inventado: sem base → `A DEFINIR` (I-02). Divergência → registrar, nunca escolher em silêncio (I-08).

## 1. RECEIVE

- **Origem:** {{ORIGEM}}
- **Itens recebidos:**
{{ITENS}}
- **Originais imutáveis:** `{{RECEIVED_DIR}}` · manifesto: {{MANIFEST}}

## 2. ANALYZE

PENDENTE — por componente: propósito, entradas/saídas, dependências (skills, ferramentas, MCP, runtime), referências internas, tamanho. Ferramenta: `component_inspect`.

## 3. CLASSIFY

PENDENTE — tabela `componente | tipo detectado | camada (Agent/Skill/Command/MCP Tool/Hook) | confiança | observação`.

## 4. COMPARE

PENDENTE — padrões Anthropic aplicáveis (plugin-dev, mcp-server-dev, Agent Skills, Knowledge Work) e equivalentes existentes no catálogo/upstream. Ferramentas: `upstream_search`, `catalog_search`, `skill_fingerprint` (drift).

## 5. CHECK_CONFLICTS

PENDENTE — colisões de nome/namespace, duplicações, conflitos de contrato (C-00…C-04), riscos (agência excessiva, injeção via conteúdo, guardrail no lugar errado, overkill). Ferramenta: `conflict_check`.

## 6. ADAPT

PENDENTE — decisão por componente (**adaptar / reutilizar / rejeitar / referenciar**) com motivo e as 4 respostas anti-overkill (Reuso, Necessidade, Custo, Reversão) para tudo que for criado. O que mudou em relação ao original e por quê.

## 7. VALIDATE

PENDENTE — `npm run validate`, `claude plugin validate --strict .`, lint dos componentes; resultado colado ou resumido com o comando.

## 8. TEST

PENDENTE — testes executados (unit/integration/e2e/evals) e resultado; testes criados para o componente.

## 9. DOCUMENT

PENDENTE — documentação criada/atualizada (README, docs/, skill references).

## 10. INTEGRATE

PENDENTE — destino final de cada componente (caminho no plugin), commit/PR.

## 11. REGISTER

PENDENTE — ids registrados no catálogo (`catalog_register`), nó do ledger atualizado, status final deste registro.
