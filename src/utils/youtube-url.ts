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

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export interface ParseResult {
  liveId: string;
}

export function parseYouTubeLiveId(input: string): ParseResult | null {
  const trimmed = input.trim();

  // ID direto
  if (VIDEO_ID_REGEX.test(trimmed)) {
    return { liveId: trimmed };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const hostname = url.hostname.replace(/^www\./, '');

  // youtu.be/VIDEO_ID
  if (hostname === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return VIDEO_ID_REGEX.test(id) ? { liveId: id } : null;
  }

  // youtube.com
  if (hostname === 'youtube.com') {
    // /watch?v=VIDEO_ID
    const vParam = url.searchParams.get('v');
    if (vParam && VIDEO_ID_REGEX.test(vParam)) {
      return { liveId: vParam };
    }

    // /live/VIDEO_ID  ou  /shorts/VIDEO_ID
    const pathParts = url.pathname.split('/').filter(Boolean);
    if ((pathParts[0] === 'live' || pathParts[0] === 'shorts') && pathParts[1]) {
      const id = pathParts[1];
      return VIDEO_ID_REGEX.test(id) ? { liveId: id } : null;
    }
  }

  return null;
}
