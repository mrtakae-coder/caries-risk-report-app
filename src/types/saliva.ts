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
    label: "これまでのむし歯（DMFT）",
    shortLabel: "DMFT",
    max: 3,
    helpText: "これまでのむし歯の経験から、今後の注意度をみる項目です。",
    lowGuide: "これまでのむし歯が少ない",
    highGuide: "これまでのむし歯が多い"
  },
  {
    key: "systemicDisease",
    group: "環境",
    label: "体調・お薬の影響",
    shortLabel: "体調",
    max: 2,
    helpText: "体調や服薬がお口の乾き・ケアに影響する可能性をみます。",
    lowGuide: "体調による影響が少ない",
    highGuide: "体調やお薬の影響に注意"
  },
  {
    key: "lactobacillus",
    group: "食事",
    label: "食事内容",
    shortLabel: "食事",
    max: 3,
    helpText: "食事内容や甘いもののとり方に関係する目安です。",
    lowGuide: "むし歯菌が増えにくい食べ方",
    highGuide: "甘いものの影響が出やすい"
  },
  {
    key: "eatingFrequency",
    group: "食事",
    label: "飲食頻度",
    shortLabel: "頻度",
    max: 3,
    helpText: "飲食の回数や、だらだら食べの影響をみる項目です。",
    lowGuide: "食べる時間がまとまっている",
    highGuide: "ちょこちょこ食べ・飲みが多い"
  },
  {
    key: "plaque",
    group: "細菌",
    label: "磨き残し（プラーク）",
    shortLabel: "プラーク",
    max: 3,
    helpText: "磨き残しの量から、清掃状態の注意度をみます。",
    lowGuide: "磨き残しが少ない",
    highGuide: "磨き残しが多い"
  },
  {
    key: "mutans",
    group: "細菌",
    label: "むし歯菌",
    shortLabel: "むし歯菌",
    max: 3,
    helpText: "むし歯のきっかけになりやすい菌の目安です。",
    lowGuide: "むし歯菌が少ない",
    highGuide: "むし歯菌が多い"
  },
  {
    key: "fluorideProgram",
    group: "感受性",
    label: "フッ素ケア",
    shortLabel: "フッ素",
    max: 3,
    helpText: "フッ素で歯を守るケアをどの程度できているかの目安です。",
    lowGuide: "フッ素ケアができている",
    highGuide: "フッ素ケアを増やしたい"
  },
  {
    key: "salivaSecretion",
    group: "感受性",
    label: "唾液の量",
    shortLabel: "唾液量",
    max: 3,
    helpText: "唾液の流れやお口の乾きやすさに関係する項目です。",
    lowGuide: "唾液がしっかり出ている",
    highGuide: "お口が乾きやすい"
  },
  {
    key: "salivaBuffering",
    group: "感受性",
    label: "唾液の戻す力",
    shortLabel: "戻す力",
    max: 2,
    helpText: "食後のお口を元の状態に戻す力の目安です。",
    lowGuide: "食後のお口が元に戻りやすい",
    highGuide: "食後のお口が酸性に傾きやすい"
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
