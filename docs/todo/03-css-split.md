# 03 CSSをテンプレートとtheme.cssに分ける

`src/styles/global.css`を、テンプレートが持つ`template.css`と、利用者が持つ`theme.css`に分けます。
04のsimpleテーマと並行して進めます。

関連 [MVP仕様書](../template-mvp.md)

## TODO

### 既知のバグ

- [ ] 980px以下で`.post-row`に`grid-template-columns`を指定しているが、gridは`.post-row-link`に付いているので効いていない。意図した列幅を確認して直す
- [ ] バグの修正はCSSの分離と別のコミットにして、見た目の比較を分けられるようにする

### 分け方

- [ ] `src/styles/template.css`を作り、全体を`@layer template`で包む
- [ ] `src/theme/theme.css`を作り、レイヤーの外で読み込む
- [ ] `BaseLayout.astro`のimportを差し替える
- [ ] 宣言ごとに、レイアウトに関わるものはテンプレート側、見た目だけのものは`theme.css`に振り分ける
- [ ] `theme.css`に移したルールは`:where()`で包み、詳細度を下げる。包んだあとにルールの順番で優先順位が変わらないか確認する
- [ ] `prefers-reduced-motion`の`!important`はテンプレート側に残す
- [ ] 装飾用の空き要素を非表示にするルールは`theme.css`に置く。テーマが装飾を描くときは、このルールを消して書き換える

### トークン

- [ ] 仕様書にある13個のトークンを`theme.css`の先頭の`:root`に書く
- [ ] `--color-link`と`--color-link-hover`を追加し、本文リンクの色をこの2つから取るようにする
- [ ] OGP用の3色は、05で読み取りを実装するまで値だけ置いておく
- [ ] トークンにしない色、角丸、影は、`theme.css`にセレクタごと直接書く

## 完了条件

- テンプレート側のCSSがすべて`@layer template`の中にある
- テンプレート側のCSSに色の値が残っていない
- 01の基準画像と比べて、見た目がバグ修正の分しか変わっていない
- `npm run build`が通る
