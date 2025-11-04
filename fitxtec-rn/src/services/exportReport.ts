// src/services/export.ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { UserStats, MGKey } from "./stats";

// el mismo orden de músculos que usas en la UI
const MG: MGKey[] = [
  "Chest","Back","Shoulders","Quads","Hamstrings","Biceps","Triceps","Calves"
];

export async function exportProgressPDF(
  uid: string,
  stats: UserStats,
  advice?: string[]    
) {
  const tips = advice ?? [];
  const title = "FITxTEC – Progress Report";
  const now = new Date();

  // Armamos filas con volumen semanal y RoP por músculo
  const rows = MG.map((m) => {
    const ms = stats.muscles[m];
    const history = ms.volumeHistory.join(" · ");
    const rop = ms.ropPct >= 0 ? `+${ms.ropPct.toFixed(1)}%` : `${ms.ropPct.toFixed(1)}%`;
    return `
      <tr>
        <td>${m}</td>
        <td class="num">${Math.round(ms.volumeWeekCurrent)}</td>
        <td class="num">${Math.round(ms.volumeWeekPrev)}</td>
        <td class="num ${ms.ropPct>2?"ok":ms.ropPct<-2?"bad":"mid"}">${rop}</td>
        <td class="mono">${history}</td>
      </tr>
    `;
  }).join("");

  const kpiStrength =
    Math.round(
      ((stats.totals.volumeWeekCurrent - stats.totals.volumeWeekPrev) /
        Math.max(stats.totals.volumeWeekPrev, 1)) * 100
    ) || 0;

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      *{ box-sizing:border-box; }
      body{ font-family: ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Inter,Arial;
            padding:24px; color:#111; }
      h1{ margin:0 0 6px 0; font-size:22px; }
      .sub{ color:#555; font-size:12px; margin-bottom:16px; }
      .kpis{ display:flex; gap:12px; margin:10px 0 16px; }
      .kpi{ flex:1; border:1px solid #ddd; border-radius:10px; padding:12px; }
      .kpi .val{ font-weight:800; font-size:18px; }
      .kpi .lbl{ color:#666; font-size:12px; }
      table{ width:100%; border-collapse:collapse; margin-top:6px; }
      th, td{ border:1px solid #e5e7eb; padding:8px; font-size:12px; }
      th{ background:#f8fafc; text-align:left; }
      td.num{ text-align:right; }
      td.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; color:#374151; }
      .ok{ color:#16A34A; font-weight:700; }
      .bad{ color:#EF4444; font-weight:700; }
      .mid{ color:#6B7280; font-weight:700; }
      .tips{ margin-top:18px; border:1px solid #e5e7eb; border-radius:10px; padding:12px; }
      .tips h3{ margin:0 0 8px 0; font-size:14px; }
      .tips li{ margin:4px 0; }
      .fine{ color:#6B7280; font-size:11px; margin-top:10px; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <div class="sub">User: <b>${uid}</b> · Generated: ${now.toLocaleString()}</div>

    <div class="kpis">
      <div class="kpi">
        <div class="val">${kpiStrength >= 0 ? "+"+kpiStrength : kpiStrength}%</div>
        <div class="lbl">Strength Increase vs last week</div>
      </div>
      <div class="kpi">
        <div class="val">${stats.totals.sessionsLast30d}</div>
        <div class="lbl">Total Sessions (last 30 days)</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Muscle</th>
          <th>This week</th>
          <th>Last week</th>
          <th>RoP %</th>
          <th>History (W-4…W0)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    ${tips.length ? `
      <div class="tips">
        <h3>AI Advice</h3>
        <ul>
          ${tips.map(t => `<li>${t}</li>`).join("")}
        </ul>
      </div>
    ` : ""}

    <div class="fine">RoP: % de cambio respecto a la semana previa. Valores &gt; +2% ⇒ verde; &lt; −2% ⇒ rojo.</div>
  </body>
  </html>
  `;

  // Generar PDF
  const { uri } = await Print.printToFileAsync({ html });

  // Compartir/guardar si está disponible
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: "com.adobe.pdf",
      mimeType: "application/pdf",
      dialogTitle: "Export Progress PDF"
    });
  }
  return uri;
}
