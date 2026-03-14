/**
 * 案内人の問いかけ・返しパターン
 */

// カテゴリ:
// [strength]  強み系  — VIA強み理論に基づく（Peterson & Seligman, 2004）
// [value]     価値観系 — ACT価値観リストに基づく（Hayes et al., 2006）
// [emotion]   感情系  — CBT・エクスプレッシブライティングに基づく（Pennebaker, 1997）

type JournalCategory = "strength" | "value" | "emotion";

export interface JournalPrompt {
  id: string;
  category: JournalCategory;
  text: string;
  hint: string;
}

// ------------------------------------------------------------
// 強み系（VIA強み理論）
// 「今日どう動いたか」からその人固有の強みのエピソードを引き出す
// ------------------------------------------------------------
const STRENGTH_PROMPTS: JournalPrompt[] = [
  {
    id: "s01",
    category: "strength",
    text: "今日、気づいたら時間を忘れて取り組んでいたことはありましたか？",
    hint: "どんな些細なことでも構いません",
  },
  {
    id: "s02",
    category: "strength",
    text: "今日、誰かに「ありがとう」「助かった」と言われた場面はありましたか？",
    hint: "言葉でなくても、表情や態度で伝わった瞬間でも",
  },
  {
    id: "s03",
    category: "strength",
    text: "今日、「これは自分がやった方がうまくいく」と感じた場面はありましたか？",
    hint: "根拠がなくても、直感でも構いません",
  },
  {
    id: "s04",
    category: "strength",
    text: "今日、誰かや何かのために自然と動いていた場面はありましたか？",
    hint: "頼まれたわけでもないのに、気づいたら動いていた瞬間",
  },
  {
    id: "s05",
    category: "strength",
    text: "今日、物事を人とは少し違う角度から見ていた瞬間はありましたか？",
    hint: "「なぜだろう」「他にも見方があるな」と思った場面",
  },
  {
    id: "s06",
    category: "strength",
    text: "今日、面倒でも丁寧にやろうとした場面はありましたか？",
    hint: "手を抜こうと思えば抜けたのに、そうしなかった瞬間",
  },
  {
    id: "s07",
    category: "strength",
    text: "今日、誰かの様子や気持ちが気になって、声をかけたり気にかけたりしましたか？",
    hint: "相手が気づいていなくても構いません",
  },
  {
    id: "s08",
    category: "strength",
    text: "今日、困難な状況でも諦めずに続けようとした瞬間はありましたか？",
    hint: "小さな踏ん張りでも構いません",
  },
  {
    id: "s09",
    category: "strength",
    text: "今日、「面白い」「もっと知りたい」と感じたことはありましたか？",
    hint: "仕事でも、ふとした瞬間でも",
  },
  {
    id: "s10",
    category: "strength",
    text: "今日、自分なりの工夫やアイデアを試してみた場面はありましたか？",
    hint: "うまくいかなくても構いません",
  },
];

// ------------------------------------------------------------
// 価値観系（ACT価値観リスト）
// 「何に反応したか」から価値観のエピソードを引き出す
// ------------------------------------------------------------
const VALUE_PROMPTS: JournalPrompt[] = [
  {
    id: "v01",
    category: "value",
    text: "今日、「これは違う」「納得できない」と感じた場面はありましたか？",
    hint: "モヤモヤした瞬間の裏には、大切にしているものがあります",
  },
  {
    id: "v02",
    category: "value",
    text: "今日、心から「良かった」「やって良かった」と思えた瞬間はありましたか？",
    hint: "どんな小さなことでも",
  },
  {
    id: "v03",
    category: "value",
    text: "今日、誰かとの会話で、特に心が動いた話題はありましたか？",
    hint: "嬉しくても、悲しくても、どちらでも",
  },
  {
    id: "v04",
    category: "value",
    text: "今日、時間やエネルギーを惜しまず使えたことはありましたか？",
    hint: "疲れても苦にならなかった、そんな瞬間",
  },
  {
    id: "v05",
    category: "value",
    text: "今日、「こういう人でありたい」と思わせてくれた人や場面はありましたか？",
    hint: "憧れや羨ましさの裏にも、価値観が隠れています",
  },
  {
    id: "v06",
    category: "value",
    text: "今日、「これだけはずらしたくない」と感じた瞬間はありましたか？",
    hint: "小さなこだわりでも構いません",
  },
  {
    id: "v07",
    category: "value",
    text: "今日、誰かのために何かをしたとき、どんな気持ちでしたか？",
    hint: "義務感でも、自然にでも、どちらでも",
  },
  {
    id: "v08",
    category: "value",
    text: "今日、「もっとこうだったら良かった」と感じた場面はありましたか？",
    hint: "理想とのギャップの中に、大切にしているものが見えます",
  },
  {
    id: "v09",
    category: "value",
    text: "今日、静かに一人でいたいと感じましたか？それとも誰かとつながりたいと感じましたか？",
    hint: "どちらが多かったか、ざっくりで構いません",
  },
  {
    id: "v10",
    category: "value",
    text: "今日、「意味があること」をしていると感じた瞬間はありましたか？",
    hint: "仕事でも、プライベートでも",
  },
];

// ------------------------------------------------------------
// 感情系（CBT・エクスプレッシブライティング理論）
// 感情→思考→意味付けの3段階を促す問い
// 感情スコアと組み合わせてAI分析の精度を上げる
// ------------------------------------------------------------
const EMOTION_PROMPTS: JournalPrompt[] = [
  {
    id: "e01",
    category: "emotion",
    text: "今日、一番エネルギーが高かった瞬間はいつでしたか？",
    hint: "テンションが上がった、集中できた、そんな瞬間",
  },
  {
    id: "e02",
    category: "emotion",
    text: "今日、じわっと嬉しかったことは何ですか？",
    hint: "大きなことでなくていいです",
  },
  {
    id: "e03",
    category: "emotion",
    text: "今日、誰かの言葉や行動で、心が動いた瞬間はありましたか？",
    hint: "ポジティブでも、ネガティブでも",
  },
  {
    id: "e04",
    category: "emotion",
    text: "今日、ふと立ち止まって考えたことはありましたか？",
    hint: "頭の中でぐるぐる考えていたこと",
  },
  {
    id: "e05",
    category: "emotion",
    text: "今日、心が軽くなった瞬間はありましたか？",
    hint: "ほっとした、すっきりした、そんな感覚",
  },
  {
    id: "e06",
    category: "emotion",
    text: "今日、少しでも「これで良かった」と思えたことはありましたか？",
    hint: "自分を褒めてあげたい瞬間",
  },
  {
    id: "e07",
    category: "emotion",
    text: "今日、何かに対して「もやっ」としたことはありましたか？",
    hint: "うまく言葉にできなくても、感じたことをそのままに",
  },
  {
    id: "e08",
    category: "emotion",
    text: "今日という日を、一言で表すとしたら何ですか？",
    hint: "言葉でも、色でも、天気でも",
  },
  {
    id: "e09",
    category: "emotion",
    text: "今日、自分に対して正直でいられた瞬間はありましたか？",
    hint: "本音を言えた、本音を感じた、そんな場面",
  },
  {
    id: "e10",
    category: "emotion",
    text: "今日、明日の自分に伝えたいことは何ですか？",
    hint: "一言でも構いません",
  },
];

// 全プロンプトを結合（strength→value→emotion の順に30件）
const ALL_PROMPTS: JournalPrompt[] = [
  ...STRENGTH_PROMPTS,
  ...VALUE_PROMPTS,
  ...EMOTION_PROMPTS,
];

// 挨拶の3パターン
const GREETINGS = [
  "今夜もここに来てくれましたね。",
  "また会えましたね。",
  "お帰りなさい。",
] as const;

// ログ記録後に表示する返し（7パターン）
const RESPONSES = [
  "今夜の言葉を、静かに受け取りました。あなたがここに来てくれたことで、土が少し温かくなりました。",
  "その言葉が、ここに根を張りました。ゆっくり休んでください。",
  "話してくれてありがとうございます。あなたの声が、この土壌の栄養になっています。",
  "その気持ちを、ありのままに受け取りました。どうか今夜は、安らかに。",
  "あなたの言葉は、ちゃんとここに届いています。また明日、聞かせてください。",
  "今日もよく話してくれましたね。その言葉が、あなたの中で少しずつ育っています。",
  "今夜もここに来てくれて、ありがとうございます。あなたの一日が、この土に刻まれました。",
] as const;

/**
 * 各カテゴリからランダムに1問ずつ選んだ3問 + null（自由記述）を返す
 */
export function getRandomQuestions(): (JournalPrompt | null)[] {
  const strength = STRENGTH_PROMPTS[Math.floor(Math.random() * STRENGTH_PROMPTS.length)];
  const value = VALUE_PROMPTS[Math.floor(Math.random() * VALUE_PROMPTS.length)];
  const emotion = EMOTION_PROMPTS[Math.floor(Math.random() * EMOTION_PROMPTS.length)];
  return [strength, value, emotion, null];
}

/**
 * cycleLogCount に対応する問いかけを返す
 * displayName がある場合は挨拶の後に添える
 */
export function getQuestion(
  cycleLogCount: number,
  displayName?: string,
): string {
  const prompt = ALL_PROMPTS[cycleLogCount % ALL_PROMPTS.length];
  const greeting = GREETINGS[cycleLogCount % GREETINGS.length];
  const name = displayName ? `${displayName}さん、` : "";
  return `「${greeting}${name}${prompt.text}」`;
}

/**
 * 現在表示中のプロンプトのヒントを返す
 */
export function getQuestionHint(cycleLogCount: number): string {
  return ALL_PROMPTS[cycleLogCount % ALL_PROMPTS.length].hint;
}

/**
 * 記録直後に表示する返しを返す（記録前の cycleLogCount を渡す）
 */
export function getResponse(cycleLogCount: number): string {
  return `「${RESPONSES[cycleLogCount % RESPONSES.length]}」`;
}
