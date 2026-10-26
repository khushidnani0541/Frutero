// ---------- Views: Home, Quality ----------
(() => {
  const { esc, f, pill, dot, kpi, card, tile, table, tabs, legend, pct } = UI;
  const S = SIM;

  // ---- plant map (simplified, live) ----
  function plantMap() {
    const L1 = S.lines.L1, L2 = S.lines.L2, z = Object.fromEntries(S.zones.map((x) => [x.id, x]));
    const room = (x, y, w, h, name, sub, go, fill = "var(--panel2)") => `<g class="hot" data-go="${go}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="var(--line)" stroke-width="1"/><text x="${x + 8}" y="${y + 15}" font-size="10.5" font-weight="800" fill="var(--ink)">${esc(name)}</text>${sub ? `<text x="${x + 8}" y="${y + 27}" font-size="9.5" fill="var(--muted)">${esc(sub)}</text>` : ""}</g>`;
    const chip = (x, y, text, s = "ok") => { const col = s === "ok" ? "var(--good)" : s === "warn" ? "var(--warn)" : s === "bad" ? "var(--bad)" : "var(--accent)"; const w = text.length * 5.6 + 14; return `<g><rect x="${x}" y="${y}" width="${w.toFixed(0)}" height="16" rx="8" fill="${col}" opacity=".14"/><circle cx="${x + 8}" cy="${y + 8}" r="3" fill="${col}"/><text x="${x + 14}" y="${y + 11.5}" font-size="9.5" font-weight="700" fill="${col}">${esc(text)}</text></g>`; };
    const lineBlock = (x, y, L, go) => `<g class="hot" data-go="${go}"><rect x="${x}" y="${y}" width="200" height="56" rx="4" fill="var(--panel)" stroke="${L.state === "running" ? "var(--good)" : "var(--warn)"}" stroke-width="1.2"/><text x="${x + 8}" y="${y + 15}" font-size="10.5" font-weight="800" fill="var(--ink)">${esc(L.name)}</text><text x="${x + 8}" y="${y + 28}" font-size="9.5" fill="var(--muted)">${esc(L.product)} · ${esc(L.machine)}</text>${chip(x + 6, y + 35, L.state === "running" ? `Running ${f(L.speed)} pcs/h` : `Stopped ${L.stopMin} min · ${L.stop}`, L.state === "running" ? "ok" : "warn")}</g>`;
    return `<svg viewBox="0 0 700 330" role="img" aria-label="Pottsville plant map, live">
      <rect x="2" y="2" width="696" height="326" rx="6" fill="var(--panel)" stroke="var(--ink)" stroke-width="1.2"/>
      ${room(8, 8, 86, 96, "Offices", "QA lab, GMP entry", "home")}
      ${room(8, 108, 86, 74, "Mix room", "300-gal batches", "quality")}${chip(14, 150, "Batch MB-0314-03", "info")}
      ${room(8, 186, 86, 64, "CIP station", "", "cip")}${chip(14, 212, "CIP-1 caustic", "info")}
      ${room(8, 254, 86, 68, "Parts, edge", "server, switches", "maint")}
      ${room(98, 8, 300, 314, "Processing room", "9,325 sq ft", "production")}
      ${lineBlock(108, 48, L1, "production")}${chip(316, 55, `Tunnel ${L1.tunnel.toFixed(0)} °F`, "ok")}${chip(316, 75, `Freezer ${f(L1.freezerLh)} L/h`, "ok")}
      ${lineBlock(108, 150, L2, "production")}${chip(316, 157, `Tunnel ${L2.tunnel} °F`, "ok")}${chip(316, 177, `${S.shift.L2.cases} cases`, "info")}
      ${chip(108, 230, "Cameras C1 to C6 live", "ok")}${chip(108, 250, `Quality ${S.shift.L1.q}% / ${S.shift.L2.q}%`, "ok")}${chip(108, 270, "Off-centre stick above limit, C1", "warn")}
      ${room(402, 8, 128, 314, "Packaging", "case packing, palletizing", "trace")}
      ${chip(408, 40, `${S.shift.L1.cases + S.shift.L2.cases} cases overnight`, "info")}${chip(408, 60, "46 pallets built", "info")}${chip(408, 80, "P-0412 on QA hold", "bad")}${chip(408, 100, "RFID label G1", "info")}
      ${room(534, 8, 92, 96, "Cooler 40 °F", "ingredients, mix", "quality", "var(--accent-soft)")}${chip(540, 50, `${z.cooler.now.toFixed(1)} °F`, z.cooler.now > 45 ? "bad" : "ok")}${chip(540, 70, "86 of 120 pallets", "info")}
      ${room(534, 108, 92, 50, "Hot box", "tempering", "quality", "var(--warn-bg)")}${chip(540, 136, `${z.hotbox.now.toFixed(1)} °F`, "ok")}
      ${room(534, 162, 92, 160, "Freezer −20 °F", "552 positions", "trace", "var(--accent-soft)")}${chip(540, 200, `${z.freezer.now.toFixed(1)} °F`, z.freezer.now > -15 ? "bad" : "ok")}${chip(540, 220, "318 pallets", "info")}${chip(540, 240, "RFID portal G2", "info")}${chip(540, 260, "Doors closed", "ok")}
      ${room(630, 8, 62, 314, "Dock", "", "trace")}${chip(634, 40, "G3", "info")}${chip(634, 60, "3 trucks", "info")}${chip(634, 80, `${z.dock.now.toFixed(0)} °F`, "ok")}
      <text x="104" y="320" font-size="9" fill="var(--faint)">Schematic from layout Rev 5, not to scale. Click a room to open its module.</text>
    </svg>`;
  }

  APP.views.home = () => {
    const sh = S.shift, out = sh.L1.out + sh.L2.out, plan = sh.L1.plan + sh.L2.plan;
    const alerts = S.alerts.filter((a) => a.open);
    return `
    <div class="ph"><div><h1>Tuesday 14 March 2028, night shift ending</h1><p>${esc(sh.label)}, ${esc(sh.crew)} led by ${esc(sh.lead)}. Every figure on this page comes from the machines, cameras and sensors; nothing is typed in.</p></div>
      <div class="tools"><button class="btn" data-go="quality">Morning report</button><button class="btn pri" data-bruce="What happened overnight?">Ask Bruce what happened</button></div></div>
    <div class="grid">
      ${kpi("Output overnight", f(out), `plan ${f(plan)} · <b>${pct(out, plan)}%</b> of plan`, { unit: "pcs" })}
      ${kpi("OEE, both lines", "79%", `Line 1 <b>${sh.L1.oee}%</b> · Line 2 <b>${sh.L2.oee}%</b>`)}
      ${kpi("First-pass quality", "98.1%", `${f(sh.L1.rejects + sh.L2.rejects)} rejects counted by camera`)}
      ${kpi("Pallets inside 20 min", `${sh.pallets.inside20}<small>of ${sh.pallets.built}</small>`, `avg ${sh.pallets.avgToFreezer} min to the freezer · <b>1 on hold</b>`, { dir: "" })}
      ${card("The plant, live", `<div class="plan">${plantMap()}</div>`, { c: "c8", sub: "rooms from layout Rev 5", r: `${dot("ok")}running ${dot("warn")}stopped ${dot("bad")}attention` })}
      <div class="card c4"><div class="ch"><h3>Needs attention</h3><span class="r">${alerts.length} open</span></div>
        <ul class="list">${S.alerts.map((a) => `<li><span class="t">${a.t}</span><span class="m"><b>${dot(a.sev)}${esc(a.title)}</b><span>${esc(a.where)}${a.note ? " · " + esc(a.note) : ""}${a.open ? "" : " · closed"}</span></span></li>`).join("")}</ul>
        <div class="ch" style="margin-top:12px"><h3>Overnight in plain words</h3><span class="r"><span class="pill vio">Bruce</span></span></div>
        <p class="note">Line 1 ran Mango stick 90 ml at 16,900 pcs/h and reached <b>94% of plan</b>; the gap is three stops, the longest a 14-minute ML8 reel change at 04:52. Line 2 ran Tender coconut bars at 81% OEE and stopped at 06:08 on an R2 film splice, 4 minutes so far. Quality held at 98.1%; off-centre sticks on lane 3 crossed the limit at 05:52 and the inserter is flagged. Every cold room stayed in band; the cooler door was open 11 minutes at 02:14 and was acknowledged in 3. <b>One pallet, P-0412, waited 23 minutes</b> at end packaging and is on QA hold with its clip. CIP-1 is in the caustic wash and is tracking 19 minutes early.</p>
        <div class="row" style="margin-top:8px"><button class="btn sm" data-go="quality" data-tab-to="pallet">See the pallet</button><button class="btn sm" data-go="maint">See the stops</button><button class="btn sm" data-bruce="Why did line 1 miss plan?">Why did line 1 miss plan?</button></div>
      </div>
      ${card("Output against plan, last 24 hours", CH.bars({ cats: S.hourLabels, series: [{ data: S.out24.L1, color: "var(--accent)", name: "Line 1" }, { data: S.out24.L2, color: "var(--violet)", name: "Line 2" }], plan: S.hourLabels.map(() => 15750), h: 190, xEvery: 8 }) + legend([["var(--accent)", "Line 1, pcs/h"], ["var(--violet)", "Line 2, pcs/h"], ["var(--ink)", "Line 1 plan 15,750"]]), { c: "c8", sub: "pieces per hour from the wrapper counters" })}
      <div class="card c4"><div class="ch"><h3>Cold rooms now</h3><span class="r">live</span></div><div class="tiles">
        ${S.zones.slice(0, 6).map((z) => tile(z.name.split(",")[0], `<span data-live="z_${z.id}">${z.now.toFixed(1)}</span>`, z.set != null ? `set ${z.set} °F` : "", z.alertAbove != null && z.now > z.alertAbove ? "bad" : "ok", "°F")).join("")}
      </div><p class="note" style="margin-top:8px">Alert when the freezer is above −15 °F for 15 minutes or a door is open 5 minutes; the shift lead by push and SMS, the owner if not acknowledged in 15.</p></div>
    </div>`;
  };

  // ---- Quality ----
  const camStrip = () => `<div class="flow">${[["C1", "After cutting", "shape, stick, count", "ok"], ["C2", "ML8 infeed, 2 cams", "coating", "ok"], ["C3", "ML8 outlet", "count per lane, bags", "ok"], ["C4", "After cutting, L2", "shape, count", "ok"], ["C5", "Pocket conveyor", "coating", "ok"], ["C6", "R2 outlet", "count, bags", "ok"], ["C7, C8", "Case packing", "cases/h, short cases", "warn"]].map((c) => `<div class="st ${c[3]}"><b>${c[0]} · ${c[1]}</b><span>${c[2]}</span></div>`).join("")}</div>`;
  const defectImg = (g) => {
    const stick = g.kind === "stick" || g.kind === "nostick";
    const body = stick ? `<rect x="52" y="22" width="46" height="70" rx="12" fill="#F2B544"/><rect x="52" y="22" width="46" height="70" rx="12" fill="#6B3A1E" opacity=".9"/><rect x="58" y="30" width="34" height="56" rx="9" fill="#F2B544" opacity=".35"/>${g.kind === "stick" ? `<rect x="${73 + g.off}" y="86" width="6" height="30" rx="2" fill="#E8D5B5"/><line x1="76" y1="86" x2="76" y2="116" stroke="var(--bad)" stroke-dasharray="2 2"/>` : `<rect x="73" y="86" width="6" height="30" rx="2" fill="none" stroke="var(--bad)" stroke-dasharray="2 2"/>`}` :
      g.kind === "coat" ? `<rect x="52" y="22" width="46" height="70" rx="12" fill="#6B3A1E"/><ellipse cx="80" cy="48" rx="11" ry="9" fill="#F2B544"/>` :
      g.kind === "coatbar" ? `<rect x="40" y="40" width="72" height="34" rx="6" fill="#6B3A1E"/><ellipse cx="88" cy="58" rx="12" ry="7" fill="#F9E7C6"/>` :
      g.kind === "broken" ? `<rect x="40" y="40" width="40" height="34" rx="6" fill="#6B3A1E"/><rect x="86" y="44" width="26" height="30" rx="6" fill="#6B3A1E" transform="rotate(8 99 59)"/>` :
      `<rect x="36" y="36" width="80" height="44" rx="4" fill="#E9EEF5" stroke="#B9C5D6"/><rect x="42" y="42" width="68" height="32" rx="3" fill="#D6DEE9"/><rect x="48" y="48" width="68" height="32" rx="3" fill="#C5D0E0" opacity=".8"/>`;
    return `<svg viewBox="0 0 152 120" role="img" aria-label="${esc(g.cls)}"><rect width="152" height="120" fill="#1E2A3A"/><rect x="0" y="100" width="152" height="20" fill="#2A3A50"/>${body}<rect x="${stick ? 48 : 34}" y="${stick ? 18 : 34}" width="${stick ? 54 : 84}" height="${stick ? 100 : 48}" fill="none" stroke="var(--lime)" stroke-width="1.5" stroke-dasharray="4 2"/><text x="6" y="12" font-size="8" fill="#B9C7DA">${g.cam} · lane ${g.lane} · ${g.t}</text><text x="146" y="12" font-size="8" text-anchor="end" fill="var(--lime)">${(g.conf * 100).toFixed(0)}%</text></svg>`;
  };

  function qVision(s) {
    const sh = S.shift;
    const rows = S.defects.map((d) => ({ ...d, state: d.n > d.limit ? "bad" : d.n > d.limit * 0.9 ? "warn" : "ok" }));
    return `
    <div class="grid">
      ${kpi("First-pass quality, line 1", `${sh.L1.q}%`, `${f(sh.L1.rejects)} rejects · stick ${f(sh.L1.rej.stick)}, coating ${f(sh.L1.rej.coating)}, wrap ${f(sh.L1.rej.wrap)}`)}
      ${kpi("First-pass quality, line 2", `${sh.L2.q}%`, `${f(sh.L2.rejects)} rejects · shape ${f(sh.L2.rej.shape)}, coating ${f(sh.L2.rej.coating)}, wrap ${f(sh.L2.rej.wrap)}`)}
      ${kpi("Pieces counted overnight", f(sh.L1.out + sh.L2.out), "every piece, from the first run")}
      ${kpi("Model accuracy", `${S.model.accuracy}%`, `missed ${S.model.missed}% · false alarms ${S.model.false}% · ${S.model.classes} classes`)}
      <div class="card c12"><div class="ch"><h3>Cameras on both lines</h3><span class="sub">washdown cameras on independent stands, triggered by the machines</span><span class="r">images stay on the edge server for 30 days</span></div>${camStrip()}</div>
      ${card("Rejects by class, line 1", CH.bars({ cats: S.shiftHours, series: [{ data: S.rejHourly.L1.map((r) => r.stick), color: "var(--accent)" }, { data: S.rejHourly.L1.map((r) => r.coating), color: "var(--violet)" }, { data: S.rejHourly.L1.map((r) => r.wrap), color: "var(--teal)" }], stacked: true, h: 160 }) + legend([["var(--accent)", "Stick"], ["var(--violet)", "Coating"], ["var(--teal)", "Wrap"]]), { sub: "per hour, night shift" })}
      ${card("Rejects by class, line 2", CH.bars({ cats: S.shiftHours, series: [{ data: S.rejHourly.L2.map((r) => r.shape), color: "var(--accent)" }, { data: S.rejHourly.L2.map((r) => r.coating), color: "var(--violet)" }, { data: S.rejHourly.L2.map((r) => r.wrap), color: "var(--teal)" }], stacked: true, h: 160 }) + legend([["var(--accent)", "Shape"], ["var(--violet)", "Coating"], ["var(--teal)", "Wrap"]]), { sub: "per hour, night shift" })}
      ${card("Defect classes, this shift", table([{ h: "Camera", f: (r) => `<b>${r.cam}</b> <span class="s">${esc(r.where)}</span>` }, { h: "Class", f: (r) => esc(r.cls), k: true }, { h: "Count", n: true, f: (r) => f(r.n) }, { h: "Rate", n: true, f: (r) => r.rate.toFixed(2) + "%" }, { h: "Limit", n: true, f: (r) => f(r.limit) }, { h: "Trend, 8 h", f: (r) => CH.spark(r.trend, r.state === "bad" ? "var(--bad)" : "var(--accent)") }, { h: "", f: (r) => pill(r.state, r.state === "bad" ? "over limit" : r.state === "warn" ? "near limit" : "in limit") }], rows), { c: "c7", sub: "counts per shift; a class over its limit alerts with the image" })}
      <div class="card c5"><div class="ch"><h3>Flagged for QA review</h3><span class="r">${S.flagged.filter((g) => !s.confirmed[g.id]).length} waiting</span></div>
        <div class="imgs">${S.flagged.map((g) => `<div class="img ${s.confirmed[g.id] ? "done" : ""}">${defectImg(g)}<div class="cap"><b>${esc(g.cls)}</b>${g.id} · ${s.confirmed[g.id] ? `<span class="pill ${s.confirmed[g.id] === "ok" ? "ok" : "mute"}">${s.confirmed[g.id] === "ok" ? "confirmed" : "dismissed"}</span>` : "awaiting QA"}</div>${s.confirmed[g.id] ? "" : `<div class="acts"><button class="btn sm" data-act="confirm:${g.id}">Confirm</button><button class="btn sm ghost" data-act="dismiss:${g.id}">Not a defect</button></div>`}</div>`).join("")}</div>
        <p class="note" style="margin-top:8px">Confirmed and dismissed images retrain the models in the weekly cycle. Drift is <b>${S.model.drift}</b>; last retrain ${S.model.retrained} on ${f(S.model.images30d)} images.</p></div>
    </div>`;
  }

  function qZones() {
    const zs = S.zones, byId = Object.fromEntries(zs.map((z) => [z.id, z]));
    const lab = S.series(48, (i) => { const d = new Date(S.now().getTime() - (47 - i) * 1800e3); return S.hh(d); });
    const zc = (z) => card(z.name, CH.line({ series: [{ data: z.trend, color: z.id === "cooler" || z.id === "dock" ? "var(--teal)" : z.id === "choc" || z.id === "mix" || z.id === "hotbox" ? "var(--warn)" : "var(--accent)", area: true }], limits: z.alertAbove != null ? [{ y: z.alertAbove, label: `alert above ${z.alertAbove} °F` }] : [], band: z.band ? { lo: z.band[0], hi: z.band[1] } : null, xLabels: lab, h: 150, xEvery: 6, fmt: (v) => v.toFixed(0) }) + `<div class="ribbon" style="margin-top:6px"><b>${esc(z.sensors)}</b><span>· alerts to ${esc(z.who)}</span></div>`, { c: "c6", sub: "last 24 hours, °F", r: `<span data-live="z_${z.id}">${z.now.toFixed(1)}</span> °F now` });
    return `
    <div class="grid">
      <div class="card c12"><div class="ch"><h3>Every zone, now</h3><span class="sub">temperature against its set point; limits proposed for Frutero's QA to confirm</span></div><div class="tiles">
        ${zs.map((z) => tile(z.name, `<span data-live="z_${z.id}">${z.now.toFixed(1)}</span>`, z.band ? `band ${z.band[0]} to ${z.band[1]} °F` : z.alertAbove != null ? `alert above ${z.alertAbove} °F` : "", z.alertAbove != null ? (z.now > z.alertAbove ? "bad" : "ok") : (z.band && (z.now < z.band[0] || z.now > z.band[1]) ? "warn" : "ok"), "°F")).join("")}
      </div></div>
      ${kpi("Time in band, 24 h", "99.6%", "all cold rooms together; 11 minutes out, cooler door")}
      ${kpi("Door events", "2", "cooler 02:14 (11 min), dock door 2 at 05:48 (loading)")}
      ${kpi("Defrost cycles", "3", "freezer evaporators, all within the set duration")}
      ${kpi("Pallets in cold rooms", "416", "freezer 318 · cooler 86 · hot box 12")}
      ${zc(byId.freezer)}${zc(byId.cooler)}${zc(byId.tunnel1)}${zc(byId.choc)}
      ${card("Zone events, night shift", `<ul class="list">${S.zoneEvents.map((e) => `<li><span class="t">${e.t}</span><span class="m"><b>${dot(e.sev)}${esc(e.zone)}: ${esc(e.what)}</b><span>${esc(e.detail)}</span></span></li>`).join("")}</ul>`, { c: "c6" })}
      ${card("Why these are quality numbers", `<p class="note">Ice cream that melts and refreezes is legal to sell and wrong to sell. The cold rooms, the hardening tunnels, the chocolate tanks and the pasteuriser all decide whether a piece is right, so they sit in the quality section with the cameras. The freezer alerts above −15 °F for 15 minutes; tunnels alert warmer than −31 °F while running; chocolate outside 110 to 116 °F shows beside the coating rejects on line 1; the pasteuriser chart is the legal record and it lives here too.</p><div class="row" style="margin-top:8px"><button class="btn sm" data-tab="quality:pallet">Pallet rule</button><button class="btn sm" data-tab="quality:release">Release and holds</button></div>`, { c: "c6" })}
    </div>`;
  }

  function qPallet() {
    const ps = S.pallets, over = ps.filter((p) => p.outside > 20);
    const steps = [["1 · First case", "Clock starts, C7 or C8", "The timer starts when the first case lands on the pallet, from the case count or a case scan. A hand-built pallet takes 7 to 10 minutes, and that time counts."], ["2 · Label", "RFID SSCC at G1", "The licence plate goes on at the end of the build; the printer is fed from the ERP order."], ["3 · Freezer door", "Read at G2", "The RFID portal at the freezer door closes the timer; a freezer-rated handheld is the fallback."], ["4 · Over the limit", "Alert at 20 minutes", "Push alert to the shift lead with the pallet, where it is waiting and the clip from C8 or C9."], ["5 · Shipping", "Scanned out, G3", "A pallet that reaches the dock without a freezer entry raises an alert before it is loaded."]];
    return `
    <div class="grid">
      ${kpi("Pallets built", String(ps.length), "night shift, both lines")}
      ${kpi("Inside 20 minutes", `${ps.length - over.length}<small>of ${ps.length}</small>`, `${over.length} over the limit, on QA hold`)}
      ${kpi("Average to the freezer", "11.4", "minutes from first case to the G2 read", { unit: "min" })}
      ${kpi("Longest wait", "23", "P-0412 at 03:40, end packaging", { unit: "min", cls: "alert" })}
      <div class="card c12"><div class="ch"><h3>The 20-minute rule</h3><span class="sub">the clock starts at the first case, not at the label</span></div><div class="steps">${steps.map((st, i) => `<div class="${i < 3 ? "done" : ""}"><div class="sn">${st[0]}</div><b>${st[1]}</b><p>${st[2]}</p></div>`).join("")}</div></div>
      ${card("Minutes outside the freezer, per pallet", CH.hist(ps.map((p) => p.outside), 10, { lo: 4, hi: 24, h: 150, label: "histogram" }) + `<p class="note">Most pallets reach the freezer in 8 to 14 minutes. The limit of 20 minutes is Mike's own rule from the call and is set here; QA can change it.</p>`, { c: "c6", sub: "night shift" })}
      ${card("Over the limit", table([{ h: "Pallet", k: true, f: (p) => `${p.id} <span class="s">${p.sscc}</span>` }, { h: "Product", f: (p) => `${esc(p.sku)} <span class="s">${p.lot} · ${p.cases} cases</span>` }, { h: "Built", n: true, f: (p) => p.built }, { h: "Freezer in", n: true, f: (p) => p.g2 || "—" }, { h: "Outside", n: true, f: (p) => `<b style="color:var(--bad)">${p.outside} min</b>` }, { h: "Action", f: (p) => `${pill("bad", "QA hold")} <button class="btn sm" data-drawer="pallet:${p.id}">Open</button>` }], over) + `<p class="note" style="margin-top:8px">The clip from camera C8 is attached to the alert. The morning report lists every pallet over the limit with minutes outside, where it waited and who acknowledged.</p>`, { c: "c6" })}
      ${card("Average time to freezer by shift, this week", CH.hbars([{ k: "Crew A, days", v: 9.8, t: "9.8 min", c: "good" }, { k: "Crew B, evenings", v: 10.6, t: "10.6 min", c: "good" }, { k: "Crew C, nights", v: 11.4, t: "11.4 min" }]), { c: "c6" })}
      ${card("Pallets flagged for a QA check before release", table([{ h: "Pallet", k: true, f: (p) => p.id }, { h: "Reason", f: (p) => `${p.outside} min outside at ${p.built}` }, { h: "QA", f: (p) => `<button class="btn sm" data-act="release:${p.id}">Release</button> <button class="btn sm ghost" data-act="scrap:${p.id}">Rework</button>` }], over), { c: "c6" })}
    </div>`;
  }

  function qRelease() {
    const w = S.series(240, () => 90.4 + S.nz(1.4) + (S.rnd() < 0.03 ? -3 : 0));
    return `
    <div class="grid">
      ${kpi("Fill weight, line 1", "90.4<small>g</small>", "target 90 g · Cpk 1.41 · 2 light packs rejected")}
      ${kpi("Short cases", "2", "flagged by C7 this shift, both corrected")}
      ${kpi("Metal detector", "0", "rejects; test pieces passed 22:00 and 02:00")}
      ${kpi("Lots waiting for release", "2", "L28-0314-A, L28-0314-B")}
      ${card("Fill weight distribution, line 1", CH.hist(w, 14, { lo: 85, hi: 95, h: 160, label: "fill weight histogram", dec: 0 }) + `<p class="note">Checkweigher at the ML8 outlet; the light tail at 87 g is the overrun drift that the freezer page shows, overrun 98 percent against 100 set.</p>`, { c: "c7", sub: "grams per pack, this shift" })}
      ${card("Lot release", table([{ h: "Lot", k: true, f: (r) => r[0] }, { h: "Product", f: (r) => r[1] }, { h: "Checks", f: (r) => r[2] }, { h: "", f: (r) => r[3] }], [["L28-0314-A", "Mango stick 90 ml", "Pasteuriser record, cold chain, vision, weight: all in", `${pill("ok", "ready")} <button class="btn sm" data-act="lotrelease:L28-0314-A">Release</button>`], ["L28-0314-B", "Tender coconut bar 31 ml", "P-0412 on hold, the rest in", `${pill("warn", "1 pallet held")}`], ["L28-0313-A", "Chiku stick 90 ml", "Released 13 Mar 07:10 by QA", pill("mute", "released")]]), { c: "c5" })}
      ${card("The release record, one place", `<p class="note">For every lot the app keeps the pasteuriser chart, the mix batch, the cold-room minutes, the camera counts per class, the checkweigher statistics, the metal detector tests and every pallet's time outside the freezer. A retailer audit or a recall question is answered from here in seconds, not from four binders.</p>`, { c: "c5" })}
      ${card("Holds and reworks, 30 days", CH.hbars([{ k: "Pallet time over 20 min", v: 4, t: "4" }, { k: "Coating below limit, lot held", v: 1, t: "1" }, { k: "Light packs, rework", v: 2, t: "2" }, { k: "Checkweigher drift", v: 1, t: "1" }]), { c: "c7" })}
    </div>`;
  }

  APP.views.quality = (s) => {
    const t = s.tab.quality;
    return `<div class="ph"><div><h1>Quality</h1><p>Cameras count every piece and classify what is wrong with it; the cold rooms, tunnels, chocolate tanks and pasteuriser decide whether it stays right.</p></div></div>
      ${tabs("quality", [["vision", "Vision quality"], ["zones", "Zones and cold chain"], ["pallet", "20-minute pallet rule"], ["release", "Weight, checks and release"]], t)}
      ${t === "vision" ? qVision(s) : t === "zones" ? qZones() : t === "pallet" ? qPallet() : qRelease()}`;
  };
})();
