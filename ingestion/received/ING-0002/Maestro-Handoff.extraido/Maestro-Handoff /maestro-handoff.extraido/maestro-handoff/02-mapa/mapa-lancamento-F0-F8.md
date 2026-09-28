# Mapa do lançamento — PEM-D16 · F0 → F8

> Texto entre aspas = **literal do briefing**. Todo o resto é proposta.
> Regra herdada do Copiloto: **dependência vence ordem numérica.** A coluna "Depende de" é
> **HIPÓTESE** a validar em E1 com o usuário (Regra do 3: ≤ 3 perguntas por rodada, ≤ 2 rodadas).
> Este mapa alimenta o estágio **L** (executar fase de lançamento). Não executar F# sem o
> gate de E6 verde.

| F | Literal do briefing | Leitura | Skills prováveis | Depende de (hip.) | Insumo faltando | DoD proposto (1 frase) |
|---|---|---|---|---|---|---|
| **F0** | "Blog ativo fullstack — todas dependências e plataformas configuradas" | **= handoff v1** (`handoff/`, estágios 0–8). **Importar como subárvore**, não refazer | `engineering:*`; ADR-001 (Obsidian/Minimal/Arrow) | — | Decisões `D1-v1…D6-v1` abertas (Astro×Arrow, HIG+Fluent, Power BI, licença `app.css`) | `npm run check` e `build` verdes + deploy em **preview** validado (produção só com aprovação) |
| **F1** | "3 packages pilares editoriais equivalentes aos níveis de consciência" | 3 Topic Packs. **Possível conflito:** "níveis de consciência" × arco do docx (Problema→Fatores→Exposição) | `obsidian-editorial-pipeline`, `rc-cognitive-risk-expert`, `executar-block-quick-frameworks`, `marketing:*` | F0 (publicar), F5 (produzir), F6 (processo) | **"fórmula de lançamento (equação)"** e ADRs granulares — **não fornecidos** | 3 packs `PRONTO_PARA_EMPACOTAR` no SOP-KP-001, claims `[E1/E2/S/FW]` fechados |
| **F2** | "Vera Agente" | agente público (o docx cita "agente de IA público" como captação gratuita). Nome "Vera" sem definição | Agent SDK (Blueprint v1), `rc` como conhecimento de domínio | F0; conhecimento de F1/F4 | Definição de "Vera" (escopo, persona, limites) | Agent Spec (C-02) aprovado + evals (C-03) P0 passando |
| **F3** | "Loja oficina" | Solution Store / Oficina | `executar-solution-store` | F0; ≥ 1 solução vinda de um pack (Bloco D, `produto_esperado=true`) | — | 1 solução em `STORE_READY` **preparada**; publicação = ação externa (I-05) |
| **F4** | "Mapa cognitivo" | Mapa Interativo de Risco Cognitivo (nome do domínio do `rc`) | `rc-cognitive-risk-expert`, `design:*`, `engineering:*` | F0; SOT do RC | Estado atual × alvo do produto (RC `prd.md`) | PRD (RC `prd.md`) + ADR aprovados; claims resolvidos no `claim-registry.csv` |
| **F5** | "CMS de produção" | provavelmente Obsidian → blog. **A DEFINIR** | `obsidian-editorial-pipeline` (D5), ADR-001 | F0 | Definição do que é "CMS" aqui | 1 ciclo do Obsidian gera ZIP que o blog consome |
| **F6** | "pipeline completo do arquivo BPM QUALIDADE" | **é o próprio Maestro:** ciclo de 8 fases + extensão agêntica. Não é uma fase de conteúdo, é o **processo que governa as outras** | trilha S inteira (E1→E9) | — | — | E9 fechado: SOP + Runbook + Eval Suite + observabilidade |
| **F7** | "Relatório descritivo de skills e capacidades técnicas" | **delta** do `EXECUTAR_SKILLS_REGISTRY` (`divergencias-e-lacunas.md` §8) | registro `exe`, `operations:process-doc` | E0 (inventário) | — | Delta aplicado ao registro; conectores com esquema lido **ou** `USER_ACTION_REQUIRED` |
| **F8** | "Workbook final resultante para iniciar a produção" | **A DEFINIR** (D8) | `gerar-workbook-deskgo` · `deskgo-business-workbook` · `plano-operacional-rastreavel` | F1–F7 | Qual workbook | Workbook gerado e validado pelo validador da skill escolhida |

## Ordem elegível sugerida (HIPÓTESE — o Maestro recalcula por dependência real)

```
F6 (processo) ─┬─► F0 (blog) ──► F5 (CMS) ──► F1 (packs) ──► F3 (loja)
               │                                  └────────► F4 (mapa) ──► F2 (Vera)
               └─► F7 (delta) — roda cedo (E0) e fecha no fim
                                                       F1..F7 ─► F8 (workbook)
```

> F6 fica **antes** de tudo porque é o processo que as demais obedecem — embora seja o 7º da lista.
> F7-delta roda em E0 porque o próprio desenho do Maestro precisa do inventário.

## Onde o docx do Process Doc entra

Ciclo de **15 dias**, peça-mãe → derivados, **3 packs = ~45 dias** (docx §5.3). Isso é a
cadência de **F1**. Se "níveis de consciência" e "arco de 3 artigos" forem duas coisas
diferentes, F1 muda de escopo — por isso a pergunta **D9** precede F1.

Ativos por ciclo (docx Tabela 5.1 = `default_assets` do Obsidian — **coincidem**, verificado):
1 artigo mãe · 1 vídeo mãe · 3 infográficos · 6 imagens · 6 carrosséis · 4 vídeos verticais ·
10–12 stories (Obsidian: 12) · 6 CTAs · 3 newsletters · 3 ebooks.

## Métricas do briefing (para a lane Operações / Analytics)

Downloads dos assets (blog + mídias sociais) · taxa de compartilhamento · comentários e reviews
das comunidades · taxas padrão de lançamento de ecossistema em mídias sociais.
**Metas numéricas: A DEFINIR** (o briefing não as fornece; não inventar).
