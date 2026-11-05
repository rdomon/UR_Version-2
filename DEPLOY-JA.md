# BODiFi Calm版（ユーザーテスト反映＋Calmスタイル）— 公開方法

1. ZIPを展開し、`index.html`、`app.js`、`spotify.js`、`keyboard.js`、`styles.css`、`calm.css`、`home.css`（新規）、`assets/` を GitHub Pages のルート（`rdomon/User-Research` 直下）に上書き配置します。
2. VS Code のターミナルで次を実行します。
   `git add index.html app.js spotify.js keyboard.js styles.css calm.css home.css assets/`
   `git commit -m "Add Home dashboard and Calm style"`
   `git push origin main`
3. `https://rdomon.github.io/User-Research/` を開き、Command+Shift+R で強制再読み込みします。

## Calmスタイルについて

- `calm.css` を `styles.css` の後に読み込み、配色・角丸・影・ボタン形状を上書きしています（Sage / Moss / Mist / Ivory / Sand、ピル型ボタン、柔らかい立体カード）。元の `styles.css` は構造のまま残しています。
- フォントは Inter（Google Fonts）に統一しました。テスト環境ではWebフォントを読み込めなかったため、実機で字形と折り返しを確認してください。
- 本文テキストのコントラストを確保するため、ボタンやラベルには基準の Sage より少し濃い Sage 600（`#5a6f5d`）を使っています。
- スタイルガイド: https://claude.ai/artifact/DEtfsqJbqQLtFU6KshKfLP
- 元に戻すときは、`index.html` の `calm.css` の行を削除するだけです（フォントは別途戻してください）。

## Homeダッシュボード

- 「Home」ボタンと bodifi ロゴを押すと、ダッシュボード形式のランディングページ（`home.css`）が開きます。左にナビゲーション、中央に挨拶・最近のプレイリスト・今日のクラス・カレンダー、右に3つの円グラフです。スタイルは Calm 版のまま維持しています。
- 「Start a class」で講師選択から始まります。再生を開始済みなら「Resume playing」で再生画面に戻れます。選択内容と再生状態はHomeを開いても保持されます。
- スケジュール・円グラフの数値は仮データです（画面にも明記）。Playlists / Schedule / Messages / Settings は未実装で、押すと案内が出ます。
- 起動直後の画面は従来どおり講師選択です（Homeを押したときだけダッシュボードが出ます）。

## 指摘と対応

| # | 指摘 | 対応 |
|---|------|------|
| 01 | 講師リストがスクロールできそうに見えない | 講師を6名に増やし（Morgan L. / Casey P. / Riley T. は仮データ）、縦スクロールのリスト化。常時表示のスクロールバーと「Scroll for more instructors ↓」の案内、タップで下へ送れるボタンを追加 |
| 02 | クラスの読み込み・確認方法がない | クラス選択後に「Load “クラス名” →」ボタンを追加。プレイリスト選択後に「Ready to play」確認画面（講師・サービス・クラス・プレイリストの一覧と Change ボタン）を追加。再生画面にも講師・クラス・「✓ Class loaded」を表示 |
| 03 | ステップ3・4が開かない | 1〜5の番号ボタンを常にタップ可能に。選んだ値はステップ間を移動しても保持。前のステップが未完了なら「Step N isn’t finished yet」と案内 |
| 04 | サインインでキーボードが出ない | デモのサインイン画面（Email / Password）に画面キーボード（`keyboard.js`）を追加（下記） |
| 05 | Apple Music が動かない | 動作しないサービスは無効表示（点線・薄色・「Not available yet」）にし、押せないようにした |
| 06 | 終了のタイミングが不明 | 5段階の進捗バーを常時表示し、現在地を強調・完了済みはチェック表示。最後に「Ready to play」画面を追加 |
| 07 | Spotify ロゴがホームに見える | 「Home」ボタンを上部に追加。bodifi ロゴも同じくホームへ戻る（挙動を統一） |
| 08 | 検索が Music Service と重なる | 画面右下に浮いていた検索ボタンを廃止し、Music Service / Playlist の選択肢の下に独立した「Search Spotify」ボタンを配置。1024×600 でも重ならないよう余白を調整 |
| 09 | ヘルプアイコンが「H」の一部で欠ける | 「?」を専用アイコン枠で中央配置し、ラベルは完全に隠すよう修正（44×44px） |

## サインイン（デモのみ）

- Spotify を選ぶと、BODiFi 独自の試作用サインイン画面（Email / Password）だけが開きます。Client ID の入力欄と、実際の Spotify への接続ボタンは削除しました。
- 画面を開くと Email 欄にフォーカスが当たり、画面キーボードが自動で出ます。Email で Enter → Password に移動、Password で Enter → サインインします。
- メール形式と、パスワードが空でないことだけを確認します。入力内容はどこにも送信・保存されません。
- Spotify の画面に似せたログインフォームにはしていません（偽のログイン画面になるため）。画面にも「試作用・実パスワード入力不可」と明記しています。
- 実際の Spotify 検索・再生は、この版では使えません（接続の入口がないため）。

## 画面キーボードについて

- タッチ対応の判定に関わらず、入力欄にフォーカスすると常に表示されます。物理キーボードで試すときだけ、URL の末尾に `?keyboard=0` を付けると無効にできます。
- 閉じ方は、Hide ボタン、入力欄以外のタップ、Esc、Enter（送信）です。1024×600 では、Email・Password・Sign in がキーボードの上に収まります。
- 実機（タブレット）での確認項目: 入力欄のタップで出ること、文字・記号の入力、Enter での移動と送信、Hide での閉じ方。

## 注意

- `spotify.js` と検索画面のコードは残してありますが、この版では呼び出されません。
