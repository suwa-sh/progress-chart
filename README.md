# progress-chart

## 概要

- バーンダウンチャート、バーンアップチャートを描画します。
- GitHub issue などの ITS のデータを同期して、チャートを更新します。
- 作成したチャートを Slack などのチャットサービスに自動投稿します。
- 毎朝 09:00 に 同期 > チャート更新 > チャット投稿 など、定期実行できます。

## イメージ

- GitHub issue
![GitHub issue](docs/images/GitHub_issue.png)
- Slack
![Slack](docs/images/Slack.png)


## 実行環境

- Google Sheets

## 対応サービス

### ITS

- Google Sheets での手動管理
- GitHub issue
- GitLab issue ※未実装
- PivotalTracker ※未実装
- Asana ※未実装

### チャット

- Slack

## 利用方法

1. [スプレッドシートの最新バージョン](https://drive.google.com/drive/u/0/folders/16Ai4B_YIXrDRHjoPcNekkknA3mLU-sN7) をマイドライブにコピー
2. settingsシートを記入
    - chartの描画期間（スプリント や クォーター など）
    - ITS情報（api token や リポジトリ など）
    - チャット情報（bot token や チャンネル など）
3. 【progress-chart】メニュー > Bulk
