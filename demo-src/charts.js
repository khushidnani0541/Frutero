// ---------- Small SVG chart helpers (theme colours through CSS variables) ----------
const CH = (() => {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const nice = (v) => Math.abs(v) >= 1000 ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + "k" : String(Math.round(v * 10) / 10);
  const grid = "var(--grid)", txt = "var(--muted)", ink = "var(--ink)";

  // line / area chart: series [{data, color, name, area, dash}], optional band {lo, hi, color}, limit lines [{y, color, label}]
  function line(o) {
    const w = o.w || 600, h = o.h || 180, pl = o.pl || 38, pr = 10, pt = 10, pb = o.xLabels ? 22 : 10;
    const all = o.series.flatMap((s) => s.data).concat(o.limits ? o.limits.map((l) => l.y) : []).concat(o.band ? [o.band.lo, o.band.hi] : []);
    let y0 = o.yMin != null ? o.yMin : Math.min(...all), y1 = o.yMax != null ? o.yMax : Math.max(...all);
    if (y1 === y0) { y1 += 1; y0 -= 1; }
    const pad = (y1 - y0) * 0.08; if (o.yMin == null) y0 -= pad; if (o.yMax == null) y1 += pad;
    const n = Math.max(...o.series.map((s) => s.data.length));
    const X = (i) => pl + (i / (n - 1)) * (w - pl - pr), Y = (v) => pt + (1 - (v - y0) / (y1 - y0)) * (h - pt - pb);
    let g = "";
    const ticks = 4;
    for (let t = 0; t <= ticks; t++) { const v = y0 + (y1 - y0) * t / ticks; g += `<line x1="${pl}" x2="${w - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${grid}" stroke-width="1"/><text x="${pl - 6}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end" font-size="9.5" fill="${txt}">${esc(o.fmt ? o.fmt(v) : nice(v))}</text>`; }
    if (o.band) g += `<rect x="${pl}" y="${Y(o.band.hi).toFixed(1)}" width="${w - pl - pr}" height="${(Y(o.band.lo) - Y(o.band.hi)).toFixed(1)}" fill="${o.band.color || "var(--good)"}" opacity=".10"/>`;
    if (o.xLabels) { const step = Math.ceil(o.xLabels.length / (o.xEvery || 6)); o.xLabels.forEach((l, i) => { if (i % step === 0 || i === o.xLabels.length - 1) g += `<text x="${X(i).toFixed(1)}" y="${h - 6}" text-anchor="middle" font-size="9.5" fill="${txt}">${esc(l)}</text>`; }); }
    for (const s of o.series) {
      const pts = s.data.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`);
      if (s.area) g += `<path d="M${pts[0]} L${pts.join(" L")} L${X(s.data.length - 1).toFixed(1)},${Y(y0).toFixed(1)} L${X(0).toFixed(1)},${Y(y0).toFixed(1)} Z" fill="${s.color}" opacity=".12"/>`;
      g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ""} stroke-linejoin="round" stroke-linecap="round"/>`;
      if (s.end !== false) { const last = s.data.length - 1; g += `<circle cx="${X(last).toFixed(1)}" cy="${Y(s.data[last]).toFixed(1)}" r="3" fill="${s.color}"/>`; }
    }
    if (o.limits) for (const l of o.limits) g += `<line x1="${pl}" x2="${w - pr}" y1="${Y(l.y).toFixed(1)}" y2="${Y(l.y).toFixed(1)}" stroke="${l.color || "var(--bad)"}" stroke-width="1.2" stroke-dasharray="4 3"/><text x="${w - pr - 2}" y="${(Y(l.y) - 3).toFixed(1)}" text-anchor="end" font-size="9" font-weight="700" fill="${l.color || "var(--bad)"}">${esc(l.label || "")}</text>`;
    if (o.marks) for (const m of o.marks) g += `<line x1="${X(m.i).toFixed(1)}" x2="${X(m.i).toFixed(1)}" y1="${pt}" y2="${h - pb}" stroke="${m.color || "var(--warn)"}" stroke-width="1" stroke-dasharray="2 2"/><text x="${(X(m.i) + 3).toFixed(1)}" y="${pt + 9}" font-size="9" fill="${m.color || "var(--warn)"}">${esc(m.label || "")}</text>`;
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.label || "chart")}">${g}</svg>`;
  }

  // vertical bars: cats [], series [{data, color, name}], stacked; optional plan line
  function bars(o) {
    const w = o.w || 600, h = o.h || 170, pl = 36, pr = 8, pt = 10, pb = 22, n = o.cats.length;
    const tot = o.cats.map((_, i) => o.stacked ? o.series.reduce((a, s) => a + s.data[i], 0) : Math.max(...o.series.map((s) => s.data[i])));
    const ymax = o.yMax || Math.max(...tot.concat(o.plan || [0])) * 1.1 || 1;
    const Y = (v) => pt + (1 - v / ymax) * (h - pt - pb), slot = (w - pl - pr) / n, bw = o.stacked ? slot * 0.62 : slot * 0.62 / o.series.length;
    let g = "";
    for (let t = 0; t <= 4; t++) { const v = ymax * t / 4; g += `<line x1="${pl}" x2="${w - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${grid}"/><text x="${pl - 5}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end" font-size="9.5" fill="${txt}">${esc(o.fmt ? o.fmt(v) : nice(v))}</text>`; }
    o.cats.forEach((c, i) => {
      const x0 = pl + i * slot + (slot - (o.stacked ? bw : bw * o.series.length)) / 2; let acc = 0;
      o.series.forEach((s, k) => { const v = s.data[i]; if (o.stacked) { g += `<rect x="${x0.toFixed(1)}" y="${Y(acc + v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(Y(acc) - Y(acc + v)).toFixed(1)}" fill="${s.color}" rx="1.5"/>`; acc += v; } else g += `<rect x="${(x0 + k * bw).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${(bw - 1).toFixed(1)}" height="${(Y(0) - Y(v)).toFixed(1)}" fill="${s.color}" rx="1.5"/>`; });
      const step = Math.ceil(n / (o.xEvery || 8)); if (i % step === 0 || i === n - 1) g += `<text x="${(pl + i * slot + slot / 2).toFixed(1)}" y="${h - 6}" text-anchor="middle" font-size="9.5" fill="${txt}">${esc(c)}</text>`;
    });
    if (o.plan) { const pts = o.plan.map((v, i) => `${(pl + i * slot + slot / 2).toFixed(1)},${Y(v).toFixed(1)}`); g += `<polyline points="${pts.join(" ")}" fill="none" stroke="${ink}" stroke-width="1.4" stroke-dasharray="4 3"/>`; }
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.label || "bar chart")}">${g}</svg>`;
  }

  // horizontal bars with labels (Pareto)
  function hbars(rows, o = {}) {
    const max = Math.max(...rows.map((r) => r.v)) || 1;
    return rows.map((r) => `<div class="bar"><span><span>${esc(r.k)}${r.s ? ` <em style="color:var(--muted);font-style:normal">${esc(r.s)}</em>` : ""}</span></span><i class="${r.c || ""}" style="width:${(r.v / max * 100).toFixed(1)}%"></i><b>${esc(r.t != null ? r.t : r.v)}</b></div>`).join("");
  }

  function spark(data, color = "var(--accent)", w = 80, h = 22) {
    const y0 = Math.min(...data), y1 = Math.max(...data) || 1, n = data.length;
    const pts = data.map((v, i) => `${(i / (n - 1) * (w - 2) + 1).toFixed(1)},${(h - 2 - (y1 === y0 ? 0.5 : (v - y0) / (y1 - y0)) * (h - 4)).toFixed(1)}`);
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="${pts[n - 1].split(",")[0]}" cy="${pts[n - 1].split(",")[1]}" r="2" fill="${color}"/></svg>`;
  }

  // ring gauge
  function ring(pct, color = "var(--accent)", label = "", size = 64) {
    const r = 26, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct / 100)));
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-label="${esc(label)}"><circle cx="32" cy="32" r="${r}" fill="none" stroke="${grid}" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 32 32)"/><text x="32" y="36" text-anchor="middle" font-size="13" font-weight="800" fill="${ink}">${esc(label)}</text></svg>`;
  }

  // waterfall for OEE: availability, performance, quality
  function waterfall(a, p, q, w = 300, h = 120) {
    const steps = [{ k: "Availability", v: a }, { k: "Performance", v: p }, { k: "Quality", v: q }];
    const vals = [100, a, a * p / 100, a * p * q / 10000];
    const Y = (v) => 10 + (1 - v / 100) * (h - 34), slot = w / 4, bw = slot * 0.6;
    let g = "";
    [100, 75, 50, 25].forEach((v) => g += `<line x1="0" x2="${w}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${grid}"/>`);
    const labels = ["Planned", "Availability", "Performance", "OEE"];
    vals.forEach((v, i) => { const x = i * slot + (slot - bw) / 2; const prev = i ? vals[i - 1] : 100; const loss = prev - v; g += `<rect x="${x}" y="${Y(v).toFixed(1)}" width="${bw}" height="${(Y(0) - Y(v)).toFixed(1)}" fill="${i === 3 ? "var(--accent)" : "var(--accent-line)"}" rx="2"/>`; if (i && loss > 0.5) g += `<rect x="${x}" y="${Y(prev).toFixed(1)}" width="${bw}" height="${(Y(v) - Y(prev)).toFixed(1)}" fill="var(--bad)" opacity=".55" rx="2"/>`; g += `<text x="${x + bw / 2}" y="${(Y(v) - 4).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="${ink}">${v.toFixed(0)}%</text><text x="${x + bw / 2}" y="${h - 4}" text-anchor="middle" font-size="9.5" fill="${txt}">${labels[i]}</text>`; });
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="OEE waterfall">${g}</svg>`;
  }

  // heatmap rows x cols
  function heat(rows, o = {}) {
    const cw = o.cw || 18, chh = o.ch || 16, pl = 46, pt = 16, max = Math.max(1, ...rows.flat());
    const w = pl + rows[0].length * cw + 4, h = pt + rows.length * chh + 4;
    let g = "";
    rows[0].forEach((_, c) => { if (c % 3 === 0) g += `<text x="${pl + c * cw + cw / 2}" y="11" text-anchor="middle" font-size="9" fill="${txt}">${String(c).padStart(2, "0")}</text>`; });
    rows.forEach((r, i) => { g += `<text x="${pl - 6}" y="${pt + i * chh + chh / 2 + 3.5}" text-anchor="end" font-size="9.5" fill="${txt}">${esc(o.rowLabels ? o.rowLabels[i] : i)}</text>`; r.forEach((v, c) => g += `<rect x="${pl + c * cw + 1}" y="${pt + i * chh + 1}" width="${cw - 2}" height="${chh - 2}" rx="2" fill="${v ? "var(--bad)" : "var(--grid)"}" opacity="${v ? (0.25 + 0.75 * v / max).toFixed(2) : 1}"/>`); });
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.label || "heatmap")}">${g}</svg>`;
  }

  // gantt-like phase bars: rows [{k, fixed, actual, color}], scale minutes
  function phaseBars(rows, total, w = 620) {
    const pl = 170, rowH = 26, h = rows.length * rowH + 26, X = (m) => pl + m / total * (w - pl - 60);
    let g = ""; let fx = 0, ax = 0;
    for (let m = 0; m <= total; m += 10) g += `<line x1="${X(m).toFixed(1)}" x2="${X(m).toFixed(1)}" y1="14" y2="${h - 10}" stroke="${grid}"/><text x="${X(m).toFixed(1)}" y="10" text-anchor="middle" font-size="9" fill="${txt}">${m}</text>`;
    rows.forEach((r, i) => {
      const y = 18 + i * rowH;
      g += `<text x="${pl - 8}" y="${y + 11}" text-anchor="end" font-size="10" font-weight="600" fill="${ink}">${esc(r.k)}</text>`;
      g += `<rect x="${X(fx).toFixed(1)}" y="${y}" width="${(X(fx + r.fixed) - X(fx)).toFixed(1)}" height="7" rx="2" fill="${grid}"/>`;
      g += `<rect x="${X(ax).toFixed(1)}" y="${y + 9}" width="${(X(ax + r.actual) - X(ax)).toFixed(1)}" height="7" rx="2" fill="${r.color}"/>`;
      g += `<text x="${(X(ax + r.actual) + 4).toFixed(1)}" y="${y + 16}" font-size="9" font-weight="700" fill="${ink}">${r.actual} min</text>`;
      fx += r.fixed; ax += r.actual;
    });
    g += `<text x="${X(fx).toFixed(1)}" y="${h - 1}" text-anchor="end" font-size="9" fill="${txt}">fixed recipe ${fx} min</text>`;
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="CIP phases">${g}</svg>`;
  }

  // simple histogram from values
  function hist(values, bins, o = {}) {
    const lo = o.lo != null ? o.lo : Math.min(...values), hi = o.hi != null ? o.hi : Math.max(...values), bw = (hi - lo) / bins;
    const counts = new Array(bins).fill(0); values.forEach((v) => { const i = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / bw))); counts[i]++; });
    const cats = counts.map((_, i) => (lo + i * bw).toFixed(o.dec || 0));
    return bars({ cats, series: [{ data: counts, color: o.color || "var(--accent)" }], h: o.h || 140, xEvery: 6, label: o.label });
  }

  return { line, bars, hbars, spark, ring, waterfall, heat, phaseBars, hist, esc };
})();
