// theme.css の最初の :root から --og-* を読む
const NAMES = ['bg', 'text', 'accent'];

/** @returns {{ bg: string, text: string, accent: string, categories: Record<string, string> }} */
export function readOgColors(css, categoryKeys = []) {
  const block = /:root\s*\{([^}]*)\}/.exec(css.replace(/\/\*[\s\S]*?\*\//g, ''))?.[1] ?? '';
  const colors = /** @type {any} */ ({});
  for (const name of NAMES) {
    const key = `--og-${name}`;
    const values = [...block.matchAll(new RegExp(`${key}\\s*:\\s*([^;]*?)\\s*(?:;|$)`, 'g'))].map((m) => m[1]);
    if (values.length === 0) throw new Error(`theme.css の :root に ${key} がありません`);
    if (values.length > 1) throw new Error(`theme.css の :root で ${key} が ${values.length} 回書かれています。1回にしてください`);
    if (!/^#[0-9a-fA-F]{6}$/.test(values[0])) throw new Error(`theme.css の ${key} の値 "${values[0]}" は #RRGGBB 形式ではありません`);
    colors[name] = values[0];
  }

  const categories = {};
  for (const category of categoryKeys) {
    const key = `--og-accent-${category}`;
    const values = [...block.matchAll(new RegExp(`${key}\\s*:\\s*([^;]*?)\\s*(?:;|$)`, 'g'))].map((m) => m[1]);
    if (values.length > 1) throw new Error(`theme.css の :root で ${key} が ${values.length} 回書かれています。1回にしてください`);
    if (values.length === 1 && !/^#[0-9a-fA-F]{6}$/.test(values[0])) throw new Error(`theme.css の ${key} の値 "${values[0]}" は #RRGGBB 形式ではありません`);
    categories[category] = values[0] ?? colors.accent;
  }
  return { ...colors, categories };
}
