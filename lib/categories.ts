// VIA 6カテゴリ（強みの花）
export const VIA_CATEGORIES = [
  "wisdom",
  "courage",
  "humanity",
  "justice",
  "temperance",
  "transcendence",
] as const;

export type ViaCategory = (typeof VIA_CATEGORIES)[number];

export const VIA_LABEL: Record<string, string> = {
  wisdom:        "知恵",
  courage:       "勇気",
  humanity:      "人間性",
  justice:       "公正",
  temperance:    "節制",
  transcendence: "超越",
};

// ACT 10カテゴリ（価値観の宝物）
export const ACT_CATEGORIES = [
  "family",
  "intimate_relationship",
  "friendship",
  "spirituality",
  "work",
  "learning",
  "leisure",
  "citizenship",
  "health",
  "parenting",
] as const;

export type ActCategory = (typeof ACT_CATEGORIES)[number];

export const ACT_LABEL: Record<string, string> = {
  family:                "家族",
  intimate_relationship: "親密な関係",
  friendship:            "友人・社会関係",
  spirituality:          "スピリチュアリティ",
  work:                  "仕事",
  learning:              "学習・成長",
  leisure:               "余暇・趣味",
  citizenship:           "市民性・社会貢献",
  health:                "身体・健康",
  parenting:             "子育て・愛情",
};
