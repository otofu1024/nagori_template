import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { readOgColors } from '../../lib/og-colors.mjs';
import { CATEGORIES, type Category } from '../../config';
import { getPublishedPosts, postSlug } from '../../lib/posts';

type OGPage = {
  title: string;
  titleLines: string[];
  category: Category;
};

// satori が受け付けるプレーンオブジェクト形式の要素（React に依存しないための最小定義）
type SatoriNode = {
  type: string;
  props: Record<string, unknown> & { children?: SatoriChild | SatoriChild[] };
};
type SatoriChild = SatoriNode | string;

// createElement 相当の小さなヘルパー
function h(type: string, props: Record<string, unknown>, ...children: SatoriChild[]): SatoriNode {
  return {
    type,
    props: {
      ...props,
      ...(children.length === 0 ? {} : { children: children.length === 1 ? children[0] : children }),
    },
  };
}

const WIDTH = 1200;
const HEIGHT = 630;

// 色は theme.css の --og-* から読む。足りない・形式が違うときはここで throw してビルドが止まる
const colors = readOgColors(await readFile(resolve('src/theme/theme.css'), 'utf-8'));

const font = readFile(
  resolve(
    'node_modules/@openfonts/noto-sans-jp_japanese/files/noto-sans-jp-japanese-700.woff',
  ),
);

// タイトル領域の目安（幅は maxWidth、高さは上下 padding を除いた分）
const TITLE_MAX_WIDTH = 930;
const TITLE_MAX_HEIGHT = 340;
const TITLE_LINE_HEIGHT = 1.35;

// 全体の文字数で基本サイズを決め、手動改行がある場合は最長行と行数が収まるよう縮める
function titleSize(lines: string[]) {
  const lengths = lines.map((line) => [...line].length);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const longest = Math.max(...lengths);

  let size = 46;
  if (total <= 14) size = 72;
  else if (total <= 22) size = 62;
  else if (total <= 32) size = 54;

  if (lines.length > 1) {
    const widthLimit = Math.floor(TITLE_MAX_WIDTH / longest);
    const heightLimit = Math.floor(TITLE_MAX_HEIGHT / (lines.length * TITLE_LINE_HEIGHT));
    size = Math.max(36, Math.min(72, widthLimit, heightLimit));
  }
  return size;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();

  return posts.map((post) => ({
    params: { slug: postSlug(post) },
    props: {
      title: post.data.title,
      titleLines: post.data.coverTitleLines ?? [post.data.title],
      category: post.data.category,
    } satisfies OGPage,
  }));
};

export const GET: APIRoute<OGPage> = async ({ props }) => {
  const image = h(
    'div',
    {
      lang: 'ja-JP',
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: 34,
        background: colors.accent,
        fontFamily: 'Noto Sans JP',
      },
    },
    h(
      'div',
      {
        style: {
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '86px 100px 118px',
          border: `2px solid ${colors.text}1A`,
          borderRadius: 30,
          background: colors.bg,
          color: colors.text,
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: TITLE_MAX_WIDTH,
            fontSize: titleSize(props.titleLines),
            fontWeight: 700,
            lineHeight: TITLE_LINE_HEIGHT,
            textAlign: 'center',
            wordBreak: 'break-all',
          },
        },
        // coverTitleLines があれば1行ずつ別の div にして手動改行を反映する
        ...props.titleLines.map((line) =>
          h('div', { style: { display: 'flex', justifyContent: 'center' } }, line),
        ),
      ),
      h(
        'div',
        {
          style: {
            position: 'absolute',
            left: 62,
            bottom: 48,
            display: 'flex',
            alignItems: 'center',
            padding: '10px 24px',
            borderRadius: 999,
            background: colors.accent,
            color: colors.text,
            fontSize: 28,
            fontWeight: 700,
          },
        },
        CATEGORIES[props.category].label,
      ),
    ),
  );

  // satori の型定義は ReactNode を要求するが、実際はプレーンオブジェクトを受け付ける
  const svg = await satori(image as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'Noto Sans JP',
        data: await font,
        weight: 700,
        style: 'normal',
      },
    ],
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
