# GAS Web App セットアップ手順

## 1. Driveフォルダ作成
1. Google Drive を開く → 新規 → フォルダ → 名前「日記」
2. フォルダを開いて URL を確認。`https://drive.google.com/drive/folders/XXXXXXXX` の **XXXXXXXX 部分がフォルダ ID**。コピーしておく。

## 2. GAS プロジェクト作成
1. https://script.google.com を開く → 新しいプロジェクト
2. プロジェクト名「AI Journal」に変更
3. デフォルトの `Code.gs` を全消し → `Code.gs` の内容を貼り付け
4. 以下を書き換え:
   - `JOURNAL_FOLDER_ID` … 上記でコピーしたフォルダ ID
   - `SHARED_TOKEN` … ランダム文字列を生成して入れる（例: 1Password の Generate Password で32文字英数字）

## 3. マニフェスト編集
1. プロジェクトの歯車アイコン → 「『appsscript.json』マニフェスト ファイルを表示する」をオン
2. エディタに `appsscript.json` が現れる → このリポジトリの `appsscript.json` の内容で置き換え

## 4. テスト実行
1. 関数選択で `testAppend` → 実行 → 初回は権限承認画面が出るので承認
2. Drive の「日記」フォルダに `日記_2026-05` が作成され、テストエントリが追記されているか確認
3. 実行ログにストリーク値が出ているか確認

## 5. Web App としてデプロイ
1. 右上「デプロイ」→「新しいデプロイ」
2. 種類: 「ウェブアプリ」
3. 説明: 「v1」
4. 次のユーザーとして実行: 「自分」
5. アクセスできるユーザー: 「自分のみ」
6. デプロイ → URL をコピー（`https://script.google.com/macros/s/.../exec` 形式）
7. この URL を iPhone ショートカット側で使う

## 6. NotebookLM 設定
1. https://notebooklm.google.com を開く → 新規ノート → タイトル「日記」
2. ソースの追加はまだしない（最初のエントリが入って `日記_2026-05` が生成されてから手動で追加する）
3. ノートの URL をブックマーク

## 更新時の再デプロイ
コードを修正したら「デプロイ」→「デプロイを管理」→ 鉛筆アイコン → バージョン「新しいバージョン」→ デプロイ。**URLは変わらない**ので、ショートカット側の修正は不要。
