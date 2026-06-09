const riskLabels = {
  low: "低",
  medium: "中",
  high: "高"
};

const riskText = {
  low: "落ち着いている傾向",
  medium: "整えるポイントあり",
  high: "優先して整えたい傾向"
};

const PRINT_FIT_BASE_HEIGHT = 1800;
const PRINT_FIT_MIN_SCALE = 0.78;
const DEFAULT_DOCUMENT_TITLE = document.title;
const PDF_LIBRARY_URLS = {
  html2canvas: "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
  jspdf: "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"
};
const DMFT_REFERENCE_SOURCE = "厚生労働省 令和6年歯科疾患実態調査 表9・10";
const DMFT_REFERENCE_DATA = [
  { label: "5歳", min: 5, max: 5, average: 0.0 },
  { label: "6歳", min: 6, max: 6, average: 0.0 },
  { label: "7歳", min: 7, max: 7, average: 0.0 },
  { label: "8歳", min: 8, max: 8, average: 0.5 },
  { label: "9歳", min: 9, max: 9, average: 0.0 },
  { label: "10歳", min: 10, max: 10, average: 0.4 },
  { label: "11歳", min: 11, max: 11, average: 0.2 },
  { label: "12歳", min: 12, max: 12, average: 0.6 },
  { label: "13歳", min: 13, max: 13, average: 2.0 },
  { label: "14歳", min: 14, max: 14, average: 1.3 },
  { label: "15-24歳", min: 15, max: 24, average: 2.8 },
  { label: "25-34歳", min: 25, max: 34, average: 5.3 },
  { label: "35-44歳", min: 35, max: 44, average: 9.2 },
  { label: "45-54歳", min: 45, max: 54, average: 12.6 },
  { label: "55-64歳", min: 55, max: 64, average: 15.9 },
  { label: "65-74歳", min: 65, max: 74, average: 18.1 },
  { label: "75-84歳", min: 75, max: 84, average: 19.9 },
  { label: "85歳-", min: 85, max: 120, average: 22.7 }
];

let restoreDocumentTitle = null;
let pdfLibrariesPromise = null;

const scoreItems = [
  {
    key: "dmftExperience",
    group: "環境",
    label: "う蝕経験（DMFT）",
    max: 3,
    includeInOverall: false,
    helpText: "これまでのむし歯の経験から、今後の注意度をみる項目です。",
    lowGuide: "これまでのむし歯が少ない",
    highGuide: "これまでのむし歯が多い",
    low: "むし歯の経験は低リスク側の傾向です。今のケアを続けながら、定期的に確認していきましょう。",
    medium: "むし歯の経験から、今後も注意したいポイントがあります。再発しにくい環境づくりを一緒に進めましょう。",
    high: "むし歯の経験が多めの傾向があります。過去の治療部位も含め、むし歯になりにくい習慣を整えていきましょう。"
  },
  {
    key: "systemicDisease",
    group: "環境",
    label: "関連全身疾患",
    max: 2,
    includeInOverall: false,
    helpText: "体調や服薬がお口の乾き・ケアに影響する可能性をみます。",
    lowGuide: "体調による影響が少ない",
    highGuide: "体調やお薬の影響に注意",
    low: "体調による影響は低リスク側の傾向です。体調の変化があれば、受診時に共有してください。",
    medium: "体調やお薬が、お口の乾きやケアのしやすさに関係する可能性があります。",
    high: "体調の影響を考えたケアが必要な可能性があります。無理のない方法を一緒に選んでいきましょう。"
  },
  {
    key: "lactobacillus",
    group: "食事",
    label: "食事内容（ラクトバチラス菌）",
    max: 3,
    helpText: "食事内容や甘いもののとり方に関係する目安です。",
    lowGuide: "むし歯菌が増えにくい食べ方",
    highGuide: "甘いものの影響が出やすい",
    low: "食事内容によるむし歯リスクは低めの傾向です。今のリズムを続けていきましょう。",
    medium: "食事内容や甘いものの取り方に、少し見直せるポイントがあります。",
    high: "食事内容がむし歯菌の増えやすさに関係している可能性があります。楽しみ方を工夫しながら整えていきましょう。"
  },
  {
    key: "eatingFrequency",
    group: "食事",
    label: "飲食頻度",
    max: 3,
    helpText: "飲食の回数や、だらだら食べの影響をみる項目です。",
    lowGuide: "食べる時間がまとまっている",
    highGuide: "ちょこちょこ食べ・飲みが多い",
    low: "飲食の回数は落ち着いている傾向です。食事と間食のメリハリを続けましょう。",
    medium: "飲食回数がやや増えやすい可能性があります。時間を決めるだけでも歯を守りやすくなります。",
    high: "飲食頻度が多い傾向があります。だらだら食べや甘い飲み物の時間を短くすることが大切です。"
  },
  {
    key: "plaque",
    group: "細菌",
    label: "プラーク量",
    max: 3,
    helpText: "磨き残しの量から、清掃状態の注意度をみます。",
    lowGuide: "磨き残しが少ない",
    highGuide: "磨き残しが多い",
    low: "磨き残しは少なめの傾向です。今のセルフケアを続けていきましょう。",
    medium: "磨き残しが出やすい場所がある可能性があります。歯と歯の間や歯ぐきの境目を一緒に確認しましょう。",
    high: "磨き残しが多めの傾向があります。歯ブラシの当て方や補助清掃用具を見直すと整えやすくなります。"
  },
  {
    key: "mutans",
    group: "細菌",
    label: "ミュータンス菌",
    max: 3,
    helpText: "むし歯のきっかけになりやすい菌の目安です。",
    lowGuide: "むし歯菌が少ない",
    highGuide: "むし歯菌が多い",
    low: "むし歯のきっかけになりやすい菌は落ち着いている傾向です。",
    medium: "むし歯のきっかけになりやすい菌が少し増えやすい可能性があります。",
    high: "むし歯のきっかけになりやすい菌が多めの傾向があります。フッ素ケアと歯みがきを組み合わせて整えましょう。"
  },
  {
    key: "fluorideProgram",
    group: "感受性",
    label: "フッ化物プログラム",
    max: 3,
    helpText: "フッ素で歯を守るケアをどの程度できているかの目安です。",
    lowGuide: "フッ素ケアができている",
    highGuide: "フッ素ケアを増やしたい",
    low: "フッ素ケアは低リスク側の傾向です。続けることで歯を守りやすくなります。",
    medium: "フッ素ケアの使い方に、さらに整えられる余地があります。",
    high: "フッ素で歯を守るケアを強めたい傾向があります。生活に合う使い方を一緒に選びましょう。"
  },
  {
    key: "salivaSecretion",
    group: "感受性",
    label: "唾液分泌速度",
    max: 3,
    helpText: "唾液の流れやお口の乾きやすさに関係する項目です。",
    lowGuide: "唾液がしっかり出ている",
    highGuide: "お口が乾きやすい",
    low: "唾液の流れは低リスク側の傾向です。水分補給とよく噛む習慣を続けましょう。",
    medium: "唾液の流れが少し弱い可能性があります。お口の乾きに気づいたらこまめに水分をとりましょう。",
    high: "唾液の流れが少なめの傾向があります。唾液は歯を守る助けになるため、乾きへの対策を意識しましょう。"
  },
  {
    key: "salivaBuffering",
    group: "感受性",
    label: "唾液緩衝能",
    max: 3,
    scoreLabels: [
      { score: 0, label: "即青", tone: "quick-blue" },
      { score: 1, label: "ゆっくり青", tone: "slow-blue" },
      { score: 2, label: "緑", tone: "green" },
      { score: 3, label: "黄", tone: "yellow" }
    ],
    helpText: "食後のお口を元の状態に戻す力の目安です。",
    lowGuide: "食後のお口が元に戻りやすい",
    highGuide: "食後のお口が酸性に傾きやすい",
    low: "食後のお口が元に戻る力は低リスク側の傾向です。",
    medium: "食後のお口が元に戻る力に、少し注意したいポイントがあります。",
    high: "食後のお口が酸性に傾きやすい傾向があります。だらだら食べを控え、食後のケアを意識しましょう。"
  }
];

const initialState = {
  chartNumber: "000123",
  patientAge: "35",
  hygienistName: "佐藤",
  dmftExperience: 0,
  systemicDisease: 0,
  lactobacillus: 0,
  eatingFrequency: 0,
  plaque: 0,
  mutans: 0,
  fluorideProgram: 0,
  salivaSecretion: 0,
  salivaBuffering: 0,
  dmftText: "",
  medication: "",
  piPcr: "",
  fluorideText: "",
  salivaFlow: "",
  findings: ""
};

let state = { ...initialState };

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scoreLevel(score, max) {
  if (score <= 0) return "low";
  if (max === 2) return score >= 2 ? "high" : "medium";
  return score >= 2 ? "high" : "medium";
}

function overallScoreItems() {
  return scoreItems.filter((item) => item.includeInOverall !== false);
}

function totalScore() {
  return overallScoreItems().reduce((total, item) => total + Number(state[item.key] ?? 0), 0);
}

function maxScore() {
  return overallScoreItems().reduce((total, item) => total + item.max, 0);
}

function levelFromRatio(score, max) {
  const ratio = max === 0 ? 0 : score / max;
  if (ratio >= 0.62) return "high";
  if (ratio >= 0.32) return "medium";
  return "low";
}

function domainRisks() {
  const domains = [
    {
      title: "生活・全身",
      keys: ["dmftExperience", "systemicDisease"],
      note: "これまでのむし歯経験や体調から見た目安です。"
    },
    {
      title: "食事習慣",
      keys: ["lactobacillus", "eatingFrequency"],
      note: "食事内容と飲食頻度から見た目安です。"
    },
    {
      title: "細菌・清掃",
      keys: ["plaque", "mutans"],
      note: "磨き残しとむし歯菌から見た目安です。"
    },
    {
      title: "唾液・防御力",
      keys: ["fluorideProgram", "salivaSecretion", "salivaBuffering"],
      note: "フッ素ケアと唾液の守る力から見た目安です。"
    }
  ];

  return domains.map((domain) => {
    const items = scoreItems.filter((item) => domain.keys.includes(item.key));
    const score = items.reduce((total, item) => total + Number(state[item.key] ?? 0), 0);
    const max = items.reduce((total, item) => total + item.max, 0);
    return {
      ...domain,
      score,
      max,
      level: levelFromRatio(score, max)
    };
  });
}

function selectedComment(item) {
  return item[scoreLevel(Number(state[item.key] ?? 0), item.max)];
}

function scoreLabelFor(item, score) {
  return item.scoreLabels?.find((marker) => marker.score === score);
}

function patientAgeNumber() {
  const age = Number(state.patientAge);
  return Number.isFinite(age) && age >= 0 ? age : null;
}

function normalizeNumericText(value) {
  return String(value ?? "").replace(/[０-９．]/g, (character) => {
    if (character === "．") return ".";
    return String.fromCharCode(character.charCodeAt(0) - 0xfee0);
  });
}

function patientDmftValue() {
  const match = normalizeNumericText(state.dmftText).match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const value = Number(match[0]);
  return Number.isFinite(value) ? Math.max(0, Math.min(32, value)) : null;
}

function dmftReferenceForAge(age) {
  if (age === null) return null;
  return DMFT_REFERENCE_DATA.find((item) => age >= item.min && age <= item.max) ?? null;
}

function lifeStage() {
  const age = patientAgeNumber();
  if (age === null) return "adult";
  if (age <= 5) return "preschool";
  if (age <= 12) return "schoolchild";
  if (age <= 17) return "teen";
  if (age >= 65) return "senior";
  return "adult";
}

function fluorideBaseAdvice(stage) {
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

function keyPoints() {
  const ranked = scoreItems
    .map((item) => ({
      ...item,
      score: Number(state[item.key] ?? 0),
      level: scoreLevel(Number(state[item.key] ?? 0), item.max)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score / b.max - a.score / a.max || b.score - a.score)
    .slice(0, 3);

  if (ranked.length === 0) {
    return [
      "全体として低リスク側の傾向です。今のセルフケアを続けながら、定期的に確認していきましょう。",
      "検査結果は生活習慣や体調で変化します。よい状態を保つために、無理なく続けられるケアを大切にしましょう。"
    ];
  }

  return ranked.map((item) => `${item.label}は「${riskLabels[item.level]}」の傾向です。${selectedComment(item)}`);
}

function adviceList() {
  const advice = [];
  const addAdvice = (text) => {
    if (!advice.includes(text)) advice.push(text);
  };
  const stage = lifeStage();
  const needsFluorideSupport =
    state.fluorideProgram >= 2 || state.dmftExperience >= 2 || state.mutans >= 2;

  addAdvice(fluorideBaseAdvice(stage));

  if (needsFluorideSupport) {
    if (stage === "preschool" || stage === "schoolchild") {
      addAdvice("むし歯リスクが高めのため、ぶくぶくうがいが安定してできるか確認し、フッ素のうがい薬や医院でのフッ素塗布を相談しましょう。");
    } else if (stage === "senior") {
      addAdvice("歯の根元のむし歯やお口の乾きが気になる場合は、フッ素のうがい薬、医院でのフッ素塗布、保湿ケアを相談しましょう。");
    } else {
      addAdvice("むし歯リスクが高めのため、フッ素のうがい薬や医院でのフッ素塗布を生活リズムに合わせて相談しましょう。");
    }
  }

  if (state.plaque >= 2 || state.mutans >= 2) {
    if (stage === "preschool" || stage === "schoolchild") {
      addAdvice("保護者の方が奥歯、歯と歯の間、歯ぐきの近くを確認し、必要に応じて仕上げみがきやフロスを一緒に行いましょう。");
    } else {
      addAdvice("歯ブラシだけでは届きにくい歯と歯の間は、フロスや歯間ブラシを使ってからフッ素入り歯みがき剤で整えましょう。");
    }
  }

  if (state.eatingFrequency >= 2 || state.lactobacillus >= 2) {
    if (stage === "preschool" || stage === "schoolchild") {
      addAdvice("おやつや甘い飲み物は時間を決め、寝る前の歯みがき後は飲食を控えられるよう、ご家庭のリズムを整えましょう。");
    } else {
      addAdvice("間食や甘い飲み物は時間を決めて楽しみ、就寝前のセルフケア後は飲食を控える時間をつくりましょう。");
    }
  }

  if (state.salivaSecretion >= 2 || state.salivaBuffering >= 2) {
    if (stage === "senior") {
      addAdvice("唾液が少なめの傾向があるため、水分補給、よく噛む食事、お口の体操、保湿剤を無理なく取り入れましょう。");
    } else {
      addAdvice("お口が乾きやすい日は、こまめな水分補給やよく噛む食事で唾液の働きを助けましょう。洗口剤の使い方も一緒に確認できます。");
    }
  }

  if (state.systemicDisease >= 1) {
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

function guidanceTextLength() {
  return [...keyPoints(), ...adviceList()].join("").length;
}

function memoTextLength() {
  return [
    state.dmftText,
    state.medication,
    state.piPcr,
    state.fluorideText,
    state.salivaFlow,
    state.findings
  ].join("").length;
}

function highRiskCount() {
  return scoreItems.filter((item) => {
    const value = Number(state[item.key] ?? 0);
    return scoreLevel(value, item.max) === "high";
  }).length;
}

function printScaleForCurrentReport() {
  const report = document.querySelector("#report");
  const height = report?.scrollHeight || PRINT_FIT_BASE_HEIGHT;
  const heightScale = PRINT_FIT_BASE_HEIGHT / height;
  const highCount = highRiskCount();
  const textLoad = guidanceTextLength() + Math.round(memoTextLength() * 0.55);

  const riskScale =
    highCount >= 8 ? 0.88 : highCount >= 5 ? 0.92 : highCount >= 3 ? 0.96 : 1;
  const textScale =
    textLoad >= 700 ? 0.82 : textLoad >= 520 ? 0.86 : textLoad >= 380 ? 0.9 : textLoad >= 300 ? 0.96 : 1;

  return Math.max(
    PRINT_FIT_MIN_SCALE,
    Math.min(1, heightScale, riskScale, textScale)
  );
}

function applyPrintFit() {
  const scale = printScaleForCurrentReport();
  document.documentElement.style.setProperty("--print-scale", scale.toFixed(3));
  document.body.dataset.printScale = scale.toFixed(3);
}

function resetPrintFit() {
  document.documentElement.style.setProperty("--print-scale", "1");
  delete document.body.dataset.printScale;
  delete document.body.dataset.outputMode;

  if (restoreDocumentTitle) {
    restoreDocumentTitle();
  }
}

function safeFilePart(value) {
  return String(value || "未入力")
    .trim()
    .replace(/[\\/:*?"<>|#%&{}$!`'@+=]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 48) || "未入力";
}

function reportFileName() {
  const date = new Date().toISOString().slice(0, 10);
  return `唾液検査結果レポート_${safeFilePart(state.chartNumber)}_${date}`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      if (existing.dataset.loaded === "true") resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", reject);
    document.head.appendChild(script);
  });
}

function loadPdfLibraries() {
  if (window.html2canvas && window.jspdf?.jsPDF) {
    return Promise.resolve();
  }

  if (!pdfLibrariesPromise) {
    pdfLibrariesPromise = Promise.all([
      loadScript(PDF_LIBRARY_URLS.html2canvas),
      loadScript(PDF_LIBRARY_URLS.jspdf)
    ]).then(() => {
      if (!window.html2canvas || !window.jspdf?.jsPDF) {
        throw new Error("PDF library failed to initialize");
      }
    });
  }

  return pdfLibrariesPromise;
}

function setPdfBusy(isBusy) {
  document.querySelectorAll("#pdf-button, #top-pdf-button").forEach((button) => {
    button.disabled = isBusy;
    button.textContent = isBusy ? "PDF作成中..." : "PDF保存";
  });
}

async function waitForReportAssets(report) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await Promise.all(
    [...report.querySelectorAll("img")].map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

function printCssAsScreenCss() {
  let css = "";

  [...document.styleSheets].forEach((sheet) => {
    try {
      [...sheet.cssRules].forEach((rule) => {
        if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText.includes("print")) {
          css += [...rule.cssRules].map((childRule) => childRule.cssText).join("\n");
          css += "\n";
        }
      });
    } catch {
      // Cross-origin stylesheets are ignored; local app CSS is same-origin.
    }
  });

  return css;
}

async function downloadPdfReport() {
  const report = document.querySelector("#report");
  if (!report) return;

  setPdfBusy(true);
  document.body.dataset.outputMode = "pdf-download";

  try {
    await loadPdfLibraries();
    await waitForReportAssets(report);

    const printCss = printCssAsScreenCss();
    const canvas = await window.html2canvas(report, {
      backgroundColor: "#ffffff",
      logging: false,
      scale: Math.min(2, window.devicePixelRatio || 2),
      useCORS: true,
      onclone: (clonedDocument) => {
        clonedDocument.documentElement.style.setProperty("--print-scale", "1");
        const style = clonedDocument.createElement("style");
        style.textContent = `
          ${printCss}
          html,
          body {
            width: auto !important;
            min-height: auto !important;
            background: #ffffff !important;
          }
          #report {
            margin: 0 !important;
          }
        `;
        clonedDocument.head.appendChild(style);
      }
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    let imageWidth = maxWidth;
    let imageHeight = (canvas.height * imageWidth) / canvas.width;

    if (imageHeight > maxHeight) {
      imageHeight = maxHeight;
      imageWidth = (canvas.width * imageHeight) / canvas.height;
    }

    const x = (pageWidth - imageWidth) / 2;
    const y = margin;
    const imageData = canvas.toDataURL("image/jpeg", 0.98);

    pdf.addImage(imageData, "JPEG", x, y, imageWidth, imageHeight, undefined, "FAST");
    pdf.save(`${reportFileName()}.pdf`);
  } catch (error) {
    console.error(error);
    alert("PDFの直接保存に失敗しました。インターネット接続を確認するか、「印刷する」からPDF保存を選んでください。");
  } finally {
    delete document.body.dataset.outputMode;
    setPdfBusy(false);
  }
}

function prepareOutput(mode) {
  applyPrintFit();
  document.body.dataset.outputMode = mode;

  if (restoreDocumentTitle) {
    restoreDocumentTitle();
  }

  if (mode === "pdf") {
    const previousTitle = document.title || DEFAULT_DOCUMENT_TITLE;
    document.title = reportFileName();
    restoreDocumentTitle = () => {
      document.title = previousTitle;
      restoreDocumentTitle = null;
    };
  }
}

function openOutputDialog(mode) {
  prepareOutput(mode);
  requestAnimationFrame(() => window.print());
}

function printReport() {
  openOutputDialog("print");
}

function savePdfReport() {
  downloadPdfReport();
}

function renderScoreFields() {
  const groups = [...new Set(scoreItems.map((item) => item.group))];

  document.querySelector("#score-fields").innerHTML = groups
    .map((group) => {
      const items = scoreItems.filter((item) => item.group === group);

      return `
        <section class="score-group">
          <div class="score-group-head">
            <span>${group}</span>
            <small>${items.length}項目</small>
          </div>
          <div class="score-group-items">
            ${items
              .map((item) => {
                const value = Number(state[item.key] ?? 0);
                const level = scoreLevel(value, item.max);
                const buttons = Array.from({ length: item.max + 1 }, (_, score) => {
                  const isSelected = score === value;
                  const marker = scoreLabelFor(item, score);
                  return `
                    <button
                      class="score-button ${marker ? "has-marker" : ""} ${isSelected ? "selected" : ""}"
                      type="button"
                      data-key="${item.key}"
                      data-score="${score}"
                      aria-pressed="${isSelected}"
                    >
                      <span class="score-button-number">${score}</span>
                      ${
                        marker
                          ? `<span class="score-color-marker tone-${marker.tone}">${escapeHtml(marker.label)}</span>`
                          : ""
                      }
                    </button>
                  `;
                }).join("");

                return `
                  <div class="score-field ${item.scoreLabels ? "with-score-markers" : ""}">
                    <div class="score-copy">
                      <strong>${item.label}</strong>
                      <small>${item.group} / 0〜${item.max}</small>
                      <span class="score-risk-guide">
                        <b>低</b>${item.lowGuide}
                        <b>高</b>${item.highGuide}
                      </span>
                    </div>
                    <div class="score-control ${item.scoreLabels ? "has-markers" : ""}" aria-label="${item.label}のスコア">
                      ${buttons}
                    </div>
                    <em class="mini-risk risk-${level}">${riskLabels[level]}</em>
                  </div>
                `;
              })
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderPatientSummary() {
  const items = [
    ["カルテ番号", state.chartNumber || "未入力"],
    ["患者年齢", state.patientAge ? `${state.patientAge}歳` : "未入力"],
    ["担当衛生士", state.hygienistName || "未入力"]
  ];

  document.querySelector("#patient-summary").innerHTML = items
    .map(
      ([label, value]) => `
        <div class="summary-item">
          <span>${label}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");

  document.querySelector("#report-date").textContent =
    `作成日 ${new Date().toISOString().slice(0, 10)}`;
}

function renderOverall() {
  const score = totalScore();
  const max = maxScore();
  const level = levelFromRatio(score, max);
  const percent = Math.round((score / max) * 100);

  document.querySelector("#overall-card").innerHTML = `
    <p class="eyebrow">Total Caries Risk</p>
    <div class="overall-main">
      <div>
        <h3>総合カリエスリスク</h3>
        <strong class="overall-level risk-text-${level}">${riskLabels[level]}</strong>
      </div>
      <div class="score-ring">
        <span>${score}</span>
        <small>/ ${max}</small>
      </div>
    </div>
    <div class="meter" aria-hidden="true">
      <i style="width: ${percent}%"></i>
    </div>
    <p>${riskText[level]}です。食事・細菌・感受性の21点満点で見た目安です。</p>
  `;

  document.querySelector("#domain-grid").innerHTML = domainRisks()
    .map(
      (domain) => `
        <div class="domain-card">
          <span class="domain-level risk-${domain.level}">${riskLabels[domain.level]}</span>
          <h4>${domain.title}</h4>
          <p>${domain.score} / ${domain.max}</p>
          <small>${domain.note}</small>
        </div>
      `
    )
    .join("");
}

function dmftReferenceSvg(reference, patientDmft) {
  const width = 560;
  const height = 112;
  const padding = { top: 14, right: 14, bottom: 24, left: 24 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(28, patientDmft !== null ? Math.ceil(patientDmft + 2) : 28);
  const xStep = chartWidth / (DMFT_REFERENCE_DATA.length - 1);
  const x = (index) => padding.left + index * xStep;
  const y = (value) => padding.top + chartHeight - (Math.min(value, maxValue) / maxValue) * chartHeight;
  const points = DMFT_REFERENCE_DATA.map((item, index) => `${x(index).toFixed(1)},${y(item.average).toFixed(1)}`).join(" ");
  const referenceIndex = reference ? DMFT_REFERENCE_DATA.indexOf(reference) : -1;
  const referenceX = referenceIndex >= 0 ? x(referenceIndex) : null;
  const patientY = patientDmft !== null ? y(patientDmft) : null;

  return `
    <svg class="dmft-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="DMFT全国平均と今回の位置">
      <line class="dmft-axis" x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" />
      <line class="dmft-axis" x1="${padding.left}" y1="${y(10)}" x2="${width - padding.right}" y2="${y(10)}" />
      <line class="dmft-axis" x1="${padding.left}" y1="${y(20)}" x2="${width - padding.right}" y2="${y(20)}" />
      <polyline class="dmft-average-line" points="${points}" />
      ${DMFT_REFERENCE_DATA.map((item, index) => `
        <circle class="dmft-average-dot ${reference === item ? "selected" : ""}" cx="${x(index).toFixed(1)}" cy="${y(item.average).toFixed(1)}" r="${reference === item ? 4.4 : 2.4}" />
      `).join("")}
      ${
        referenceX !== null
          ? `<line class="dmft-selected-guide" x1="${referenceX.toFixed(1)}" y1="${padding.top}" x2="${referenceX.toFixed(1)}" y2="${padding.top + chartHeight}" />`
          : ""
      }
      ${
        referenceX !== null && patientY !== null
          ? `<path class="dmft-patient-marker" d="M ${referenceX.toFixed(1)} ${(patientY - 6).toFixed(1)} L ${(referenceX + 6).toFixed(1)} ${patientY.toFixed(1)} L ${referenceX.toFixed(1)} ${(patientY + 6).toFixed(1)} L ${(referenceX - 6).toFixed(1)} ${patientY.toFixed(1)} Z" />`
          : ""
      }
      <text class="dmft-axis-label" x="${padding.left}" y="${height - 5}">5歳</text>
      <text class="dmft-axis-label" x="${width - padding.right}" y="${height - 5}" text-anchor="end">85歳-</text>
      ${referenceX !== null ? `<text class="dmft-axis-label selected" x="${referenceX.toFixed(1)}" y="${height - 5}" text-anchor="middle">${escapeHtml(reference.label)}</text>` : ""}
      <text class="dmft-axis-label" x="4" y="${y(10).toFixed(1)}">10</text>
      <text class="dmft-axis-label" x="4" y="${y(20).toFixed(1)}">20</text>
    </svg>
  `;
}

function renderDmftReference() {
  const age = patientAgeNumber();
  const reference = dmftReferenceForAge(age);
  const patientDmft = patientDmftValue();
  const comparisonText =
    reference && patientDmft !== null
      ? patientDmft <= reference.average
        ? "同年代平均より低めです。今のケアを続けていきましょう。"
        : "同年代平均より高めです。過去の治療部位も含めて、再発しにくい環境づくりを意識しましょう。"
      : "年齢と紙の記入欄DMFTを入力すると、今回の位置が表示されます。";

  document.querySelector("#dmft-reference").innerHTML = `
    <div class="dmft-reference-card">
      <div class="dmft-reference-copy">
        <p class="eyebrow">DMFT Reference</p>
        <h3>日本人のDMFT平均と今回の位置</h3>
        <div class="dmft-stat-grid">
          <div>
            <span>年齢帯</span>
            <strong>${reference ? escapeHtml(reference.label) : "未判定"}</strong>
          </div>
          <div>
            <span>全国平均</span>
            <strong>${reference ? `${reference.average.toFixed(1)}本` : "-"}</strong>
          </div>
          <div>
            <span>今回のDMFT</span>
            <strong>${patientDmft !== null ? `${patientDmft.toFixed(1)}本` : "未入力"}</strong>
          </div>
        </div>
        <p class="dmft-reference-note">${escapeHtml(comparisonText)}</p>
      </div>
      <div class="dmft-chart-wrap">
        ${dmftReferenceSvg(reference, patientDmft)}
        <div class="dmft-legend">
          <span><i class="average"></i>全国平均</span>
          <span><i class="patient"></i>今回のDMFT</span>
        </div>
        <small>出典: ${DMFT_REFERENCE_SOURCE}</small>
      </div>
    </div>
  `;
}

function scoreCells(item) {
  const value = Number(state[item.key] ?? 0);
  const cells = [];

  for (let score = 0; score <= 3; score += 1) {
    if (score > item.max) {
      cells.push(`<td class="score-cell muted">-</td>`);
      continue;
    }

    cells.push(
      `<td class="score-cell ${value === score ? "selected" : ""}">
        <span class="score-cell-content">
          <span>${score}</span>
          ${
            scoreLabelFor(item, score)
              ? `<span class="score-color-marker table-marker tone-${scoreLabelFor(item, score).tone}">${escapeHtml(scoreLabelFor(item, score).label)}</span>`
              : ""
          }
        </span>
      </td>`
    );
  }

  return cells.join("");
}

function itemGuideHtml(item) {
  return `
    <div class="item-cell">
      <strong>${escapeHtml(item.label)}</strong>
      <small>${escapeHtml(item.helpText)}</small>
      <span class="report-risk-guide">
        <span><b>低</b><em>${escapeHtml(item.lowGuide)}</em></span>
        <span><b>高</b><em>${escapeHtml(item.highGuide)}</em></span>
      </span>
    </div>
  `;
}

function renderRiskTable() {
  const groupedItems = [...new Set(scoreItems.map((item) => item.group))].map((group) => ({
    group,
    items: scoreItems.filter((item) => item.group === group)
  }));

  document.querySelector("#risk-table").innerHTML = `
    <thead>
      <tr>
        <th class="group-column">分類</th>
        <th class="item-column">検査項目</th>
        <th class="score-column" colspan="4">低リスク ← スコア → 高リスク</th>
        <th class="risk-column">判定</th>
      </tr>
    </thead>
    <tbody>
      ${groupedItems
        .map(({ group, items }) => {
          return items
            .map((item, index) => {
              const value = Number(state[item.key] ?? 0);
              const level = scoreLevel(value, item.max);
              return `
                <tr>
                  ${
                    index === 0
                      ? `<td class="group-cell" rowspan="${items.length}">${escapeHtml(group)}</td>`
                      : ""
                  }
                  <td class="item-data">${itemGuideHtml(item)}</td>
                  ${scoreCells(item)}
                  <td class="risk-cell"><span class="table-risk risk-${level}">${riskLabels[level]}</span></td>
                </tr>
              `;
            })
            .join("");
        })
        .join("")}
    </tbody>
  `;
}

function renderGuidance() {
  document.querySelector("#key-points").innerHTML = keyPoints()
    .map((point) => `<li>${escapeHtml(point)}</li>`)
    .join("");

  document.querySelector("#advice-list").innerHTML = adviceList()
    .map((advice) => `<li>${escapeHtml(advice)}</li>`)
    .join("");
}

function renderMemoSummary() {
  const memoItems = [
    ["DMFT", state.dmftText],
    ["服薬", state.medication],
    ["PII / PCR", state.piPcr],
    ["フッ化物", state.fluorideText],
    ["唾液分泌量", state.salivaFlow],
    ["所見", state.findings]
  ].filter(([, value]) => String(value ?? "").trim() !== "");

  if (memoItems.length === 0) {
    document.querySelector("#memo-summary").innerHTML = "";
    document.querySelector("#memo-summary").classList.add("empty");
    return;
  }

  document.querySelector("#memo-summary").classList.remove("empty");
  document.querySelector("#memo-summary").innerHTML = `
    <div class="report-section-title">
      <p>Clinical Memo</p>
      <h3>記入メモ</h3>
    </div>
    <div class="memo-grid">
      ${memoItems
        .map(
          ([label, value]) => `
            <div>
              <span>${label}</span>
              <strong>${escapeHtml(value).replaceAll("\n", "<br>")}</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function render() {
  renderPatientSummary();
  renderOverall();
  renderDmftReference();
  renderRiskTable();
  renderGuidance();
  renderMemoSummary();
}

function bindInputs() {
  const textKeys = [
    "chartNumber",
    "patientAge",
    "hygienistName",
    "dmftText",
    "medication",
    "piPcr",
    "fluorideText",
    "salivaFlow",
    "findings"
  ];

  textKeys.forEach((key) => {
    const input = document.querySelector(`#${key}`);
    input.value = state[key];
    input.addEventListener("input", (event) => {
      state[key] = event.target.value;
      render();
    });
  });

  document.querySelector("#score-fields").addEventListener("click", (event) => {
    const button = event.target.closest("[data-key][data-score]");
    if (!button) return;

    state[button.dataset.key] = Number(button.dataset.score);
    renderScoreFields();
    render();
  });

  document.querySelector("#print-button").addEventListener("click", printReport);
  document.querySelector("#top-print-button").addEventListener("click", printReport);
  document.querySelector("#pdf-button").addEventListener("click", savePdfReport);
  document.querySelector("#top-pdf-button").addEventListener("click", savePdfReport);
  document.querySelector("#reset-button").addEventListener("click", () => {
    state = { ...initialState };
    renderScoreFields();
    textKeys.forEach((key) => {
      document.querySelector(`#${key}`).value = state[key];
    });
    render();
  });
}

window.addEventListener("beforeprint", applyPrintFit);
window.addEventListener("afterprint", resetPrintFit);

renderScoreFields();
bindInputs();
render();
