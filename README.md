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
3. `supabase/migrations/003_create_member_photos_bucket.sql`（写真アップロード用）

### 3. 環境変数

`.env.local` を作成:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 未読バッジのメール通知（Resend）
RESEND_API_KEY=re_...
EMAIL_FROM=Resono <onboarding@resend.dev>
```

### 4. ダミーデータ投入

```bash
npm run seed
```

20人分のメンバーデータが Supabase に upsert されます。

### 5. Vercel デプロイ時

Vercel Dashboard → **Settings → Environment Variables** に上記を追加。

- `SUPABASE_SERVICE_ROLE_KEY` … seed 用に加え、未読バッジのメール通知（登録メールアドレスの取得）にも必要
- `RESEND_API_KEY` / `EMAIL_FROM` … 未設定の場合はメール通知はスキップ（アプリ自体は動作）

## Features

- **トップ画面**: 人物カードを縦スクロールで表示（Supabase / フォールバック20人）
- **詳細画面**: 横スワイプで5ページ切り替え（Portrait / Music / Fashion / Mood / Looking For）
- **プロフィール編集**: 詳細画面右上の鉛筆アイコン → 編集 → Supabase に保存
- **認証**: Welcome / 新規登録 / ログイン / オンボーディング
- **共鳴する**: localStorage で状態管理（今後 Supabase 連携予定）

## Auth Setup

### Supabase Dashboard

1. **Authentication → Providers → Email** を有効化
2. **Authentication → Providers → Google** を有効化（Google Cloud OAuth クライアント ID / Secret）
3. **Authentication → URL Configuration** に以下を追加:
   - Site URL: `http://localhost:3000`（本番は Vercel URL）
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://resono-fwdi.vercel.app/auth/callback`
     - プレビュー URL を使う場合は `https://*.vercel.app/auth/callback` も追加
4. **メール確認 / 送信上限**（開発・本番）:
   - Supabase 標準メールは **1時間あたり数通** の上限があります。テスト中に「送信上限」が出た場合は **Google ログイン** を使うか、1時間ほど待ってください。
   - 開発中にメール確認を省略する: **Authentication → Providers → Email → Confirm email** を OFF
   - 本番で上限を緩和する: **Authentication → SMTP Settings** で Resend 等の SMTP を設定（`RESEND_API_KEY` 利用可。Host: `smtp.resend.com`, Port: `465`, User: `resend`, Password: API key）
5. 開発用: 確認メールが届かない既存ユーザーを手動確認する場合:

```bash
npm run auth:confirm -- user@example.com
```

（`SUPABASE_SERVICE_ROLE_KEY` が必要）

### 画面

| URL | 内容 |
|-----|------|
| `/welcome` | Welcome |
| `/signup` | 新規登録 → `/onboarding` |
| `/login` | ログイン → `/` |
| `/onboarding` | 登録後オンボーディング |


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
