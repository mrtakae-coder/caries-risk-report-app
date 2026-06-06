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
    low: "体調による影響は低リスク側の傾向です。体調の変化があれば、受診時に共有してください。",
    medium: "体調やお薬が、お口の乾きやケアのしやすさに関係する可能性があります。",
    high: "体調の影響を考えたケアが必要な可能性があります。無理のない方法を一緒に選んでいきましょう。"
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
    high: "むし歯のきっかけになりやすい菌が多めの傾向があります。フッ素ケアと歯みがきを組み合わせて整えましょう。"
  },
  fluorideProgram: {
    low: "フッ素ケアは低リスク側の傾向です。続けることで歯を守りやすくなります。",
    medium: "フッ素ケアの使い方に、さらに整えられる余地があります。",
    high: "フッ素で歯を守るケアを強めたい傾向があります。生活に合う使い方を一緒に選びましょう。"
  },
  salivaSecretion: {
    low: "唾液の流れは低リスク側の傾向です。水分補給とよく噛む習慣を続けましょう。",
    medium: "唾液の流れが少し弱い可能性があります。お口の乾きに気づいたらこまめに水分をとりましょう。",
    high: "唾液の流れが少なめの傾向があります。唾液は歯を守る助けになるため、乾きへの対策を意識しましょう。"
  },
  salivaBuffering: {
    low: "食後のお口が元に戻る力は低リスク側の傾向です。",
    medium: "食後のお口が元に戻る力に、少し注意したいポイントがあります。",
    high: "食後のお口が酸性に傾きやすい傾向があります。だらだら食べを控え、食後のケアを意識しましょう。"
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

function getPatientAge(age: string) {
  const parsed = Number(age);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function getLifeStage(age: string) {
  const parsed = getPatientAge(age);
  if (parsed === null) return "adult";
  if (parsed <= 5) return "preschool";
  if (parsed <= 12) return "schoolchild";
  if (parsed <= 17) return "teen";
  if (parsed >= 65) return "senior";
  return "adult";
}

function getFluorideBaseAdvice(stage: ReturnType<typeof getLifeStage>) {
  if (stage === "preschool") {
    return "イエテボリ法（フッ素をお口に残すみがき方）の考え方を取り入れ、保護者の方が歯みがき剤の量を確認しましょう。うがいが難しい時期は軽く拭き取る方法も相談できます。";
  }

  if (stage === "schoolchild") {
    return "就寝前はイエテボリ法（フッ素をお口に残すみがき方）を意識し、すすぎは少量の水で1回を目安にしましょう。保護者の方が奥歯や歯と歯の間も確認しましょう。";
  }

  if (stage === "teen") {
    return "就寝前はイエテボリ法（フッ素をお口に残すみがき方）を意識し、すすぎは少量の水で1回を目安にしましょう。";
  }

  if (stage === "senior") {
    return "夜はイエテボリ法（フッ素をお口に残すみがき方）を意識し、歯の根元までみがきましょう。すすぎは少量の水で1回が目安です。";
  }

  return "夜はイエテボリ法（フッ素をお口に残すみがき方）を意識し、すすぎは少量の水で1回を目安にしましょう。";
}

export function getCareAdvice(scores: CariesScores, age: string) {
  const advice: string[] = [];
  const addAdvice = (text: string) => {
    if (!advice.includes(text)) advice.push(text);
  };
  const stage = getLifeStage(age);
  const needsFluorideSupport =
    scores.fluorideProgram >= 2 || scores.dmftExperience >= 2 || scores.mutans >= 2;

  addAdvice(getFluorideBaseAdvice(stage));

  if (needsFluorideSupport) {
    if (stage === "preschool" || stage === "schoolchild") {
      addAdvice("むし歯リスクが高めのため、ぶくぶくうがいが安定してできるか確認し、フッ素のうがい薬や医院でのフッ素塗布を相談しましょう。");
    } else if (stage === "senior") {
      addAdvice("歯の根元のむし歯やお口の乾きが気になる場合は、フッ素のうがい薬、医院でのフッ素塗布、保湿ケアを相談しましょう。");
    } else {
      addAdvice("むし歯リスクが高めのため、フッ素のうがい薬や医院でのフッ素塗布を生活リズムに合わせて相談しましょう。");
    }
  }

  if (scores.plaque >= 2 || scores.mutans >= 2) {
    if (stage === "preschool" || stage === "schoolchild") {
      addAdvice("保護者の方が奥歯、歯と歯の間、歯ぐきの近くを確認し、必要に応じて仕上げみがきやフロスを一緒に行いましょう。");
    } else {
      addAdvice("歯ブラシだけでは届きにくい歯と歯の間は、フロスや歯間ブラシを使ってからフッ素入り歯みがき剤で整えましょう。");
    }
  }

  if (scores.eatingFrequency >= 2 || scores.lactobacillus >= 2) {
    if (stage === "preschool" || stage === "schoolchild") {
      addAdvice("おやつや甘い飲み物は時間を決め、寝る前の歯みがき後は飲食を控えられるよう、ご家庭のリズムを整えましょう。");
    } else {
      addAdvice("間食や甘い飲み物は時間を決めて楽しみ、就寝前のセルフケア後は飲食を控える時間をつくりましょう。");
    }
  }

  if (scores.salivaSecretion >= 2 || scores.salivaBuffering >= 2) {
    if (stage === "senior") {
      addAdvice("唾液が少なめの傾向があるため、水分補給、よく噛む食事、お口の体操、保湿剤を無理なく取り入れましょう。");
    } else {
      addAdvice("お口が乾きやすい日は、こまめな水分補給やよく噛む食事で唾液の働きを助けましょう。洗口剤の使い方も一緒に確認できます。");
    }
  }

  if (scores.systemicDisease >= 1) {
    if (stage === "senior") {
      addAdvice("服薬や体調により乾燥しやすい場合は、むせやすさも含めて確認し、洗口剤・保湿ケア・清掃方法を一緒に選びましょう。");
    } else {
      addAdvice("体調やお薬でお口が乾きやすい場合は、フッ素のうがい薬や保湿ケアについて受診時に相談してください。");
    }
  }

  if (advice.length < 4) {
    addAdvice("検査結果は生活習慣や体調で変化します。できることから一緒に整えていきましょう。");
  }

  return advice.slice(0, 4);
}
