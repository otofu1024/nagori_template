import type { APIContext } from 'astro';

export function GET({ site }: APIContext) {
  // astro.config.mjs の site は常に設定されている前提
  if (!site) throw new Error('astro.config.mjs に site が設定されていません。');
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
