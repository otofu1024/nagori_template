# ブログテンプレートMVP仕様書

日本語ブログ向けのAstroテンプレートを、OSSで公開するための仕様です。nagoriは仮の名前です。

- 作成日 2026-10-07
- 更新日 2026-10-07。GPT-6-Sol、GPT-6.1-Solとの設計レビュー3往復の結果を反映し、MCPサーバーを範囲から外した。元にしたブログ固有の要素をすべて取り除いた前提に改めた
- 状態 仕様確定、実装は未着手

## 目的

ユーザーがAIに頼むだけで、自分好みの見た目のブログを作れるようにします。
AIが編集するのは`theme.css`の1枚だけで、テンプレート本体には触れません。

既存のAstroブログテーマはTailwind系が多く、見た目の指定がマークアップ中のクラスに散らばっています。
そのためCSS1枚では全体の見た目を変えられず、AIに頼むと複数の`.astro`ファイルを書き換えることになります。
このテンプレートの一番の特徴は、AIが安全に見た目を変えられる構造です。

## 想定ユーザー

対象は、Claude CodeやCursorなどローカルのコーディングAIを使う開発者です。

## MVPの範囲と合格条件

MVPには、テンプレート、`theme.css`、`AGENTS.md`、プレビュー用スクリプトを含めます。
Claude Codeに配色の異なるテーマを2回作らせ、どちらも差分が`theme.css`だけで、代表画面がPC幅とスマホ幅で崩れなければ合格です。

## 将来のブログアプリとの関係

将来、このテンプレートを組み込んだブログアプリを作る構想があります。
アプリの中でAIとMCPでつながり、ブログのデザインを自由に変えられるようにするつもりです。
MCPサーバーを持つのはアプリ側で、このテンプレートでは作りません。

アプリから見ると、テンプレートは次の3つを満たしていれば扱えます。
AIが編集するのは決まった場所にある`theme.css`の1枚だけであること、使えるトークンとセレクタが契約に書かれていること、見た目をスクリーンショットで確認するスクリプトがあることです。
この3つはMVPにすでに含まれているので、アプリのためにテンプレート側で追加する作業はありません。

## 機能

今あるコードの機能をそのまま使い、新しい機能は足しません。キャラクター吹き出しだけは、今のコードから外してあるので作り直します。

- 記事一覧、カテゴリー別一覧、タグ別一覧
- 記事ページ。目次、所要時間、前後の記事へのリンクを含む
- Pagefindによる全文検索
- RSS、サイトマップ、robots.txt
- satoriによるOGP画像の自動生成
- リンクカード。URLだけの行をカードにする
- 日本語の強調記法の崩れ対策
- キャラクター会話の吹き出し。任意機能で、キャラクターを定義しなければ無効になる

## 見た目のカスタマイズ範囲

テーマ側で変えてよいのは色、フォント、文字サイズ、字間、行間、角丸、影、hover時の動き、装飾です。
gridの列構成、`position: sticky`、ブレークポイント、日本語の改行制御、skip-linkやfocus表示の存在はテンプレート側で固定します。

`theme.css`には任意のセレクタを書けるので、技術的にはレイアウトも上書きできます。
レイアウトの固定はCSSの仕組みで強制するものではなく、利用者との約束として契約に書くものです。

## ファイル構成

| パス | 持ち主 | 内容 |
|---|---|---|
| `src/styles/template.css` | テンプレート | 全体を`@layer template`の1層で包んだテンプレートのCSS |
| `src/theme/theme.css` | 利用者 | AIが編集する唯一のCSS。レイヤーの外で読み込む |
| `themes/simple.css` | テンプレート | 標準テーマの見本。テンプレートの初期状態の`theme.css`と同じ内容 |
| `src/site.config.ts` | 利用者 | サイト名、URL、著者、カテゴリー、ナビ、キャラクター |
| `src/content/` | 利用者 | 記事 |
| `AGENTS.md`、`docs/theme-contract.md` | テンプレート | AI向けの作業ルールと契約 |

## CSSの設計

### @layer

テンプレートのCSS全体を`@layer template`で包みます。
レイヤーの外にある`theme.css`は、詳細度に関係なくテンプレートより優先されます。
今のCSSには`.prose a:not(.link-card)`のように詳細度の高いセレクタがあり、レイヤーがないとAIの上書きが効かない場面が出ます。
レイヤーを分けるのはこの1層だけです。

見た目のルールを`theme.css`に移すときは、`:where()`で包んで詳細度を下げます。
こうしておくと、利用者が後から書くルールと競合しにくくなります。

### トークン

トークンは実際に変えたい役割だけに絞った13個です。
細かい色の違い、角丸、影、余白、カテゴリー色はトークンにしません。`theme.css`の中でセレクタを書いて指定します。

今の値は、元のブログの配色を消すために置いた仮の無彩色です。正式な値は04でsimpleテーマを作るときに決めます。

| トークン | 役割 | 今の仮の値 |
|---|---|---|
| `--color-bg` | ページの背景 | `#ffffff` |
| `--color-surface` | 記事カード、リンクカード、タグの背景 | `#fafafa` |
| `--color-text` | 基本の文字色 | `#222222` |
| `--color-text-muted` | 説明、日付などの補助情報 | `#666666` |
| `--color-border` | 基本の区切り線 | `#e5e5e5` |
| `--color-accent` | ナビと目次の選択中表示、検索結果のmark、focus枠 | `#8a8a8a` |
| `--color-accent-secondary` | 引用の線、カードhover時の枠などの補助的な強調 | `#555555` |
| `--color-link` | 本文のリンク | `#222222` |
| `--color-link-hover` | 本文リンクのhoverとfocus | `#000000` |
| `--font-sans` | 本文とUIのフォント | 日本語向けのシステムフォントのスタック |
| `--og-bg` | OGP画像の背景 | `#f0f0f0` |
| `--og-text` | OGP画像の文字 | `#222222` |
| `--og-accent` | OGP画像の強調色 | `#e0e0e0` |

`--color-link`と`--color-link-hover`はまだCSSにありません。03で追加します。

### 契約

テーマが使ってよいセレクタの一覧を、短いMarkdownの`docs/theme-contract.md`にまとめます。
今のクラス名をそのまま公開し、BEMへの全面的な改名はしません。

`.brand-mark`、`.section-mark`、`.auto-cover-mark`、`.article-toc__mark`、`.article-toc__leaf`、`.article-toc__reading-leaf`は装飾用の空き要素です。
テンプレートの初期状態では非表示にしてあり、テーマが表示して装飾を描けます。

カテゴリーの色は、`.category-label.tech`や`.auto-cover.tech`のようにカテゴリーのキーを使ったクラスで指定します。
子要素の並び順や深いDOM構造は保証しません。

契約にないクラスをテーマで使うのは自己責任とし、テンプレートを更新したときに表示が変わっても保証しません。
AIには`AGENTS.md`で、契約にあるセレクタだけを使うよう指示します。

## CSSの外で色が決まっている箇所

### OGP画像

OGP画像のレイアウトは固定し、色だけを`theme.css`の`--og-bg`、`--og-text`、`--og-accent`から読みます。
3つの変数は、`theme.css`の先頭にある`:root`に`#RRGGBB`形式で1回ずつ書く決まりです。
ビルド時に正規表現で読み取るだけで、`var()`や`color-mix()`は評価しません。変数が足りないときや値が不正なときは、ビルドをエラーで止めます。

ページの配色をOGPに自動で同期するわけではありません。1枚のCSSにページの配色とOGPの配色の両方を書く、という約束です。
記事以外のページには、今はOGP画像を設定していません。05で、トップページ用の画像を用意するか決めます。

### コードブロック

AstroのShikiが持つCSS変数の仕組みを使い、`.astro-code`の`--astro-code-*`変数で配色を指定する方式にし、独自のトークンは追加しません。

### theme-color

`<meta name="theme-color">`はHTMLに色の値を直接書く必要があり、CSS変数を参照できません。MVPでは同期せず、`site.config.ts`の固定値にします。

## キャラクター吹き出し

任意機能としてMVPに含めます。今のコードには入っていないので、06で新しく作ります。

記法は`> [!キャラクターのキー 表情]`です。
キャラクターは`src/site.config.ts`の`CHARACTERS`に定義し、`astro.config.mjs`からremarkプラグインに渡します。

```ts
export const CHARACTERS = {
  HARU: {
    name: "ハル",
    defaultExpression: "normal",
    expressions: {
      normal: { src: "/images/haru/normal.png", label: "通常", aliases: ["通常"] },
      troubled: { src: "/images/haru/troubled.png", label: "困り", aliases: ["confused", "困り"] },
    },
  },
} as const;
```

この例のキャラクターは説明用です。テンプレートの初期状態では`CHARACTERS`を空にします。

キャラクターのキーには英数字、`_`、`-`だけを使え、大文字にそろえて照合します。
GitHubのアラート記法とぶつからないよう、`NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`はキーに使えません。
表情は小文字にそろえ、末尾の`!！?？`を取り除いてから照合します。
表情を省略すると`defaultExpression`になります。設定にないマーカーは通常の引用として表示し、登録済みのキャラクターで未知の表情を指定したときは警告を出します。
`CHARACTERS`が空なら機能は無効です。

出力するHTMLは次の形にします。`data-expression`には、記事で使った別名ではなく正規のキーを入れます。

```html
<aside class="talk" data-character="HARU" data-expression="troubled" aria-label="ハル（困り）のひとこと">
  <img class="talk__character" src="/images/haru/troubled.png" alt="" aria-hidden="true">
  <div class="talk__bubble"><p>本文</p></div>
</aside>
```

テーマは`.talk__bubble`とその擬似要素で、吹き出しの背景、枠、角丸、尾の形を変えられる設計です。キャラクターごとの指定には`.talk[data-character="HARU"]`を使います。

## 配布とアップデート

テンプレートはGitHubのテンプレートリポジトリとして公開します。
公開の準備に入るのは、MVPの合格条件を満たしてからです。

テンプレートから作ったリポジトリは元のリポジトリと履歴を共有しないため、`git merge`では更新を取り込めません。
利用者は、テンプレートが持つパスだけを次のコマンドでリリース時点の内容に置き換えてください。

```sh
git fetch upstream --tags
git restore --source=<リリースタグ> -- <テンプレートが持つパス>
```

実行前に手元の変更をコミットしておく必要があります。npmパッケージとしての配布は、利用者が増えて手作業での取り込みが負担になってから検討します。

テンプレートが持つパスは`src/pages/`、`src/layouts/`、`src/components/`、`src/lib/`、`src/styles/template.css`、`src/content.config.ts`、`scripts/`、`astro.config.mjs`、`tsconfig.json`、`AGENTS.md`、`docs/theme-contract.md`、`docs/markdown-guide.md`、`themes/`です。
利用者が持つパスは`src/theme/theme.css`、`src/site.config.ts`、`src/content/`、`public/`の素材、`src/data/link-cards.json`、`public/link-cards/`、README、デプロイ設定です。
`package.json`は、依存関係と標準のscriptsをテンプレート側、パッケージ名と追加したscriptsを利用者側が管理します。

`astro.config.mjs`をテンプレート側に置くには、サイトURLを`site.config.ts`から読むようにしておく必要があります。

## リファクタでの見た目の確認

CSSの分割やテーマの整理で、見た目が意図せず変わっていないかを確かめます。
01で今の状態のスクリーンショットを撮っておき、作業の前後で比べる形です。

比較は1280pxと375pxで全種類のページを撮り、980px、720px、600pxの境界付近は影響のある画面だけを追加で撮ります。
検索結果、目次の追従と選択中表示、hover、focusも確認します。
同じブラウザ、フォント、記事データで、画像の読み込みが終わってから撮影する決まりです。差分画像は目で見て確認し、描画の細かな揺れは許容します。配置、改行、色、装飾に説明できない差があれば直します。

04でsimpleテーマを作ると見た目は意図して変わるので、そこで基準の画像を撮り直します。

## MVPに含めないもの

- レイアウトの切り替え
- MCPサーバー。将来のブログアプリ側で作る
- 多言語対応
- ダークモードの自動切り替え。テーマ側で`prefers-color-scheme`を書けば対応できる
- theme-colorの同期
- npmパッケージやAstro integrationとしての配布
- カテゴリー色の自動生成、JSON形式の契約、CSSの静的検査

## 検討して採用しなかった案

| 案 | 採用しなかった理由 |
|---|---|
| 全色、全角丸をトークンにする | 利用者が変えない値まで公開すると設定項目が増え、テーマを理解しにくくなる |
| BEMへの全面的な改名 | CSS、Astro、remarkプラグインの出力を一度に変えることになり、CSS1枚という目的には役立たない |
| `@layer`をbase、layout、componentsの3層に分ける | 3層にしてもレイアウトは守れず、1層で詳細度の問題は解決する |
| `data-category`属性と`color-mix()`による色の自動生成 | 既存のカテゴリークラスで足り、自動生成した色は文字の読みやすさを保証できない |
| `theme.css`全体をCSSパーサーで解析してOGPの色を取る | `var()`、後続の上書き、メディアクエリまで評価しないと画面の最終色にならない |
| 契約をJSONで管理し、Markdownを生成する | JSON、生成スクリプト、整合性の検査が必要になり、MVPには重い |

## 作業手順

各手順の詳細は`docs/todo/`のファイルを見てください。

| ファイル | 内容 |
|---|---|
| [01-visual-baseline.md](todo/01-visual-baseline.md) | 今の状態の基準スクリーンショットを撮る |
| [02-site-config.md](todo/02-site-config.md) | サイトの設定を`site.config.ts`にまとめる |
| [03-css-split.md](todo/03-css-split.md) | CSSをテンプレートと`theme.css`に分け、トークンを導入する |
| [04-simple-theme.md](todo/04-simple-theme.md) | 標準テーマのsimpleを作る。03と並行して進める |
| [05-ogp-and-code.md](todo/05-ogp-and-code.md) | OGP画像とコードブロックの配色を`theme.css`から決める |
| [06-talk.md](todo/06-talk.md) | キャラクター吹き出しを作る |
| [07-contract-and-check.md](todo/07-contract-and-check.md) | 契約、`AGENTS.md`、プレビューを整え、MVPの合格条件を確かめる |
| [08-release.md](todo/08-release.md) | 公開の準備をする |

## 未決事項

- テンプレートの名前。nagoriを仮の名前にしている
- ライセンス。コードはMITなどを想定している
- simpleテーマの具体的なデザイン
- 吹き出しのサンプルに使う、配布できるキャラクター素材
