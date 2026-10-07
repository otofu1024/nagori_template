# nagori

日本語で書くためのAstroブログテンプレートです。現在は開発中で、仕様は変わる可能性があります。

仕様と開発の方針は`docs/template-mvp.md`にあります。

## 使い方

```sh
npm install
npm run dev
```

記事の雛形は`npm run new-post`で作ります。公開用のファイルは`npm run build`で生成され、`dist/`に出力されます。

サイトのタイトルと説明、カテゴリーは`src/config.ts`で設定します。記事の書き方は`docs/markdown-guide.md`を参照してください。
