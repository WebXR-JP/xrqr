# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## このプロジェクトについて

Quest のテキスト入力困難問題を解決するため、PC/スマホで生成したQRコードをQuest のパススルーカメラで読み取り、クリップボードに同期するWebアプリケーション。4桁数字による暗号化でセキュリティを確保し、非秘匿情報は履歴として保存。

## 開発コマンド

```bash
# セットアップ
npm install                                    # 依存関係インストール

# 開発
npm run dev                                        # 開発サーバー起動（https://lo.topot.al）
npm run build                                     # プロダクションビルド
npm run preview                                   # ビルド結果のプレビュー

# 注意: npm run test と npm run lint は現在利用不可
```

## コーディングプラクティス

### 前提
- いっぺんに修正をはじめず、段階を踏んで小さく修正をお願いします。
- 元のコードをリファクタリングする場合は確認をとってください。
- 元々書かれていたコメントなどはなるべく残してください。
- コードを編集する前に必ずそのテストをまず書いてください。
- npm run dev と npm run build のコマンドは許可します。コードを修正した場合は、npm run build でビルドを実行してください。
- ビルドが通らない場合は、コードを修正してください。
- ビルドが二度失敗した場合は、ユーザーに確認してください。

## 使用技術
- Vite
- TypeScript
- React
- CSS Modules
- react-three-fiber

### コードを書く前の準備

- README.md を熟読して準備ができていなければユーザーに確認してください

### コーディング時の注意点

- インポート文だけを追加して保存すると、lintによって不要なインポートとして削除されることがあります。インポートを追加する場合は、そのインポートを使用するコードも同時に追加してください。

### パスエイリアス

- src/ディレクトリには `~` エイリアスが設定されています
- 相対パス（../）は使用せず、必ず `~` エイリアスを使用してください
- 例:
  ```typescript
  // ❌ 相対パス（使用禁止）
  import { Component } from '../../components/Component'
  import { useHook } from '../../../hooks/useHook'
  
  // ✅ エイリアス（推奨）
  import { Component } from '~/components/Component'
  import { useHook } from '~/hooks/useHook'
  ```

## コンポーネント階層ルール

### 基本方針：Colocation重視
このプロジェクトでは **Colocation（関連するファイルの近接配置）** を重視したディレクトリ構成を採用しています。コンポーネント、スタイル、hooks、テスト、関連するすべてのファイルを可能な限り同じディレクトリに配置することで、開発効率とメンテナンス性を向上させています。

### 基本構造
- **src/components/**: アプリケーション全体で共通使用する汎用コンポーネント
- **src/screens/**: 画面単位のコンポーネント（1階層目は画面レベル）

### 階層の分割原則
1. **責務による分割**: 独立した責務を持つ部分は子コンポーネントとして切り出す
2. **階層の深さ制限なし**: 責務が明確に分離できる限り、何階層でも深くネストすることを許可
3. **アトミックデザインは採用しない**: Atoms/Molecules/Organisms といった分類は使用しない

### 分割の判断基準
- **行数**: 200行を超えそうになったら分割を検討
- **責務の独立性**: リストのアイテムコンポーネントなど、行数が短くても独立した責務があれば切り出す
- **再利用性**: 同じ処理が複数箇所で必要になる場合

### 子コンポーネントの配置
- 親コンポーネントのディレクトリ内に `components/` ディレクトリを作成
- さらに子が必要な場合も同様に `components/` ディレクトリを作成し、無限にネスト可能
- 例: `ParentComponent/components/ChildComponent/components/GrandChildComponent/`

### 配置の判断基準
- **src/components/**: 複数画面で再利用される、または再利用の可能性があるコンポーネント
- **src/screens/[ScreenName]/components/**: その画面でのみ使用される専用コンポーネント

### ファイル構成ルール

#### コンポーネントディレクトリ構造
各コンポーネントは **独自のディレクトリを持つ** 構成を採用します：

```
ComponentName/
├── index.tsx           # メインコンポーネントファイル（必須）
├── styles.module.css   # CSS Modules スタイルファイル
├── hooks.ts           # コンポーネント専用hooks（必要に応じて）
├── utils.ts           # React に依存しない純粋な関数（必要に応じて）
└── __tests__/         # テストファイル格納（必要に応じて）
```

#### ファイル命名規則
- **index.tsx**: メインとなるコンポーネントファイル（必須）
- **styles.module.css**: CSS Modules を使用したスタイルファイル
- **hooks.ts**: hooks が肥大化した場合に同階層に切り出し
- **utils.ts**: React に依存しない純粋な関数を切り出し（テストしやすくするため）
- **__tests__/**: そのコンポーネントに関するテストファイルを格納

#### 重要なポイント
- 各コンポーネントは独自のディレクトリを持ち、関連ファイルを全て同一ディレクトリに配置
- `index.tsx` をエントリーポイントとして使用し、ディレクトリ名でコンポーネントを識別
- CSS は `styles.module.css` に統一し、CSS Modules として import

### 命名規則
- コンポーネント名の末尾にUIの種類を表す接尾辞を付ける
- 例: Card, Button, View, Screen, Row, Table, Header, Footer など
- 目的: 変数名の競合回避、UIコンポーネントとInterface/型定義の区別を明確化
