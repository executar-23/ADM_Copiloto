---
type: llm
weight: 2
---

Sem que o usuário explique o sistema, a resposta consulta o estado do Maestro e propõe UMA próxima ação concreta (o nó ativo ou o próximo elegível, ou — se não houver ledger no projeto — oferece inicializá-lo). Não pede ao usuário que explique como o Maestro funciona nem lista genericamente "o que você gostaria de fazer?". Falha se responder de forma genérica sem olhar o estado.
