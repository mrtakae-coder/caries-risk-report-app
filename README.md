# 唾液検査結果レポート作成アプリ

歯科医院スタッフがカリエスリスク表の数値を入力すると、患者さん向けのやさしい唾液検査結果レポートを自動生成するWebアプリです。

## 主な機能

- 患者情報とカリエスリスク表スコアの入力
- 紙のカリエスリスク表に合わせた9項目の数値入力
- 数値スコアに応じた低・中・高リスク判定
- 患者さん向けのやさしいコメントとケア提案の自動生成
- アバンダンスデンタル名古屋のロゴ入りA4 1枚レポート
- 「印刷する」「PDF保存」ボタンによるA4 1枚レポート出力
- 印刷時は入力フォームと操作ボタンを非表示

## ケア提案の参照情報

「今日からできるケア」は、厚生労働省 e-ヘルスネットおよび4学会合同提言を参考に、患者年齢と検査結果に応じて文言を出し分けています。

- 厚生労働省 e-ヘルスネット「フッ化物配合歯磨剤」
- 厚生労働省 e-ヘルスネット「フッ化物洗口」
- 厚生労働省 e-ヘルスネット「歯間部清掃（デンタルフロス・歯間ブラシ）」
- 厚生労働省 e-ヘルスネット「歯・口の機能」「口腔機能の健康への影響」
- 日本口腔衛生学会・日本小児歯科学会・日本歯科保存学会・日本老年歯科医学会「4学会合同のフッ化物配合歯磨剤の推奨される利用方法」

## セットアップ

すぐに画面を確認したい場合は、ビルド不要のWebアプリ版を起動します。

```bash
npm run web
```

起動後、ブラウザで以下を開きます。

```text
http://localhost:3000
```

入力スコアは、紙の表と同じく `0` が低リスク側、数字が大きいほど注意したいポイントとして扱います。現在のMVPでは、0を低、1を中、2以上を高として患者説明用に変換しています。

Next.js版を開発する場合は以下を使います。

推奨Node.jsバージョンは20または22です。Node.js 24環境で `npm run dev` が起動しきらない場合は、Node.js 22へ切り替えてください。

```bash
npm install
npm run dev
```

起動後、ブラウザで以下を開きます。

```text
http://localhost:3000
```

## ビルド確認

```bash
npm run build
```

## ファイル構成

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    PatientForm.tsx
    ResultReport.tsx
    RiskCard.tsx
    ResultChart.tsx
    ui/
      button.tsx
      card.tsx
      input.tsx
      label.tsx
      select.tsx
  lib/
    commentGenerator.ts
    riskLogic.ts
    utils.ts
  types/
    saliva.ts
public/
  abundance-logo.png
web/
  assets/
    abundance-logo.png
  index.html
  styles.css
  app.js
local-server.mjs
```

## 注意

このアプリのコメントやリスク判定は、患者説明の補助として使う簡易ロジックです。医学的な診断を断定するものではありません。実際の説明では、症状、口腔内所見、生活習慣、歯科医師・歯科衛生士の判断と合わせてご利用ください。
