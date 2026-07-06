const USER_AGENT = 'GiuseppeOS-PresenceBot/1.0 (+https://giuseppe-os.vercel.app)';

export async function fetchText(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/xml, text/xml, text/html, */*'
      },
      signal: controller.signal,
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return response.text();
  } finally {
    clearTimeout(timer);
  }
}
