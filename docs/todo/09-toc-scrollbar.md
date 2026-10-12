# 09 目次のスクロールバーを、操作するときだけ表示する

目次が長くなると、目次の欄にスクロールバーが出たままになります。
macOSで「スクロールバーを常に表示」にしている場合や、マウスを接続している場合に起きます。
スクロールバーは普段は透明にし、目次にマウスを乗せたときか、目次の中にフォーカスがあるときだけ表示します。

関連 [MVP仕様書](../template-mvp.md)

## TODO

- [x] `template.css`の`.article-toc`に`scrollbar-width: thin`と、つまみと溝を透明にする`scrollbar-color`を足す
- [x] `.article-toc:hover`と`.article-toc:focus-within`のときだけ、つまみに色を付ける。色は`--color-text-muted`をもとに`color-mix()`で薄めて作り、テーマの配色に追従させる
- [x] スクロールできること自体は変えない。`overflow-y: auto`はそのまま残す

## 完了条件

- 目次にマウスを乗せていないとき、スクロールバーが見えない
- 目次にマウスを乗せるかフォーカスすると、スクロールバーが見えてスクロールできる
- `npm run build`と`npm test`が通る
