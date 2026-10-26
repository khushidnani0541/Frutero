// ---------- UI helpers, router, drawer, toast ----------
const UI = (() => {
  const esc = CH.esc, f = SIM.fmtN;
  const pill = (s, t) => `<span class="pill ${s}">${esc(t)}</span>`;
  const dot = (s) => `<span class="dot ${s}"></span>`;
  const kpi = (l, v, d, o = {}) => `<div class="card kpi ${o.c || "c3"} ${o.cls || ""}"><div class="l">${esc(l)}</div><div class="v">${v}${o.unit ? `<small>${esc(o.unit)}</small>` : ""}</div>${d ? `<div class="d ${o.dir || ""}">${d}</div>` : ""}</div>`;
  const card = (title, body, o = {}) => `<div class="card ${o.c || "c6"} ${o.cls || ""}" ${o.id ? `id="${o.id}"` : ""}><div class="ch"><h3>${esc(title)}</h3>${o.sub ? `<span class="sub">${esc(o.sub)}</span>` : ""}${o.r ? `<span class="r">${o.r}</span>` : ""}</div>${body}</div>`;
  const tile = (l, v, d, s = "", unit = "") => `<div class="tile ${s}"><div class="l">${esc(l)}</div><div class="v">${v}${unit ? `<small>${esc(unit)}</small>` : ""}</div>${d ? `<div class="d">${d}</div>` : ""}</div>`;
  // cols: [{h, n, f(row) -> html}] ; rows ; o.row(row) -> extra attrs
  const table = (cols, rows, o = {}) => `<div class="scroll"><table class="tbl">${o.noHead ? "" : `<thead><tr>${cols.map((c) => `<th class="${c.n ? "n" : ""}">${esc(c.h)}</th>`).join("")}</tr></thead>`}<tbody>${rows.map((r) => `<tr ${o.row ? o.row(r) : ""}>${cols.map((c) => `<td class="${c.n ? "n" : ""} ${c.k ? "k" : ""}">${c.f(r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const tabs = (view, items, active) => `<div class="tabs">${items.map((t) => `<button data-tab="${view}:${t[0]}" class="${t[0] === active ? "on" : ""}">${esc(t[1])}</button>`).join("")}</div>`;
  const seg = (key, items, active) => `<div class="seg">${items.map((t) => `<button data-seg="${key}:${t[0]}" class="${t[0] === active ? "on" : ""}">${esc(t[1])}</button>`).join("")}</div>`;
  const legend = (items) => `<div class="legend">${items.map((i) => `<span><i style="background:${i[0]}"></i>${esc(i[1])}</span>`).join("")}</div>`;
  const stateOf = (v, lo, hi) => (v < lo || v > hi) ? "bad" : (v < lo + (hi - lo) * 0.1 || v > hi - (hi - lo) * 0.1) ? "warn" : "ok";
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const progress = (p, cls = "") => `<i class="${cls}" style="display:block;height:6px;border-radius:3px;background:var(--grid);overflow:hidden"><i style="display:block;height:100%;width:${Math.min(100, p)}%;background:var(--accent)"></i></i>`;
  let toastT;
  const toast = (m) => { const t = document.getElementById("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2200); };
  const drawer = {
    open(title, html) { const d = document.getElementById("drawer"); d.querySelector(".dh b").textContent = title; d.querySelector(".db").innerHTML = html; d.classList.add("open"); },
    close() { document.getElementById("drawer").classList.remove("open"); },
  };
  return { esc, f, pill, dot, kpi, card, tile, table, tabs, seg, legend, stateOf, pct, progress, toast, drawer };
})();

// ---------- App state and router ----------
const APP = {
  state: { view: "home", tab: { quality: "vision", production: "lines", trace: "pallets", maint: "events", cip: "live" }, seg: { period: "shift" }, confirmed: {}, wo: null, cipIn: null, search: "" },
  views: {},
  titles: { home: ["Plant overview", "Pottsville"], quality: ["Quality", "Vision, zones, pallet rule, release"], production: ["Production and OEE", "Lines, losses, crews"], trace: ["Traceability and ERP", "Pallets, inventory, orders, lots"], maint: ["Downtime and maintenance", "Events, insights, plan, work orders"], cip: ["CIP monitoring", "Spectral endpoints, savings"] },
  go(view, tab) { this.state.view = view; if (tab) this.state.tab[view] = tab; this.render(); document.querySelector(".content").scrollTop = 0; try { localStorage.setItem("frutero-view", view); } catch (e) {} },
  render() {
    const s = this.state, v = this.views[s.view];
    document.querySelectorAll(".rail .nav").forEach((b) => b.classList.toggle("on", b.dataset.go === s.view));
    const t = this.titles[s.view]; document.getElementById("crumb").innerHTML = `${UI.esc(t[0])} <span>· ${UI.esc(t[1])}</span>`;
    document.getElementById("content").innerHTML = v ? v(s) : "";
    this.live();
  },
  live() {
    const L = SIM.lines.L1;
    const map = { clock: () => SIM.hh(SIM.now()) + ":" + String(SIM.now().getSeconds()).padStart(2, "0"), l1speed: () => UI.f(L.speed), l1lh: () => UI.f(L.freezerLh), l1tunnel: () => L.tunnel.toFixed(1), cipT: () => SIM.circuits[0].t.toFixed(1), cipTurb: () => SIM.cipSensors.outlet[4].v.toFixed(1), cipRes: () => SIM.cipSensors.outlet[5].v.toFixed(2), cipTin: () => SIM.cipSensors.inlet[0].v.toFixed(1), cipTout: () => SIM.cipSensors.outlet[0].v.toFixed(1) };
    for (const z of SIM.zones) map["z_" + z.id] = () => z.now.toFixed(1);
    document.querySelectorAll("[data-live]").forEach((el) => { const fn = map[el.dataset.live]; if (fn) el.textContent = fn(); });
  },
};
