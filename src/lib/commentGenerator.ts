import {
  scoreDefinitions,
  type CariesScoreKey,
  type CariesScores,
  type RiskLevel
} from "@/types/saliva";
import { getItemRiskLevel } from "@/lib/riskLogic";

type CommentSet = Record<RiskLevel, string>;

const comments: Record<CariesScoreKey, CommentSet> = {
  dmftExperience: {
    low: "むし歯の経験は低リスク側の傾向です。今のケアを続けながら、定期的に確認していきましょう。",
    medium: "むし歯の経験から、今後も注意したいポイントがあります。再発しにくい環境づくりを一緒に進めましょう。",
    high: "むし歯の経験が多めの傾向があります。過去の治療部位も含め、むし歯になりにくい習慣を整えていきましょう。"
  },
  systemicDisease: {
    low: "全身状態による影響は低リスク側の傾向です。体調の変化があれば、受診時に共有してください。",
    medium: "全身状態や服薬が、お口の乾きやケアのしやすさに関係する可能性があります。",
    high: "全身状態の影響を考慮したケアが必要な可能性があります。無理のない方法を一緒に選んでいきましょう。"
  },
  lactobacillus: {
    low: "食事内容によるむし歯リスクは低めの傾向です。今のリズムを続けていきましょう。",
    medium: "食事内容や甘いものの取り方に、少し見直せるポイントがあります。",
    high: "食事内容がむし歯菌の増えやすさに関係している可能性があります。楽しみ方を工夫しながら整えていきましょう。"
  },
  eatingFrequency: {
    low: "飲食の回数は落ち着いている傾向です。食事と間食のメリハリを続けましょう。",
    medium: "飲食回数がやや増えやすい可能性があります。時間を決めるだけでも歯を守りやすくなります。",
    high: "飲食頻度が多い傾向があります。だらだら食べや甘い飲み物の時間を短くすることが大切です。"
  },
  plaque: {
    low: "磨き残しは少なめの傾向です。今のセルフケアを続けていきましょう。",
    medium: "磨き残しが出やすい場所がある可能性があります。歯と歯の間や歯ぐきの境目を一緒に確認しましょう。",
    high: "磨き残しが多めの傾向があります。歯ブラシの当て方や補助清掃用具を見直すと整えやすくなります。"
  },
  mutans: {
    low: "むし歯のきっかけになりやすい菌は落ち着いている傾向です。",
    medium: "むし歯のきっかけになりやすい菌が少し増えやすい可能性があります。",
    high: "むし歯のきっかけになりやすい菌が多めの傾向があります。フッ化物と清掃習慣を組み合わせて整えましょう。"
  },
  fluorideProgram: {
    low: "フッ化物の活用は低リスク側の傾向です。続けることで歯を守りやすくなります。",
    medium: "フッ化物の使い方に、さらに整えられる余地があります。",
    high: "フッ化物による歯の守りを強めたい傾向があります。生活に合う使い方を一緒に選びましょう。"
  },
  salivaSecretion: {
    low: "唾液の流れは低リスク側の傾向です。水分補給とよく噛む習慣を続けましょう。",
    medium: "唾液の流れが少し弱い可能性があります。お口の乾きに気づいたらこまめに水分をとりましょう。",
    high: "唾液の流れが少なめの傾向があります。唾液は歯を守る助けになるため、乾きへの対策を意識しましょう。"
  },
  salivaBuffering: {
    low: "お口の中が酸性に傾いたあと、戻る力は低リスク側の傾向です。",
    medium: "酸性に傾いたお口を戻す力に、少し注意したいポイントがあります。",
    high: "お口の中が酸性に傾いたあと、戻る力が弱い傾向があります。だらだら食べを控え、食後のケアを意識しましょう。"
  }
};

export function generateComment(key: CariesScoreKey, scores: CariesScores) {
  const level = getItemRiskLevel(key, scores);
  return comments[key][level];
}

export function buildResultRows(scores: CariesScores) {
  return scoreDefinitions.map((definition) => ({
    ...definition,
    score: scores[definition.key],
    level: getItemRiskLevel(definition.key, scores),
    comment: generateComment(definition.key, scores)
  }));
}

export function getKeyPoints(scores: CariesScores) {
  const rows = buildResultRows(scores)
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score / b.max - a.score / a.max || b.score - a.score)
    .slice(0, 3);

  if (rows.length === 0) {
    return [
      "全体として低リスク側の傾向です。今のセルフケアを続けながら、定期的に確認していきましょう。",
      "検査結果は生活習慣や体調で変化します。よい状態を保つために、無理なく続けられるケアを大切にしましょう。"
    ];
  }

  return rows.map((row) => `${row.label}は「${row.level === "high" ? "高" : "中"}」の傾向です。${row.comment}`);
}

export function getCareAdvice(scores: CariesScores) {
  const advice = new Set<string>();

  if (scores.eatingFrequency >= 2 || scores.lactobacillus >= 2) {
    advice.add("間食や甘い飲み物は時間を決めて楽しみ、飲食が長く続かないように整えましょう。");
  }

  if (scores.plaque >= 2 || scores.mutans >= 2) {
    advice.add("歯と歯の間、歯ぐきの境目を1日1回ていねいにケアしましょう。");
  }

  if (scores.fluorideProgram >= 2 || scores.dmftExperience >= 2) {
    advice.add("フッ化物入り歯みがき剤や洗口液を、生活に合う形で取り入れていきましょう。");
  }

  if (scores.salivaSecretion >= 2 || scores.salivaBuffering >= 2) {
    advice.add("こまめな水分補給と、よく噛む食事で唾液の働きをサポートしましょう。");
  }

  if (scores.systemicDisease >= 1) {
    advice.add("体調や服薬によるお口の乾きがある場合は、受診時に気軽に相談してください。");
  }

  advice.add("検査結果は変化します。できることから一緒に整えていきましょう。");

  return Array.from(advice).slice(0, 4);
}
