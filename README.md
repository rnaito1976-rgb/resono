# Resono

世界観で共鳴するバンドメンバーと出会うサービスのUIプロトタイプ。

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase

## Getting Started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

### 1. プロジェクト作成

1. [https://supabase.com](https://supabase.com) でプロジェクトを作成
2. **Project Settings → API** から以下をコピー:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`（seed 用・秘密）

### 2. テーブル作成

Supabase Dashboard → **SQL Editor** で以下を順番に実行:

1. `supabase/migrations/001_create_members.sql`
2. `supabase/migrations/002_allow_member_updates.sql`（プロフィール編集用）

### 3. 環境変数

`.env.local` を作成:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. ダミーデータ投入

```bash
npm run seed
```

20人分のメンバーデータが Supabase に upsert されます。

### 5. Vercel デプロイ時

Vercel Dashboard → **Settings → Environment Variables** に上記3つを追加（`SUPABASE_SERVICE_ROLE_KEY` は seed 時のみローカルで使用可）。

## Features

- **トップ画面**: 人物カードを縦スクロールで表示（Supabase / フォールバック20人）
- **詳細画面**: 横スワイプで5ページ切り替え（Portrait / Music / Fashion / Mood / Looking For）
- **プロフィール編集**: 詳細画面右上の鉛筆アイコン → 編集 → Supabase に保存
- **共鳴する**: localStorage で状態管理（今後 Supabase 連携予定）

## Design

- 390px幅基準のスマホファースト
- 黒背景・大きな余白・ミニマルデザイン
- Apple × Spotify 的なタイポグラフィ

## Data Flow

```
Supabase (members テーブル)
    ↓
src/lib/members.ts
    ↓
トップ / 詳細ページ

※ 環境変数未設定 or DB 空の場合 → src/data/members.ts にフォールバック
```
