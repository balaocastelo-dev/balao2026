export function sanitizeHtmlBasic(input: string): string {
  const raw = String(input || "");

  const allowedIframes = new Map<string, string>();
  let iframeIdx = 0;

  const withPlaceholders = raw.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, (match) => {
    const srcMatch = match.match(/\ssrc=["']([^"']+)["']/i);
    const src = srcMatch?.[1] ? String(srcMatch[1]).trim() : "";
    if (!src) return "";

    const lower = src.toLowerCase();
    const allowed =
      lower.startsWith("https://www.youtube.com/embed/") ||
      lower.startsWith("https://www.youtube-nocookie.com/embed/") ||
      lower.startsWith("https://player.globo.com/") ||
      lower.startsWith("https://globoplay.globo.com/");
    if (!allowed) return "";

    const titleMatch = match.match(/\stitle=["']([^"']+)["']/i);
    const title = titleMatch?.[1] ? String(titleMatch[1]).trim() : "Vídeo";
    const token = `__IFRAME_${iframeIdx++}__`;
    allowedIframes.set(
      token,
      `<iframe src="${src}" title="${title}" loading="lazy" referrerpolicy="no-referrer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
    );
    return token;
  });

  const withoutScripts = withPlaceholders
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<object\b[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[\s\S]*?<\/embed>/gi, "");

  const withoutInlineHandlers = withoutScripts.replace(/\son\w+="[^"]*"/gi, "");

  const withoutJsUrls = withoutInlineHandlers
    .replace(/\shref="javascript:[^"]*"/gi, ' href="#"')
    .replace(/\ssrc="javascript:[^"]*"/gi, "");

  let restored = withoutJsUrls;
  for (const [token, html] of allowedIframes.entries()) {
    restored = restored.replace(new RegExp(token, "g"), html);
  }

  return restored.trim();
}
