# みらいシネマ ローカル確認版

このPCでは `web/.env.local` によりテスト用Google Sheetsへ接続済みです。感想の実保存・重複防止を確認しました。画面上部にテスト保存の案内を表示します。本番シートには接続していません。

PowerShellで以下を実行します。

```powershell
cd "C:\work\チームみらい\みらいシネマ\web"
npm.cmd install
npm.cmd run dev
```

開くURLは http://127.0.0.1:3000 です。同じPC内だけからアクセスできます。停止は起動したターミナルで Ctrl+C。

```powershell
npm.cmd test
npm.cmd run build
npm.cmd start
```

`build` と `dev` は同時に実行しないでください。共通の `.next` を使用します。

既定の `DATA_SOURCE=demo` はローカルの2作品を表示します。指定済みの実Drive動画を使用しますが、一覧シートと感想保存には接続しません。デモの送信ボタンは未保存を表示し、完了画面は別のプレビューボタンで確認できます。

実接続は `../apps-script/README.md` に従い、必ずテスト専用シートで確認します。Vercel Productionは `DATA_SOURCE=sheets` を必須とし、demoへ自動的に切り替えません。

デモ用の自動確認は、`DATA_SOURCE=demo` のサーバーに対してルートから `node tests/browser-check.cjs`、`node tests/api-check.mjs` を実行します。実シート接続中にはデモ期待値と一致しません。ブラウザ検証はPlaywrightが必要です。別PCでは `PLAYWRIGHT_MODULE` 環境変数にPlaywrightモジュールの場所を指定してください。
