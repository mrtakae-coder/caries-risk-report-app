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

function scoreCells(score: number, max: number) {
  return Array.from({ length: 4 }, (_, value) => {
    const unavailable = value > max;

    return (
      <td
        key={value}
        className={cn(
          "w-9 border-r border-slate-100 px-2 py-1 text-center font-bold text-slate-400 print:w-7 print:px-1 print:py-0.5 print:text-[8px]",
          unavailable && "bg-slate-50 text-slate-200",
          score === value && !unavailable && "bg-[#173865] text-white"
        )}
      >
        {unavailable ? "-" : value}
      </td>
    );
  });
}

function memoItems(memo: ClinicalMemo) {
  return [
    ["DMFT", memo.dmft],
    ["服薬", memo.medication],
    ["PII / PCR", memo.piPcr],
    ["フッ素ケア", memo.fluoride],
    ["唾液分泌量", memo.salivaFlow],
    ["所見", memo.findings]
  ].filter(([, value]) => value.trim() !== "");
}

export function ResultReport({ form }: ResultReportProps) {
  const overall = calculateOverallRisk(form.scores);
  const domains = calculateDomainRisks(form.scores);
  const rows = buildResultRows(form.scores);
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
          description="数値が高い項目から、できることを一緒に整えていきましょう。"
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
                  <th className="w-14 border-r border-slate-200 px-2 py-2 print:w-10 print:px-1 print:py-1">分類</th>
                  <th className="border-r border-slate-200 px-2 py-2 text-left print:px-1 print:py-1">検査項目</th>
                  <th className="w-36 border-r border-slate-200 px-2 py-2 print:w-28 print:px-1 print:py-1" colSpan={4}>
                    低 ← スコア → 高
                  </th>
                  <th className="w-12 px-2 py-2 print:w-9 print:px-1 print:py-1">判定</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-t border-slate-100">
                    <td className="border-r border-slate-100 px-2 py-2 text-center font-bold text-slate-500 print:px-1 print:py-1">
                      {row.group}
                    </td>
                    <td className="border-r border-slate-100 px-2 py-2 font-bold text-slate-700 print:px-1 print:py-1">
                      {row.label}
                    </td>
                    {scoreCells(row.score, row.max)}
                    <td className="px-2 py-2 text-center print:px-1 print:py-1">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold print:text-[8px] ${riskPillClass[row.level]}`}>
                        {riskLabels[row.level]}
                      </span>
                    </td>
                  </tr>
                ))}
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
