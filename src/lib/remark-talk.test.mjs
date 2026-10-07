import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkTalk from './remark-talk.mjs';

const characters = {
  NAGORI: {
    name: 'なごり',
    defaultExpression: 'normal',
    expressions: {
      normal: { src: '/images/nagori/normal.png', label: '通常', aliases: ['通常'] },
    },
  },
};

const render = async (md, chars = characters) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkTalk, chars)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md);
  return { html: String(file), messages: file.messages };
};

test('正規キー、別名、表情の省略が吹き出しになる', async () => {
  for (const marker of ['[!NAGORI normal]', '[!nagori 通常！]', '[!NAGORI]']) {
    const { html } = await render(`> ${marker}\n> 本文`);
    assert.match(html, /<aside class="talk" data-character="NAGORI" data-expression="normal" aria-label="なごり（通常）のひとこと">/);
    assert.match(html, /<img class="talk__character" src="\/images\/nagori\/normal.png" alt="" aria-hidden="true">/);
    assert.match(html, /<div class="talk__bubble">\s*<p>本文<\/p>\s*<\/div>/);
    assert.doesNotMatch(html, /\[!/);
  }
});

test('吹き出しの中の段落とリンクが保たれる', async () => {
  const { html } = await render('> [!NAGORI]\n> 一つ目 [リンク](https://example.com)\n>\n> 二つ目');
  assert.match(html, /<p>一つ目 <a href="https:\/\/example.com">リンク<\/a><\/p>/);
  assert.match(html, /<p>二つ目<\/p>/);
});

test('設定にないキーは通常の引用のまま', async () => {
  const { html } = await render('> [!NOTE]\n> 本文');
  assert.match(html, /<blockquote>/);
  assert.doesNotMatch(html, /talk/);
});

test('未知の表情は警告して引用のまま', async () => {
  const { html, messages } = await render('> [!NAGORI 怒り]\n> 本文');
  assert.match(html, /<blockquote>/);
  assert.equal(messages.length, 1);
});

test('設定エラーは初期化時に throw する', () => {
  const expr = (aliases) => ({ normal: { src: '/a.png', label: 'a', aliases }, b: { src: '/b.png', label: 'b', aliases } });
  const make = (key, expressions) => () =>
    remarkTalk({ [key]: { name: 'x', defaultExpression: 'normal', expressions } });
  assert.throws(make('A B', expr([])));
  assert.throws(make('note', expr([])));
  assert.throws(make('OK', expr(['同じ'])));
});
