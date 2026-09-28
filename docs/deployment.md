# 公開環境の設定

GitHub: https://github.com/itc-ri/mirai-cinema （既存の公開リポジトリを使用し、元のREADME・LICENSE・資料を保持）

公開サイト: https://mirai-cinema.vercel.app

Vercelプロジェクト: `mochimatsus-projects-a5b61bc8/mirai-cinema`。GitHubのmainブランチと連携しています。

本番接続先は `../apps-script/production-connection.json`、テスト用接続先は `../apps-script/test-connection.json` に記録。秘密キーはどちらのJSONにも含みません。

2026-09-29：Vercel Previewからテスト用Feedbackシートへの保存と、同じ受付IDの再送で `already_recorded` を確認。本番のMovies読取も成功。本番Feedbackにはテスト感想を入れていません。

GitHubリポジトリにはサイト実装、Apps Scriptの秘密値を含まないソース、テストと運用手順を登録します。動画制作ファイル、認証情報、環境変数ファイルは含めません。

VercelのフレームワークはNext.js、Root Directoryは `web`、Install Commandは `npm ci`、Build Commandは `npm run build` です。

| 変数 | Production | Preview |
|---|---|---|
| DATA_SOURCE | sheets | sheets |
| SHEETS_ENVIRONMENT | production | test |
| APP_VERSION | 0.1.0 | 0.1.0 |
| GAS_WEB_APP_URL | 本番用GAS /exec URL | テスト用GAS /exec URL |
| API_SHARED_SECRET | 本番用秘密キー（Sensitive） | テスト用秘密キー（Sensitive） |

秘密キーはサーバー専用です。`NEXT_PUBLIC_` を付けず、GitHubやブラウザに出しません。Previewと本番のシート・GAS・キーを分けます。公開APIへの接続にはVercel側の環境変数設定が必要です。

公開URLと保存先、検証結果は `implementation-status.md` に記録します。実保存のテストはPreviewのテストシートで行い、本番データには混ぜません。
