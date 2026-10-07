# nagori_template

日本語で書くためのAstroブログテンプレートです。見た目を変えたいときはAIに頼むだけで、AIが書き換えるのは`src/theme/theme.css`の1枚だけです。

## はじめ方

次のコマンドでプロジェクトを作ります。

```sh
npm create astro@latest -- --template otofu1024/nagori_template
cd プロジェクト名
npm install
npm run dev
```

Node.js 22.21.1以上が必要です。`npm run dev`のあと、ブラウザで`http://localhost:4321/`を開くとサイトを確認できます。

## 見た目を変える

Claude CodeやCursorなどのAIに「見た目を〇〇にして」と頼んでください。AIは`AGENTS.md`と`docs/theme-contract.md`に従い、`theme.css`だけを書き換えます。

自分で書き換えるときは、`theme.css`の`:root`にあるトークン(変数)から変えてください。フォントは、1行目の`@import`と`--font-sans`を変えます。

## 設定

- サイト名、説明、著者、カテゴリー、キャラクターは`src/config.ts`で設定します
- サイトのURLは`astro.config.mjs`の`site`で設定します。環境変数`SITE_URL`でも上書きできます

## 記事を書く

`npm run new-post`で記事の雛形を作ります。詳しい書き方は`docs/markdown-guide.md`を見てください。URLだけの行はリンクカードになり、キャラクターの吹き出しも使えます。

## 公開する

`npm run build`を実行すると、`dist/`に静的ファイルが出力されます。好きな静的ホスティングに置いてください。

## 主な機能

- 全文検索
- 記事の目次
- RSSとサイトマップ
- OGP画像の自動生成
- リンクカード
- キャラクターの吹き出し
- 日本語の強調記法(`**「」**`など)の崩れ対策

## ライセンス

MITライセンスです。詳細は[LICENSE](./LICENSE)を参照してください。
