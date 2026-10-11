export const SITE: {
  title: string;
  description: string;
  author: string;
  image?: string;
} = {
  title: "nagori",
  description: "日本語で書くためのAstroブログテンプレート。",
  author: "nagori",
  // 記事以外のページのOGP画像。public/からのパス。省略できる
  // image: "/og.png",
} as const;

export interface Hero {
  lead?: string[];
  image?: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
}

// トップのヒーロー。どの項目も省略できる
export const HERO: Hero = {
  // lead: ["1行目の文章", "2行目の文章"],
  // image: { src: "/images/hero.png", width: 531, height: 948, alt: "画像の説明" },
};

// カテゴリーの唯一の定義元。
// スキーマ（content.config.ts）、ナビゲーション、about ページはここから生成する。
// scripts/new-post.mjs も Node の型ストリップ機能でこのファイルを直接 import している。
// そのため enum や namespace など、型を消すだけでは実行できない TS 構文は使わないこと。
export const CATEGORIES = {
  daily: {
    label: "日常",
    description:
      "日々の出来事について書いた記事です。",
  },
  tech: {
    label: "技術",
    description:
      "技術に関する記事です。",
  },
  review: {
    label: "感想",
    description: "本や作品の感想を書いた記事です。",
  },
} as const;

export type Category = keyof typeof CATEGORIES;

// z.enum に渡せるよう、少なくとも1要素を持つタプル型としてキー一覧を公開する
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as [Category, ...Category[]];

// キャラクター吹き出しの設定。空のオブジェクトにすると機能が無効になる。
// astro.config.mjs からも Node で直接 import されるため、型を消すだけで動く構文だけを使うこと。
export const CHARACTERS = {
  NAGORI: {
    name: "なごり",
    defaultExpression: "normal",
    expressions: {
      normal: { src: "/images/nagori/normal.png", label: "通常", aliases: ["通常"] },
    },
  },
};
