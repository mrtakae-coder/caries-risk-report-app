"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

import { PatientForm } from "@/components/PatientForm";
import { ResultReport } from "@/components/ResultReport";
import { getCareAdvice, getKeyPoints } from "@/lib/commentGenerator";
import { getItemRiskLevel } from "@/lib/riskLogic";
import { defaultFormState, scoreDefinitions, type ReportFormState } from "@/types/saliva";

const PRINT_FIT_BASE_HEIGHT = 1800;
const PRINT_FIT_MIN_SCALE = 0.78;

function getMemoLength(form: ReportFormState) {
  return Object.values(form.memo).join("").length;
}

function getHighRiskCount(form: ReportFormState) {
  return scoreDefinitions.filter((definition) =>
    getItemRiskLevel(definition.key, form.scores) === "high"
  ).length;
}

function getGuidanceLength(form: ReportFormState) {
  return [...getKeyPoints(form.scores), ...getCareAdvice(form.scores, form.patient.age)].join("").length;
}

function calculatePrintScale(form: ReportFormState) {
  const report = document.querySelector<HTMLElement>(".report-page");
  const height = report?.scrollHeight || PRINT_FIT_BASE_HEIGHT;
  const heightScale = PRINT_FIT_BASE_HEIGHT / height;
  const highCount = getHighRiskCount(form);
  const textLoad = getGuidanceLength(form) + Math.round(getMemoLength(form) * 0.55);

  const riskScale =
    highCount >= 8 ? 0.88 : highCount >= 5 ? 0.92 : highCount >= 3 ? 0.96 : 1;
  const textScale =
    textLoad >= 700 ? 0.82 : textLoad >= 520 ? 0.86 : textLoad >= 380 ? 0.9 : textLoad >= 300 ? 0.96 : 1;

  return Math.max(
    PRINT_FIT_MIN_SCALE,
    Math.min(1, heightScale, riskScale, textScale)
  );
}

export default function Home() {
  const [form, setForm] = useState<ReportFormState>(defaultFormState);

  useEffect(() => {
    const applyPrintFit = () => {
      const scale = calculatePrintScale(form);
      document.documentElement.style.setProperty("--print-scale", scale.toFixed(3));
      document.body.dataset.printScale = scale.toFixed(3);
    };
    const resetPrintFit = () => {
      document.documentElement.style.setProperty("--print-scale", "1");
      delete document.body.dataset.printScale;
    };

    window.addEventListener("beforeprint", applyPrintFit);
    window.addEventListener("afterprint", resetPrintFit);

    return () => {
      window.removeEventListener("beforeprint", applyPrintFit);
      window.removeEventListener("afterprint", resetPrintFit);
    };
  }, [form]);

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f6fbfb_0%,#f5fbff_42%,#fff7f8_100%)] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="no-print mx-auto mb-7 max-w-7xl">
        <div className="rounded-[36px] border border-white/80 bg-white/75 p-6 shadow-soft backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <img
                  src="/abundance-logo.png"
                  alt="アバンダンスデンタル名古屋ロゴ"
                  className="h-12 w-12 object-contain"
                />
                <p className="text-xs font-black tracking-[0.12em] text-[#173865]">
                  アバンダンスデンタル名古屋
                </p>
              </div>
              <h1 className="text-3xl font-bold tracking-normal text-slate-900 sm:text-4xl">
                唾液検査結果レポート作成
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                カリエスリスク表の数値をもとに、患者さんにやさしく伝わる唾液検査結果レポートを自動生成します。
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-[24px] bg-white p-4 text-sm text-slate-600 shadow-card">
              <FileText className="h-5 w-5 text-skywash-700" aria-hidden="true" />
              A4 1枚印刷・PDF保存を想定
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[420px_1fr]">
        <PatientForm form={form} onChange={setForm} />
        <ResultReport form={form} />
      </div>
    </main>
  );
}
