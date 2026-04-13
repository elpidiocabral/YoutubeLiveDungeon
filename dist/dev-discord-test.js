"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ╔══════════════════════════════════════════════════════╗
 *   SCRIPT DE TESTE ISOLADO — DISCORD
 *   Testa a conexão do bot Discord e a captura de mensagens
 *   diretamente no terminal, sem precisar do servidor completo.
 *
 *   Pré-requisitos:
 *     1. DISCORD_TOKEN no .env
 *     2. DISCORD_CHANNEL_IDS no .env (opcional — sem isso captura TUDO)
 *
 *   Uso:
 *     npx ts-node src/dev-discord-test.ts
 *     npx ts-node src/dev-discord-test.ts --prefix !
 * ╚══════════════════════════════════════════════════════╝
 */
require("dotenv/config");
const env_1 = require("./config/env");
const discord_client_1 = require("./infrastructure/discord.client");
const chat_filter_1 = require("./services/chat-filter");
// ── Argumento opcional: prefixo de comando ───────────────
const prefixIdx = process.argv.indexOf('--prefix');
const commandPrefix = prefixIdx !== -1 ? process.argv[prefixIdx + 1] : null;
// ── Validação rápida ─────────────────────────────────────
if (!env_1.config.discord.token) {
    console.error('\n[ERRO] DISCORD_TOKEN não encontrado no .env');
    console.error('Copie .env.example para .env e preencha DISCORD_TOKEN\n');
    process.exit(1);
}
// ── Filtro ───────────────────────────────────────────────
const filter = new chat_filter_1.ChatFilter();
if (commandPrefix) {
    filter.setCommandPrefix(commandPrefix);
}
// ── Cliente ──────────────────────────────────────────────
const client = new discord_client_1.DiscordChatClient();
function formatMessage(msg) {
    const time = msg.timestamp.toLocaleTimeString('pt-BR');
    const mod = msg.metadata.isModerator ? ' [MOD]' : '';
    const guild = msg.metadata.guildId ? ` guild:${msg.metadata.guildId}` : '';
    const ch = msg.metadata.channelId ? ` #${msg.metadata.channelId}` : '';
    return `[${time}]${guild}${ch}  ${msg.author.name}${mod}: ${msg.content}`;
}
console.log('\n══════════════════════════════════════════════════');
console.log('  Discord Test — aguardando mensagens...');
console.log(`  Canais monitorados: ${env_1.config.discord.channelIds.join(', ') || '(todos)'}`);
console.log(`  Filtro de prefixo:  ${commandPrefix ?? '(sem filtro)'}`);
console.log('  Pressione Ctrl+C para sair');
console.log('══════════════════════════════════════════════════\n');
let received = 0;
let filtered = 0;
client.on('message', (msg) => {
    received++;
    if (filter.passes(msg)) {
        console.log(formatMessage(msg));
    }
    else {
        filtered++;
        process.stdout.write(`  (filtrada: "${msg.content.slice(0, 40)}")\r`);
    }
});
client.on('error', (err) => {
    console.error('[Discord] Erro:', err.message);
});
client.start().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error('\n[ERRO] Falha ao conectar:', message);
    console.error('\nVerifique:');
    console.error('  • DISCORD_TOKEN válido no .env');
    console.error('  • Bot convidado ao servidor com permissões de leitura');
    console.error('  • Privileged Intent "Message Content" ativado no Discord Developer Portal\n');
    process.exit(1);
});
// ── Graceful exit com resumo ─────────────────────────────
process.on('SIGINT', () => {
    client.stop();
    console.log(`\n\nResumo: ${received} recebidas, ${filtered} filtradas, ${received - filtered} publicadas`);
    process.exit(0);
});
//# sourceMappingURL=dev-discord-test.js.map