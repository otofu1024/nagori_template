export const SITE = {
  title: "nagori",
  description: "日本語で書くためのAstroブログテンプレート。",
  author: "nagori",
} as const;

// カテゴリーの唯一の定義元。
// スキーマ（content.config.ts）、ナビゲーション、about ページはここから生成する。
// scripts/new-post.mjs も Node の型ストリップ機能でこのファイルを直接 import している。
// そのため enum や namespace など、型を消すだけでは実行できない TS 構文は使わないこと。
export const CATEGORIES = {
  daily: {
    label: "日常",
    icon: "○",
    description:
      "日々の出来事について書いた記事です。",
  },
  tech: {
    label: "技術",
    icon: "▤",
    description:
      "技術に関する記事です。",
  },
  review: {
    label: "感想",
    icon: "✎",
    description: "本や作品の感想を書いた記事です。",
  },
} as const;

export type Category = keyof typeof CATEGORIES;

// z.enum に渡せるよう、少なくとも1要素を持つタプル型としてキー一覧を公開する
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as [Category, ...Category[]];
