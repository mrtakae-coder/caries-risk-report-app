"use client";

import { ResultChart } from "@/components/ResultChart";
import { RiskCard } from "@/components/RiskCard";
import { buildResultRows, getCareAdvice, getKeyPoints } from "@/lib/commentGenerator";
import { calculateDomainRisks, calculateOverallRisk } from "@/lib/riskLogic";
import { cn } from "@/lib/utils";
import { riskLabels, type ClinicalMemo, type ReportFormState, type RiskLevel } from "@/types/saliva";

type ResultReportProps = {
  form: ReportFormState;
};

const riskPillClass: Record<RiskLevel, string> = {
  low: "bg-mist-100 text-mist-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-blossom-100 text-rose-700"
};

const scoreToneClass = {
  quickBlue: "border-sky-300 bg-sky-100 text-sky-800",
  slowBlue: "border-cyan-300 bg-cyan-50 text-cyan-800",
  green: "border-emerald-300 bg-emerald-100 text-emerald-800",
  yellow: "border-amber-300 bg-amber-100 text-amber-800"
};

const colonyDots = [
  [24, 24, 1.8, 0.8],
  [39, 20, 1.5, 0.65],
  [32, 29, 1.4, 0.72],
  [47, 27, 1.7, 0.78],
  [18, 31, 1.3, 0.58],
  [51, 18, 1.2, 0.56],
  [29, 17, 1.2, 0.5],
  [42, 33, 1.4, 0.66],
  [21, 18, 1.2, 0.52],
  [55, 30, 1.3, 0.62],
  [34, 35, 1.6, 0.74],
  [15, 24, 1.2, 0.5],
  [46, 13, 1.3, 0.62],
  [28, 38, 1.1, 0.52],
  [59, 23, 1.2, 0.5],
  [37, 14, 1.1, 0.54],
  [23, 34, 1.2, 0.55],
  [50, 36, 1.1, 0.52],
  [17, 14, 1.1, 0.48],
  [57, 15, 1.1, 0.48],
  [31, 22, 2.1, 0.85],
  [44, 24, 2.2, 0.88],
  [36, 27, 2.0, 0.82],
  [26, 28, 1.9, 0.78],
  [53, 26, 1.9, 0.8],
  [40, 38, 1.8, 0.72],
  [22, 12, 1.6, 0.65],
  [60, 34, 1.7, 0.7],
  [13, 31, 1.5, 0.62],
  [48, 40, 1.5, 0.62],
  [33, 11, 1.4, 0.6],
  [55, 10, 1.3, 0.55],
  [12, 19, 1.3, 0.55],
  [62, 21, 1.2, 0.52]
] as const;

const colonyDotCounts = [1, 7, 17, 34] as const;

function ColonyPlate({ score, compact = false }: { score: number; compact?: boolean }) {
  return (
    <svg viewBox="0 0 74 50" aria-hidden="true" focusable="false" className={compact ? "h-8 w-12 print:h-[8.1mm] print:w-[12mm]" : "h-10 w-14"}>
      <ellipse cx={37} cy={42} rx={26} ry={3.6} fill="rgba(5,12,25,0.18)" />
      <ellipse cx={37} cy={25} rx={30} ry={19} fill="#0a1020" stroke="#1f2f4a" strokeWidth={1.5} />
      <ellipse cx={37} cy={25} rx={25} ry={15} fill="#050914" stroke="rgba(96,165,250,0.48)" />
      {score === 3 ? (
        <path
          d="M18 28c5-9 18-13 29-10 8 2 13 7 12 12-2 7-13 9-24 8-9-1-19-3-17-10Z"
          fill="rgba(56,189,248,0.2)"
        />
      ) : null}
      {colonyDots.slice(0, colonyDotCounts[score as 0 | 1 | 2 | 3] ?? colonyDotCounts[0]).map(([cx, cy, radius, opacity], index) => (
        <circle key={`${score}-${index}`} cx={cx} cy={cy} r={radius} opacity={opacity} fill="#38bdf8" />
      ))}
    </svg>
  );
}

const dmftReferenceSource = "厚生労働省 令和6年歯科疾患実態調査 表9・10";
const dmftReferenceData = [
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

function formatDate(date: string) {
  if (!date) return "未入力";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parsed);
}

function scoreCells(
  key: string,
  score: number,
  max: number,
  scoreLabels?: Array<{ score: number; label: string; tone: keyof typeof scoreToneClass }>,
  scoreRanges?: Array<{ score: number; lines: [string, string] }>
) {
  const showsColonies = key === "lactobacillus";

  return Array.from({ length: 4 }, (_, value) => {
    const unavailable = value > max;
    const marker = scoreLabels?.find((item) => item.score === value);
    const range = scoreRanges?.find((item) => item.score === value);

    return (
      <td
        key={value}
        className={cn(
          "w-10 border-r border-slate-100 px-2 py-1 text-center font-bold text-slate-400 print:w-[9.6mm] print:px-0.5 print:py-0.5 print:text-[8px]",
          unavailable && "bg-slate-50 text-slate-200",
          score === value && !unavailable && "bg-[#173865] text-white"
        )}
      >
        {unavailable ? (
          "-"
        ) : (
          <span className="grid justify-items-center gap-0.5">
            {showsColonies ? <ColonyPlate score={value} compact /> : null}
            <span>{value}</span>
            {marker && !showsColonies ? (
              <span
                className={`inline-flex max-w-[48px] items-center justify-center whitespace-nowrap rounded-full border px-1 py-0.5 text-[8.5px] font-black leading-none print:max-w-[9.2mm] print:px-[0.5mm] print:py-[0.2mm] print:text-[5pt] ${scoreToneClass[marker.tone]}`}
              >
                {marker.label}
              </span>
            ) : null}
            {range ? (
              <span
                className={cn(
                  "block max-w-[34px] text-center text-[7px] font-black leading-none text-slate-500 print:max-w-[10mm] print:text-[4.3pt]",
                  score === value && "text-white/85"
                )}
              >
                {range.lines[0]}
                <br />
                {range.lines[1]}
              </span>
            ) : null}
          </span>
        )}
      </td>
    );
  });
}

function memoItems(memo: ClinicalMemo) {
  return [
    ["DMFT", memo.dmft],
    ["服薬", memo.medication],
    ["PII / PCR", memo.piPcr],
    ["フッ化物", memo.fluoride],
    ["唾液分泌量", memo.salivaFlow],
    ["所見", memo.findings]
  ].filter(([, value]) => value.trim() !== "");
}

function normalizeNumericText(value: string) {
  return value.replace(/[０-９．]/g, (character) => {
    if (character === "．") return ".";
    return String.fromCharCode(character.charCodeAt(0) - 0xfee0);
  });
}

function parsePositiveNumber(value: string) {
  const match = normalizeNumericText(value).match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(32, parsed)) : null;
}

function parsePatientAge(age: string) {
  const parsed = Number(age);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function dmftReferenceForAge(age: string) {
  const parsed = parsePatientAge(age);
  if (parsed === null) return null;
  return dmftReferenceData.find((item) => parsed >= item.min && parsed <= item.max) ?? null;
}

function groupResultRows(rows: ReturnType<typeof buildResultRows>) {
  return rows.reduce<Array<{ group: string; rows: ReturnType<typeof buildResultRows> }>>((groups, row) => {
    const currentGroup = groups[groups.length - 1];

    if (currentGroup?.group === row.group) {
      currentGroup.rows.push(row);
      return groups;
    }

    groups.push({ group: row.group, rows: [row] });
    return groups;
  }, []);
}

function DmftReferenceCard({ form }: ResultReportProps) {
  const reference = dmftReferenceForAge(form.patient.age);
  const patientDmft = parsePositiveNumber(form.memo.dmft);
  const comparisonText =
    reference && patientDmft !== null
      ? patientDmft <= reference.average
        ? "同年代平均より低めです。今のケアを続けていきましょう。"
        : "同年代平均より高めです。過去の治療部位も含めて、再発しにくい環境づくりを意識しましょう。"
      : "";
  const width = 420;
  const height = 156;
  const padding = { top: 18, right: 18, bottom: 30, left: 34 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const highestAverage = Math.max(...dmftReferenceData.map((item) => item.average));
  const highestValue = Math.max(highestAverage, patientDmft !== null ? patientDmft : 0);
  const maxValue = Math.max(24, Math.min(32, Math.ceil((highestValue + 1) / 4) * 4));
  const gridValues = [0, Math.round(maxValue / 2), maxValue];
  const xStep = chartWidth / (dmftReferenceData.length - 1);
  const x = (index: number) => padding.left + index * xStep;
  const y = (value: number) => padding.top + chartHeight - (Math.min(value, maxValue) / maxValue) * chartHeight;
  const pointPairs = dmftReferenceData.map((item, index) => ({
    x: x(index),
    y: y(item.average)
  }));
  const points = pointPairs.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const areaPath = [
    `M ${pointPairs[0].x.toFixed(1)} ${(padding.top + chartHeight).toFixed(1)}`,
    ...pointPairs.map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`),
    `L ${pointPairs[pointPairs.length - 1].x.toFixed(1)} ${(padding.top + chartHeight).toFixed(1)}`,
    "Z"
  ].join(" ");
  const referenceIndex = reference ? dmftReferenceData.indexOf(reference) : -1;
  const referenceX = referenceIndex >= 0 ? x(referenceIndex) : null;
  const patientY = patientDmft !== null ? y(patientDmft) : null;

  return (
    <section className="border-t border-slate-100 bg-slate-50/40 px-7 py-5 print:px-0 print:py-3">
      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/95 p-4 print:grid-cols-[0.9fr_1.1fr] print:gap-3 print:rounded-xl print:p-3 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#173865] print:text-[7px]">
            DMFT Reference
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 print:text-[12px]">
            日本人のDMFT平均と今回の位置
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2 print:mt-2 print:gap-1.5">
            {[
              ["年齢帯", reference?.label ?? "未判定"],
              ["全国平均", reference ? `${reference.average.toFixed(1)}本` : "-"],
              ["今回のDMFT", patientDmft !== null ? `${patientDmft.toFixed(1)}本` : "未入力"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-2 print:rounded-lg print:p-1.5">
                <p className="text-[10px] font-bold text-slate-500 print:text-[5.5pt]">{label}</p>
                <p className="mt-0.5 text-sm font-black text-[#173865] print:text-[8.2pt]">{value}</p>
              </div>
            ))}
          </div>
          {comparisonText ? (
            <p className="mt-3 text-xs font-bold leading-5 text-slate-600 print:mt-2 print:text-[6.4pt] print:leading-tight">
              {comparisonText}
            </p>
          ) : null}
        </div>
        <div className="grid min-w-0 justify-items-center gap-1.5">
          <svg className="h-[152px] w-full max-w-[430px] overflow-visible print:h-[20mm] print:max-w-[58mm]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="DMFT全国平均と今回の位置">
            <rect x={1} y={1} width={width - 2} height={height - 2} rx={18} fill="rgba(248,252,253,0.92)" stroke="rgba(221,233,239,0.9)" />
            {gridValues.map((value) => (
              <g key={value}>
                <line x1={padding.left} y1={y(value)} x2={width - padding.right} y2={y(value)} stroke="#e7eef3" />
                <text x={padding.left - 8} y={y(value) + 3} textAnchor="end" fill="#8b98a8" fontSize={8} fontWeight={800}>
                  {value}
                </text>
              </g>
            ))}
            <line x1={padding.left} y1={padding.top + chartHeight} x2={width - padding.right} y2={padding.top + chartHeight} stroke="#cfdde6" strokeWidth={1.2} />
            <path d={areaPath} fill="rgba(107,135,157,0.11)" />
            <polyline points={points} fill="none" stroke="#6b879d" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
            {dmftReferenceData.map((item, index) => (
              <circle
                key={item.label}
                cx={x(index)}
                cy={y(item.average)}
                r={reference === item ? 4.7 : 2.5}
                fill={reference === item ? "#dff5e7" : "#fff"}
                stroke={reference === item ? "#2f7a66" : "#6b879d"}
                strokeWidth={reference === item ? 2.5 : 2}
              />
            ))}
            {referenceX !== null ? (
              <line x1={referenceX} y1={padding.top} x2={referenceX} y2={padding.top + chartHeight} stroke="rgba(23,56,101,0.18)" strokeDasharray="4 4" />
            ) : null}
            {referenceX !== null && patientY !== null ? (
              <path
                d={`M ${referenceX.toFixed(1)} ${(patientY - 5.5).toFixed(1)} L ${(referenceX + 5.5).toFixed(1)} ${patientY.toFixed(1)} L ${referenceX.toFixed(1)} ${(patientY + 5.5).toFixed(1)} L ${(referenceX - 5.5).toFixed(1)} ${patientY.toFixed(1)} Z`}
                fill="#d8b260"
                stroke="#8c6420"
                strokeWidth={1.8}
              />
            ) : null}
            <text x={padding.left} y={height - 5} fill="#6c7a8c" fontSize={9} fontWeight={800}>5歳</text>
            <text x={width - padding.right} y={height - 5} textAnchor="end" fill="#6c7a8c" fontSize={9} fontWeight={800}>85歳-</text>
            {referenceX !== null ? (
              <text x={referenceX} y={height - 5} textAnchor="middle" fill="#173865" fontSize={10} fontWeight={900}>
                {reference?.label}
              </text>
            ) : null}
            <text x={5} y={15} fill="#8b98a8" fontSize={8} fontWeight={800}>本</text>
          </svg>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 print:gap-1.5 print:text-[5.8pt]">
            <span className="inline-flex items-center gap-1"><i className="h-1.5 w-3 rounded-full bg-[#6b879d]" />全国平均</span>
            <span className="inline-flex items-center gap-1"><i className="h-1.5 w-3 rounded-full bg-[#d8b260]" />今回のDMFT</span>
          </div>
          <p className="text-[9px] font-semibold text-slate-500 print:text-[5.3pt]">出典: {dmftReferenceSource}</p>
        </div>
      </div>
    </section>
  );
}

export function ResultReport({ form }: ResultReportProps) {
  const overall = calculateOverallRisk(form.scores);
  const domains = calculateDomainRisks(form.scores);
  const rows = buildResultRows(form.scores);
  const groupedRows = groupResultRows(rows);
  const keyPoints = getKeyPoints(form.scores);
  const advice = getCareAdvice(form.scores, form.patient.age);
  const memos = memoItems(form.memo);
  const createdDate = formatDate(new Date().toISOString().slice(0, 10));

  return (
    <article className="report-page mx-auto max-w-5xl overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-soft print:max-w-none print:rounded-none print:border-0 print:shadow-none">
      <div className="h-2 bg-[linear-gradient(90deg,#173865,#6b879d_55%,#d8b68a)] print:h-[3mm]" />
      <header className="flex flex-col gap-4 bg-gradient-to-br from-skywash-50 via-white to-white px-7 py-6 print:flex-row print:items-start print:justify-between print:bg-white print:px-0 print:py-4">
        <div className="flex items-center gap-4 print:gap-3">
          <img
            src="/abundance-logo.png"
            alt="アバンダンスデンタル名古屋ロゴ"
            className="h-16 w-16 object-contain print:h-12 print:w-12"
          />
          <div>
            <p className="text-xs font-black tracking-[0.12em] text-slate-500 print:text-[8px]">
              ABUNDANCE DENTAL NAGOYA
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-900 print:text-2xl">
              唾液検査結果レポート
            </h1>
          </div>
        </div>
        <p className="text-sm font-bold text-slate-500 print:text-[9px]">
          作成日 {createdDate}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 border-t border-slate-100 px-7 py-4 sm:grid-cols-3 print:grid-cols-3 print:px-0 print:py-3">
        {[
          ["カルテ番号", form.patient.chartNumber || "未入力"],
          ["患者年齢", form.patient.age ? `${form.patient.age}歳` : "未入力"],
          ["担当衛生士", form.patient.hygienistName || "未入力"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 print:rounded-lg print:p-2">
            <p className="text-xs font-bold text-slate-500 print:text-[7px]">{label}</p>
            <p className="mt-1 text-base font-bold text-slate-800 print:text-[10px]">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 border-t border-slate-100 px-7 py-5 lg:grid-cols-[0.95fr_1.4fr] print:grid-cols-[0.95fr_1.4fr] print:gap-3 print:px-0 print:py-3">
        <RiskCard
          title={overall.title}
          level={overall.level}
          description="食事・細菌・感受性の21点満点で見た目安です。"
          scoreLabel={`${overall.score} / ${overall.max}`}
        />
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
          {domains.map((domain) => (
            <RiskCard
              key={domain.title}
              title={domain.title}
              level={domain.level}
              description={domain.description}
              scoreLabel={`${domain.score} / ${domain.max}`}
            />
          ))}
        </div>
      </section>

      <DmftReferenceCard form={form} />

      <section className="grid gap-4 border-t border-slate-100 px-7 py-5 lg:grid-cols-[1.25fr_0.75fr] print:grid-cols-[1.28fr_0.72fr] print:gap-3 print:px-0 print:py-3">
        <div>
          <div className="mb-3 print:mb-2">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#173865] print:text-[7px]">
              Score Sheet
            </p>
            <h2 className="text-lg font-bold text-slate-900 print:text-[12px]">カリエスリスク表</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 print:rounded-lg">
            <table className="w-full table-fixed border-collapse bg-white text-xs print:text-[8px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="w-14 border-r border-slate-200 px-2 py-2 print:w-9 print:px-1 print:py-1">分類</th>
                  <th className="border-r border-slate-200 px-2 py-2 text-left print:px-1 print:py-1">検査項目</th>
                  <th className="w-32 border-r border-slate-200 px-2 py-2 print:w-24 print:px-1 print:py-1" colSpan={4}>
                    低 ← スコア → 高
                  </th>
                  <th className="w-12 px-2 py-2 print:w-8 print:px-1 print:py-1">判定</th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map((group) =>
                  group.rows.map((row, index) => (
                    <tr key={row.key} className="border-t border-slate-100">
                      {index === 0 ? (
                        <td
                          rowSpan={group.rows.length}
                          className="align-middle border-r border-slate-100 bg-slate-50/60 px-2 py-2 text-center font-bold text-slate-500 print:px-1 print:py-1"
                        >
                          {group.group}
                        </td>
                      ) : null}
                      <td className="border-r border-slate-100 px-2 py-2 text-left print:px-1 print:py-1">
                        <span className="block text-[13.5px] font-black leading-[1.18] text-slate-800 print:text-[7.7px] print:leading-[1.08]">
                          {row.label}
                        </span>
                        <span className="mt-1 block text-[9.5px] font-bold leading-[1.32] text-slate-500 print:mt-0.5 print:text-[5.4px] print:leading-[1.12]">
                          {row.helpText}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 text-[11.5px] font-black leading-[1.25] text-slate-700 print:mt-0.5 print:gap-x-1 print:gap-y-0 print:text-[6.25px] print:leading-[1.1]">
                          <span className="inline-flex items-center gap-1 print:gap-0.5">
                            <b className="inline-flex min-h-5 min-w-6 items-center justify-center rounded-full bg-mist-100 px-1 text-[11px] text-mist-700 print:min-h-3 print:min-w-4 print:text-[6px]">
                              低
                            </b>
                            <em className="not-italic text-[#26374c]">{row.lowGuide}</em>
                          </span>
                          <span className="inline-flex items-center gap-1 print:gap-0.5">
                            <b className="inline-flex min-h-5 min-w-6 items-center justify-center rounded-full bg-blossom-100 px-1 text-[11px] text-rose-700 print:min-h-3 print:min-w-4 print:text-[6px]">
                              高
                            </b>
                            <em className="not-italic text-[#26374c]">{row.highGuide}</em>
                          </span>
                        </span>
                      </td>
                      {scoreCells(row.key, row.score, row.max, row.scoreLabels, row.scoreRanges)}
                      <td className="px-2 py-2 text-center print:px-1 print:py-1">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold print:text-[8px] ${riskPillClass[row.level]}`}>
                          {riskLabels[row.level]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-3 print:mb-2">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#173865] print:text-[7px]">
              Score Chart
            </p>
            <h2 className="text-lg font-bold text-slate-900 print:text-[12px]">スコア分布</h2>
          </div>
          <ResultChart scores={form.scores} />
        </div>
      </section>

      <section className="grid gap-4 border-t border-slate-100 px-7 py-5 lg:grid-cols-2 print:grid-cols-2 print:gap-3 print:px-0 print:py-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 print:rounded-lg print:p-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#173865] print:text-[7px]">
            Key Points
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 print:text-[12px]">今回のポイント</h2>
          <ul className="mt-3 space-y-2 print:mt-2 print:space-y-1">
            {keyPoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm leading-6 text-slate-600 print:text-[8px] print:leading-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#173865] print:mt-1 print:h-1.5 print:w-1.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-4 print:rounded-lg print:p-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#173865] print:text-[7px]">
            Home Care
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 print:text-[12px]">今日からできるケア</h2>
          <ul className="mt-3 space-y-2 print:mt-2 print:space-y-1">
            {advice.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600 print:text-[8px] print:leading-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#173865] print:mt-1 print:h-1.5 print:w-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {memos.length > 0 ? (
        <section className="border-t border-slate-100 px-7 py-4 print:px-0 print:py-2">
          <div className="grid gap-2 sm:grid-cols-3 print:grid-cols-3">
            {memos.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 print:rounded-lg print:p-2">
                <p className="text-xs font-bold text-slate-500 print:text-[7px]">{label}</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-700 print:text-[8px] print:leading-4">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="border-t border-slate-100 bg-slate-50/70 px-7 py-4 text-xs leading-5 text-slate-500 print:px-0 print:py-2 print:text-[7.5px] print:leading-4">
        検査結果は現在のお口の傾向を知るための目安です。診断を断定するものではありません。
        気になる点は担当衛生士と一緒に確認し、できることから整えていきましょう。
      </footer>
    </article>
  );
}
