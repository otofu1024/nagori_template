import { randomBytes } from 'node:crypto';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
// Node 22.18 以降の型ストリップ機能で config.ts を直接読み込み、カテゴリー定義を共有する
import { CATEGORY_KEYS } from '../src/config.ts';

const prompt = createInterface({ input, output });
const ask = async (label) => (await prompt.question(label)).trim();
const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

try {
  const title = await ask('記事タイトル: ');
  if (!title) throw new Error('記事タイトルは必須です。');

  const description = await ask('記事の短い説明: ');
  if (!description) throw new Error('記事の説明は必須です。');

  const category = await ask(`カテゴリー（${CATEGORY_KEYS.join(' / ')}）: `);
  if (!CATEGORY_KEYS.includes(category)) {
    throw new Error(`カテゴリーは ${CATEGORY_KEYS.join('、')} のどれかです。`);
  }

  const tags = (await ask('タグ（カンマ区切り、空でも可）: '))
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const datePart = date.replaceAll('-', '');
  let slug;
  let articleDirectory;
  do {
    slug = `${datePart}-${randomBytes(3).toString('hex')}`;
    articleDirectory = join(process.cwd(), 'src', 'content', 'blog', slug);
  } while (await exists(articleDirectory));

  await mkdir(articleDirectory, { recursive: false });
  const tagLines = tags.length
    ? `\ntags:\n${tags.map((tag) => `  - ${JSON.stringify(tag)}`).join('\n')}`
    : '\ntags: []';
  const markdown = `---\ntitle: ${JSON.stringify(title)}\n# 表紙タイトルを手動で改行したい場合だけ使用\n# coverTitleLines:\n#   - "1行目"\n#   - "2行目"\ndescription: ${JSON.stringify(description)}\npublishedAt: ${date}\ncategory: ${category}${tagLines}\ndraft: false\n---\n\nここから本文を書きます。\n`;
  const articlePath = join(articleDirectory, 'index.md');
  await writeFile(articlePath, markdown, 'utf8');
  output.write(`\n記事の雛形を作りました:\n${articlePath}\n`);
  output.write(`記事URL: /posts/${slug}/\n`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  output.write(`\n作成できませんでした: ${message}\n`);
  process.exitCode = 1;
} finally {
  prompt.close();
}
