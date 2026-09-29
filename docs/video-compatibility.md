# 温泉編のiOS互換性対応（2026-09-29）

iPhone/iPadでは温泉編のみメタデータを読み込めず、PCでは両作品が再生できるとの報告を受けて調査しました。

温泉編はH.264 High、720×1280、約24fps、AAC-LCですが、SPSには level_idc=62（Level 6.2）、num_units_in_tick=1、time_scale=2000000 が記録されていました。正常に再生できた子育て編はLevel 4.0です。この過大な能力・タイミング宣言を互換性問題の有力原因と判断しました。実機での原因確定は未了です。

配信コピーだけをFFmpeg 7.1のビットストリームフィルターでLevel 4.0、tick_rate=48へ修正しました。MP4内のサンプル時刻は維持し、映像・音声ともstream copyを使用しています。元の完成版とDrive原本は変更していません。キャッシュを避けるため配信ファイル名を変更しました。

```powershell
ffmpeg -i mobility-onsen.mp4 -map 0:v:0 -map 0:a:0 -c copy -bsf:v h264_metadata=level=40:tick_rate=48 -movflags +faststart mobility-onsen-web-v2.mp4
```

検証：両ファイルを全編デコードし、映像・音声を同時に `-fps_mode passthrough -f framemd5` へ出力。時刻・サンプルサイズ・各フレーム/音声ハッシュを含む出力全体のSHA-256がともに `ca6b5731003079c184495c72e46d14c9941aff9874a2d627476b5a90db1e3176` で一致しました。映像1105フレーム、音声、タイミングを保持し、再生成・再編集・再圧縮はしていません。

参考：[FFmpegのh264_metadata](https://ffmpeg.org/ffmpeg-bitstream-filters.html#h264_005fmetadata)、[AppleのSafari動画配信ガイド](https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari)。

iPhone/iPad実機での再生確認はユーザーによる確認待ちです。ブラウザの表示だけで実機再生の成功とは扱いません。
