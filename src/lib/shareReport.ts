import type { MonthlyReport } from "./types";
import { formatReportMonth } from "./reports";

const W = 720;
const PADDING = 48;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function formatKRW(n: number): string {
  return `₩${n.toLocaleString("ko-KR")}`;
}

export function renderReportToBlob(report: MonthlyReport): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const topCount = report.topSubscriptions.length;
    const H = 520 + topCount * 56 + (report.changeFromPrev !== undefined ? 40 : 0);

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Header gradient
    const grad = ctx.createLinearGradient(0, 0, W, 180);
    grad.addColorStop(0, "#10b981");
    grad.addColorStop(1, "#047857");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 180);

    // Header text
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "500 24px Pretendard, system-ui, sans-serif";
    ctx.fillText("FlowSave 월간 리포트", PADDING, 72);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px Pretendard, system-ui, sans-serif";
    ctx.fillText(formatReportMonth(report.month), PADDING, 140);

    let y = 220;

    // Stat boxes
    const boxW = (W - PADDING * 2 - 24) / 2;
    const boxes = [
      { label: "월 고정비", value: formatKRW(report.totalMonthly), color: "#10b981" },
      { label: "활성 구독", value: `${report.subscriptionCount}개`, color: "#18181b" },
    ];

    boxes.forEach((box, i) => {
      const bx = PADDING + i * (boxW + 24);
      ctx.fillStyle = "#f4f4f5";
      roundRect(ctx, bx, y, boxW, 100, 20);
      ctx.fill();
      ctx.fillStyle = "#71717a";
      ctx.font = "500 20px Pretendard, system-ui, sans-serif";
      ctx.fillText(box.label, bx + 24, y + 36);
      ctx.fillStyle = box.color;
      ctx.font = "bold 32px Pretendard, system-ui, sans-serif";
      ctx.fillText(box.value, bx + 24, y + 76);
    });

    y += 130;

    if (report.changeFromPrev !== undefined) {
      const sign = report.changeFromPrev >= 0 ? "+" : "";
      const color = report.changeFromPrev > 0 ? "#ef4444" : "#10b981";
      ctx.fillStyle = "#71717a";
      ctx.font = "500 22px Pretendard, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `전월 대비 ${sign}${formatKRW(report.changeFromPrev)}`,
        W / 2,
        y
      );
      ctx.fillStyle = color;
      y += 40;
      ctx.textAlign = "left";
    }

    // TOP 3
    if (report.topSubscriptions.length > 0) {
      ctx.fillStyle = "#71717a";
      ctx.font = "600 22px Pretendard, system-ui, sans-serif";
      ctx.fillText("TOP 3 지출", PADDING, y);
      y += 36;

      report.topSubscriptions.forEach((s, i) => {
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 24px Pretendard, system-ui, sans-serif";
        ctx.fillText(String(i + 1), PADDING, y + 28);

        ctx.fillStyle = "#18181b";
        ctx.font = "500 26px Pretendard, system-ui, sans-serif";
        ctx.fillText(s.name, PADDING + 36, y + 28);

        ctx.textAlign = "right";
        ctx.fillStyle = "#52525b";
        ctx.font = "600 24px Pretendard, system-ui, sans-serif";
        ctx.fillText(`${formatKRW(s.amount)}/월`, W - PADDING, y + 28);
        ctx.textAlign = "left";
        y += 56;
      });
    }

    // Footer
    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PADDING, H - 72);
    ctx.lineTo(W - PADDING, H - 72);
    ctx.stroke();

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "500 20px Pretendard, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("flowsave · 구독과 고정비, 한눈에", W / 2, H - 36);

    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create image"))),
      "image/png",
      1
    );
  });
}

export async function shareReportImage(report: MonthlyReport) {
  const blob = await renderReportToBlob(report);
  const file = new File([blob], `flowsave-${report.month}.png`, { type: "image/png" });
  const title = `FlowSave ${formatReportMonth(report.month)} 리포트`;

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title,
      text: `월 ₩${report.totalMonthly.toLocaleString()} · 구독 ${report.subscriptionCount}개`,
      files: [file],
    });
    return "shared";
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flowsave-${report.month}.png`;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}

export async function copyReportImage(report: MonthlyReport): Promise<boolean> {
  try {
    const blob = await renderReportToBlob(report);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}
