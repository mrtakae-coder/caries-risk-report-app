"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import { PatientForm } from "@/components/PatientForm";
import { ResultReport } from "@/components/ResultReport";
import { defaultFormState, type ReportFormState } from "@/types/saliva";

export default function Home() {
  const [form, setForm] = useState<ReportFormState>(defaultFormState);

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
