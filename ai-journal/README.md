# シームレスAIジャーナリング

音声入力した日記を NotebookLM で客観的にフィードバックしてもらい、年・月単位で振り返るための仕組み。三日坊主にならない設計と、NotebookLM のソース上限（無料100/Plus 300）に当たらない月次集約方式を採用。

## 全体像

```
平日: iPhoneショートカット (Hey Siri, 日記) → ディクテーション
週末: Gemini Live「ジャーナリングコーチ」Gem → 深掘り対話
                    ↓ どちらも
        GAS Web App (doPost)
                    ↓
        Google Drive「日記」フォルダの
        「日記_YYYY-MM」Google Docs に
        日付見出し付きで先頭追記
                    ↓
        NotebookLM「日記」ノート1つに
        月次Docsを自動同期
                    ↓
        週末/月末: 保存済みプロンプトで
        客観フィードバック + Audio Overview
```

**1ノート = 全期間**。月次Docs1ファイルは平均15,000語程度しか使わない（上限50万語）。100ソース上限でも8年以上、Plus 300なら25年以上 1 ノートで持つ。

## クイックスタート (約60分)

| Phase | やること | 所要 |
|---|---|---|
| A | Google Drive フォルダ作成 + GAS デプロイ + NotebookLM ノート作成 | 30分 |
| B | iPhone ショートカット 2 本 + オートメーション設定 | 20分 |
| C | Gemini「ジャーナリングコーチ」Gem 作成 | 10分 |

詳細は各サブディレクトリの `setup.md` を順に参照。

## 構成ファイル

| ファイル | 役割 |
|---|---|
| [gas/Code.gs](gas/Code.gs) | GAS Web App 本体（音声テキスト受信→月次Docs追記、ストリーク計算） |
| [gas/appsscript.json](gas/appsscript.json) | GAS マニフェスト |
| [shortcut/setup.md](shortcut/setup.md) | iPhone ショートカット2本（平日用 + Gem連携用）作成手順 |
| [gem/system-prompt.md](gem/system-prompt.md) | 「ジャーナリングコーチ」Gem システムプロンプト |
| [gem/setup.md](gem/setup.md) | Gem 作成手順 |
| [notebooklm/prompts.md](notebooklm/prompts.md) | 週次/月次/年次レビュー用保存プロンプト集 |
| [notebooklm/operations.md](notebooklm/operations.md) | 月初/週末/月末の運用フロー |

## 三日坊主対策の核

1. **摩擦ゼロ**: "Hey Siri, 日記" 1コマンド、確認画面1つ
2. **空欄恐怖の解消**: 曜日別の質問プロンプトを音声で投げる
3. **ストリーク + 報酬**: 7日連続で Audio Overview、30日で月次レポート
4. **失敗許容**: 「記録なし」ボタンでソフトストリーク継続
5. **書く→読まれるループ**: 日曜と月末のフィードバックリマインダー
