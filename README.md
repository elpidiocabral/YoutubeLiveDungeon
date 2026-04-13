# AnimaDungeon — YouTube Live Dungeon Backend

Backend em **Node.js + TypeScript** que captura mensagens de lives do YouTube e canais do Discord em tempo real, normaliza tudo em uma interface unificada e entrega via **WebSocket (Socket.io)** para um frontend React.

Projetado para capturar **comandos de jogo** enviados pelo chat durante lives — sem depender da API oficial do YouTube.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Linguagem | TypeScript (strict) |
| Framework HTTP | Express 5 |
| Tempo real | Socket.io |
| Chat YouTube | `youtube-chat` (scraping) |
| Chat Discord | `discord.js` v14 |
| Logging | Winston |
| Config | dotenv |

---

## Arquitetura

```
src/
├── index.ts                        # Bootstrap (produção)
├── dev-server.ts                   # Bootstrap (desenvolvimento)
├── dev-discord-test.ts             # Teste isolado do Discord
│
├── config/
│   └── env.ts                      # Leitura de variáveis de ambiente
│
├── core/
│   ├── entities.ts                 # UnifiedChatMessage — contrato central
│   └── ports.ts                    # IChatSource, IMessageBus
│
├── adapters/
│   ├── youtube.adapter.ts          # ChatItem → UnifiedChatMessage
│   └── discord.adapter.ts          # discord.js Message → UnifiedChatMessage
│
├── infrastructure/
│   ├── youtube-chat.client.ts      # Fonte YouTube (reconexão + circuit breaker)
│   ├── discord.client.ts           # Fonte Discord
│   ├── mock-chat.source.ts         # Fonte simulada para desenvolvimento
│   ├── socket.server.ts            # Socket.io + MessageBus
│   └── express.server.ts           # Servidor HTTP
│
├── services/
│   ├── youtube-live.service.ts     # Gerencia ciclo de vida da live
│   ├── chat-filter.ts              # Filtro por prefixo de comando
│   ├── chat.orchestrator.ts        # Orquestra as fontes
│   └── circuit-breaker.ts          # Circuit breaker (CLOSED/OPEN/HALF_OPEN)
│
├── api/
│   ├── health.controller.ts        # GET /health
│   ├── youtube.controller.ts       # POST /api/youtube/start|stop, GET /status
│   └── settings.controller.ts      # GET|POST /api/settings
│
└── utils/
    ├── logger.ts                   # Winston estruturado
    └── youtube-url.ts              # Parser de URL do YouTube
```

### Fluxo de dados

```
[youtube-chat] ──┐
                  ├─→ Adapter ─→ ChatFilter ─→ MessageBus ─→ Socket.io ─→ React
[discord.js]  ──┘
```

O React recebe apenas `UnifiedChatMessage` — agnóstico em relação à fonte.

---

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o arquivo `.env`

```bash
cp .env.example .env
```

Preencha as variáveis necessárias:

```env
PORT=3001
LOG_LEVEL=info

# YouTube — não é necessário no startup; a live é passada via API em runtime
YOUTUBE_CHANNEL_ID=
YOUTUBE_LIVE_ID=

# Discord — opcional; deixar em branco desativa a fonte
DISCORD_TOKEN=seu_token_aqui
DISCORD_CHANNEL_IDS=123456789,987654321   # separados por vírgula; vazio = todos os canais

# Circuit breaker / reconexão
YT_RECONNECT_DELAY_MS=5000
YT_MAX_RECONNECT_ATTEMPTS=10
CB_FAILURE_THRESHOLD=5
CB_RECOVERY_TIMEOUT_MS=30000
```

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento — YouTube via API + Discord (se configurado) |
| `npm run dev:mock` | Igual ao `dev` + mensagens simuladas automáticas |
| `npm run dev:discord` | Teste isolado do Discord no terminal |
| `npm run build` | Compila TypeScript → `dist/` |
| `npm start` | Executa o build de produção |
| `npm run typecheck` | Valida os tipos sem gerar arquivos |

---

## API REST

Base URL: `http://localhost:3001`

### `GET /health`
Verifica se o servidor está de pé.

### `POST /api/youtube/start`
Conecta ao chat de uma live. Aceita qualquer formato de URL do YouTube ou o ID direto (11 caracteres).
```json
{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
```

### `POST /api/youtube/stop`
Para a captura da live atual.

### `GET /api/youtube/status`
Retorna o estado da live (`active: true/false`).

### `GET /api/settings`
Retorna o prefixo de comando configurado.

### `POST /api/settings`
Define o prefixo. Somente mensagens que começam com o prefixo serão emitidas.
```json
{ "commandPrefix": "!" }   // null ou "" para desativar
```

---

## WebSocket — evento `chat:message`

O frontend conecta via **Socket.io** e escuta o evento `chat:message`.

```ts
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');

socket.on('chat:message', (msg: UnifiedChatMessage) => {
  console.log(msg.source, msg.author.name, msg.content);
});
```

### Tipo `UnifiedChatMessage`

```ts
interface UnifiedChatMessage {
  id: string;
  source: 'youtube' | 'discord';
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;                  // texto plano
  richContent: RichContentPart[];   // texto + emojis decompostos
  attachments: MessageAttachment[]; // imagens/arquivos (Discord)
  timestamp: string;                // ISO 8601
  metadata: {
    isOwner: boolean;
    isModerator: boolean;
    isMember: boolean;
    superchat?: { amount: string; currency: string; color: string };
    channelId?: string;             // Discord
    guildId?: string;               // Discord
  };
}
```

Consulte [API_CONTRACT.md](API_CONTRACT.md) para exemplos completos de payload.

---

## Configurar o bot Discord

1. Acesse [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application**
2. Menu **Bot** → copie o token e defina em `DISCORD_TOKEN`
3. Ainda em **Bot**, ative os *Privileged Gateway Intents*:
   - `Server Members Intent`
   - `Message Content Intent` ← obrigatório
4. **OAuth2 → URL Generator**: scopes `bot` + permissões `Read Messages` + `Read Message History`
5. Acesse a URL gerada e convide o bot para o servidor

### Testar o Discord isoladamente

```bash
npm run dev:discord
# com filtro de prefixo:
npx ts-node src/dev-discord-test.ts --prefix !
```

---

## Teste visual local

Abra `test-client.html` diretamente no browser (sem servidor HTTP). A página conecta ao backend, exibe o feed de mensagens em tempo real e permite:

- Colar a URL de uma live e iniciar/parar a captura
- Definir o prefixo de comando
- Ver avatar, badges e anexos de imagem

---

## Deploy (Render / Railway)

O servidor lê a porta da variável `PORT` (padrão `3001`) e expõe `/health` para health checks. Basta apontar o serviço para o comando de start:

```bash
npm run build && npm start
```
