<!-- Referência ingerida em ING-0002 a partir de ING-0002:02-mapa/ficha-22-pontos.md (sha256 08cb595156b3…). Conteúdo preservado; hipóteses continuam HIPÓTESE.
     Adaptações de caminho: '07-execucao/ESTADO.md' → ledger canônico 07-execucao/estado.json (projeção ESTADO.md); '01-contratos/' → contratos/; '02-mapa/' → mapa/.
     Atualizações seguem change control (I-10): não reescrever; acrescentar nota datada. -->

# Ficha de caracterização — PEM-D16 · status dos 22 pontos

> **A legenda dos 22 pontos (os títulos) não foi fornecida.** Por isso a coluna "Ponto" traz só
> o **número recebido** e o **resumo do que você escreveu** — nenhum título foi inventado.
> Numeração recebida: `1 · 2 · 3 · 4–10 · 5 · 6>7 · 8–9 · 11–15 · 16–17 · 18 · 18–19 · 20 · 21 · 22`.
> Ela **sobrepõe** (`5` dentro de `4–10`; `18` aparece duas vezes) — **não normalizar sem a legenda** (D9).

## Legenda de status
`PREENCHIDO` = há conteúdo no briefing · `PARCIAL` = há conteúdo, mas remete a anexo que
falta · `REMETE` = só aponta para anexo não fornecido · `TBD` = o briefing diz "TBD".

| # | Resumo do que o briefing traz | Status | Depende de |
|---|---|---|---|
| 1 | "Risco cognitivo · ID PEM-D16 · V1 · Adm dev" (nome, ID, versão, responsável) | PREENCHIDO | — |
| 2 | "Projeto" (tipo) | PREENCHIDO | — |
| 3 | Blog editorial + plataforma para neurodivergentes, gestão de projetos/processos neuroadaptativos e controle de riscos cognitivos; falta conhecimento técnico didático baseado em evidências; oportunidade: tema pouco explorado e de alta demanda | PREENCHIDO | — |
| 4 | Relação com o Programa Executar/ecossistema: primeiro canal de divulgação, amostra beta, validação de demanda; correlação com 6 lançamentos (App, Consultoria, Marketplace, Comunidade/ONG, Schola.ai, posteriores) | **PARCIAL** | README do ecossistema |
| 5 | Valor: conhecimento técnico em linguagem prática/didática + assets práticos, para trabalhador solo/autônomo com dificuldades de autogestão | PREENCHIDO | — |
| 6 | Expectativa de resultados ligada às métricas | PREENCHIDO | metas numéricas: A DEFINIR |
| 7 | Métricas: downloads de assets, compartilhamento, comentários/reviews, taxas padrão de lançamento | PREENCHIDO | metas numéricas: A DEFINIR |
| 8 | Lançamento inclui F0–F8 (lista completa em `mapa-lancamento-F0-F8.md`) | **PARCIAL** | ADRs do lançamento granular |
| 9 | (idem 8; "ver ADRs do lançamento granular") | **PARCIAL** | ADRs do lançamento granular |
| 10 | Só "ver anexo README do ecossistema" | **REMETE** | README do ecossistema |
| 11–15 | "TBD" | **TBD** (5 pontos) | descoberta (E1) |
| 16–17 | "TBD" | **TBD** (2 pontos) | descoberta (E1) |
| 18 | "TBD" (primeira ocorrência) | **TBD** | descoberta (E1) |
| 19 *(lido como "18–19")* | Riscos principais: overkill, falta de eficiência, retrabalho, não aplicabilidade — riscos de código e engenharia | **PARCIAL** (só categorias; sem probabilidade/impacto/controle) | E3 (FMEA) |
| 20 | "TBD" | **TBD** | descoberta (E1) |
| 21 | "TBD" | **TBD** | descoberta (E1) |
| 22 | "TBD" | **TBD** | descoberta (E1) |

## Contagem (soma = 22)

| Status | Pontos | Qtde |
|---|---|---|
| PREENCHIDO | 1, 2, 3, 5, 6, 7 | **6** |
| PARCIAL | 4, 8, 9, 19 | **4** |
| REMETE | 10 | **1** |
| TBD | 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22 | **11** |

> "19 = riscos" é **leitura minha** da entrada `18–19` (o briefing repete o `18`). Confirmar.

## Protocolo de preenchimento (para o estágio E1)

1. **Preencher só com evidência** (I-02). Fonte aceita: o briefing, o README (quando vier), os ADRs granulares
   (quando vierem), o Process Doc, o `rc` (para claims de domínio), pesquisa citada.
2. **Ponto `TBD` → pergunta**, agrupada: no máximo **3 perguntas por rodada, 2 rodadas**. O que sobrar
   fica `A DEFINIR` (é resultado válido, não falha).
3. **Cada ponto preenchido guarda** `fonte` + `classe_evidencia` (`A_OBSERVADO…E_INFERIDO`).
   Inferência do agente entra como `E_INFERIDO` e **exige confirmação** para virar `D_INTERNO`.
4. **Ficha completa** ≠ ficha **aprovada**: a promoção exige o usuário (I-03).
5. Ponto 19: alimentar o FMEA de E3; **não** criar segundo registro de riscos.
6. Persistir como **nó `FICHA`** do ESTADO.md (uma linha por ponto) — **sem** criar novo arquivo de controle.
