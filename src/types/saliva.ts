export type RiskLevel = "low" | "medium" | "high";

export type CariesScoreKey =
  | "dmftExperience"
  | "systemicDisease"
  | "lactobacillus"
  | "eatingFrequency"
  | "plaque"
  | "mutans"
  | "fluorideProgram"
  | "salivaSecretion"
  | "salivaBuffering";

export type CariesScoreGroup = "環境" | "食事" | "細菌" | "感受性";

export type PatientInfo = {
  chartNumber: string;
  age: string;
  hygienistName: string;
};

export type ClinicalMemo = {
  dmft: string;
  medication: string;
  piPcr: string;
  fluoride: string;
  salivaFlow: string;
  findings: string;
};

export type CariesScores = Record<CariesScoreKey, number>;

export type ReportFormState = {
  patient: PatientInfo;
  scores: CariesScores;
  memo: ClinicalMemo;
};

export type ScoreDefinition = {
  key: CariesScoreKey;
  group: CariesScoreGroup;
  label: string;
  shortLabel: string;
  max: 2 | 3;
  helpText: string;
  lowGuide: string;
  highGuide: string;
};

export type DomainRisk = {
  title: string;
  level: RiskLevel;
  score: number;
  max: number;
  description: string;
};

export const scoreDefinitions: ScoreDefinition[] = [
  {
    key: "dmftExperience",
    group: "環境",
    label: "う蝕経験（DMFT）",
    shortLabel: "DMFT",
    max: 3,
    helpText: "過去のむし歯経験から、今後の注意度をみる項目です。",
    lowGuide: "むし歯経験が少ない",
    highGuide: "過去のむし歯経験が多い"
  },
  {
    key: "systemicDisease",
    group: "環境",
    label: "関連全身疾患",
    shortLabel: "全身",
    max: 2,
    helpText: "体調や服薬がお口の乾き・ケアに影響する可能性をみます。",
    lowGuide: "全身状態の影響が少ない",
    highGuide: "体調・服薬の影響に配慮が必要"
  },
  {
    key: "lactobacillus",
    group: "食事",
    label: "食事内容（ラクトバチラス菌）",
    shortLabel: "食事",
    max: 3,
    helpText: "食事内容や甘いもののとり方に関係する目安です。",
    lowGuide: "むし歯菌が増えにくい食習慣",
    highGuide: "甘味・発酵性食品の影響が出やすい"
  },
  {
    key: "eatingFrequency",
    group: "食事",
    label: "飲食頻度",
    shortLabel: "頻度",
    max: 3,
    helpText: "飲食の回数や、だらだら食べの影響をみる項目です。",
    lowGuide: "飲食にメリハリがある",
    highGuide: "だらだら食べ・飲みが多い"
  },
  {
    key: "plaque",
    group: "細菌",
    label: "プラーク量",
    shortLabel: "プラーク",
    max: 3,
    helpText: "磨き残しの量から、清掃状態の注意度をみます。",
    lowGuide: "磨き残しが少ない",
    highGuide: "磨き残しが多く菌が残りやすい"
  },
  {
    key: "mutans",
    group: "細菌",
    label: "ミュータンス菌",
    shortLabel: "ミュータンス",
    max: 3,
    helpText: "むし歯のきっかけになりやすい菌の目安です。",
    lowGuide: "むし歯菌が少なめ",
    highGuide: "むし歯のきっかけ菌が多め"
  },
  {
    key: "fluorideProgram",
    group: "感受性",
    label: "フッ化物プログラム",
    shortLabel: "フッ化物",
    max: 3,
    helpText: "フッ化物による歯の守りをどの程度活用できているかの目安です。",
    lowGuide: "フッ化物を活用できている",
    highGuide: "フッ化物の守る力を強めたい"
  },
  {
    key: "salivaSecretion",
    group: "感受性",
    label: "唾液分泌速度",
    shortLabel: "唾液量",
    max: 3,
    helpText: "唾液の流れやお口の乾きやすさに関係する項目です。",
    lowGuide: "唾液量が保たれている",
    highGuide: "唾液が少なく乾きやすい"
  },
  {
    key: "salivaBuffering",
    group: "感受性",
    label: "唾液緩衝能",
    shortLabel: "緩衝能",
    max: 2,
    helpText: "酸性に傾いたお口を元に戻す力の目安です。",
    lowGuide: "酸性から戻りやすい",
    highGuide: "酸性状態が続きやすい"
  }
];

export const defaultFormState: ReportFormState = {
  patient: {
    chartNumber: "000123",
    age: "35",
    hygienistName: "佐藤"
  },
  scores: {
    dmftExperience: 0,
    systemicDisease: 0,
    lactobacillus: 0,
    eatingFrequency: 0,
    plaque: 0,
    mutans: 0,
    fluorideProgram: 0,
    salivaSecretion: 0,
    salivaBuffering: 0
  },
  memo: {
    dmft: "",
    medication: "",
    piPcr: "",
    fluoride: "",
    salivaFlow: "",
    findings: ""
  }
};

export const riskLabels: Record<RiskLevel, string> = {
  low: "低",
  medium: "中",
  high: "高"
};
