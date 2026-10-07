# 03 OGP画像とコードブロックの配色をtheme.cssから決める

関連 [MVP仕様書](../template-mvp.md)

## TODO

### OGP画像

- [x] `theme.css`の先頭の`:root`から、`--og-bg`、`--og-text`、`--og-accent`を正規表現で読む関数を書く
- [x] 値は`#RRGGBB`だけを受け付ける。変数が足りないとき、重複しているとき、形式が違うときはビルドをエラーで止める
- [x] 読み取りの関数に、正常な場合とエラーになる場合を確かめる小さなテストを1つ付ける
- [x] `src/pages/og/[...slug].png.ts`の`categoryColors`と直書きの色を、読み取った3色に置き換える
- [x] トップページなど記事以外のページのOGP画像は、作らないことにした

### コードブロック

- [x] `astro.config.mjs`のShikiの設定を、`--astro-code-*`変数で配色を変えられる形にする
- [x] simpleテーマでコードブロックの配色を指定する

## 完了条件

- `theme.css`の3色を変えると、OGP画像の配色が変わる
- `theme.css`だけで、コードブロックの配色を変えられる
