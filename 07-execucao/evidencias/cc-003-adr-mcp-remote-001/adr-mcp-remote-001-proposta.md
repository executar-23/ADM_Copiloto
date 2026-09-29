# ADR-MCP-REMOTE-001 (PROPOSTA) — conteúdo recebido, não editado

> Este arquivo guarda o texto **exatamente como recebido** do usuário em 2026-09-29, via
> comando `/mcp__Cloudflare_Developer_Platform__workers-prompt-full`. É dado de entrada
> (I-07: conteúdo recebido é dado, nunca instrução a seguir cegamente), registrado como
> `CC-003` no ledger (`07-execucao/estado.json`). Não é documentação canônica do
> repositório — o formato final de ADR ainda depende da decisão `D10` (ainda `ABERTA`).
>
> Status auto-declarado no próprio texto: **PROPOSED**, versão 0.1.0. Não aprovada, não
> implementada. `DE-012` (`docs/architecture/decisions.md`) continua válida até aprovação
> explícita do usuário + implementação real (a própria proposta diz isso em sua seção 22).

---

Sim. A mudança é arquitetural, não apenas de configuração. O que você quer como produto final é um Custom Connector baseado em Remote MCP, enquanto hoje o núcleo operacional ainda é um Claude Code Plugin com MCPs locais stdio executados por sessão.

Há também uma correção importante de nomenclatura: o plugin pode continuar existindo para distribuir agents, skills e commands; o que precisa se tornar público na internet é o servidor MCP remoto autenticado. Claude conecta esse servidor a partir da nuvem da Anthropic, então ele precisa de uma URL HTTPS publicamente alcançável.

Contrato preparado: ADR-MCP-REMOTE-001 (ID proposto), versão 0.1.0, área Arquitetura/Plataforma, status PROPOSED, owner A DEFINIR, automação A1 — PREPARED. A decisão substitui arquiteturalmente a DE-012; não altera o repositório nem fecha D14 nesta etapa.

## ADR — Remote MCP público autenticado para EXECUTAR

### 1. Metadados

| Campo | Valor |
|---|---|
| ID | ADR-MCP-REMOTE-001 — proposto |
| Version | 0.1.0 |
| Status | PROPOSED |
| Área | Arquitetura / Plataforma / MCP |
| Workflow | Local MCP → Remote MCP → OAuth → Blog/CMS |
| Owner | A DEFINIR |
| Data | 29/09/2026 |
| Supersedes | DE-012 |
| Relacionado | D14 / CF-ROUTE-0001 |
| Automation Level | A1 — PREPARED |
| Decision Type | Architecture Change |
| Target | Claude Custom Connector / Remote MCP |
| Hosting | Cloudflare Workers |
| Transport | Streamable HTTP |
| Authentication | OAuth 2.1 |
| Client Identity | CIMD / Claude Published Identity como caminho preferencial |
| Fallback Client Registration | DCR somente para compatibilidade |
| Public MCP URL | A DEFINIR após deploy |

### 2. Contexto

O repositório `executar-23/ADM_Copiloto` implementa atualmente o Maestro como Claude Code Plugin.

O plugin carrega dois servidores MCP locais por meio de `.mcp.json`: `estado` e `registry`. Ambos usam:

```
Claude Code → Plugin Maestro → .mcp.json → stdio → Node local → dist/mcp/estado.js / dist/mcp/registry.js
```

Esse modelo depende da execução local e do filesystem da máquina ou workspace onde Claude Code está rodando.

Separadamente, existe `cloudflare-worker/`, mas sua arquitetura atual foi deliberadamente construída como: Remote MCP + público + Streamable HTTP + somente leitura + sem autenticação de usuário + GitHub como fonte.

Seu objetivo atual é diferente. O MCP deve se tornar um serviço de integração real do ecossistema EXECUTAR, acessível como Custom Connector e capaz de autenticar usuários e operar sobre o Blog e a plataforma CMS.

### 3. Problema

A arquitetura atual não satisfaz os requisitos do produto.

O Worker remoto atual não possui: autenticação OAuth do usuário; autorização por escopo; login; consentimento; identidade delegada; integração real com Blog; integração real com CMS; ferramentas operacionais de conteúdo; identidade do usuário propagada ao domínio de negócio; política de leitura/escrita por usuário; backend remoto capaz de substituir funcionalidades dependentes de filesystem.

Portanto: **REMOTE atual ≠ Custom Connector operacional desejado**

### 4. Decisão

Será criada uma nova arquitetura de Remote MCP público autenticado, hospedada em Cloudflare Workers e acessível por URL HTTPS estável. O endpoint público será o ponto canônico de integração para clientes MCP externos.

Arquitetura alvo: Claude/outro MCP Host → Custom Connector → `https://<dominio>/mcp` (Streamable HTTP + OAuth 2.1) → Cloudflare MCP Gateway (OAuth 2.1, MCP Authorization Discovery, CIMD, PKCE, Scope Enforcement) → MCP Tool Router (identity, authorization, validation, audit, tool dispatch) → Blog Adapter / CMS Adapter → Blog API / CMS API.

O Remote MCP deixa de ser apenas um espelho de arquivos GitHub e passa a ser um integration gateway autenticado.

### 5. Distinção entre Plugin e Connector

O Claude Code Plugin não será confundido com o Custom Connector.

- **Plugin**: continua distribuindo `agents/`, `skills/`, `commands/`, `hooks/` e demais componentes específicos do ambiente Claude Code.
- **Remote MCP / Custom Connector**: passa a fornecer capacidade remota + autenticação + autorização + integrações + tools.

O Remote MCP será utilizável independentemente da instalação local do plugin.

### 6. Transporte MCP

Transporte canônico: Streamable HTTP. Endpoint: `POST https://<dominio>/mcp`. Não será adotado SSE legado como arquitetura nova.

O Worker atual baseado em `McpAgent` deverá ser revisado. Para uma nova implementação stateless, o alvo será o handler Streamable HTTP recomendado pela stack atual da Cloudflare (conceitualmente `createMcpHandler(...)`). Durable Objects não devem ser usados apenas para manter sessão MCP se não houver outro requisito real de estado.

### 7. OAuth e autenticação

O Remote MCP não deverá operar como endpoint operacional anônimo. Quando um cliente tenta usar `https://<dominio>/mcp` sem credencial válida, o servidor deverá iniciar o fluxo MCP OAuth: `401` + OAuth metadata → Claude descobre Authorization Server → browser → sign-in → consentimento → Authorization Code → PKCE Token Exchange → Access Token → `Authorization: Bearer ...`.

A camada Cloudflare será responsável por autenticar e autorizar antes que uma ferramenta operacional seja executada.

### 8. Endpoints OAuth necessários

A implementação deverá fornecer ou expor corretamente: `/mcp`, `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server`, `/authorize`, `/token`. Para compatibilidade transitória poderá existir `/register`, mas Dynamic Client Registration não será o modelo primário da arquitetura.

### 9. Claude Published Identity / CIMD

O desenho deve priorizar Client ID Metadata Documents. Objetivo de experiência no Claude: "Add custom connector" → URL do servidor MCP → "Sign in now" → "Use Claude's published identity". O Authorization Server deverá anunciar suporte equivalente a `client_id_metadata_document_supported = true`. Não deve ser necessário armazenar um `client_secret` estático do Claude para esse caminho. Dynamic Client Registration poderá permanecer apenas como fallback temporário de compatibilidade.

### 10. OAuth Provider no Cloudflare

A camada de autorização deverá utilizar a infraestrutura OAuth do Worker: OAuth Provider (discovery, authorize, token, consent, token validation) + MCP Resource Server (`/mcp`). A implementação poderá utilizar `@cloudflare/workers-oauth-provider` ou seu sucessor oficial compatível com a versão MCP adotada.

O servidor MCP deve validar, no mínimo: issuer; audience/resource; access token; scopes; expiration; usuário; cliente; autorização solicitada.

### 11. Identity Provider

O provedor responsável por autenticar a pessoa é: **A DEFINIR**. Opções arquiteturalmente compatíveis incluem: Cloudflare Access; provedor OAuth/OIDC existente; provedor próprio do ecossistema EXECUTAR. A ADR não seleciona silenciosamente um provedor porque a identidade atualmente utilizada pelo Blog/CMS ainda precisa ser inspecionada.

### 12. Modelo de identidade

Após autenticação, cada chamada MCP deverá possuir contexto identificável (`user_id`, `client_id`, `scopes[]`, `tenant/workspace`, `session/grant reference`, `authorization metadata`). Regra: **permissão do MCP ≤ permissão do usuário autenticado**.

### 13. Blog e CMS

O Remote MCP passará a ser a camada de integração entre o agente e o EXECUTAR Blog e o EXECUTAR CMS: Claude → OAuth → Remote MCP → Tool authorization → Domain Adapter → Blog / CMS. Não será adotado acesso direto ao banco de dados sem uma decisão arquitetural específica. Preferência: MCP Tool → Application/Domain Service → Blog/CMS API → Database. Isso preserva regras de negócio fora do MCP.

### 14. Adapters

Estrutura conceitual proposta em `cloudflare-worker/src/`: `mcp/{server.ts,tools/,schemas/}`, `auth/{provider.ts,discovery.ts,scopes.ts,consent.ts}`, `identity/context.ts`, `integrations/{blog/{client.ts,adapter.ts},cms/{client.ts,adapter.ts}}`, `policy/authorization.ts`, `index.ts`. Os nomes definitivos poderão ser adaptados ao padrão existente do repositório.

### 15. Tool model

O schema exato das ferramentas dependerá das APIs reais do Blog e CMS e é **A DEFINIR** após inspeção das APIs. A arquitetura deverá separar semanticamente READ / WRITE / PUBLISH / ADMIN (ex. não-final: `content.read`, `content.search`, `content.create`, `content.update`, `content.publish`, `content.admin`). Cada categoria deverá corresponder a scopes OAuth próprios.

### 16. Scopes

Estrutura conceitual: `content:read`, `content:write`, `content:publish`, `cms:read`, `cms:write`, `admin`. Nomes exatos **A DEFINIR**. Uma ferramenta deverá declarar a permissão necessária e o Tool Router deverá recusá-la quando o access token não possuir o scope correspondente.

### 17. Escrita e publicação

Ferramentas que alterem conteúdo devem permanecer separadas das ferramentas de leitura (READ sem mutação / WRITE altera draft-configuração / PUBLISH gera efeito público). A publicação deverá possuir controle explícito de autorização. O MCP não deverá tratar "create draft" e "publish production" como equivalentes.

### 18. Persistência

O conteúdo editorial não deve ser duplicado no MCP sem necessidade — fonte canônica: Blog/CMS. O Worker poderá necessitar armazenamento próprio para grants OAuth, metadados de autorização, consentimento, auditoria, configurações do conector. A necessidade de KV/D1/R2/Durable Objects deve ser decidida pelo tipo de dado, não porque esses serviços existem.

### 19. Ledger estado e registry

Os dois servidores locais NÃO devem ser removidos imediatamente — dependem profundamente do filesystem (`07-execucao/estado.json`, `catalog/`, `ingestion/`, `vendor/`, `mapa/`). A migração será em estágios:

- **Estado inicial**: `estado`/`registry` → stdio local; `remote` → read-only Cloudflare.
- **Estado intermediário**: `estado`/`registry` → stdio local; `public MCP` → OAuth + Blog + CMS + ferramentas remotas.
- **Estado futuro**: só após paridade comprovada, Claude → Public Remote MCP (`state`, `registry`, `blog`, `cms`). Só então uma decisão separada poderia descontinuar os MCPs locais por padrão.

### 20. Estado remoto do Maestro

Caso `estado` seja posteriormente movido para o Remote MCP, o filesystem não será o banco operacional do serviço — exigiria nova decisão para uma fonte remota persistente (ex.: `estado.json` viraria export/projection em vez de fonte transacional). **Essa migração está fora do escopo desta ADR.**

### 21. Nova topologia

```
INTERNET → Claude Custom Connector → (Streamable HTTP, OAuth 2.1) → CLOUDFLARE WORKER (https://.../mcp)
  → OAuth / Tool Router / Audit → Identity / Blog Adapter / CMS Adapter → Blog API / CMS API
```

### 22. Impacto sobre o Worker atual

`cloudflare-worker/src/index.ts` não deve simplesmente "ser publicado como está" — é um espelho read-only de `estado.json` e `roteamento.json`; publicar esse código resolveria apenas a URL, não autenticação nem Blog/CMS.

AS-IS: GitHub public mirror + 4 read-only tools. TO-BE: authenticated MCP gateway + identity + authorization + Blog integration + CMS integration + audit.

Consequentemente, a `DE-012` deixa de representar a arquitetura alvo. Ela deverá ser registrada como **SUPERSEDED** *após aprovação e implementação desta decisão* — não antes.

### 23. Mudança de implementação do transporte

O Worker atual utiliza `McpAgent`. Para a nova arquitetura será adotado o mecanismo atual recomendado para novos Remote MCP servers com Streamable HTTP stateless, salvo se um requisito real exigir estado de protocolo (conceitualmente `createMcpHandler()` ou equivalente oficial vigente no momento da implementação). A decisão evita acoplar a nova infraestrutura a sessões persistentes que o protocolo não exige.

### 24. `.mcp.json`

Não remover imediatamente `estado`/`registry` do `.mcp.json`. Durante a migração, local MCP + remote MCP podem coexistir. Depois que as ferramentas remotas atingirem paridade e os agents forem atualizados, uma ADR complementar poderá decidir se o plugin passará a consumir apenas `https://<dominio>/mcp`.

### 25. Experiência desejada no Claude

Critério de produto: `Customize → Connectors → Add custom connector → EXECUTAR → https://<dominio>/mcp`, o cliente detecta a configuração de autenticação (`Authentication: Sign in now`, `OAuth client: Use Claude's published identity`, `Connect` → browser → sign-in → consent → Claude conectado), depois `tools/list` → EXECUTAR tools → Blog/CMS.

### 26. Segurança obrigatória

HTTPS obrigatório; OAuth 2.1; PKCE; validação de issuer; tokens vinculados ao recurso correto; scopes mínimos; consentimento explícito; isolamento por usuário; ausência de secrets no código; secrets via Cloudflare Secrets; logs sem access tokens; ferramentas de escrita separadas das de leitura; publicação separada de criação/edição; proteção CSRF no fluxo de consentimento quando aplicável; rate limiting e controle de abuso antes da abertura pública.

### 27. Compatibilidade

Projetado para MCP `2026-07-28`, mantendo compatibilidade adequada com clientes Streamable HTTP 2025 suportados pela stack Cloudflare utilizada. DCR poderá existir como fallback enquanto clientes antigos ainda dependerem dele — não deverá constituir o padrão primário.

### 28. URL pública

Produção deverá possuir uma URL estável (ex. conceitual `https://mcp.<dominio-executar>/mcp`). Valor real: **A DEFINIR**. A URL nunca deverá ser registrada no ledger antes de deployment e verificação reais. Para staging poderá ser utilizada inicialmente a URL `workers.dev`.

### 29. Integrações pendentes

Antes de implementar as ferramentas de domínio deverão ser inspecionados:

- **Blog**: API/base URL, Authentication, Schema, Read/Write/Publish operations — todos **A DEFINIR**.
- **CMS**: API/base URL, Authentication, Schema, User/role model, Read/Write/Publish operations — todos **A DEFINIR**.

Nenhum desses contratos deve ser inferido.

### 30. Migração (6 fases)

1. **Foundation**: Cloudflare Remote MCP, Streamable HTTP, OAuth discovery, CIMD, PKCE, Sign-in, Scopes, Consent. Resultado: Claude consegue autenticar e executar uma tool `whoami`/`health` controlada.
2. **Blog**: inspecionar API real, criar `BlogAdapter`, mapear tools às operações permitidas, verificar read/write/publish/permissions.
3. **CMS**: inspecionar API real, criar `CmsAdapter`, mapear roles/scopes, verificar leitura e mutações.
4. **Public Connector**: publicar Worker, registrar URL real, configurar Custom Connector, executar OAuth completo (discovery, sign-in, consent, token, `tools/list`, read, write autorizado, revocation/reconnect).
5. **Plugin integration**: atualizar agentes/skills para reconhecer o Remote MCP como integration plane; manter local `estado`/`registry` até paridade comprovada.
6. **Remote parity** (somente se ainda desejado): migrar state backend; migrar registry; retirar dependência operacional do filesystem; substituir MCPs stdio pelo endpoint remoto. Exige ADR complementar.

### 31. Critérios de aceite

Transport: endpoint HTTPS público existe; `/mcp` responde via Streamable HTTP; MCP Inspector conecta.

OAuth: acesso anônimo a ferramenta protegida recebe challenge adequado; Protected Resource Metadata é descoberto; Authorization Server Metadata é descoberto; PKCE funciona; Sign-in funciona; consentimento funciona; access token válido permite acesso; access token inválido é recusado; scopes são aplicados; suporte CIMD é anunciado e testado; Claude consegue usar sua identidade publicada, quando suportado pelo cliente.

Claude: Custom Connector aceita a URL; autenticação é detectada; login completa; `tools/list` retorna ferramentas; uma operação de leitura real funciona.

Blog: API real inspecionada; adapter testado; pelo menos uma operação real verificada.

CMS: API real inspecionada; adapter testado; pelo menos uma operação real verificada.

Escrita: scopes específicos controlam mutações; usuário sem permissão não consegue escrever; publicação possui permissão específica; auditoria identifica usuário + tool + ação + resultado.

Segurança: nenhum secret no repositório; nenhum token completo nos logs; issuer validado; resource/audience validado; teste de revogação realizado.

### 32. Rollback

A migração não removerá inicialmente os MCPs locais. Rollback: desabilitar Remote MCP → manter `estado`/`registry` local → nenhuma perda do plugin atual. Essa estratégia reduz o risco da mudança.

### 33. Consequências

**Positivas**: Custom Connector verdadeiro; acesso independente da máquina local; autenticação por usuário; autorização por escopo; integração real com Blog/CMS; compatibilidade com Claude Web/Desktop; endpoint reutilizável por outros MCP Hosts; infraestrutura centralizada; auditabilidade; base para produto público.

**Custos**: infraestrutura OAuth; gerenciamento de identidade; política de scopes; backend de integração; segurança pública; observabilidade; testes de autorização; migração posterior de capacidades filesystem-dependent.

### 34. Decisões explicitamente não tomadas

Esta ADR NÃO decide: Identity Provider definitivo; API exata do Blog; API exata do CMS; banco utilizado pelo CMS; migração do ledger para D1; migração integral do Registry; remoção dos MCPs locais; domínio final; publicação pública em diretório de conectores. Todos permanecem A DEFINIR até evidência aplicável.

### 35. Resultado da decisão

A arquitetura alvo deixa de ser "Claude Code → MCP local por sessão → filesystem" como único plano operacional. Passa a existir como plano principal de integração: Claude → Custom Connector → OAuth → Remote MCP → Cloudflare → EXECUTAR Domain Layer → Blog + CMS. O Claude Code Plugin permanece como pacote de comportamento e desenvolvimento, enquanto o Remote MCP passa a ser o plano público de integração do ecossistema EXECUTAR.

### 36. Decision

**PROPOSED.** Construir e publicar um Remote MCP autenticado no Cloudflare, baseado em Streamable HTTP e OAuth 2.1, com suporte preferencial a Client ID Metadata Documents, destinado a funcionar como Custom Connector do EXECUTAR e gateway autorizado para Blog e CMS.

A DE-012, que define o Worker como espelho público somente leitura do GitHub, deverá ser superseded quando essa arquitetura for aprovada e implementada. Os MCPs locais `estado` e `registry` permanecem durante a migração até que uma decisão posterior prove paridade funcional e defina uma fonte remota de estado.

Há três consequências técnicas importantes dessa ADR. Primeiro, o Worker atual não deve ser apenas "publicado como está" — é um espelho read-only de `estado.json` e `roteamento.json`; publicar esse código resolveria apenas a URL, não autenticação nem Blog/CMS. Segundo, a stack atual da Cloudflare confirma o desenho: Remote MCP usa Streamable HTTP; OAuth 2.1 é a camada de autorização; o Worker pode usar a biblioteca OAuth Provider; e a revisão MCP de 28 de julho de 2026 passou a preferir CIMD a Dynamic Client Registration. Terceiro, a opção descrita como "Use Claude's published identity" é conceitualmente o caminho CIMD: o cliente possui uma identidade publicada em uma URL HTTPS usada como `client_id`. Para que esse caminho funcione, o Authorization Server precisa declarar suporte a Client ID Metadata Documents.

Sequência proposta: **ADR aprovada → inspecionar contratos reais do Blog e CMS → substituir o Worker read-only pelo gateway OAuth → publicar URL Cloudflare → testar discovery/OAuth/CIMD no Claude → somente depois registrar a URL em D14.**

---

## Nota do Maestro (não faz parte do texto recebido acima)

URL de dashboard citada junto com esta proposta: `https://dash.cloudflare.com/99b69a0d6b75b6b4f13beff73c5fa0b9/workers/services/view/executar-studio/production`.

Verificação real nesta sessão (`workers_list` no conector Cloudflare Developer Platform conectado): a conta retornou 4 workers — `morning-bird-8ce4`, `proud-leaf-11b7`, `executar-blogg`, `01-executar-echo` — nenhum chamado `executar-studio`. Isso é uma divergência factual registrada como `DIV-008`, não resolvida em silêncio (I-08): pode ser conta Cloudflare diferente, nome diferente, ou um recurso que não é um Worker.

Ver `CC-003` (`07-execucao/estado.json`) para o registro completo desta proposta como change-control `ABERTA`, e `DIV-008` para a divergência de conta/worker.
