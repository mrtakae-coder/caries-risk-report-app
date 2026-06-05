"use client";

import { CalendarDays, ClipboardList, Printer, RotateCcw, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  defaultFormState,
  scoreDefinitions,
  type CariesScoreKey,
  type ClinicalMemo,
  type PatientInfo,
  type ReportFormState
} from "@/types/saliva";
import { getItemRiskLevel } from "@/lib/riskLogic";

type PatientFormProps = {
  form: ReportFormState;
  onChange: (form: ReportFormState) => void;
};

const memoFields: Array<{ key: keyof ClinicalMemo; label: string; placeholder: string }> = [
  { key: "dmft", label: "DMFT", placeholder: "例）2" },
  { key: "medication", label: "服薬・種類", placeholder: "例）なし" },
  { key: "piPcr", label: "PII / PCR", placeholder: "例）PCR 18%" },
  { key: "fluoride", label: "フッ化物", placeholder: "例）歯磨剤使用" },
  { key: "salivaFlow", label: "唾液分泌量", placeholder: "例）1.2 ml/分" }
];

const riskToneClass = {
  low: "bg-mist-100 text-mist-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-blossom-100 text-rose-700"
};

const riskLabel = {
  low: "低",
  medium: "中",
  high: "高"
};

function clampScore(value: string, max: number) {
  const numeric = Math.round(Number(value || 0));
  return Math.max(0, Math.min(max, Number.isNaN(numeric) ? 0 : numeric));
}

export function PatientForm({ form, onChange }: PatientFormProps) {
  const updatePatient = (key: keyof PatientInfo, value: string) => {
    onChange({
      ...form,
      patient: {
        ...form.patient,
        [key]: value
      }
    });
  };

  const updateScore = (key: CariesScoreKey, value: string, max: number) => {
    onChange({
      ...form,
      scores: {
        ...form.scores,
        [key]: clampScore(value, max)
      }
    });
  };

  const updateMemo = (key: keyof ClinicalMemo, value: string) => {
    onChange({
      ...form,
      memo: {
        ...form.memo,
        [key]: value
      }
    });
  };

  return (
    <Card className="no-print sticky top-6 overflow-hidden border-skywash-100/80 bg-white/90 backdrop-blur">
      <CardHeader className="border-b border-skywash-100 bg-gradient-to-br from-skywash-50 to-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>レポート入力</CardTitle>
            <CardDescription>
              カリエスリスク表の数値を入力すると、右側のA4レポートへすぐ反映されます。
            </CardDescription>
          </div>
          <div className="rounded-full bg-mist-100 p-3 text-mist-700">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-7">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CalendarDays className="h-4 w-4 text-skywash-700" aria-hidden="true" />
            患者情報
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chart-number">カルテ番号</Label>
              <Input
                id="chart-number"
                value={form.patient.chartNumber}
                onChange={(event) => updatePatient("chartNumber", event.target.value)}
                placeholder="例）000123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hygienist-name">担当衛生士</Label>
              <Input
                id="hygienist-name"
                value={form.patient.hygienistName}
                onChange={(event) => updatePatient("hygienistName", event.target.value)}
                placeholder="例）佐藤"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-1 h-4 w-4 text-skywash-700" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">カリエスリスク表スコア</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                0が低リスク側、数字が大きいほど注意したいポイントとして判定します。
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {scoreDefinitions.map((definition) => {
              const level = getItemRiskLevel(definition.key, form.scores);

              return (
                <div
                  key={definition.key}
                  className="grid grid-cols-[1fr_76px_44px] items-center gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div>
                    <Label htmlFor={definition.key}>{definition.label}</Label>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {definition.group} / 0〜{definition.max}・{definition.helpText}
                    </p>
                  </div>
                  <Input
                    id={definition.key}
                    type="number"
                    min={0}
                    max={definition.max}
                    step={1}
                    value={form.scores[definition.key]}
                    onChange={(event) => updateScore(definition.key, event.target.value, definition.max)}
                    className="text-center font-bold"
                  />
                  <span className={`rounded-full px-3 py-2 text-center text-sm font-bold ${riskToneClass[level]}`}>
                    {riskLabel[level]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800">紙の記入欄</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {memoFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  value={form.memo[field.key]}
                  onChange={(event) => updateMemo(field.key, event.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="findings">その他・所見など</Label>
              <textarea
                id="findings"
                value={form.memo.findings}
                onChange={(event) => updateMemo("findings", event.target.value)}
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-skywash-600 focus:ring-4 focus:ring-skywash-100"
                placeholder="必要に応じて入力"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" className="flex-1" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            印刷する
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onChange(defaultFormState)}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            初期値に戻す
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
