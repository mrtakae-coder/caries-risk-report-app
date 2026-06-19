"use client";

import { useState } from "react";
import { CalendarDays, ClipboardList, Download, Printer, RotateCcw, UserRound } from "lucide-react";

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

type PdfWindow = Window &
  typeof globalThis & {
    html2canvas?: (
      element: HTMLElement,
      options?: {
        backgroundColor?: string;
        logging?: boolean;
        scale?: number;
        useCORS?: boolean;
        onclone?: (document: Document) => void;
      }
    ) => Promise<HTMLCanvasElement>;
    jspdf?: {
      jsPDF: new (options: { orientation: "portrait"; unit: "mm"; format: "a4" }) => {
        addImage: (
          imageData: string,
          format: "JPEG" | "PNG",
          x: number,
          y: number,
          width: number,
          height: number,
          alias?: string,
          compression?: "FAST"
        ) => void;
        save: (filename: string) => void;
      };
    };
  };

const PDF_LIBRARY_URLS = {
  html2canvas: "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
  jspdf: "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"
};
const PDF_RENDER_SCALE = 4;

let pdfLibrariesPromise: Promise<void> | null = null;

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

type ColonyVariant = "lactobacillus" | "mutans";

function colonyVariantForKey(key: CariesScoreKey): ColonyVariant | null {
  if (key === "lactobacillus") return "lactobacillus";
  if (key === "mutans") return "mutans";
  return null;
}

function ColonyPlate({ score, variant = "lactobacillus" }: { score: number; variant?: ColonyVariant }) {
  const isMutans = variant === "mutans";

  return (
    <svg viewBox="0 0 74 50" aria-hidden="true" focusable="false" className="h-10 w-14">
      <ellipse cx={37} cy={42} rx={26} ry={3.6} fill="rgba(5,12,25,0.18)" />
      <ellipse
        cx={37}
        cy={25}
        rx={30}
        ry={19}
        fill={isMutans ? "#ffffff" : "#0a1020"}
        stroke={isMutans ? "#bfdbfe" : "#1f2f4a"}
        strokeWidth={1.5}
      />
      <ellipse
        cx={37}
        cy={25}
        rx={25}
        ry={15}
        fill={isMutans ? "#ffffff" : "#050914"}
        stroke={isMutans ? "rgba(37,99,235,0.38)" : "rgba(96,165,250,0.48)"}
      />
      {score === 3 ? (
        <path
          d="M18 28c5-9 18-13 29-10 8 2 13 7 12 12-2 7-13 9-24 8-9-1-19-3-17-10Z"
          fill={isMutans ? "rgba(56,189,248,0.1)" : "rgba(56,189,248,0.2)"}
        />
      ) : null}
      {colonyDots.slice(0, colonyDotCounts[score as 0 | 1 | 2 | 3] ?? colonyDotCounts[0]).map(([cx, cy, radius, opacity], index) => (
        <circle key={`${score}-${index}`} cx={cx} cy={cy} r={radius} opacity={opacity} fill="#38bdf8" />
      ))}
    </svg>
  );
}

function clampScore(value: string, max: number) {
  const numeric = Math.round(Number(value || 0));
  return Math.max(0, Math.min(max, Number.isNaN(numeric) ? 0 : numeric));
}

function safeFilePart(value: string) {
  return (value || "未入力")
    .trim()
    .replace(/[\\/:*?"<>|#%&{}$!`'@+=]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 48) || "未入力";
}

function reportFileName(form: ReportFormState) {
  const date = new Date().toISOString().slice(0, 10);
  return `唾液検査結果レポート_${safeFilePart(form.patient.chartNumber)}_${date}`;
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", reject, { once: true });
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
  const browserWindow = window as PdfWindow;
  if (browserWindow.html2canvas && browserWindow.jspdf?.jsPDF) return Promise.resolve();

  pdfLibrariesPromise ??= Promise.all([
    loadScript(PDF_LIBRARY_URLS.html2canvas),
    loadScript(PDF_LIBRARY_URLS.jspdf)
  ]).then(() => {
    if (!browserWindow.html2canvas || !browserWindow.jspdf?.jsPDF) {
      throw new Error("PDF library failed to initialize");
    }
  });

  return pdfLibrariesPromise;
}

async function waitForReportAssets(report: HTMLElement) {
  await document.fonts?.ready;

  await Promise.all(
    [...report.querySelectorAll("img")].map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    })
  );
}

function printCssAsScreenCss() {
  let css = "";

  [...document.styleSheets].forEach((sheet) => {
    try {
      [...sheet.cssRules].forEach((rule) => {
        if (rule.type === CSSRule.MEDIA_RULE && (rule as CSSMediaRule).conditionText.includes("print")) {
          css += [...(rule as CSSMediaRule).cssRules].map((childRule) => childRule.cssText).join("\n");
          css += "\n";
        }
      });
    } catch {
      // Cross-origin stylesheets are ignored; app CSS is same-origin.
    }
  });

  return css;
}

async function savePdfReport(form: ReportFormState) {
  const report = document.querySelector<HTMLElement>(".report-page");
  if (!report) return;

  const browserWindow = window as PdfWindow;
  document.body.dataset.outputMode = "pdf-download";

  try {
    await loadPdfLibraries();
    await waitForReportAssets(report);

    const canvas = await browserWindow.html2canvas?.(report, {
      backgroundColor: "#ffffff",
      logging: false,
      scale: PDF_RENDER_SCALE,
      useCORS: true,
      onclone: (clonedDocument) => {
        clonedDocument.documentElement.style.setProperty("--print-scale", "1");
        const style = clonedDocument.createElement("style");
        style.textContent = `
          ${printCssAsScreenCss()}
          html,
          body,
          main {
            width: auto !important;
            min-height: auto !important;
            background: #ffffff !important;
          }
          .report-page {
            margin: 0 !important;
          }
        `;
        clonedDocument.head.appendChild(style);
      }
    });

    if (!canvas || !browserWindow.jspdf?.jsPDF) throw new Error("PDF render failed");

    const { jsPDF } = browserWindow.jspdf;
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

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      (pageWidth - imageWidth) / 2,
      margin,
      imageWidth,
      imageHeight,
      undefined,
      "FAST"
    );
    pdf.save(`${reportFileName(form)}.pdf`);
  } catch (error) {
    console.error(error);
    alert("PDFの直接保存に失敗しました。インターネット接続を確認するか、「印刷する」からPDF保存を選んでください。");
  } finally {
    delete document.body.dataset.outputMode;
  }
}

export function PatientForm({ form, onChange }: PatientFormProps) {
  const [isSavingPdf, setIsSavingPdf] = useState(false);

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
              <Label htmlFor="patient-age">患者年齢</Label>
              <Input
                id="patient-age"
                type="number"
                min={0}
                max={120}
                value={form.patient.age}
                onChange={(event) => updatePatient("age", event.target.value)}
                placeholder="例）35"
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
              const colonyVariant = colonyVariantForKey(definition.key);
              const showsColonyScale = Boolean(colonyVariant);

              return (
                <div
                  key={definition.key}
                  className={`grid items-center gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 ${
                    showsColonyScale ? "grid-cols-[1fr_44px]" : "grid-cols-[1fr_76px_44px]"
                  }`}
                >
                  <div>
                    <Label htmlFor={definition.key}>{definition.label}</Label>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {definition.group} / 0〜{definition.max}・{definition.helpText}
                    </p>
                    <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-semibold leading-5 text-slate-500">
                      <span className="rounded-full bg-mist-100 px-2 font-bold text-mist-700">低</span>
                      <span>{definition.lowGuide}</span>
                      <span className="rounded-full bg-blossom-100 px-2 font-bold text-rose-700">高</span>
                      <span>{definition.highGuide}</span>
                    </p>
                    {definition.scoreLabels ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {definition.scoreLabels.map((marker) => (
                          <span
                            key={`${definition.key}-${marker.score}`}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-black ${scoreToneClass[marker.tone]}`}
                          >
                            <b>{marker.score}</b>
                            {marker.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {definition.scoreRanges ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {definition.scoreRanges.map((range) => (
                          <span
                            key={`${definition.key}-${range.score}`}
                            className="inline-grid min-w-[64px] justify-items-center rounded-xl border border-slate-200 bg-white px-2 py-1 text-[10px] font-black leading-tight text-slate-600"
                          >
                            <b className="text-xs text-[#173865]">{range.score}</b>
                            <span>{range.lines[0]}</span>
                            <span>{range.lines[1]}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {showsColonyScale ? (
                      <div className="mt-3 grid grid-cols-4 gap-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-rose-50/40 p-2">
                        {Array.from({ length: definition.max + 1 }, (_, score) => {
                          const isSelected = form.scores[definition.key] === score;

                          return (
                            <button
                              key={`${definition.key}-${score}`}
                              type="button"
                              aria-pressed={isSelected}
                              aria-label={`${definition.label} ${score}点`}
                              onClick={() => updateScore(definition.key, String(score), definition.max)}
                              className={`grid min-h-[76px] place-items-center rounded-2xl border px-1 py-2 text-sm font-black transition ${
                                isSelected
                                  ? "border-[#173865] bg-[#173865] text-white shadow-sm"
                                  : "border-transparent bg-white/85 text-slate-600 hover:border-slate-200"
                              }`}
                            >
                              <ColonyPlate score={score} variant={colonyVariant ?? "lactobacillus"} />
                              <span>{score}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                  {showsColonyScale ? null : (
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
                  )}
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
            disabled={isSavingPdf}
            onClick={async () => {
              setIsSavingPdf(true);
              await savePdfReport(form);
              setIsSavingPdf(false);
            }}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {isSavingPdf ? "PDF作成中..." : "PDF保存"}
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
