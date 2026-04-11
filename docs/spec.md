# bloomine — 技術仕様書

**バージョン:** v6.0
**最終更新:** 2026年4月11日
**ステータス:** Phase 0〜6 完了・本番稼働中 / Phase 7 設計中
**ドメイン:** https://bloomines.com

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システムアーキテクチャ](#2-システムアーキテクチャ)
3. [機能要件](#3-機能要件)
4. [データモデル](#4-データモデル-supabase)
5. [AIプロンプト設計](#5-aiプロンプト設計)
6. [サブスクリプション設計](#6-サブスクリプション設計)
7. [デザイン＆UX指針](#7-デザインux指針)
8. [アニメーション仕様](#8-アニメーション仕様)
9. [非機能要件](#9-非機能要件)
10. [ファイル構成](#10-ファイル構成)
11. [開発チェックリスト](#11-開発チェックリスト)
12. [メモ・決定事項ログ](#12-メモ決定事項ログ)

---

## 1. プロジェクト概要

> 「やりたいこと」がなくてもいい。夜の独り言から、ユーザーの「OS（性質）」を再発見し、自己受容を届ける。

### 核心的価値

職業ラベルによるステレオタイプを排除し、生の「事象」と「感情」からその人固有の強みを特定する。

### 開発制約

| 項目       | 制約          | 備考                               |
| ---------- | ------------- | ---------------------------------- |
| 開発時間   | 週16時間      | 持続可能なペースを優先             |
| 運用コスト | 月¥10,000以内 | Supabase Free + Gemini API費用含む |

---

## 2. システムアーキテクチャ

```
ブラウザ (Next.js App Router)
  ├─ Web Speech API（音声→テキスト）
  ├─ Web Audio API（マイク音量取得・アニメーション連動）
  └─ Framer Motion（植物成長アニメーション）
       ↕ HTTP / Route Handlers
Next.js Route Handlers (API層)
       ↕ SDK
  ├─ Supabase (PostgreSQL + Auth)
  ├─ Gemini 2.5 Flash (AI Engine)
  └─ Stripe (決済・サブスクリプション)
```

### 技術スタック

| レイヤー    | 技術                      | 役割                                        |
| ----------- | ------------------------- | ------------------------------------------- |
| Frontend    | `Next.js 16 (App Router)` | UI・ルーティング・音声入力                  |
| Backend     | `Next.js Route Handlers`  | APIエンドポイント・AIプロキシ               |
| Database    | `Supabase (PostgreSQL)`   | ログ・ユーザーデータ永続化                  |
| Auth        | `Supabase Auth`           | email + password 認証。Cookie セッション管理 |
| AI Engine   | `Gemini 2.5 Flash`        | 傾聴・分析・命名（名前呼びかけ対応）        |
| STT         | `Web Speech API`          | ブラウザ標準音声テキスト化（Chrome専用）    |
| Animation   | `Framer Motion`           | 植物ステージ間トランジション・音量連動グロー |
| 決済        | `Stripe`                  | サブスクリプション管理（月額・年額）        |
| デプロイ    | `Vercel`                  | GitHub連携・自動デプロイ                    |

> **Web Speech API の制約:** Chrome 最新版のみ対応。Safari/Firefox はテキスト入力（「かく」ボタン）にフォールバック。

---

## 3. 機能要件

### 3.1 ログ記録フロー ✅

| 機能                 | 説明                                                                          | 状態 |
| -------------------- | ----------------------------------------------------------------------------- | ---- |
| 感情チェックイン     | 1〜10点のスコアを選択（44px タッチターゲット確保）                            | 完了 |
| 問いかけ選択         | 話す・書くボタン押下時に4択の問いを表示（強み系・価値観系・感情系各1問＋自由記述）。選ばれた問いをプロンプト欄に反映 | 完了 |
| 音声入力             | マイクボタンで録音開始。録音中は停止アイコンに切り替わり、土部分が音量に連動して発光 | 完了 |
| テキスト入力         | 「かく」ボタンでモーダル入力。電車内など声が出せない場面でも記録可能          | 完了 |
| 複数ログ対応         | 同日2回目以降のログ記録時は選択ポップアップを表示（追加 / 更新 / キャンセル）  | 完了 |
| 案内人の応答         | 属性ラベルを剥がし、事象・感情にフォーカス。全肯定トーンで1つだけ問いを投げる  | 完了 |
| 名前呼びかけ         | display_name をプロフィールから取得し、挨拶文と AI プロンプトに反映           | 完了 |
| 永続化               | 発言・スコア・AI返答・prompt_id をDBへ保存。week_number はタイムゾーン対応で算出 | 完了 |
| 進捗ランプ           | 3つのランプで今サイクルの記録数を表示。分析後リセット                         | 完了 |

**グリーティングメッセージ（問いかけ前）:**
ログ記録前に以下のいずれかをランダムで表示：
- 「今夜もここに来てくれましたね。」
- 「また会えましたね。」
- 「お帰りなさい。」

### 3.2 花が咲くフェーズ（3日サイクル）✅

> **蓄積の原則:** 3日間の未分析ログをGeminiへ投入し「強みの断片」(動詞)を抽出。分析は24時間に1回。結果は花として蓄積され、サイクルを重ねるごとにレベルが上がる。

**アウトプット構成：**

1. **強みの花の名称** — 独創的な二つ名の命名（動詞として命名）
2. **生存戦略（OS）** — 性質を深く肯定する解説
3. **逆照射** — 過去の苦しみを「強みの裏返し」として再定義
4. **輝ける土壌** — その性質が活きる環境条件の提示
5. **根っこ（root_elements）** — 各ログとの紐付け（ログごとに固有の要約文）

**レベル計算式:**

```
levelGain = Math.ceil(Math.sqrt(rootEntries.length))
// 根拠1本 → +1, 2〜3本 → +2, 4〜8本 → +3
新規作成: level = levelGain
既存更新: level = current.level + levelGain
```

**分析の柔軟性：**

- 1ログから複数の断片を抽出可能
- 複数ログで同じ性質が見られれば統合し、各ログ固有の root 文を生成
- 無理に件数を増やさない（明確に見えた性質だけ出力）

### 3.3 宝物を見つけるフェーズ（3日サイクル）✅

> **蓄積の原則:** 3日間の未分析ログをGeminiへ投入し「宝の断片」(名詞)を抽出。分析は24時間に1回。結果は宝物として蓄積され、サイクルを重ねるごとにレベルが上がる。

**アウトプット構成：**

1. **価値観の名称** — 独創的な二つ名の命名（名詞として命名）
2. **宝物の解説** — ユーザーが大切にしている価値観
3. **キーワード** — ログから抽出された宝の断片
4. **✦ さらに光輝かせるために** — 価値観が満たされているときの状態（ACT療法の充足感イメージ）
5. **⚠ 宝を失わないために** — 価値観が脅かされているときのサイン
6. **発掘場所** — 各ログとの紐付け（ログごとに固有の要約文）

**レベル計算式:** 強みと同様（`Math.ceil(Math.sqrt(siteEntries.length))`）

### 3.4 OS命名（タネ）✅

7日間ごとにGeminiがユーザーの根底にある性質（OS）に名前をつける。

**アウトプット構成（seeds_collection に保存）：**

1. **seed_name** — 詩的な二つ名（例：「夜の思考者」）
2. **os_description** — その性質の肯定的な解説
3. **logic_reflection** — 過去の苦しみを強みとして再定義した文
4. **environment_condition** — その性質が最も輝く環境

### 3.5 強みの庭 ✅

- **花カード一覧:** 蓄積された花をレベル順に表示
- **カード展開:** クリックで OS・逆照射・土壌・根っこ一覧を表示
- **根っこクリック:** 根拠となるログ原文（transcript）を逆引き
- **アクセス制御:** 有料ユーザー・管理者・無料トライアル期間中のみ閲覧可能

### 3.6 価値観の宝庫 ✅

- **価値観カード一覧:** 蓄積された価値観をレベル順に表示
- **カード展開:** クリックで宝物の解説・キーワード・さらに光輝かせるために・宝を失わないために・発掘場所一覧を表示
- **発掘場所クリック:** 根拠となるログ原文（transcript）を逆引き
- **アクセス制御:** 有料ユーザー・管理者・無料トライアル期間中のみ閲覧可能

### 3.7 新規登録者通知 ✅

新規ユーザーが登録した際、裏側で `bloomine.support@gmail.com` に通知メールを送信する。
- メール内容: ユーザーID・メールアドレス・登録日時
- 送信タイミング: `/auth/callback` (メール確認ありの場合) または `/login` の登録成功時
- 実装: Resend APIを使用（既存のお問い合わせ機能と同じ仕組み）
- ユーザー側の操作には一切影響しない

### 3.8 カレンダー機能 ✅

- 月ごとのログ記録日をカレンダー形式で表示
- 記録のある日は緑ドットで表示、クリックでその日のログ一覧を展開
- 月ごとのデータをキャッシュ（TTL: 60秒）してAPI呼び出しを削減

### 3.9 レポートページ（Phase 7 設計中）

強みの庭・価値観の宝庫とは別の独立したページ（`/report`）として実装予定。

**構成（実装順）:**

1. **価値観ピラミッド** — レベル上位5件の価値観をピラミッド型で可視化。ピラミッドの頂点が最上位。
2. **週次カード** — `seeds_collection` の履歴を週ごとにカード表示。過去のOS（タネ）を振り返られる。
3. **強みレーダーチャート** — VIA 6徳目（知恵/勇気/人間性/公正/節制/超越）を軸に、どのカテゴリに強みが集中しているかを表示。AIが各強みをカテゴリに分類する処理が必要。

**アクセス制御:** 強みの庭・価値観の宝庫と同様（`hasAccessWithFreeTrial`）。

### 3.11 認証・アカウント管理 ✅

| 機能           | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| 新規登録       | display_name + email + password。登録と同時に user_profiles を upsert |
| ログイン       | email + password。エラーは日本語メッセージで表示             |
| セッション管理 | Supabase Cookie ベース（リフレッシュトークン60日）           |
| ログアウト     | 設定ページから確認ダイアログ付きでログアウト。localStorage（オンボーディングフラグ）もクリア |
| メール確認     | ON の場合は auth/callback で user_profiles を upsert         |

### 3.12 設定ページ ✅

| 機能                 | 説明                                                    |
| -------------------- | ------------------------------------------------------- |
| 呼ばれたい名前の変更 | user_profiles.display_name を更新                       |
| メールアドレス変更   | Supabase Auth 経由で更新                                |
| パスワード変更       | 現在のパスワードで再認証後に変更。表示/非表示トグル付き |
| お問い合わせフォーム | カテゴリ（不具合報告/機能要望/その他）+ 件名 + 本文。contact_messages テーブルに保存 |
| プランを確認する     | 有料ユーザーには「解約する」ボタン（警告色）を表示。無料ユーザーには表示しない |
| ログアウト           | 確認ポップアップ表示後にサインアウト → /login へリダイレクト |

### 3.13 サブスクリプション（プラン・お支払い）✅

| 機能                 | 説明                                                          |
| -------------------- | ------------------------------------------------------------- |
| 月額プラン           | ¥480/月（税込）。Stripe checkout 経由                        |
| 年額プラン           | ¥4,800/年（税込、¥400/月相当）。デフォルト選択肢              |
| 無料分析             | 新規ユーザーは最大3回まで無料で分析可能                       |
| 無料トライアル期間   | 登録から7日間は強みの庭・価値観の宝庫に無料アクセス可能       |
| 解約                 | Stripe Customer Portal 経由                                   |
| Webhook              | `checkout.session.completed` / `customer.subscription.updated` / `customer.subscription.deleted` を処理。RLSバイパスにservice roleキーを使用 |

---

## 4. データモデル (Supabase)

### daily_logs ✅

| Column          | Type        | Description                                   |
| --------------- | ----------- | --------------------------------------------- |
| `id`            | uuid        | プライマリキー（gen_random_uuid()）            |
| `user_id`       | uuid        | auth.users への外部キー（RLS で保護）          |
| `created_at`    | timestamptz | 作成日時（UTC で保存。表示はユーザーTZ変換）   |
| `week_number`   | int         | サイクル番号（タイムゾーン対応で算出）         |
| `transcript`    | text        | ユーザーの発言テキスト（最大10,000文字）       |
| `emotion_score` | int         | 1〜10の感情スコア（サーバー側で整数・範囲検証）|
| `ai_response`   | text        | 案内人（AI）の返答                             |
| `is_analyzed`   | boolean     | 分析使用済みフラグ（default: false）           |
| `prompt_id`     | text        | 選ばれた問いかけのID（例: `s01`, `v03`）。自由記述の場合はnull |

### flower_collection ✅

| Column                  | Type        | Description                                      |
| ----------------------- | ----------- | ------------------------------------------------ |
| `id`                    | uuid        | プライマリキー                                   |
| `user_id`               | uuid        | auth.users への外部キー（RLS で保護）            |
| `flower_name`           | text        | AIが命名した二つ名                               |
| `os_description`        | text        | 性質の解説文                                     |
| `logic_reflection`      | text        | 過去の苦しみの再定義文                           |
| `environment_condition` | text        | 輝ける土壌の条件                                 |
| `level`                 | int         | 蓄積レベル（初期値 = `ceil(√根拠数)`）           |
| `analyzed_at`           | timestamptz | 分析実施日時                                     |

### root_elements ✅

| Column       | Type        | Description                                      |
| ------------ | ----------- | ------------------------------------------------ |
| `id`         | uuid        | プライマリキー                                   |
| `user_id`    | uuid        | auth.users への外部キー（RLS で保護）            |
| `flower_id`  | uuid        | flower_collection への外部キー                   |
| `log_id`     | uuid        | daily_logs への外部キー                          |
| `root`       | text        | そのログでこの強みが現れた場面の要約（50字以内） |
| `created_at` | timestamptz | 作成日時                                         |

### treasure_collection ✅

| Column              | Type        | Description                                      |
| ------------------- | ----------- | ------------------------------------------------ |
| `id`                | uuid        | プライマリキー                                   |
| `user_id`           | uuid        | auth.users への外部キー（RLS で保護）            |
| `treasure_name`     | text        | AIが命名した価値観の二つ名                       |
| `description`       | text        | 価値観の解説文                                   |
| `keywords`          | text[]      | 抽出されたキーワード配列                         |
| `fulfillment_state` | text        | 価値観が満たされているときの状態（✦ さらに光輝かせるために） |
| `threat_signal`     | text        | 価値観が脅かされているときのサイン（⚠ 宝を失わないために） |
| `level`             | int         | 蓄積レベル（初期値 = `ceil(√根拠数)`）           |

### dig_sites ✅

| Column        | Type        | Description                                      |
| ------------- | ----------- | ------------------------------------------------ |
| `id`          | uuid        | プライマリキー                                   |
| `user_id`     | uuid        | auth.users への外部キー（RLS で保護）            |
| `treasure_id` | uuid        | treasure_collection への外部キー                 |
| `log_id`      | uuid        | daily_logs への外部キー                          |
| `site`        | text        | そのログでこの価値観が現れた場面の要約           |
| `created_at`  | timestamptz | 作成日時                                         |

### seeds_collection ✅

| Column                  | Type        | Description                                      |
| ----------------------- | ----------- | ------------------------------------------------ |
| `id`                    | uuid        | プライマリキー                                   |
| `user_id`               | uuid        | auth.users への外部キー（RLS で保護）            |
| `week_number`           | int         | サイクル番号（UNIQUE: user_id + week_number）    |
| `seed_name`             | text        | AIが命名した「OS（性質）」の二つ名               |
| `os_description`        | text        | 性質の肯定的な解説                               |
| `logic_reflection`      | text        | 過去の苦しみを強みとして再定義した文             |
| `environment_condition` | text        | その性質が最も輝く環境                           |
| `created_at`            | timestamptz | 作成日時                                         |

### user_profiles ✅

| Column                       | Type        | Description                                              |
| ---------------------------- | ----------- | -------------------------------------------------------- |
| `id`                         | uuid        | auth.users の ID と紐付く主キー                          |
| `display_name`               | text        | 案内人が呼びかける名前                                   |
| `timezone`                   | text        | ユーザーのタイムゾーン（デフォルト: `Asia/Tokyo`）       |
| `is_admin`                   | boolean     | 管理者フラグ（default: false）                           |
| `subscription_status`        | text        | `free` / `active` / `past_due` / `canceled`              |
| `stripe_customer_id`         | text        | Stripe Customer ID（`cus_...`）                          |
| `current_period_end`         | timestamptz | サブスクリプションの現在期間終了日                       |
| `plan_type`                  | text        | `monthly` / `yearly`                                     |
| `total_analyses_count`       | int         | 累計分析回数（無料回数管理に使用）                       |
| `total_logs_at_last_analysis`| int         | 直前の分析時点での累計ログ数                             |
| `created_at`                 | timestamptz | 作成日時                                                 |

### contact_messages ✅

| Column       | Type        | Description                               |
| ------------ | ----------- | ----------------------------------------- |
| `id`         | uuid        | プライマリキー                            |
| `user_id`    | uuid        | auth.users への外部キー（RLS で保護）     |
| `category`   | text        | 不具合報告 / 機能要望 / その他            |
| `subject`    | text        | 件名                                      |
| `message`    | text        | 本文                                      |
| `created_at` | timestamptz | 送信日時                                  |

> **RLS ポリシー（全テーブル共通）:**
> `auth.uid() = user_id`（または `id`）で SELECT / INSERT / UPDATE を制限。ユーザー間のデータ完全分離を保証。
> Stripe Webhook ルートのみ service role キーを使用（RLSをバイパスしてユーザー情報を更新）。

---

## 5. AIプロンプト設計

### プロンプト一覧（`lib/prompts.ts`）

| 定数名                   | 用途                    | 呼び出し元          |
| ------------------------ | ----------------------- | ------------------- |
| `GUIDE_SYSTEM_PROMPT`    | 傾聴・問いかけ（毎回）  | `/api/guide`        |
| `FRAGMENT_ANALYZE_PROMPT`| 強み分析                | `/api/analyze`      |
| `VALUE_ANALYZE_PROMPT`   | 価値観分析              | `/api/analyze`      |
| `ANALYZE_SYSTEM_PROMPT`  | OS命名（タネ生成）      | `/api/analyze`      |

### 科学的根拠の組み込み

**FRAGMENT_ANALYZE_PROMPT（強み分析）**
- **VIA強み分類（Peterson & Seligman, 2004）** の6徳目を分析軸として使用
  - 知恵と知識 / 勇気 / 人間性 / 公正さ / 節制 / 超越性

**ANALYZE_SYSTEM_PROMPT（OS命名）**
- **Pennebaker（1997）エクスプレッシブライティング理論** による3段階読み解き（感情層・認知層・意味層）
- **ナラティブセラピー（White & Epston, 1990）** によるオルタナティブストーリー構築

**VALUE_ANALYZE_PROMPT（価値観分析）**
- **ACT価値観リスト（Hayes et al., 2006）** の6領域を分析軸として使用
  - 関係性 / 自己成長 / 社会参加 / 健康と安定 / 精神性 / 仕事と達成

**GUIDE_SYSTEM_PROMPT（傾聴）**
- **Rogers（1957）来談者中心療法** の3原則（無条件の肯定的配慮・共感的理解・自己一致）
- **Seligman et al.（2005）ポジティブ心理学** による問いの設計方針（3 Good Things等）

### ジャーナルプロンプト（`lib/messages.ts`）

ログ記録前に4択の問いを表示する。毎回ランダムに選択。

| カテゴリ      | 問い数 | 根拠理論                                          |
| ------------- | ------ | ------------------------------------------------- |
| `strength`    | 10問   | VIA強み理論（Peterson & Seligman, 2004）          |
| `value`       | 10問   | ACT価値観リスト（Hayes et al., 2006）             |
| `emotion`     | 10問   | CBT・エクスプレッシブライティング（Pennebaker, 1997）|
| `free`        | 固定1問| 自由記述（常に表示）                              |

選ばれた問いの `id`（例: `s01`, `v03`, `e07`）は `daily_logs.prompt_id` に保存する。
AI分析時には `PROMPT_MAP`（`lib/messages.ts`）で `prompt_id` → `{ text, category }` に逆引きし、各ログの質問文・カテゴリをプロンプトに含めて渡す。

**分析時のログフォーマット（`FRAGMENT_ANALYZE_PROMPT` / `VALUE_ANALYZE_PROMPT`）:**
```
Day1（感情スコア: 7）
【質問（強み系）】今日、気づいたら時間を忘れて取り組んでいたことはありましたか？
（ユーザーの回答）

---

Day2（感情スコア: 5）
【自由記述】
（ユーザーの回答）
```

---

## 6. サブスクリプション設計

### プラン構成

| プラン   | 価格           | Stripe Price ID              |
| -------- | -------------- | ---------------------------- |
| 月額     | ¥480/月（税込）| `STRIPE_PRICE_ID_MONTHLY`    |
| 年額     | ¥4,800/年（税込）| `STRIPE_PRICE_ID_YEARLY`   |

### 分析回数制限

| 状態                   | 分析可能条件                    |
| ---------------------- | ------------------------------- |
| 無料（分析0〜2回目）   | `ANALYSIS_THRESHOLDS = [2, 2, 3]` 件の新規ログ |
| 無料（3回消費済み）    | 分析不可（subscription_required） |
| 有料（active）         | 3件の新規ログごとに分析可能     |
| 管理者                 | 常に分析可能                    |

### アクセス制御

```
hasAccessWithFreeTrial(profile):
  is_admin → true
  subscription_status === "active" → true
  created_at + 7日 > 現在 → true（無料トライアル期間中）
  それ以外 → false → /upgrade へリダイレクト
```

### Stripe Webhook フロー

```
Stripe → POST /api/stripe/webhook
  ↓ 署名検証（STRIPE_WEBHOOK_SECRET）
  ↓ middleware の認証をスキップ（/api/stripe/webhook は認証除外）
  ↓ createAdminClient()（service role キー、RLSバイパス）
  ↓ user_profiles を stripe_customer_id で照合・更新
    - subscription_status
    - current_period_end
    - plan_type（monthly / yearly）
```

### 環境変数（Stripe関連）

| 変数名                    | 説明                               |
| ------------------------- | ---------------------------------- |
| `STRIPE_SECRET_KEY`       | Stripe シークレットキー（`sk_live_...`）|
| `STRIPE_PRICE_ID_MONTHLY` | 月額プライスID                     |
| `STRIPE_PRICE_ID_YEARLY`  | 年額プライスID                     |
| `STRIPE_WEBHOOK_SECRET`   | Webhook 署名シークレット（`whsec_...`）|

---

## 7. デザイン＆UX指針

### レイアウト原則

- **モバイルファースト:** `px-4 sm:px-6` パターンで全ページ統一
- **コンテナ幅:** `w-full max-w-{size} mx-auto` パターンを全ページで使用
- **スマートフォン対応:** タッチターゲット最低 44px（`h-11`）。iOS ホームバー考慮（`bottom-8`）
- **ブレークポイント:** `sm:` (640px) に統一

### ホーム画面レイアウト（上から順）

1. タイトル「bloomine」+ 設定ボタン（左端・歯車SVGアイコン）
2. ナビゲーションボタン行（カレンダー / 価値観の宝庫 / 強みの庭）
3. 進捗ランプ（3個。サイクル内ログ数をカウント）
4. AI メッセージボックス（コンパクト: `min-h-[72px] p-4`）
5. 植物アニメーション（成長ステージ）
6. 分析ボタン（3日分のログ蓄積後に表示）
7. 感情スコア選択（1〜10）
8. マイクボタン + かくボタン（横並び。録音中はかくボタンを非表示）
9. 発話テキスト（録音後に表示）

### カラーパレット

| 役割                 | Tailwind クラス / HEX              |
| -------------------- | ---------------------------------- |
| 背景                 | `slate-950` (#0f172a)              |
| メインテキスト       | `slate-200`                        |
| アクセント（緑）     | `emerald-400` (#34d399)            |
| 葉・茎               | `emerald-400` / `emerald-950` fill |
| 花びら（分析後）     | `rose-300` (#fda4af) ストローク    |
| 花の中心             | `rose-400` (#fb7185)               |
| 土グロー             | `emerald-300` (#6ee7b7)            |
| 警告（解約ボタン等） | `red-400` / `red-800`              |

---

## 8. アニメーション仕様

### 植物成長ステージ（`components/PlantAnimation.tsx`）

| `cycleLogCount` | ステージ   | 表示内容                               |
| --------------- | ---------- | -------------------------------------- |
| 0               | `soil`     | 盛り上がった土のみ                     |
| 1               | `sprout`   | 短い茎 + 丸い芽                        |
| 2               | `seedling` | 茎 + 双葉 + 小さな蕾                  |
| 分析後          | `flower`   | 茎 + 葉 + ローズ系6枚花びら + 中心    |

**実装詳細:**
- SVG ミニマル線画（viewBox: `0 0 120 160`）
- Framer Motion `AnimatePresence mode="wait"` でステージ間をフェード遷移（duration: 0.55s）

### 音量連動グロー（録音中）

- Web Audio API（`AudioContext` + `AnalyserNode`）でマイク音量をリアルタイム計測
- `useMotionValue` → `useSpring`（damping: 18, stiffness: 200）でスムーズに平滑化
- RAF ループは~10fps（100msインターバル）にスロットルしてCPU負荷を抑制
- 録音停止時にアナライザー参照を null クリアしてループを自己終了
- `useTransform` で opacity に変換: 入力 `[0, 0.2]` → 出力 `[0, 0.88]`
- 土の背後に emerald-300 グロー楕円。SVG `<feGaussianBlur>` を使用（iOS Safari 対応）

---

## 9. 非機能要件

### 認証・セキュリティ

| カテゴリ           | 要件                                     | 実装方法                              |
| ------------------ | ---------------------------------------- | ------------------------------------- |
| 認証               | Supabase Auth（email + password）        | 新規登録・ログイン。Cookie セッション |
| API認証            | 全書き込みAPIで認証チェック。未認証は401 | `supabase.auth.getUser()` + 早期return |
| Webhook認証除外    | `/api/stripe/webhook` は middleware の認証対象外 | Stripe 署名検証で代替 |
| データ分離         | ユーザー間のデータ完全分離               | RLS: `auth.uid() = user_id`           |
| 管理者操作         | Webhook等でのRLSバイパス                 | `createAdminClient()`（service role key）|
| 入力バリデーション | log_id UUID形式・emotion_score 整数1〜10・transcript 10,000文字上限 | サーバー側で検証 |
| 音声プライバシー   | 音声データはサーバーに送信・保存しない   | Web Speech API はブラウザ内処理       |
| APIキー保護        | Gemini/Stripe APIキーをクライアントに露出しない | Route Handler 経由のみ           |
| レート制限         | analyze APIは24時間に1回まで             | 最新 `is_analyzed=true` ログの `updated_at` で経過時間チェック |
| ログアウト         | localStorage（オンボーディングフラグ）もクリア | `localStorage.removeItem()` |

### 定数管理（`lib/constants.ts`）

```ts
DAY_START_HOUR = 5          // 1日の切り替わり時刻（午前5時）
EMOTION_SCORE_MIN = 1       // 感情スコア最小値
EMOTION_SCORE_MAX = 10      // 感情スコア最大値
TRANSCRIPT_MAX = 10_000     // transcript 最大文字数
RATE_LIMIT_MS = 24時間(ms)  // 分析レート制限
FREE_TRIAL_DAYS = 7         // 無料トライアル期間（日数）
```

### パフォーマンス

- **N+1解消:** 分析処理で既存flower/treasureのレベルを一括SELECT（`.in()`）し、root_elements/dig_sitesをバッチINSERTに変更（最大40クエリ → 数クエリ）
- **並列実行:** Gemini分析3種（強み・価値観・OS命名）を `Promise.all` で並列実行
- **並列取得:** 既存花・価値観の事前取得も `Promise.all` で並列実行

### エラーハンドリング

- AIレスポンスのJSONパースは try/catch で保護。パース失敗時は 422 を返す
- タネ（OS命名）のパース失敗は致命的でないため処理を継続
- Stripe checkout URL未取得時はアラートでエラー内容を表示
- `root_elements` / `dig_sites` のバッチINSERT失敗時は明示的にエラーをthrow（花・価値観だけが作成されて根拠なしになるのを防ぐ）

### データ整合性

- `root_elements` が0件の花は `/api/flowers` のレスポンスから除外（フィルタリング）
- `dig_sites` が0件の価値観は `/api/treasures` のレスポンスから除外

### コスト管理

| サービス         | プラン            | 月額目安                       |
| ---------------- | ----------------- | ------------------------------ |
| Supabase         | Free（500MB DB）  | ¥0                             |
| Vercel           | Hobby（個人利用） | ¥0                             |
| Gemini 2.5 Flash | 従量課金          | 数十ユーザーで ¥300〜¥500 程度 |
| Stripe           | 本番              | 決済手数料 3.6% + ¥40/件       |

### 対応環境

- **推奨ブラウザ:** Chrome 最新版（Web Speech API の制約）
- **フォールバック:** Safari/Firefox では「かく」ボタンによるテキスト入力を提供
- **スマートフォン:** iOS Safari / Android Chrome 対応。レスポンシブ実装済み
- **iOS Safari 注意点:** SVG blur は CSS `filter` でなく `<feGaussianBlur>` を使用

### タイムゾーン対応

- `daily_logs.created_at` は UTC で保存（Supabase デフォルト）
- ブラウザで `Intl.DateTimeFormat().resolvedOptions().timeZone` を検出し `user_profiles.timezone` に自動保存
- API 側で `lib/date-utils.ts` の `calcWeekNumber()` を使い、ユーザーの暦日ベースで week_number を算出
- JST深夜0〜5時（`DAY_START_HOUR` 前）のログは前日扱い

### デプロイ・CI/CD

| ツール              | 用途                                             |
| ------------------- | ------------------------------------------------ |
| Vercel              | Next.js ホスティング。GitHub Push → 自動デプロイ |
| GitHub              | ソースコード管理・Vercel 連携済み                |
| Supabase Migrations | `supabase/migrations/` でスキーマをコード管理    |

### 開発用モック

- `DEV_MOCK_AI=true` を `.env.local` に設定すると Gemini API を呼ばずにプリセット返答を返す

---

## 10. ファイル構成

```
app/
  page.tsx                        # メイン画面（ログ記録・植物・感情スコア・マイク・かく）
  login/page.tsx                  # ログイン・新規登録（email + password）
  settings/page.tsx               # 設定ページ（名前・メール・パスワード・お問い合わせ・ログアウト）
  upgrade/page.tsx                # プラン確認・サブスクリプション購入（月額/年額切り替え）
  calendar/page.tsx               # カレンダー（過去ログの日付ブラウズ。60秒キャッシュ）
  seeds/page.tsx                  # 強みの庭（花カード一覧・詳細展開）
  treasures/page.tsx              # 価値観の宝庫（価値観カード一覧・詳細展開）
  report/page.tsx                 # レポートページ（価値観ピラミッド・週次カード・強みレーダーチャート）【Phase 7 実装予定】
  auth/callback/route.ts          # メール確認後のコールバック（user_profiles upsert）
  api/
    logs/route.ts                 # ログ保存 POST / 更新 PUT（認証必須・prompt_id対応）
    status/route.ts               # 週次ステータス取得
    analyze/route.ts              # 分析実行（Gemini並列。24時間レート制限。N+1解消済み）
    calendar/route.ts             # 月ごとのログ日付一覧
    calendar/[date]/route.ts      # 指定日のログ一覧
    flowers/route.ts              # 花コレクション取得（根拠0件は除外）
    treasures/route.ts            # 価値観コレクション取得（根拠0件は除外）
    report/route.ts               # レポートデータ取得【Phase 7 実装予定】
    contact/route.ts              # お問い合わせ送信
    stripe/
      create-checkout/route.ts    # Stripe Checkout セッション作成
      create-portal/route.ts      # Stripe Customer Portal セッション作成
      webhook/route.ts            # Stripe Webhook 処理（署名検証・DB更新）

components/
  PlantAnimation.tsx              # 植物SVGアニメーション（成長ステージ + 音量グロー）
  Onboarding.tsx                  # オンボーディング（初回訪問時の機能説明）

hooks/
  useVolumeTracker.ts             # Web Audio API音量トラッキング
  useSpeechRecognition.ts         # Web Speech API初期化・transcript管理

lib/
  supabase.ts                     # ブラウザ用 Supabase クライアント
  supabase-server.ts              # サーバー用クライアント（createClient / createAdminClient）
  stripe.ts                       # Stripe クライアント初期化
  prompts.ts                      # AI プロンプト定数（4種。科学的根拠組み込み済み）
  messages.ts                     # 案内人メッセージ・ジャーナルプロンプト30問
  date-utils.ts                   # タイムゾーン対応日付計算
  constants.ts                    # 共通定数（RATE_LIMIT_MS / FREE_TRIAL_DAYS 含む）
  subscription.ts                 # 分析可否チェック・アクセス権チェック（hasAccessWithFreeTrial）

middleware.ts                     # 認証ガード（/api/stripe/webhook は除外）

supabase/migrations/
  001_initial_schema.sql          # daily_logs・基本スキーマ
  002_flower_schema.sql           # flower_collection・root_elements
  003_contact_messages.sql        # contact_messages
  004_user_profiles.sql           # user_profiles
  005_user_profiles_timezone.sql  # timezone カラム追加
  006_remove_ai_response.sql      # daily_logs.ai_response 削除
  006_subscriptions.sql           # サブスクリプション関連カラム
  007_freemium.sql                # フリーミアム関連
  007_treasure_collection.sql     # treasure_collection・dig_sites・seeds_collection
  008_add_prompt_id_to_logs.sql   # daily_logs.prompt_id カラム追加
```

---

## 11. 開発チェックリスト

### Phase 0 — 基盤整備 ✅

- [x] Next.js プロジェクト作成（App Router）
- [x] Gemini API 接続確認（gemini-2.5-flash）
- [x] GitHub 連携
- [x] Supabase プロジェクト作成・Auth 設定
- [x] DB マイグレーション実行
- [x] Vercel デプロイ設定・本番稼働
- [x] ドメイン取得・設定（bloomines.com）

### Phase 1 — ログ記録フロー ✅

- [x] 感情スコア UI 実装（1〜10）
- [x] Web Speech API 統合（マイクボタン/停止ボタン）
- [x] テキスト入力「かく」ボタン
- [x] 案内人 AI 応答実装（Gemini Route Handler）
- [x] ログ永続化（Supabase INSERT）
- [x] middleware による認証ガード
- [x] DEV_MOCK_AI モード実装

### Phase 2 — 花が咲くフェーズ ✅

- [x] 3日サイクル判定ロジック
- [x] Gemini 統合分析（FRAGMENT_ANALYZE_PROMPT）
- [x] flower_collection / root_elements への保存
- [x] レベル計算（`Math.ceil(Math.sqrt(n))`）
- [x] N+1クエリ解消（一括SELECT・バッチINSERT）
- [x] JSONパース例外処理

### Phase 3 — 価値観・OS命名 ✅

- [x] VALUE_ANALYZE_PROMPT（ACT価値観リスト組み込み）
- [x] treasure_collection / dig_sites への保存
- [x] fulfillment_state / threat_signal フィールド追加
- [x] ANALYZE_SYSTEM_PROMPT（OS命名・seeds_collection保存）
- [x] seeds_collection テーブル作成

### Phase 4 — 強みの庭・価値観の宝庫 ✅

- [x] 花コレクション一覧UI（レベル順・詳細展開）
- [x] 価値観コレクション一覧UI（fulfillment_state/threat_signal表示）
- [x] アクセス制御（hasAccessWithFreeTrial）

### Phase 5 — アカウント・UX強化 ✅

- [x] 新規登録・ログイン（email + password）
- [x] 設定ページ（名前・メール・パスワード・お問い合わせ）
- [x] オンボーディング（初回訪問時。ログアウト時にlocalStorageクリア）
- [x] 植物アニメーション（Framer Motion SVG）
- [x] 音量連動グロー（iOS Safari対応）
- [x] タイムゾーン対応
- [x] カレンダー機能
- [x] 科学的根拠のプロンプト組み込み（VIA・ACT・CBT・Rogers・Seligman）
- [x] ジャーナルプロンプト30問（問いかけ選択UI）

### Phase 6 — サブスクリプション ✅

- [x] Stripe 統合（月額¥480・年額¥4,800）
- [x] Stripe Checkout・Customer Portal
- [x] Webhook処理（署名検証・service roleキーでDB更新）
- [x] middleware での Webhook エンドポイント認証除外
- [x] plan_type（monthly/yearly）の保存・表示
- [x] 設定ページの「プランを確認する」（有料ユーザーのみ「解約する」表示）
- [x] 無料トライアル期間（7日間）アクセス制御

### Phase 7 — レポートページ（設計中）

- [ ] `/report` ページ新設（強みの庭・価値観の宝庫とは独立）
- [ ] 価値観ピラミッド（上位5件をレベル降順でピラミッド可視化）
- [ ] 週次カード（seeds_collectionを週ごとにカード表示）
- [ ] 強みレーダーチャート（VIA 6徳目に強みを分類・Rechartsなど使用）
- [ ] AIによる強みのVIAカテゴリ分類処理
- [ ] ホーム画面ナビゲーションへのレポートボタン追加

### Phase 8 — プッシュ通知（未着手）

- [ ] Service Worker の登録（`public/sw.js`）
- [ ] 通知許可リクエストUI（初回ログ記録後などのタイミングで表示）
- [ ] `push_subscriptions` テーブル新設（user_id, endpoint, keys）
- [ ] `/api/push/subscribe` エンドポイント（購読情報をDBに保存）
- [ ] `/api/push/send` エンドポイント（`web-push` ライブラリで送信）
- [ ] Vercel Cron または Supabase pg_cron で毎晩リマインダー送信
- [ ] PWA対応（`manifest.json`）とホーム画面追加の案内（iOS Safari向け）

**実装メモ:**
- Android Chrome: ブラウザを閉じていても通知が届く
- Mac Chrome/Edge: ブラウザ起動中のみ届く
- **iOS Safari（iOS 16.4以降）:** ホーム画面に追加（PWAインストール）していれば届く。ブラウザのままでは届かない
- iOSユーザーへは「ホーム画面に追加してください」の案内が必要になる
- メール通知より軽量でユーザー負担が少ない（メールは大袈裟なので不採用）

### 今後の候補

- [ ] 感情スコアの推移グラフ（週ごとの平均）
- [ ] 総合サマリー（累計ログ数・分析回数・最高Lv.強み）

---

## 12. メモ・決定事項ログ

| 日付       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| 2026-03-01 | Gemini モデルを `gemini-1.5-pro` → `gemini-2.5-flash` に変更（コスト削減）             |
| 2026-03-02 | seeds_collection → flower_collection にリネーム。level カラム追加                      |
| 2026-03-03 | root_elements テーブル追加（花とログを多対多で紐付け）                                  |
| 2026-03-03 | 分析は「1ログ1断片」の強制をやめ、統合・複数断片に対応                                  |
| 2026-03-04 | 認証を Magic Link → email + password に変更                                            |
| 2026-03-04 | 設定ページ新設（/settings）                                                             |
| 2026-03-05 | スマホ対応（モバイルファーストのレスポンシブ実装）                                      |
| 2026-03-06 | 植物成長アニメーション実装（framer-motion + SVG）                                       |
| 2026-03-07 | タイムゾーン対応（lib/date-utils.ts）                                                   |
| 2026-03-08 | 「かく」ボタン追加・複数ログ対応・カスタムフック分離・constants.ts新設                  |
| 2026-03-08 | iOS Safari 音量グローの blur を SVG `<feGaussianBlur>` に変更                          |
| 2026-03-08 | セキュリティ強化（POST未認証401返却・UUID検証・emotionScore検証・レート制限）            |
| 2026-03-10 | Stripe サブスクリプション統合（月額¥480・年額¥4,800）                                  |
| 2026-03-10 | Stripe Webhook の 401 問題解決（middleware で /api/stripe/webhook を認証除外）          |
| 2026-03-10 | Webhook の Supabase 更新失敗問題解決（service role キーで RLS をバイパス）              |
| 2026-03-10 | Stripe 本番環境へ移行（テスト環境 → 本番環境）                                         |
| 2026-03-12 | 価値観に fulfillment_state（✦ さらに光輝かせるために）と threat_signal（⚠ 宝を失わないために）を追加 |
| 2026-03-12 | レベル計算を「+1固定」→「`Math.ceil(√根拠数)`」に変更（根拠が多いほど多くLvが上がる）  |
| 2026-03-12 | 分析サイクルを7日 → 3日に短縮                                                          |
| 2026-03-12 | ジャーナルプロンプト30問実装（strength/value/emotion 各10問）。問いかけ選択UIを追加    |
| 2026-03-12 | AIプロンプトに科学的根拠を組み込み（VIA・ACT・Pennebaker・Rogers・Seligman）            |
| 2026-03-12 | seeds_collection テーブル作成・OS命名（ANALYZE_SYSTEM_PROMPT）実装                    |
| 2026-03-15 | コードレビューに基づく品質改善（N+1解消・JSONパース例外処理・アクセス権チェック統合・定数集約） |
| 2026-03-15 | ログアウト時にlocalStorage（オンボーディングフラグ）をクリアするよう修正                |
| 2026-03-15 | daily_logs に prompt_id カラム追加（選ばれた問いかけIDを保存）                         |
| 2026-03-15 | プロジェクト名を「夜の温室 (Night Greenhouse)」→「bloomine」に変更                     |
| 2026-04-11 | 新規登録者通知メール実装（Resend経由でbloomine.support@gmail.comへ送信）                |
| 2026-04-11 | AI分析時に質問文・カテゴリをプロンプトへ渡すよう改善（PROMPT_MAP逆引き）               |
| 2026-04-11 | root_elements/dig_sitesのINSERT失敗時にエラーをthrowするよう修正（根拠なし花バグ対応） |
| 2026-04-11 | 根拠0件の花・価値観をAPIレスポンスから除外するフィルタリング追加                       |
| 2026-04-11 | レポートページ方針決定: 価値観ピラミッド＋週次カード＋強みレーダーチャート（VIA軸）    |
| 2026-04-12 | プッシュ通知をPhase 8として計画。Web Push API（PWA）で実装予定。メール通知は不採用（大袈裟すぎる）。iOSはホーム画面追加が必要な点を考慮 |
