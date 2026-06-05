# Vercelで共有URLを作る手順

## GitHub連携で公開する方法

GitHubリポジトリ:

https://github.com/mrtakae-coder/caries-risk-report-app

Vercelインポート用リンク:

https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmrtakae-coder%2Fcaries-risk-report-app&project-name=caries-risk-report-app&root-directory=web

1. [Vercel](https://vercel.com/) にログインします。
2. `Add New...` → `Project` を選びます。
3. GitHubリポジトリ `caries-risk-report-app` を選びます。
4. `Root Directory` を `web` に設定します。
5. Framework Preset は `Other` または自動判定のままで公開します。
6. Deploy が完了すると、共有URLが発行されます。

今後デザインや文言を変更したら、GitHubへpushするとVercel側も更新されます。

## zipで手動公開する方法

1. `caries-risk-report-vercel-site.zip` を解凍します。
2. [Vercel](https://vercel.com/) にログインします。
3. Vercelの新規プロジェクト作成画面で、解凍した `vercel-site` フォルダをアップロードします。
4. Framework Preset は `Other` または静的サイトとして公開します。
5. Deploy が完了すると、共有URLが発行されます。

## CLIで公開する方法

Vercel CLIにログイン済みの場合:

```bash
cd "/Users/isatsutakayuki/Documents/サリバ/vercel-site"
vercel --prod
```

`vercel` コマンドがない場合:

```bash
npm install -g vercel
cd "/Users/isatsutakayuki/Documents/サリバ/vercel-site"
vercel login
vercel --prod
```

## 注意

- `http://localhost:3000` は自分のMac専用のURLです。別の人に共有しても開けません。
- Vercelで発行された `https://...vercel.app` のURLを共有してください。
- 公開されるのは `vercel-site` フォルダ内の静的Webアプリです。
