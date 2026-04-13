# Contexto e Objetivo
Você atuará como um Engenheiro de Software Sênior. O objetivo é criar uma aplicação backend em Node.js projetada para ler chats ao vivo do YouTube usando a biblioteca `youtube-chat` (evitando limites da API oficial) e integrar-se a canais do Discord usando `discord.js` para monitoramento e retransmissão de mensagens. 

A aplicação servirá como fonte de dados em tempo real para um *client-side* em React, substituindo uma arquitetura legada de *polling* no cliente.

# Stack Tecnológico Exigido
- **Runtime**: Node.js
- **Linguagem**: TypeScript (Configuração rigorosa)
- **Framework Web**: Express (para rotas de controle e *health check*)
- **Tempo Real**: Socket.io (para emitir os dados processados para o React)
- **Integrações**: `youtube-chat`, `discord.js`
- **Utilitários**: `dotenv` (gestão de variáveis), `winston` ou `pino` (logging estruturado).

# Requisitos de Arquitetura e Engenharia de Software
A implementação deve seguir boas práticas de Engenharia de Software, Clean Code e princípios SOLID:

1. **Separação de Responsabilidades (Clean Architecture)**: Isole a lógica de negócio das infraestruturas externas. Use o padrão de *Ports and Adapters*.
2. **Padrão Adapter para Normalização de Dados (CRÍTICO)**: O formato de saída do `youtube-chat` e da API oficial do YouTube são completamente diferentes. O `youtube-chat` frequentemente quebra a mensagem em um array de objetos de texto e emojis (ex: `[{ text: "Olá " }, { emoji: { url: "..." } }]`). 
   - Você DEVE implementar uma camada de Adaptação que intercepte os eventos do `youtube-chat` (e do Discord) e os transforme em uma interface genérica unificada (ex: `UnifiedChatMessage`).
   - O React consumirá via WebSockets APENAS essa interface unificada, mantendo-se agnóstico em relação à fonte de origem do dado.
3. **Injeção de Dependências**: As instâncias dos clientes do YouTube e Discord devem ser injetadas nos serviços, facilitando testes e desacoplamento.
4. **Tratamento de Erros e Resiliência**: O `youtube-chat` baseia-se em *scraping* e pode falhar com atualizações do YouTube. Implemente *circuit breakers*, reconexões automáticas e tratamento de exceções.
5. **Comunicação Assíncrona**: O tráfego de mensagens deve utilizar padrões assíncronos não bloqueantes (ex: `EventEmitter` interno) para enviar os dados normalizados ao WebSocket.
6. **Pronto para Deploy**: Configuração para plataformas como Render ou Railway (escutando na porta definida por `PORT` e rotas de `/health`).

# Estrutura de Diretórios Sugerida
Proponha e implemente uma estrutura baseada em domínios:
```text
/src
  /config         # Configurações de ambiente, constantes
  /core           # Entidades unificadas (ex: UnifiedChatMessage) e interfaces
  /infrastructure # Conexões externas (DiscordClient, YouTubeChatClient, SocketServer)
  /adapters       # Transformadores de payload (YouTubeDataToUnifiedAdapter, etc.)
  /services       # Regras de negócio e orquestração
  /api            # Controladores Express
  /utils          # Loggers, formatadores