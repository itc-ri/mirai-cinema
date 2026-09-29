# テスト接続の準備

本番公開用の独立したシート2つとApps Scriptも作成済みです。接続先は `production-connection.json`、公開構成は `../docs/deployment.md` を参照してください。本番とテストはシート・スクリプト・秘密キーすべて別です。

2026-09-29：ユーザー承認のもと、テスト用2シートとApps Scriptウェブアプリを作成し、ローカルフォームからの実保存と重複防止を確認しました。接続先IDとURLは `test-connection.json` に記録しています。シートは非公開です。APIはGoogleログイン不要の入口ですが、サーバー専用秘密キーで認証します。

現在の環境は設定済みです。以下は別のテスト環境を新規構築する場合の手順です。`scripts/prepare-test-gas.mjs` は秘密値入りの初期設定コードを `.private/` に生成するため、再実行は再設定が必要な場合に限定してください。初期設定後はリモートのInitialize.gsを空の説明コメントに戻してからバージョン作成します。

1. Googleでテスト用の独立したスプレッドシートを2つ作成。公開・匿名共有はしないでください。
2. 作品側に `Movies` タブ、感想側に `Feedback` タブを作り、各 `.gs` の `MOVIE_HEADERS` / `FEEDBACK_HEADERS` と同じヘッダーを1行目に設定します。列順は自由です。published はチェックボックスにします。
3. `src/` のすべての `.gs` とマニフェストを新しいテスト用Apps Scriptに登録します。Script Properties に `CATALOG_SPREADSHEET_ID`、`FEEDBACK_SPREADSHEET_ID`、`API_SHARED_SECRET`、`APP_VERSION=0.1.0`、`SHEETS_ENVIRONMENT=test` を設定します。秘密値は暗号学的乱数で生成し、コードやURLに入れません。
4. テスト作品の動画IDと実測秒数を設定してから published をTRUEにします。初期IDは `mobility-onsen` と `family-robots`、表示順は10と20です。公開用動画の指定がない間はFALSEにしてください。
5. Google認証後、デプロイ者として実行するウェブアプリを作成します。サーバーから呼べるアクセス設定が必要です。組織の制約で匿名呼び出しができない場合は構成の再検討が必要です。
6. `web/.env.example` を `.env.local` にコピーし、`DATA_SOURCE=sheets`、テスト用 `/exec` URL、同じ秘密値を設定して再起動します。ローカルとVercel Previewは双方の `SHEETS_ENVIRONMENT=test` が一致しないと保存を拒否します。
7. テスト用の本文1件を送り、Feedbackで受付ID・作品・本文・1行だけであることを確認。同じID再送、数式風文字列、絵文字200文字、応答紛失後の再送を確認してください。実保存未確認を成功扱いしないでください。

本番は別スクリプト・別シート・別の秘密値を使用し、両側の環境をproductionにします。環境フラグは設定ミスの検出用であり、シートIDが本当にテスト用かは設定時の確認が必要です。

`Plays.gs` は作品管理ブックに `Plays` タブを初回再生時に作成し、再生ID・開始日時・作品IDを保存します。`recordPlay` は排他ロックと再生IDで再送を重複排除します。`getCatalog` が集計値を返します。導入以前のDrive視聴は含みません。個人情報・IPは保存しません。簡易カウンターであり、視聴人数や不正アクセスを除外した分析指標ではありません。

ContentServiceのJSON応答はリダイレクトを追従し、保存はScriptLockで排他します。
参考：[Content Service](https://developers.google.com/apps-script/guides/content)、[LockService](https://developers.google.com/apps-script/reference/lock/lock-service)。
