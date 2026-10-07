import { visit } from 'unist-util-visit';

const KEY_PATTERN = /^[A-Za-z0-9_-]+$/;
const RESERVED_KEYS = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'];
// 引用の先頭行 [!キー 表情]。表情は省略できる
const MARKER = /^\[!([A-Za-z0-9_-]+)(?:[ 　]+([^\]\n]*))?\][ \t]*(?:\n|$)/;

const normalize = (value) => value.trim().toLowerCase().replace(/[!！?？]+$/, '');

export default function remarkTalk(characters = {}) {
  // キー(大文字) -> { name, defaultExpression, lookup: 表情名または別名(小文字) -> { key, label, src } }
  const table = new Map();
  for (const [rawKey, character] of Object.entries(characters)) {
    const key = rawKey.toUpperCase();
    if (!KEY_PATTERN.test(rawKey)) {
      throw new Error(`キャラクターのキー「${rawKey}」には英数字、_、-だけを使えます`);
    }
    if (RESERVED_KEYS.includes(key)) {
      throw new Error(`キャラクターのキー「${rawKey}」はGitHubのアラート記法と重なるため使えません`);
    }
    const lookup = new Map();
    const add = (name, value) => {
      const id = normalize(name);
      if (lookup.has(id)) {
        throw new Error(`キャラクター「${rawKey}」の表情名または別名「${name}」が重複しています`);
      }
      lookup.set(id, value);
    };
    for (const [expression, { src, label, aliases = [] }] of Object.entries(character.expressions)) {
      const value = { expression, label, src };
      add(expression, value);
      aliases.forEach((alias) => add(alias, value));
    }
    table.set(key, { name: character.name, defaultExpression: character.defaultExpression, lookup });
  }

  return (tree, file) => {
    if (table.size === 0) return;

    visit(tree, 'blockquote', (node) => {
      const paragraph = node.children[0];
      const text = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined;
      if (text?.type !== 'text') return;

      const match = MARKER.exec(text.value);
      const character = match && table.get(match[1].toUpperCase());
      if (!character) return;

      const id = match[2]?.trim() ? normalize(match[2]) : character.defaultExpression;
      const found = character.lookup.get(id);
      if (!found) {
        file.message(`キャラクター「${match[1]}」に未知の表情「${match[2]}」が指定されました`, node);
        return;
      }

      // マーカー行を取り除く。段落が空になったら段落ごと消す
      text.value = text.value.slice(match[0].length);
      if (!text.value) paragraph.children.shift();
      const children = paragraph.children.length ? node.children : node.children.slice(1);

      node.data = {
        hName: 'aside',
        hProperties: {
          className: ['talk'],
          dataCharacter: match[1].toUpperCase(),
          dataExpression: found.expression,
          ariaLabel: `${character.name}（${found.label}）のひとこと`,
        },
      };
      // 画像と吹き出しは未知のノード型にして、data.hName で要素にする
      node.children = [
        {
          type: 'talkCharacter',
          data: {
            hName: 'img',
            hProperties: { className: ['talk__character'], src: found.src, alt: '', ariaHidden: 'true' },
          },
        },
        { type: 'talkBubble', data: { hName: 'div', hProperties: { className: ['talk__bubble'] } }, children },
      ];
      return 'skip';
    });
  };
}
