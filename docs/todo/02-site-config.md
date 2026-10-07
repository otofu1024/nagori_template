# 02 サイトの設定をsite.config.tsにまとめる

利用者が書き換える値を`src/site.config.ts`に集めます。
これが終わると、`src/pages/`や`astro.config.mjs`をテンプレートの更新対象にできます。

関連 [MVP仕様書](../template-mvp.md)

## TODO

- [ ] `src/config.ts`を`src/site.config.ts`に移す。import しているファイルもすべて直す
- [ ] サイトURLを`site.config.ts`に持たせ、`astro.config.mjs`はそこから読む。環境変数`SITE_URL`での上書きは残す
- [ ] `BaseLayout.astro`の`navItems`のラベルとアイコンを設定に移す
- [ ] `BaseLayout.astro`に直書きされた`theme-color`の値を設定から読む
- [ ] `scripts/new-post.mjs`が新しい設定ファイルを読めることを確認する
- [ ] 「最近の記事」「目次」「前の記事」などUIの固定文言は、日本語のまま残す

## 完了条件

- 利用者が書き換える値が`src/site.config.ts`だけにまとまっている
- 01の基準画像と比べて、見た目が変わっていない
- `npm run build`が通る
