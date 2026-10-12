# 10 OGP画像の色をカテゴリーごとに変えられるようにする

記事のOGP画像は、外枠とカテゴリーのバッジを`--og-accent`の1色で塗っています。
SNSで共有されたときにカテゴリーを見分けられるよう、カテゴリーごとに色を指定できるようにします。

関連 [MVP仕様書](../template-mvp.md)、[テーマの契約](../theme-contract.md)

## 指定のしかた

`theme.css`の最初の`:root`に、`--og-accent-<カテゴリーのキー>`を書きます。
書いたカテゴリーはその色で塗り、書いていないカテゴリーは`--og-accent`で塗ります。
形式のルールは`--og-bg`などと同じで、`#RRGGBB`で1回だけ書きます。

```css
:root {
  --og-accent: #cfeff6;
  --og-accent-daily: #dcf1e4;
  --og-accent-tech: #cfeff6;
  --og-accent-review: #f8e9c8;
}
```

## TODO

- [x] `src/lib/og-colors.mjs`の`readOgColors`に、カテゴリーのキーの配列を2つ目の引数で渡せるようにする。キーごとに`--og-accent-<キー>`を探し、あればその色、なければ`accent`を返す。戻り値に`categories`(キーから色への対応)を足す
- [x] `--og-accent-<キー>`にも、重複と形式のチェックを`--og-bg`などと同じように適用する
- [x] `src/pages/og/[...slug].png.ts`で`CATEGORY_KEYS`を渡し、外枠とバッジを記事のカテゴリーの色で塗る
- [x] `src/lib/og-colors.test.mjs`に、カテゴリーの色を読むテスト、書いていないカテゴリーが`accent`になるテスト、カテゴリーの色の形式違いでエラーになるテストを足す
- [x] 標準テーマの`src/theme/theme.css`に、上の例の3色を足す
- [x] `docs/theme-contract.md`のトークン表と「OGP画像の色」の節に、`--og-accent-<キー>`を書き足す

## 完了条件

- カテゴリーごとに外枠とバッジの色が変わったOGP画像が生成される
- `--og-accent-<キー>`を書かないテーマでは、今までどおり`--og-accent`の1色になる
- `npm run build`と`npm test`が通る
