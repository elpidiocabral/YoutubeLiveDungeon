# AnimaDungeon Backend — Contrato da API

> Documento de referência para integração do frontend React.
> Base URL local: `http://localhost:3001`

---

## 1. Conexão WebSocket (Socket.io)

O frontend conecta via **Socket.io** (não WebSocket puro).

```ts
import { io } from 'socket.io-client';
const socket = io('http://localhost:3001');
```

---

## 2. Evento recebido: `chat:message`

Toda mensagem filtrada e normalizada é emitida neste evento.

### Tipo TypeScript completo

```ts
type MessageSource = 'youtube' | 'discord';

interface RichContentPart {
  type: 'text' | 'emoji' | 'image';
  value: string;      // texto legível ou shortcode do emoji
  url?: string;       // presente quando type === 'emoji' ou 'image'
  width?: number;
  height?: number;
}

interface MessageAttachment {
  url: string;
  name: string;
  mediaType: 'image' | 'video' | 'file';
  width?: number;
  height?: number;
}

interface SuperChatInfo {
  amount: string;   // ex: "R$ 50,00"
  currency: string;
  color: string;
}

interface UnifiedChatMessage {
  id: string;
  source: MessageSource;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;   // URL direta, pronta para <img src>
  };
  content: string;            // texto plano concatenado
  richContent: RichContentPart[];
  attachments: MessageAttachment[];
  timestamp: string;          // ISO 8601 — use new Date(timestamp)
  metadata: {
    isOwner: boolean;
    isModerator: boolean;
    isMember: boolean;
    superchat?: SuperChatInfo;
    channelId?: string;       // apenas Discord
    guildId?: string;         // apenas Discord
  };
}
```

### Exemplos de payload

**Mensagem de texto simples (YouTube):**
```json
{
  "id": "CjgKGkNJa...",
  "source": "youtube",
  "author": {
    "id": "UCxxxxxxxxxxxxxxxx",
    "name": "WarriorX",
    "avatarUrl": "https://yt3.ggpht.com/..."
  },
  "content": "!atacar boss",
  "richContent": [
    { "type": "text", "value": "!atacar boss" }
  ],
  "attachments": [],
  "timestamp": "2026-04-13T21:00:00.000Z",
  "metadata": {
    "isOwner": false,
    "isModerator": false,
    "isMember": true
  }
}
```

**Mensagem com emoji customizado (YouTube):**
```json
{
  "content": "vai lá ",
  "richContent": [
    { "type": "text", "value": "vai lá " },
    { "type": "emoji", "value": ":_dungeon:", "url": "https://yt3.ggpht.com/emoji/..." }
  ],
  "attachments": []
}
```

**Mensagem com imagem anexada (Discord):**
```json
{
  "source": "discord",
  "author": {
    "id": "123456789",
    "name": "Elfa_Mage",
    "avatarUrl": "https://cdn.discordapp.com/avatars/123456789/abc.png"
  },
  "content": "!mapa",
  "richContent": [{ "type": "text", "value": "!mapa" }],
  "attachments": [
    {
      "url": "https://cdn.discordapp.com/attachments/.../mapa.png",
      "name": "mapa.png",
      "mediaType": "image",
      "width": 1280,
      "height": 720
    }
  ],
  "metadata": {
    "isOwner": false,
    "isModerator": true,
    "isMember": true,
    "channelId": "987654321",
    "guildId": "111222333"
  }
}
```

**Super Chat (YouTube):**
```json
{
  "content": "Boa sorte na dungeon!",
  "metadata": {
    "isOwner": false,
    "isModerator": false,
    "isMember": false,
    "superchat": {
      "amount": "R$ 20,00",
      "currency": "BRL",
      "color": "#1DE9B6"
    }
  }
}
```

---

## 3. Rotas HTTP REST

### `GET /health`

Verifica se o servidor está de pé.

**Resposta `200`:**
```json
{
  "status": "ok",
  "uptime": 42.3,
  "startedAt": "2026-04-13T20:00:00.000Z",
  "timestamp": "2026-04-13T20:00:42.000Z"
}
```

---

### `POST /api/youtube/start`

Conecta ao chat de uma live do YouTube.

**Body:**
```json
{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
```

Formatos aceitos para `url`:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/live/VIDEO_ID`
- `VIDEO_ID` (11 caracteres direto)

**Resposta `200` — sucesso:**
```json
{ "success": true, "liveId": "dQw4w9WgXcQ" }
```

**Resposta `422` — URL inválida:**
```json
{ "success": false, "error": "Não foi possível extrair um liveId de..." }
```

---

### `POST /api/youtube/stop`

Para a captura da live atual.

**Resposta `200`:**
```json
{ "success": true }
```

---

### `GET /api/youtube/status`

Retorna o estado atual da live.

**Resposta — sem live ativa:**
```json
{ "active": false }
```

**Resposta — live ativa:**
```json
{
  "active": true,
  "liveId": "dQw4w9WgXcQ",
  "startedAt": "2026-04-13T21:00:00.000Z"
}
```

---

### `GET /api/settings`

Retorna as configurações de filtro.

**Resposta:**
```json
{ "commandPrefix": "!" }
// ou, sem filtro:
{ "commandPrefix": null }
```

---

### `POST /api/settings`

Define o prefixo de filtro de comandos. Apenas mensagens que **começam** com o prefixo são emitidas via WebSocket.

**Body — ativar filtro:**
```json
{ "commandPrefix": "!" }
```

**Body — desativar filtro (captura tudo):**
```json
{ "commandPrefix": null }
```

**Resposta `200`:**
```json
{
  "success": true,
  "settings": { "commandPrefix": "!" }
}
```

---

## 4. Conectando localmente (backend + frontend React)

### Passo 1 — Rodar o backend

```bash
# no diretório YoutubeLiveDungeon
npm run dev
```

O servidor sobe em `http://localhost:3001`.

### Passo 2 — Instalar Socket.io no React

```bash
# no diretório do frontend React
npm install socket.io-client
```

### Passo 3 — Hook de conexão (exemplo mínimo)

```tsx
// src/hooks/useChatSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

export function useChatSocket() {
  const [messages, setMessages] = useState<UnifiedChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(BACKEND_URL);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('chat:message', (msg: UnifiedChatMessage) => {
      setMessages((prev) => [msg, ...prev].slice(0, 200));
    });

    return () => { socket.disconnect(); };
  }, []);

  return { messages, connected };
}
```

### Passo 4 — Variável de ambiente no Vite (opcional)

Crie `.env.local` na raiz do projeto React:

```env
VITE_BACKEND_URL=http://localhost:3001
```

### Passo 5 — Iniciar a live via fetch no React

```tsx
async function startLive(url: string) {
  const res = await fetch('http://localhost:3001/api/youtube/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json(); // { success: true, liveId: "..." }
}

async function setCommandPrefix(prefix: string | null) {
  await fetch('http://localhost:3001/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commandPrefix: prefix }),
  });
}
```

### Resumo da arquitetura local

```
┌─────────────────────┐        WebSocket (Socket.io)         ┌──────────────────┐
│  React  :5173        │  ◄──── evento: chat:message ────────  │  Backend  :3001  │
│                      │                                        │                  │
│  fetch /api/youtube  │  ────── POST /api/youtube/start ────►  │  YouTube Chat    │
│  fetch /api/settings │  ────── POST /api/settings ─────────►  │  Discord Bot     │
└─────────────────────┘                                        └──────────────────┘
```

Ambos rodam simultaneamente em terminais separados — não há conflito de porta.
