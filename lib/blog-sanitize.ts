export function sanitizeHtmlBasic(input: string): string {
  const raw = String(input || "");

  const withoutScripts = raw
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[\s\S]*?<\/embed>/gi, "");

  const withoutInlineHandlers = withoutScripts.replace(/\son\w+="[^"]*"/gi, "");

  const withoutJsUrls = withoutInlineHandlers
    .replace(/\shref="javascript:[^"]*"/gi, ' href="#"')
    .replace(/\ssrc="javascript:[^"]*"/gi, "");

  return withoutJsUrls.trim();
}

