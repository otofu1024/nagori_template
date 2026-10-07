const STRONG_PATTERN = /(?<!\*)\*\*(?![\s*])([\s\S]*?\S)\*\*(?!\*)/gu;

function splitJapaneseStrong(node, source) {
  if (node.type !== 'text' || !node.value.includes('**')) return null;

  const start = node.position?.start.offset;
  const end = node.position?.end.offset;

  // Escaped asterisks have a different source representation. Leave those alone.
  if (
    typeof start !== 'number' ||
    typeof end !== 'number' ||
    source.slice(start, end) !== node.value
  ) {
    return null;
  }

  const children = [];
  let cursor = 0;

  for (const match of node.value.matchAll(STRONG_PATTERN)) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    if (matchStart > cursor) {
      children.push({ type: 'text', value: node.value.slice(cursor, matchStart) });
    }

    children.push({
      type: 'strong',
      children: [{ type: 'text', value: match[1] }],
    });
    cursor = matchEnd;
  }

  if (cursor === 0) return null;

  if (cursor < node.value.length) {
    children.push({ type: 'text', value: node.value.slice(cursor) });
  }

  return children;
}

function transformChildren(parent, source) {
  if (!Array.isArray(parent.children)) return;

  const children = [];

  for (const child of parent.children) {
    const replacement = splitJapaneseStrong(child, source);

    if (replacement) {
      children.push(...replacement);
      continue;
    }

    transformChildren(child, source);
    children.push(child);
  }

  parent.children = children;
}

/**
 * CommonMark does not recognize emphasis delimiters in strings such as
 * `本文**「作品名。」**です`, because Japanese punctuation touches the markers.
 * Convert only the unparsed `**...**` text left behind by the Markdown parser.
 */
export default function remarkJapaneseStrong() {
  return (tree, file) => {
    transformChildren(tree, String(file));
  };
}
