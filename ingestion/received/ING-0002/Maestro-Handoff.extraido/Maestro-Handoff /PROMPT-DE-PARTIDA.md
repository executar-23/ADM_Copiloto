# Prompt de partida para o Claude Code (Plan Mode)

Cole isto no Claude Code, na raiz do diretório `maestro-handoff/`:

---

Você está em Plan Mode. Leia nesta ordem, por inteiro:

1. `00-LEIA-PRIMEIRO/HANDOFF.md`
2. `00-LEIA-PRIMEIRO/CLAUDE.md`
3. `01-contratos/C-00-invariantes-comuns.md`
4. `01-contratos/C-01-estado-unificado.md`
5. `02-mapa/divergencias-e-lacunas.md`

Depois:

1. Execute o **Estágio E0** (`04-prompts-por-estagio/E0-verificacao-e-inventario.md`), em
   modo somente leitura, e salve o resultado em `07-execucao/E0-verificacao.md`.
2. Com base no resultado de E0, apresente um **plano** que inclua sua recomendação para as
   decisões D4, D5, D6, D7, D8 (as que E0 resolve) e liste as demais (D1, D2, D3, D9, D10,
   D11) como pendentes para os estágios seguintes.
3. **Aguarde minha aprovação** antes de instalar qualquer skill/plugin, criar qualquer
   agente, ou escrever fora de `07-execucao/`.

Se qualquer comportamento do Claude Code assumido nos contratos (spawn de subagente,
hooks, `--agent`) não se confirmar na minha instalação, pare e me diga exatamente o que
encontrou — não ajuste o plano em silêncio para compensar.

---
