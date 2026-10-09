/**
 * Comprehensive YouTube URL & Video ID helper for Bihar Board 10th App
 * Handles: standard watch, youtube.com/live/..., youtu.be/..., shorts, embed, iframe snippets
 * and prevents Google Workspace / Account restrictions by using youtube-nocookie.com.
 */

export const extractYouTubeVideoId = (input: string): string => {
  if (!input) return '';
  let trimmed = input.trim();

  // If user pasted iframe HTML tag: <iframe src="https://www.youtube.com/embed/xyz" ...>
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    trimmed = iframeMatch[1];
  }

  // Direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex matching all YouTube URL formats
  const regex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+?&v=|live\/|shorts\/))([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback URL parsing
  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const vParam = urlObj.searchParams.get('v');
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
      return vParam;
    }
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && /^[a-zA-Z0-9_-]{11}$/.test(lastPart)) {
      return lastPart;
    }
  } catch {}

  return '';
};

export interface EmbedOptions {
  useNoCookie?: boolean;
  dataSaver?: boolean;
  autoplay?: boolean;
}

export const getYouTubeEmbedUrl = (input: string, options: EmbedOptions = {}): string => {
  const { useNoCookie = true, dataSaver = false, autoplay = true } = options;
  const videoId = extractYouTubeVideoId(input);
  if (!videoId) {
    return input;
  }

  // Use youtube-nocookie.com by default to bypass Google Account / Workspace restrictions
  const domain = useNoCookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
  const autoParam = autoplay ? '1' : '0';
  const qualityParam = dataSaver ? '&vq=small' : '&vq=medium';

  return `https://${domain}/embed/${videoId}?autoplay=${autoParam}&controls=1&rel=0&playsinline=1&enablejsapi=1&fs=1&hl=hi&modestbranding=1${qualityParam}`;
};

export const getYouTubeDirectWatchUrl = (input: string): string => {
  const videoId = extractYouTubeVideoId(input);
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  return input.startsWith('http') ? input : `https://www.youtube.com/watch?v=${input}`;
};
