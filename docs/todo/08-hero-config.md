# 08 トップの文章と画像、サイト全体のOGP画像を設定できるようにする

トップの挨拶文やキャラクター画像、サイト全体のOGP画像を、`src/config.ts`だけで指定できるようにします。
今はどれも`index.astro`や`BaseLayout.astro`を書き換えないと変えられず、テンプレートを更新するたびに利用者の変更とぶつかります。

関連 [MVP仕様書](../template-mvp.md)

## 設定の形

```ts
// src/config.ts
export const SITE = {
  title: "nagori",
  description: "日本語で書くためのAstroブログテンプレート。",
  author: "nagori",
  // 記事以外のページのOGP画像。public/からのパス。省略できる
  // image: "/og.png",
};

// トップのヒーロー。どの項目も省略できる
export const HERO: Hero = {
  // lead: ["1行目の文章", "2行目の文章"],
  // image: { src: "/images/hero.png", width: 531, height: 948, alt: "画像の説明" },
};
```

`Hero`の型は`config.ts`の中で定義します。`config.ts`は`astro.config.mjs`と`scripts/new-post.mjs`からNodeで直接読み込まれるので、型を消すだけで動く書き方(`type`と`interface`)だけを使ってください。

## TODO

### 設定

- [x] `src/config.ts`に`Hero`の型と`HERO`を足す。初期状態は空のオブジェクトにし、上の書き方をコメントで残す
- [x] `SITE`に省略できる`image`を足す。初期状態ではコメントで書き方だけを残す

### トップ

- [x] `src/pages/index.astro`で、`HERO.lead`があれば要素ごとに`<br />`で改行して表示し、なければ今までどおり`SITE.description`を表示する
- [x] `HERO.image`があれば、`.hero-copy`の後ろに`<div class="hero-art"><img class="hero-image" ...></div>`を出す。`img`には`width`、`height`、`alt`、`decoding="async"`、`fetchpriority="high"`を付ける
- [x] `template.css`に、画像があるときだけPC幅で文章と画像を2列に並べ、スマホ幅では縦に積むルールを足す。`.hero:has(.hero-art)`で切り替え、画像がないときの見た目は今と変えない
- [x] 2列の比率や画像の高さは、元にしたブログ(`/Users/fufufu/yuzu_notes/src/styles/global.css`の`.hero`、`.hero-art`、`.hero-yuzuko`と、そのメディアクエリ)を参考にする。色や装飾(`.hero-spark`など)は持ち込まない

### OGP画像

- [x] `BaseLayout.astro`の`image`の初期値を`SITE.image ?? null`にする。記事ページは自分で`image`を渡しているので変わらない

### 契約と説明

- [x] `docs/theme-contract.md`のトップの表に`.hero-art`と`.hero-image`を足す。`.hero-art`の`::before`と`::after`は装飾に使えると書く
- [x] `README.md`の設定の節に`HERO`と`SITE.image`を1行ずつ足す

## 完了条件

- 初期状態(`HERO`が空、`SITE.image`なし)のトップとOGPのmetaが、変更前と同じ
- `HERO`に`lead`と`image`を入れると、PC幅で文章と画像が2列、スマホ幅で縦積みになる
- `SITE.image`を入れると、記事以外のページに`og:image`が出る
- `npm run build`と`npm test`が通る
