const ALLOWED_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.com",
  "maps.google.com",
  "google.com",
  "www.waze.com",
  "waze.com",
  "waze.me",
]);

function isPrivate(hostname) {
  if (["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(hostname)) return true;
  if (/^10\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  return false;
}

async function followRedirect(url, method = "HEAD", timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CarpoolSplit/1.0)" },
    });
    return res.url;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url");

  if (!raw) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // SSRF: validate and allowlist
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (isPrivate(parsed.hostname)) {
    return Response.json({ error: "URL not allowed" }, { status: 403 });
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return Response.json({ error: "URL not allowed" }, { status: 403 });
  }

  try {
    // HEAD is faster — try it first
    let finalUrl = await followRedirect(raw, "HEAD");

    // HEAD sometimes doesn't follow all redirects (CDN quirk on goo.gl)
    // Fall back to GET if we got the same URL back
    if (!finalUrl || finalUrl === raw) {
      finalUrl = await followRedirect(raw, "GET");
    }

    // Validate redirect target is also on the allowlist (prevents SSRF via redirect chain)
    if (finalUrl && finalUrl !== raw) {
      try {
        const finalParsed = new URL(finalUrl);
        if (isPrivate(finalParsed.hostname) || !ALLOWED_HOSTS.has(finalParsed.hostname)) {
          finalUrl = raw; // return original, let client handle NO_DATA
        }
      } catch { finalUrl = raw; }
    }

    return Response.json({ finalUrl: finalUrl ?? raw });
  } catch (err) {
    const message = err.name === "AbortError" ? "Request timed out" : "Could not resolve URL";
    return Response.json({ error: message }, { status: 500 });
  }
}
