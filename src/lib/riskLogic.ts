import {
  scoreDefinitions,
  type CariesScoreKey,
  type CariesScores,
  type DomainRisk,
  type RiskLevel
} from "@/types/saliva";

export function getScoreDefinition(key: CariesScoreKey) {
  return scoreDefinitions.find((definition) => definition.key === key);
}

export function getMetricRiskScore(key: CariesScoreKey, scores: CariesScores) {
  return Number(scores[key] ?? 0);
}

export function getItemRiskLevel(key: CariesScoreKey, scores: CariesScores): RiskLevel {
  const definition = getScoreDefinition(key);
  const score = getMetricRiskScore(key, scores);

  if (score <= 0) return "low";
  if (definition?.max === 2) return score >= 2 ? "high" : "medium";
  return score >= 2 ? "high" : "medium";
}

export function getTotalScore(scores: CariesScores) {
  return scoreDefinitions.reduce((total, definition) => total + getMetricRiskScore(definition.key, scores), 0);
}

export function getMaxScore() {
  return scoreDefinitions.reduce((total, definition) => total + definition.max, 0);
}

export function levelFromRatio(score: number, max: number): RiskLevel {
  const ratio = max === 0 ? 0 : score / max;

  if (ratio >= 0.62) return "high";
  if (ratio >= 0.32) return "medium";
  return "low";
}

export function calculateOverallRisk(scores: CariesScores) {
  const score = getTotalScore(scores);
  const max = getMaxScore();

  return {
    title: "総合カリエスリスク",
    score,
    max,
    level: levelFromRatio(score, max),
    description: "カリエスリスク表の各項目スコアを合計した目安です。"
  } satisfies DomainRisk;
}

export function calculateDomainRisks(scores: CariesScores): DomainRisk[] {
  const domains = [
    {
      title: "生活・全身",
      keys: ["dmftExperience", "systemicDisease"],
      description: "過去のむし歯経験や全身状態から見た目安です。"
    },
    {
      title: "食事習慣",
      keys: ["lactobacillus", "eatingFrequency"],
      description: "食事内容と飲食頻度から見た目安です。"
    },
    {
      title: "細菌・清掃",
      keys: ["plaque", "mutans"],
      description: "磨き残しとむし歯菌から見た目安です。"
    },
    {
      title: "唾液・防御力",
      keys: ["fluorideProgram", "salivaSecretion", "salivaBuffering"],
      description: "フッ化物と唾液の守る力から見た目安です。"
    }
  ] as const;

  return domains.map((domain) => {
    const definitions = scoreDefinitions.filter((definition) =>
      (domain.keys as readonly string[]).includes(definition.key)
    );
    const score = definitions.reduce((total, definition) => total + getMetricRiskScore(definition.key, scores), 0);
    const max = definitions.reduce((total, definition) => total + definition.max, 0);

    return {
      title: domain.title,
      score,
      max,
      level: levelFromRatio(score, max),
      description: domain.description
    };
  });
}

export function getCarePriorityLabel(score: number) {
  if (score >= 2) return "重点ケア";
  if (score >= 1) return "見直し";
  return "良好";
}

export function getRiskTone(level: RiskLevel) {
  if (level === "high") {
    return {
      label: "優先して整えたい",
      description: "不安にするためではなく、変えられるポイントを一緒に見つけるための目安です。",
      className: "border-blossom-200 bg-blossom-50 text-rose-700"
    };
  }

  if (level === "medium") {
    return {
      label: "整えるポイントあり",
      description: "今の習慣に小さな工夫を足すことで、より安定しやすい状態です。",
      className: "border-amber-200 bg-amber-50 text-amber-800"
    };
  }

  return {
    label: "落ち着いています",
    description: "よい状態を保てるよう、今のケアを気持ちよく続けていきましょう。",
    className: "border-mist-200 bg-mist-50 text-mist-700"
  };
}
