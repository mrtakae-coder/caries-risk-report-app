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

const scoreItems = [
  {
    key: "dmftExperience",
    group: "環境",
    label: "う蝕経験（DMFT）",
    max: 3,
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
    max: 2,
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

function totalScore() {
  return scoreItems.reduce((total, item) => total + Number(state[item.key] ?? 0), 0);
}

function maxScore() {
  return scoreItems.reduce((total, item) => total + item.max, 0);
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

function patientAgeNumber() {
  const age = Number(state.patientAge);
  return Number.isFinite(age) && age >= 0 ? age : null;
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
    return "保護者の方が歯みがき剤の量を確認し、就寝前を含めて1日2回の歯みがきを一緒に行いましょう。うがいが難しい時期は軽く拭き取る方法も相談できます。";
  }

  if (stage === "schoolchild") {
    return "お子さん本人の歯みがき後に、保護者の方が奥歯や歯と歯の間を確認しましょう。就寝前はすすぎを少量の水で1回にすると、フッ素を残しやすくなります。";
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
                  return `
                    <button
                      class="score-button ${isSelected ? "selected" : ""}"
                      type="button"
                      data-key="${item.key}"
                      data-score="${score}"
                      aria-pressed="${isSelected}"
                    >
                      ${score}
                    </button>
                  `;
                }).join("");

                return `
                  <div class="score-field">
                    <div class="score-copy">
                      <strong>${item.label}</strong>
                      <small>${item.group} / 0〜${item.max}</small>
                      <span class="score-risk-guide">
                        <b>低</b>${item.lowGuide}
                        <b>高</b>${item.highGuide}
                      </span>
                    </div>
                    <div class="score-control" aria-label="${item.label}のスコア">
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
    <p>${riskText[level]}です。数値が高い項目から、できることを一緒に整えていきましょう。</p>
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

function scoreCells(item) {
  const value = Number(state[item.key] ?? 0);
  const cells = [];

  for (let score = 0; score <= 3; score += 1) {
    if (score > item.max) {
      cells.push(`<td class="score-cell muted">-</td>`);
      continue;
    }

    cells.push(
      `<td class="score-cell ${value === score ? "selected" : ""}">${score}</td>`
    );
  }

  return cells.join("");
}

function renderRiskTable() {
  document.querySelector("#risk-table").innerHTML = `
    <thead>
      <tr>
        <th>分類</th>
        <th>検査項目</th>
        <th colspan="4">低リスク ← スコア → 高リスク</th>
        <th>判定</th>
      </tr>
    </thead>
    <tbody>
      ${scoreItems
        .map((item) => {
          const value = Number(state[item.key] ?? 0);
          const level = scoreLevel(value, item.max);
          return `
            <tr>
              <td>${item.group}</td>
              <td>${item.label}</td>
              ${scoreCells(item)}
              <td><span class="table-risk risk-${level}">${riskLabels[level]}</span></td>
            </tr>
          `;
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

  document.querySelector("#print-button").addEventListener("click", () => window.print());
  document.querySelector("#top-print-button").addEventListener("click", () => window.print());
  document.querySelector("#reset-button").addEventListener("click", () => {
    state = { ...initialState };
    renderScoreFields();
    textKeys.forEach((key) => {
      document.querySelector(`#${key}`).value = state[key];
    });
    render();
  });
}

renderScoreFields();
bindInputs();
render();
