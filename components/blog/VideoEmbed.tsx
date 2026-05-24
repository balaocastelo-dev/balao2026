import { guessVideoProvider } from '@/lib/blog/utils';

function youtubeEmbedUrl(input: string): string {
  const u = input.trim();
  const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;
  const v = u.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (v?.[1]) return `https://www.youtube.com/embed/${v[1]}`;
  const shorts = u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;
  const embed = u.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embed?.[1]) return `https://www.youtube.com/embed/${embed[1]}`;
  return u;
}

export default function VideoEmbed({ url, provider }: { url: string; provider?: string | null }) {
  const p = provider || guessVideoProvider(url) || 'embed';
  const src =
    p === 'youtube'
      ? youtubeEmbedUrl(url)
      : url.trim();

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden border">
      <div className="relative w-full aspect-video">
        <iframe
          src={src}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Vídeo"
        />
      </div>
    </div>
  );
}

