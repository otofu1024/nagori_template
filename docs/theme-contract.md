# テーマの契約

`src/theme/theme.css`が使ってよいトークンとセレクタの一覧です。AIも人間も、見た目を変えるときはこの一覧にあるものだけを使ってください。仕様は[template-mvp.md](template-mvp.md)にあります。

## トークン

`theme.css`の`:root`に定義しています。

| トークン | 役割 |
|---|---|
| `--color-bg` | ページの背景 |
| `--color-surface` | 記事カード、リンクカード、タグの背景 |
| `--color-text` | 基本の文字色 |
| `--color-text-muted` | 説明、日付などの補助情報 |
| `--color-border` | 基本の区切り線 |
| `--color-accent` | ナビと目次の選択中表示、検索結果のmark、focus枠 |
| `--color-accent-secondary` | 引用の線、カードhover時の枠などの補助的な強調 |
| `--color-link` | 本文のリンク |
| `--color-link-hover` | 本文リンクのhoverとfocus |
| `--font-sans` | 本文とUIのフォント |
| `--og-bg` | OGP画像の背景 |
| `--og-text` | OGP画像の文字 |
| `--og-accent` | OGP画像の強調色 |
| `--astro-code-foreground`、`--astro-code-background` | コードブロックの文字色と背景 |
| `--astro-code-token-comment`、`-keyword`、`-string`、`-string-expression`、`-constant`、`-function`、`-parameter`、`-punctuation`、`-link` | コードブロックの構文の色 |

## セレクタ

### ヘッダーとナビ

| セレクタ | 対象 |
|---|---|
| `.skip-link` | 本文へ移動するリンク |
| `.site-header` | ヘッダー |
| `.brand` | サイト名のリンク |
| `.site-nav` | ナビ。`.site-nav a`、選択中の`.site-nav a.active`を使える |
| `.nav-icon` | ナビ項目のアイコン |

### トップ

| セレクタ | 対象 |
|---|---|
| `.hero` | ヒーロー全体 |
| `.hero-copy` | ヒーローの文章。中の`h1`と`> p`を使える |
| `.hero-title-rule` | タイトル下の線 |
| `.hero-cta` | 記事一覧へのリンク |
| `.section-heading` | 「新着記事」などの節の見出し。中の`h2`を使える |

### 記事一覧とカード

記事一覧、カテゴリー別一覧、タグ別一覧、トップの新着で共通です。

| セレクタ | 対象 |
|---|---|
| `.page-header` | 一覧ページや about の見出し部分。中の`h1`と最後の`p`を使える |
| `.post-row` | 記事カード |
| `.post-row-link` | カード全体のリンク |
| `.post-main` | カードの文章部分。中の`h3`と`p`を使える |
| `.post-meta` | 日付とカテゴリーの行 |
| `.category-label` | カテゴリー名のラベル。`.category-label.<キー>`で色を変えられる |
| `.post-arrow` | カードの矢印 |
| `.auto-cover` | 自動生成する表紙。`.auto-cover.<キー>`で色を変えられる |
| `.auto-cover-title` | 表紙のタイトル。長さに応じて`.medium`と`.long`が付く |
| `.auto-cover-category` | 表紙のカテゴリー名 |
| `.empty-state` | 記事がないときの表示 |

### 記事ページ

| セレクタ | 対象 |
|---|---|
| `.article` | 記事全体 |
| `.article-header` | 記事の見出し部分。中の`h1`を使える |
| `.article-description` | 記事の説明 |
| `.article-dates` | 公開日と更新日 |
| `.tag-list` | タグの一覧。中の`a`を使える |
| `.article-cover` | 記事の表紙。中の`img`を使える |
| `.article-footer` | 記事末尾の領域 |
| `.article-pagination__link` | 前後の記事へのリンク。`--previous`、`--next`が付く。中の`span`は見出し、`strong`は記事名 |
| `.article-list-link` | 記事一覧へ戻るリンク |

### 目次

| セレクタ | 対象 |
|---|---|
| `.article-toc` | 目次全体。`li`と`a`を使える。表示中の節のリンクには`a.is-active`が付く |
| `.article-toc__heading` | 見出し部分。中の`h2`を使える |
| `.article-toc__divider` | 見出し下の区切り |
| `.article-toc__list--root` | 最上位の一覧 |
| `.article-toc__list--nested` | 入れ子の一覧 |
| `.article-toc__number` | 節番号 |
| `.article-toc__text` | 節の題 |
| `.article-toc__arrow` | 矢印 |
| `.article-toc__reading-time` | 所要時間。中の`strong`は分数 |
| `.article-toc__reading-label` | 所要時間のラベル |

### 本文

`.prose`の下にある標準の要素を使えます。

| セレクタ | 対象 |
|---|---|
| `.prose` | 本文全体 |
| `.prose h2`、`.prose h3`、`.prose h4` | 見出し |
| `.prose a` | リンク。リンクカードは`.prose a:not(.link-card)`で除ける |
| `.prose blockquote` | 引用 |
| `.prose code`、`.prose pre` | インラインコードとコードブロック |
| `.prose hr` | 区切り線 |
| `.prose table`、`.prose th`、`.prose td` | 表 |

### リンクカード

URLだけの行から作るカードです。`.prose`の下に出ます。

| セレクタ | 対象 |
|---|---|
| `.link-card` | カード全体。画像があるときは`.link-card--with-image`も付く |
| `.link-card__title` | タイトル |
| `.link-card__description` | 説明 |
| `.link-card__site` | サイト名 |
| `.link-card__image` | 画像 |

### 吹き出し

`.prose`の下に出ます。キャラクターを定義していないときは出力されません。

| セレクタ | 対象 |
|---|---|
| `.talk` | 吹き出し全体。`data-character`にキャラクターのキー、`data-expression`に表情のキーが入る |
| `.talk__character` | キャラクター画像 |
| `.talk__bubble` | 吹き出し。背景、枠、角丸、尾は`::before`と`::after`で変えられる |

キャラクターごとの指定には`.talk[data-character="NAGORI"]`のように書きます。表情ごとの指定は`.talk[data-expression="normal"]`です。

### 検索

| セレクタ | 対象 |
|---|---|
| `.search-form` | 検索フォーム。中の`label`を使える |
| `.search-input-row` | 入力欄の行。中の`input`と`button`を使える |
| `.search-status` | 検索の状態表示 |
| `.search-results` | 結果の一覧 |
| `.search-result` | 結果1件。中の`span`は題、`p`は抜粋、`mark`は一致した語 |

### about

| セレクタ | 対象 |
|---|---|
| `.about-grid` | 項目の並び。中の`section`、`h2`、`p`を使える |
| `.author-note` | 著者の紹介。中の`h2`を使える |
| `.author-label` | 著者のラベル |

### 404

| セレクタ | 対象 |
|---|---|
| `.not-found` | ページ全体。中の`h1`を使える |
| `.error-code` | 「404」の表示 |
| `.primary-link` | トップへ戻るリンク |

### フッター

| セレクタ | 対象 |
|---|---|
| `.site-footer` | フッター全体 |
| `.footer-links` | リンクの行。中の`a`を使える |
| `.footer-meta` | コピーライト |

### カテゴリーのキー

カテゴリーのキーは`src/config.ts`の`CATEGORIES`で決まります。初期状態は`daily`、`tech`、`review`です。
キーを足したときは、`.category-label.<キー>`と`.auto-cover.<キー>`をテーマにも足してください。

## 装飾用の空き要素

次の6つは中身のない要素で、テーマが装飾を描くために置いてあります。初期状態では`theme.css`の1つのルールで`display: none`にしてあります。そのルールを消すか上書きすると表示できます。

- `.brand-mark`
- `.section-mark`
- `.auto-cover-mark`
- `.article-toc__mark`
- `.article-toc__leaf`
- `.article-toc__reading-leaf`

## 変えてよいもの、保つもの

変えてよいもの

- 色、フォント、文字サイズ、字間、行間
- 角丸、影
- hover時の動き
- 装飾

保つもの

- gridの列構成
- `position: sticky`
- ブレークポイント
- 日本語の改行制御
- skip-linkとfocus表示の存在など、操作性

技術的にはどれも上書きできます。保つものは、テンプレートの仕様として利用者と交わす約束です。

## 契約の範囲

- 契約にないクラスを使うのは自己責任です。テンプレートを更新して表示が変わっても保証しません
- 子要素の並び順や深いDOM構造も保証しません

## OGP画像の色

`--og-bg`、`--og-text`、`--og-accent`は、`theme.css`の最初の`:root`に`#RRGGBB`形式で1回ずつ書きます。ビルド時に正規表現で読むので、`var()`や`color-mix()`は使えません。値が足りないか不正だと、ビルドがエラーで止まります。

## フォントを変えるとき

`theme.css`の1行目にある`@import`を、使いたいフォントのGoogle FontsのURLに書き換え、`--font-sans`も同じフォントに合わせます。`@import`はファイルの先頭にないと無視されるので、1行目から動かさないでください。
