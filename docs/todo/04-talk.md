# 04 キャラクター吹き出しを作る

設定でキャラクターを定義できる吹き出しのremarkプラグインを新しく作ります。
記法、設定、出力するHTMLは仕様書の「キャラクター吹き出し」の節に従ってください。

関連 [MVP仕様書](../template-mvp.md)

## TODO

### 設定

- [x] `~/Downloads/nagori.png`(1254px四方、691KB)を256px四方に縮小し、`public/images/nagori/normal.png`に置く
- [x] `src/config.ts`に`CHARACTERS`を追加し、サンプルの`NAGORI`を1つ入れる
- [x] `astro.config.mjs`から、remarkプラグインに`CHARACTERS`を渡す
- [x] キャラクターのキーを英数字、`_`、`-`に限る
- [x] `NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`をキーに使ったら設定エラーにする
- [x] 表情の別名が重複していたら設定エラーにする

### 記法と出力

- [x] 引用の先頭の`[!キー 表情]`を読み取る。キーは大文字にそろえて照合する
- [x] 表情は小文字にそろえ、末尾の`!！?？`を取り除いてから照合する
- [x] 表情を省略したら`defaultExpression`を使う
- [x] 設定にないマーカーは、通常の引用として表示する
- [x] 登録済みのキャラクターで未知の表情が指定されたら、警告を出して元の内容を残す
- [x] 出力を`<aside class="talk" data-character data-expression>`、`.talk__character`、`.talk__bubble`の形にする
- [x] `data-expression`には、記事で使った別名ではなく正規のキーを入れる
- [x] 画像の寸法やlazy読み込みは、既存の`rehype-responsive-images.mjs`の処理に任せる
- [x] `CHARACTERS`が空なら、プラグインは何もしない
- [x] 別名、表情の省略、未知の指定、吹き出し内のMarkdownの保持を確かめる小さなテストを1つ書く

### 見た目

- [x] 吹き出しの左右の配置とスマホでの列構成をテンプレート側のCSSに書く
- [x] 吹き出しの色、枠、角丸、尾の形をsimpleテーマに書く
- [x] `docs/markdown-guide.md`に記法の説明を足す

## 完了条件

- サンプル記事の中で、`NAGORI`の吹き出しが表示される
- `CHARACTERS`を空にすると、吹き出しが通常の引用として表示される
