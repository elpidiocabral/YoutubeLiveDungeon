/**
 * Extrai o videoId (liveId) de qualquer formato de URL do YouTube
 * ou aceita um ID direto (11 caracteres base64url).
 *
 * Formatos suportados:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://www.youtube.com/watch?v=VIDEO_ID&t=123
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/live/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *   VIDEO_ID  (11 chars direto)
 */
export interface ParseResult {
    liveId: string;
}
export declare function parseYouTubeLiveId(input: string): ParseResult | null;
//# sourceMappingURL=youtube-url.d.ts.map