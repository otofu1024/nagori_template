import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// ビルド内の重複取得を防ぐメモリキャッシュ
const previewCache = new Map();

// 永続キャッシュ(gitにコミットする前提)
const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'link-cards.json');
const IMAGE_DIR = path.join(process.cwd(), 'public', 'link-cards');
const IMAGE_PUBLIC_PATH = '/link-cards';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_WIDTH = 480;
const REFRESH = process.env.LINK_CARDS_REFRESH === '1';

const URL_PATTERN = /^https?:\/\/[^\s<>]+$/i;
const MAX_HTML_LENGTH = 1_000_000;
const FETCH_TIMEOUT_MS = 8_000;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function decodeHtml(value = '') {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readAttributes(tag) {
  const attributes = {};
  const pattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match;

  while ((match = pattern.exec(tag))) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  }

  return attributes;
}

function readMetadata(html) {
  const metadata = {};
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    const attributes = readAttributes(tag);
    const key = (attributes.property || attributes.name || '').toLowerCase();

    if (key && attributes.content && metadata[key] === undefined) {
      metadata[key] = attributes.content;
    }
  }

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) metadata.title = decodeHtml(titleMatch[1].replace(/<[^>]*>/g, ''));

  return metadata;
}

function shorten(value, maximum) {
  if (value.length <= maximum) return value;
  return `${value.slice(0, maximum).trimEnd()}…`;
}

let persistentCache = {};
let cacheLoading = null;
let cacheDirty = false;
let saveQueue = Promise.resolve();

// ビルド開始後の最初の呼び出しで一度だけ読み込む。
// 並行して呼ばれても同じオブジェクトを共有するよう、読み込み中のPromiseを使い回す
function loadPersistentCache() {
  cacheLoading ??= readFile(CACHE_FILE, 'utf8')
    .then((text) => {
      persistentCache = JSON.parse(text);
    })
    .catch(() => {
      persistentCache = {};
    })
    .then(() => persistentCache);

  return cacheLoading;
}

// 書き込みは直列化し、一時ファイル経由で置き換える
function savePersistentCache() {
  if (!cacheDirty) return saveQueue;

  saveQueue = saveQueue.then(async () => {
    if (!cacheDirty) return;
    cacheDirty = false;

    // ビルド中はプラグインが別インスタンスで複数回読み込まれるため、
    // 保存直前にファイルを読み直してマージし、他インスタンスの追記を消さない
    let onDisk = {};
    try {
      onDisk = JSON.parse(await readFile(CACHE_FILE, 'utf8'));
    } catch {
      // ファイルが無い・壊れている場合は手元の内容だけで書き出す
    }
    const merged = { ...onDisk, ...persistentCache };
    const sorted = Object.fromEntries(
      Object.keys(merged)
        .sort()
        .map((key) => [key, merged[key]]),
    );
    const temporaryFile = `${CACHE_FILE}.${process.pid}.${Date.now()}.tmp`;

    await mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await writeFile(temporaryFile, `${JSON.stringify(sorted, null, 2)}\n`);
    await rename(temporaryFile, CACHE_FILE);
  }).catch((error) => {
    console.warn(`[link-cards] キャッシュの保存に失敗しました: ${error.message}`);
  });

  return saveQueue;
}

// サイズ上限つきでレスポンス本文を読み込む
async function readLimitedBody(response, limit) {
  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > limit) throw new Error('Image too large');

  const chunks = [];
  let total = 0;

  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > limit) throw new Error('Image too large');
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

// OGP画像をダウンロードし、リサイズしたwebpとして保存する。失敗時は空文字
async function saveImage(url, imageUrl) {
  if (!imageUrl) return '';

  const hash = createHash('sha256').update(url).digest('hex').slice(0, 16);
  const fileName = `${hash}.webp`;
  const filePath = path.join(IMAGE_DIR, fileName);
  const publicPath = `${IMAGE_PUBLIC_PATH}/${fileName}`;

  if (!REFRESH && existsSync(filePath)) return publicPath;

  try {
    const response = await fetch(imageUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        accept: 'image/*',
        'user-agent': 'Mozilla/5.0 (compatible; nagori-link-preview/1.0)',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const body = await readLimitedBody(response, MAX_IMAGE_BYTES);
    const output = await sharp(body)
      .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    await mkdir(IMAGE_DIR, { recursive: true });
    await writeFile(filePath, output);
    return publicPath;
  } catch {
    return '';
  }
}

function fallbackPreview(url) {
  const parsedUrl = new URL(url);

  return {
    url,
    hostname: parsedUrl.hostname.replace(/^www\./, ''),
    title: parsedUrl.hostname.replace(/^www\./, ''),
    description: parsedUrl.pathname === '/' ? '' : parsedUrl.pathname,
    image: '',
  };
}

async function fetchPreview(url) {
  if (previewCache.has(url)) return previewCache.get(url);

  const request = (async () => {
    const cache = await loadPersistentCache();
    if (!REFRESH && cache[url]) return cache[url];

    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'user-agent': 'Mozilla/5.0 (compatible; nagori-link-preview/1.0)',
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      const finalUrl = response.url || url;
      const metadata = readMetadata((await response.text()).slice(0, MAX_HTML_LENGTH));
      const parsedUrl = new URL(finalUrl);
      const rawImage = metadata['og:image'] || metadata['twitter:image'] || '';

      const remoteImage = rawImage ? new URL(rawImage, finalUrl).toString() : '';

      const preview = {
        url: finalUrl,
        hostname: parsedUrl.hostname.replace(/^www\./, ''),
        title: shorten(metadata['og:title'] || metadata['twitter:title'] || metadata.title || parsedUrl.hostname, 140),
        description: shorten(
          metadata['og:description'] || metadata['twitter:description'] || metadata.description || '',
          220,
        ),
        image: await saveImage(url, remoteImage),
        fetchedAt: new Date().toISOString(),
      };

      // 取得に成功した結果だけを永続化する
      cache[url] = preview;
      cacheDirty = true;
      return preview;
    } catch {
      return fallbackPreview(url);
    }
  })();

  previewCache.set(url, request);
  return request;
}

function standaloneUrl(node) {
  if (node.type !== 'paragraph' || node.children.length !== 1) return null;

  const child = node.children[0];
  if (child.type === 'text') {
    const value = child.value.trim();
    return URL_PATTERN.test(value) ? value : null;
  }

  if (child.type === 'link' && child.children.length === 1 && child.children[0].type === 'text') {
    const label = child.children[0].value.trim();
    return URL_PATTERN.test(child.url) && label === child.url ? child.url : null;
  }

  return null;
}

function renderCard(preview) {
  const title = escapeHtml(preview.title);
  const hostname = escapeHtml(preview.hostname);
  const description = preview.description
    ? `<span class="link-card__description">${escapeHtml(preview.description)}</span>`
    : '';
  const image = preview.image
    ? `<span class="link-card__image"><img src="${escapeHtml(preview.image)}" alt="" loading="lazy" decoding="async"></span>`
    : '';
  const imageClass = preview.image ? ' link-card--with-image' : '';

  return `<a class="link-card${imageClass}" href="${escapeHtml(preview.url)}" target="_blank" rel="noopener noreferrer" aria-label="${title}（${hostname}）" data-pagefind-ignore><span class="link-card__body"><strong class="link-card__title">${title}</strong>${description}<span class="link-card__site"><span aria-hidden="true">↗</span>${hostname}</span></span>${image}</a>`;
}

function findCandidates(node, candidates = []) {
  if (!node.children) return candidates;

  node.children.forEach((child, index) => {
    const url = standaloneUrl(child);
    if (url) {
      candidates.push({ parent: node, index, url });
      return;
    }

    findCandidates(child, candidates);
  });

  return candidates;
}

export default function remarkLinkCards() {
  return async (tree) => {
    const candidates = findCandidates(tree);

    await Promise.all(
      candidates.map(async ({ parent, index, url }) => {
        const preview = await fetchPreview(url);
        parent.children[index] = { type: 'html', value: renderCard(preview) };
      }),
    );

    await savePersistentCache();
  };
}
