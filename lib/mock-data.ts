export type Issue = {
  id: string
  createdAt: string
  category: string
  rawText: string
  finalStatement?: string
  tags?: string[]
  emotionTags?: ("不安" | "不満" | "怒り" | "悲しみ" | "困惑" | "期待" | "安心" | "希望")[]
  likes: number
  status: "未対応" | "対応中" | "解決済"
  hidden?: boolean
}

export type Edge = {
  sourceId: string
  targetId: string
  type: "related" | "cause"
  confidence: number
}

export const mockIssues: Issue[] = [
  {
    id: "1",
    createdAt: "2024-01-15T10:30:00Z",
    category: "職場環境",
    rawText: "残業が多すぎて家族との時間が取れません。働き方改革が必要だと思います。",
    finalStatement: "働き方改革により、ワークライフバランスの改善を求めます。",
    tags: ["残業", "家族時間", "働き方改革"],
    emotionTags: ["不満", "悲しみ"],
    likes: 12,
    status: "未対応",
  },
  {
    id: "2",
    createdAt: "2024-01-14T14:20:00Z",
    category: "コミュニケーション",
    rawText: "上司とのコミュニケーションがうまくいかず、ストレスを感じています。",
    finalStatement: "上司との円滑なコミュニケーション環境の構築を希望します。",
    tags: ["上司", "ストレス", "コミュニケーション"],
    emotionTags: ["不安", "困惑"],
    likes: 8,
    status: "対応中",
  },
  {
    id: "3",
    createdAt: "2024-01-13T09:15:00Z",
    category: "研修・教育",
    rawText: "新しい技術についていけず、研修の機会が少ないと感じています。",
    finalStatement: "継続的な技術研修プログラムの充実を求めます。",
    tags: ["技術", "研修", "スキルアップ"],
    emotionTags: ["不安", "期待"],
    likes: 15,
    status: "解決済",
  },
  {
    id: "4",
    createdAt: "2024-01-12T16:45:00Z",
    category: "職場環境",
    rawText: "オフィスの温度調整がうまくいかず、集中できません。",
    finalStatement: "快適な作業環境の整備をお願いします。",
    tags: ["オフィス", "温度", "集中"],
    emotionTags: ["不満"],
    likes: 6,
    status: "対応中",
  },
  {
    id: "5",
    createdAt: "2024-01-11T11:30:00Z",
    category: "評価制度",
    rawText: "評価基準が不明確で、どう頑張ればいいかわからない状況です。",
    finalStatement: "透明性のある評価制度の確立を希望します。",
    tags: ["評価", "基準", "透明性"],
    emotionTags: ["困惑", "不安"],
    likes: 20,
    status: "未対応",
  },
  {
    id: "6",
    createdAt: "2024-01-10T13:20:00Z",
    category: "福利厚生",
    rawText: "健康診断の結果フォローアップが不十分だと感じています。",
    finalStatement: "健康管理サポート体制の強化を求めます。",
    tags: ["健康診断", "フォローアップ", "健康管理"],
    emotionTags: ["不安", "希望"],
    likes: 9,
    status: "未対応",
  },
]

export const mockEdges: Edge[] = [
  { sourceId: "1", targetId: "2", type: "related", confidence: 0.7 },
  { sourceId: "1", targetId: "4", type: "cause", confidence: 0.6 },
  { sourceId: "2", targetId: "5", type: "related", confidence: 0.8 },
  { sourceId: "3", targetId: "5", type: "cause", confidence: 0.5 },
  { sourceId: "4", targetId: "1", type: "related", confidence: 0.4 },
  { sourceId: "5", targetId: "6", type: "related", confidence: 0.6 },
]

export const categories = ["職場環境", "コミュニケーション", "研修・教育", "評価制度", "福利厚生", "その他"]

export const aiReplies = [
  "お話しいただき、ありがとうございます。そのような状況は本当に大変ですね。",
  "あなたの気持ちがよく伝わってきます。一人で抱え込まずに、声を上げることは大切です。",
  "そのような経験をされているのですね。あなたの想いを聞かせていただけて良かったです。",
  "とても重要な問題提起だと思います。多くの方が同じような思いを抱えているかもしれません。",
  "お疲れさまです。あなたの率直な気持ちを教えてくださり、ありがとうございます。",
]
