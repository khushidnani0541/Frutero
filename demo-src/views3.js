// ---------- Views: Downtime and Maintenance, CIP, Bruce, boot ----------
(() => {
  const { esc, f, pill, dot, kpi, card, tile, table, tabs, legend, pct, progress, toast, drawer } = UI;
  const S = SIM;

  // ---- Maintenance ----
  function mEvents() {
    const sh = S.shift;
    return `<div class="grid">
      ${kpi("Downtime this shift", `${sh.L1.stopMin + sh.L2.stopMin}<small>min</small>`, `line 1 <b>${sh.L1.stopMin}</b> · line 2 <b>${sh.L2.stopMin}</b> · 5 stops`)}
      ${kpi("Mean time to repair", "7.6<small>min</small>", "breakdowns this week, both lines")}
      ${kpi("Response to a stop", "3.4<small>min</small>", "stop to first action on the panel")}
      ${kpi("Open events", "1", "line 2, R2 film splice since 06:08", { cls: "alert" })}
      ${card("Event log", table([{ h: "Time", n: true, f: (e) => e.t }, { h: "Line", f: (e) => e.line }, { h: "Machine", k: true, f: (e) => e.machine }, { h: "Cause", f: (e) => `${esc(e.cause)} <span class="s">${e.kind} · from the panel's station-at-fault code</span>` }, { h: "Duration", n: true, f: (e) => e.min + " min" }, { h: "Response", n: true, f: (e) => e.resp ? e.resp.toFixed(1) + " min" : "—" }, { h: "Who", f: (e) => e.who }, { h: "", f: (e) => e.status === "open" ? pill("bad", "open") : pill("mute", "closed") }], S.events, { row: (e) => `data-drawer="event:${e.t}" class="click"` }), { c: "c8", sub: "night shift; click an event" })}
      ${card("By kind, this week", CH.hbars([{ k: "Breakdowns", v: 333, t: "333 min", c: "bad" }, { k: "Planned stops", v: 244, t: "244 min" }, { k: "Changeovers", v: 118, t: "118 min", c: "warn" }]) + `<div class="ch" style="margin-top:12px"><h3>Top causes</h3></div>` + CH.hbars(S.losses.slice(0, 5).map((l) => ({ k: l.cause, v: l.min, t: l.min + " min", c: l.kind === "Breakdown" ? "bad" : "" }))), { c: "c4" })}
      ${card("MTBF and MTTR by machine", table([{ h: "Machine", k: true, f: (a) => a.name }, { h: "Hours run", n: true, f: (a) => f(a.hours) }, { h: "MTBF", n: true, f: (a) => a.mtbf + " h" }, { h: "MTTR", n: true, f: (a) => a.mttr + " min" }, { h: "Health", f: (a) => `${progress(a.health)}<span class="s">${a.health}</span>` }, { h: "Next", f: (a) => `${esc(a.next)} <span class="s">${esc(a.due)}</span>` }, { h: "", f: (a) => pill(a.state, a.state === "ok" ? "ok" : "watch") }], S.assets, { row: (a) => `data-drawer="asset:${a.id}" class="click"` }), { c: "c12", sub: "from the panel alarms, stop codes and hour counters" })}
    </div>`;
  }

  function mInsights(s) {
    return `<div class="grid">
      <div class="card c7"><div class="ch"><h3>What Bruce sees coming</h3><span class="sub">patterns in the stops, counters and sensors, with the evidence</span><span class="r"><span class="pill vio">Bruce</span></span></div>
        <div class="stack">${S.insights.map((i, k) => `<div class="insight ${i.sev}"><b>${esc(i.title)}</b><p>${esc(i.body)}</p><div class="acts">${i.act.startsWith("See") ? `<button class="btn sm" data-go="cip">Open CIP</button>` : i.act.startsWith("Suggest") ? `<button class="btn sm" data-act="note:${k}">Add to the shift handover</button>` : `<button class="btn sm pri" data-act="wo:${k}">${esc(i.act)}</button>`}<span class="ev">Evidence: ${esc(i.ev)}</span></div></div>`).join("")}</div></div>
      <div class="card c5"><div class="ch"><h3>Condition signals</h3><span class="sub">read from the panels and the refrigeration controller</span></div>
        ${card("Tunnel 18/800 overload stops per week", CH.bars({ cats: ["W6", "W7", "W8", "W9", "W10", "W11"], series: [{ data: [0, 1, 0, 1, 0, 2], color: "var(--bad)" }], h: 110, yMax: 3 }), { c: "c12", cls: "flat" })}
        <div style="height:10px"></div>
        ${card("CO2 compressor 2, capacity steps at the same load", CH.line({ series: [{ data: S.series(28, (i) => 5.1 + (i > 18 ? (i - 18) * 0.12 : 0) + S.nz(0.25)), color: "var(--warn)", area: true }], h: 110, yMin: 4, yMax: 7.5, limits: [{ y: 6.2, label: "norm + 18%", color: "var(--warn)" }] }), { c: "c12", cls: "flat", sub: "28 days" })}
        <div style="height:10px"></div>
        ${card("Dasher hours, Teknofreeze 2x2000", `<div class="bar"><span><span>1,980 of 2,000 h to service</span></span><i class="warn" style="width:99%"></i><b>99%</b></div>`, { c: "c12", cls: "flat" })}
      </div>
      ${card("Stops by hour and day", CH.heat(S.stopsHeat, { rowLabels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"], label: "stops heatmap" }), { c: "c12", sub: "last 7 days; the night reel-change cluster shows at 02:00 to 04:00" })}
    </div>`;
  }

  function mPlan() {
    const days = ["Mon 13", "Tue 14", "Wed 15", "Thu 16", "Fri 17", "Sat 18", "Sun 19"];
    const idx = (d) => (d === 0 ? 1 : d === 1 ? 2 : d === 2 ? 3 : d === 3 ? 4 : d === 4 ? 5 : d === 5 ? 6 : 0);
    const techLoad = [{ k: "Marco", v: 7.5 }, { k: "Jen", v: 5.2 }, { k: "Omar", v: 6.1 }, { k: "Contractor", v: 2 }];
    return `<div class="grid">
      <div class="card c12"><div class="ch"><h3>Preventive plan, this week</h3><span class="sub">intervals from the Teknoice manuals and the hour counters; items due move to the front</span><span class="r"><button class="btn sm" data-act="autoplan">Let Bruce fill next week</button></span></div>
        <div class="cal">${days.map((d, i) => `<div class="day ${i === 1 ? "today" : ""}"><h5>${d}${i === 1 ? "<span>today</span>" : ""}</h5>${S.pmPlan.filter((p) => idx(p.day) === i).map((p) => `<div class="pm ${p.due ? "due" : ""}">${esc(p.what)}<br><span style="color:var(--muted)">${p.min} min · ${p.who}</span></div>`).join("")}</div>`).join("")}</div></div>
      ${card("Hours this week, by machine", CH.hbars(S.woHours.map((w) => ({ k: w.m, v: w.h, t: w.h.toFixed(1) + " h", c: w.m.startsWith("Prev") ? "good" : "" }))) + `<p class="note" style="margin-top:8px">Hours counted from work orders opened and closed in the app; no one is tracked.</p>`, { c: "c6" })}
      ${card("Technician load, this week", CH.hbars(techLoad.map((t) => ({ k: t.k, v: t.v, t: t.v + " h", c: t.v > 7 ? "warn" : "" }))) + `<p class="note" style="margin-top:8px">Assignments balance against the production plan: nothing on a line during its run, everything in CIP and changeover windows.</p>`, { c: "c6" })}
      ${card("Parts on hand for the plan", table([{ h: "Part", k: true, f: (r) => r[0] }, { h: "For", f: (r) => r[1] }, { h: "On hand", n: true, f: (r) => r[2] }, { h: "", f: (r) => r[3] }], [["Dasher scraper blade set, 2x2000", "Dasher service tonight", "2", pill("ok", "in stock")], ["Tray chain link kit, 18/800", "Chain inspection Wed", "1", pill("ok", "in stock")], ["Splice unit sensor, ML8", "WO-0338", "0", pill("warn", "ordered, ETA Thu")], ["Pump seal, enrober tank 1", "Thu", "3", pill("ok", "in stock")]]), { c: "c12", sub: "parts mezzanine; reorder requests go to the ERP" })}
    </div>`;
  }

  function mWork(s) {
    const cols = [["open", "Open"], ["assigned", "Assigned"], ["progress", "In progress"], ["done", "Done this week"]];
    const wo = (w) => `<div class="wo"><b>${esc(w.title)}</b><div class="meta"><span>${w.id}</span><span>${w.machine}</span><span>${w.est} min</span><span>${w.pri}</span>${w.hours ? `<span>${w.hours} h logged</span>` : ""}</div><div class="meta"><span>from ${esc(w.src)}</span>${w.tech ? `<span><b>${w.tech}</b></span>` : ""}</div>
      ${w.col === "open" ? `<select data-assign="${w.id}"><option value="">Assign to…</option><option>Marco</option><option>Jen</option><option>Omar</option><option>Contractor</option></select>` : ""}
      <div class="acts">${w.col === "assigned" ? `<button class="btn sm" data-act="start:${w.id}">Start</button>` : w.col === "progress" ? `<button class="btn sm" data-act="done:${w.id}">Close</button>` : ""}</div></div>`;
    return `<div class="grid">
      ${kpi("Open", String(S.workOrders.filter((w) => w.col === "open").length), "waiting for a technician")}
      ${kpi("In progress", String(S.workOrders.filter((w) => w.col === "progress").length), "2.3 h logged today")}
      ${kpi("Closed this week", "14", "28.5 h; preventive 7.2 h of it")}
      ${kpi("Suggested by Bruce", String(S.workOrders.filter((w) => w.src.startsWith("Bruce")).length), "each one approved by a person")}
      <div class="card c12"><div class="ch"><h3>Work orders</h3><span class="sub">assign, start and close here; hours are counted from these</span></div><div class="kanban">${cols.map((c) => `<div class="col"><h4>${c[1]}<span>${S.workOrders.filter((w) => w.col === c[0]).length}</span></h4>${S.workOrders.filter((w) => w.col === c[0]).map(wo).join("")}</div>`).join("")}</div></div>
    </div>`;
  }

  APP.views.maint = (s) => {
    const t = s.tab.maint;
    return `<div class="ph"><div><h1>Downtime and maintenance</h1><p>Every stop with its cause from the panel; the patterns that predict the next one; the plan and the work orders that prevent it.</p></div></div>
      ${tabs("maint", [["events", "Events"], ["insights", "Insights and prevention"], ["plan", "Maintenance plan"], ["work", "Work orders"]], t)}
      ${t === "events" ? mEvents() : t === "insights" ? mInsights(s) : t === "plan" ? mPlan() : mWork(s)}`;
  };

  APP.eventDrawer = (t) => { const e = S.events.find((x) => x.t === t); if (!e) return ""; return `<div class="kv"><span>Time</span><b>${e.t}</b><span>Line</span><b>${e.line}</b><span>Machine</span><b>${e.machine}</b><span>Cause</span><b>${esc(e.cause)}</b><span>Kind</span><b>${e.kind}</b><span>Duration</span><b>${e.min} min</b><span>Response</span><b>${e.resp ? e.resp + " min" : "—"}</b><span>By</span><b>${e.who}</b></div><div class="insight"><b>From the controller</b><p>Station-at-fault code and alarm text from the panel, the counter values before and after, and the camera clip from the nearest position are attached to the event. The operator's note is the only typed field.</p></div><div class="acts" style="display:flex;gap:6px"><button class="btn sm pri" data-act="wofrom:${e.t}">Create work order</button><button class="btn sm">Open clip</button></div>`; };
  APP.assetDrawer = (id) => { const a = S.assets.find((x) => x.id === id); if (!a) return ""; return `<div class="kv"><span>Hours run</span><b>${f(a.hours)}</b><span>MTBF</span><b>${a.mtbf} h</b><span>MTTR</span><b>${a.mttr} min</b><span>Health</span><b>${a.health}</b><span>Next</span><b>${esc(a.next)}</b><span>Due</span><b>${esc(a.due)}</b></div>${card("Stops, 6 weeks", CH.bars({ cats: ["W6", "W7", "W8", "W9", "W10", "W11"], series: [{ data: S.series(6, () => Math.round(1 + S.rnd() * 4)), color: "var(--accent)" }], h: 110 }), { c: "c12", cls: "flat" })}<div class="insight"><b>Manual and parts</b><p>Teknoice service intervals, the parts list and the last three work orders are one tap away; Bruce drafts the next work order from them.</p></div>`; };

  // ---- CIP ----
  function cipLive(s) {
    const c = S.circuits[0], ph = S.phases;
    const sensorTiles = (list, pre) => `<div class="tiles">${list.map((x, i) => { const st = x.lo != null ? UI.stateOf(x.v, x.lo, x.hi) : ""; const live = pre === "in" && i === 0 ? "cipTin" : pre === "out" && i === 0 ? "cipTout" : pre === "out" && i === 4 ? "cipTurb" : pre === "out" && i === 5 ? "cipRes" : null; return tile(x.k, live ? `<span data-live="${live}">${x.v}</span>` : String(x.v), x.lo != null ? `${x.lo} to ${x.hi}${x.u ? " " + x.u : ""}` : "", st, x.u); }).join("")}</div>`;
    return `<div class="grid">
      <div class="card c12"><div class="ch"><h3>Circuits</h3><span class="sub">each with its own supply and return sensors</span></div><div class="flow">${S.circuits.map((x) => `<div class="st ${x.state === "running" ? "ok" : x.state.startsWith("done") ? "" : "warn"}"><b>${x.id} · ${esc(x.name)}</b><span>${x.state === "running" ? `running: ${ph[Math.max(0, x.phase)].k}, <span data-live="cipT">${x.t}</span> min in` : esc(x.state)}</span></div>`).join("")}</div></div>
      ${card("CIP-1 cycle " + c.cycleId + ", fixed recipe against measured endpoints", CH.phaseBars(ph.map((p, i) => ({ ...p, actual: i < c.phase ? p.actual : i === c.phase ? Math.max(1, Math.round(c.t)) : p.actual })), 75) + legend([["var(--grid)", "fixed recipe step"], ["var(--accent)", "sensor-verified, rinses and caustic"], ["var(--violet)", "acid"], ["var(--good)", "sanitise"]]) + `<p class="note">Each phase ends when the return-line sensors say the job is done, not when a timer runs out: <b>${esc(ph[Math.max(0, c.phase)].end)}</b>. Expected this cycle: ${S.actualTotal} min against ${S.fixedTotal}, <b>${S.fixedTotal - S.actualTotal} minutes back on the line</b>.</p>`, { c: "c8", sub: "minutes" })}
      ${card("Residue index, caustic wash", CH.line({ series: [{ data: S.residue, color: "var(--accent)", area: true }], h: 150, yMin: 0, yMax: 1.05, limits: [{ y: 0.15, label: "endpoint 0.15", color: "var(--good)" }], marks: [{ i: 19, label: "endpoint met, 19 min" }], xLabels: S.series(26, (i) => i + " min"), xEvery: 5 }) + `<p class="note">Integrated UV-Vis absorbance of the return line against the clean baseline: fat and chocolate at 400 to 480 nm, protein at 280 nm, fruit colour at 520 nm.</p>`, { c: "c4" })}
      <div class="card c6"><div class="ch"><h3>Supply, inlet pipe</h3><span class="r">live</span></div>${sensorTiles(S.cipSensors.inlet, "in")}</div>
      <div class="card c6"><div class="ch"><h3>Return, outlet pipe</h3><span class="r">live</span></div>${sensorTiles(S.cipSensors.outlet, "out")}</div>
      ${card("Spectral fingerprint of the return line", CH.line({ series: [{ data: S.spectrum.start, color: "var(--bad)", end: false, dash: "4 3" }, { data: S.spectrum.now, color: "var(--accent)", end: false }, { data: S.spectrum.clean, color: "var(--good)", end: false }], xLabels: S.wl.map((w) => w + " nm"), xEvery: 6, h: 170, yMin: 0, yMax: 1.1, fmt: (v) => v.toFixed(1), marks: [{ i: 3, label: "protein 280", color: "var(--muted)" }, { i: 19, label: "fat, chocolate 440", color: "var(--muted)" }, { i: 27, label: "fruit 520", color: "var(--muted)" }] }) + legend([["var(--bad)", "start of wash"], ["var(--accent)", "now, 12 min into caustic"], ["var(--good)", "clean baseline"]]), { c: "c8", sub: "absorbance, 250 to 750 nm" })}
      <div class="card c4"><div class="ch"><h3>Tanks and dosing</h3></div>${S.cipSensors.tanks.map((t) => `<div class="bar"><span><span>${t.k}</span></span><i class="${t.v < 50 ? "warn" : ""}" style="width:${t.v}%"></i><b>${t.v}%</b></div>`).join("")}<p class="note" style="margin-top:8px">Caustic is dosed to 1.5 percent by conductivity, not by volume, so a weak batch is caught before the wash starts. Recovered final-rinse water feeds the next pre-rinse.</p></div>
    </div>`;
  }

  function cipHistory() {
    return `<div class="grid">
      ${kpi("Cycles, 14 days", String(S.cycles.length), "all verified on endpoints; 0 repeats")}
      ${kpi("Minutes saved per cycle", "19.1", "average; fixed recipe 73 min", { unit: "min" })}
      ${kpi("Final rinse, conductivity", "+14<small>µS/cm</small>", "average above supply; limit 20")}
      ${kpi("Repeat washes", "0", "a failed endpoint would repeat the phase, not the cycle")}
      ${card("Minutes saved per cycle", CH.bars({ cats: S.cycles.map((c) => c.date), series: [{ data: S.cycles.map((c) => c.saved), color: "var(--good)" }], h: 150, xEvery: 7, yMax: 25 }), { c: "c12", sub: "against the fixed recipe" })}
      ${card("Cycle record", table([{ h: "Cycle", k: true, f: (c) => c.id }, { h: "Date", f: (c) => c.date }, { h: "Circuit", f: (c) => c.circuit }, { h: "Fixed", n: true, f: (c) => c.fixed + " min" }, { h: "Actual", n: true, f: (c) => c.actual + " min" }, { h: "Saved", n: true, f: (c) => `<b style="color:var(--good)">${c.saved} min</b>` }, { h: "Water", n: true, f: (c) => f(c.water) + " gal" }, { h: "Caustic", n: true, f: (c) => c.caustic + " L" }, { h: "Acid", n: true, f: (c) => c.acid + " L" }, { h: "Energy", n: true, f: (c) => c.kwh + " kWh" }, { h: "Final rinse", n: true, f: (c) => "+" + c.rinse + " µS" }, { h: "", f: (c) => pill("ok", "verified") }], S.cycles.slice().reverse()), { c: "c12", sub: "every cycle keeps its sensor traces as the sanitation record" })}
    </div>`;
  }

  function cipSavings(s) {
    const d = { ...S.cipDefaults, ...(s.cipIn || {}) };
    const minDay = (S.fixedTotal - S.actualTotal) * d.cyclesPerDay, hrsDay = minDay / 60;
    const upDay = hrsDay * d.lineHourValue, waterDay = d.waterSaved * d.cyclesPerDay * d.waterCost, chemDay = (d.causticSaved * d.causticCost + d.acidSaved * d.acidCost) * d.cyclesPerDay, enDay = d.kwhSaved * d.cyclesPerDay * d.energyCost;
    const tot = upDay + waterDay + chemDay + enDay;
    const inp = (k, l, step = 1) => `<label class="kv" style="grid-template-columns:1fr 110px;align-items:center"><span>${l}</span><input data-cip="${k}" type="number" step="${step}" value="${d[k]}" style="border:1px solid var(--line);border-radius:6px;padding:4px 8px;background:var(--panel);width:110px"></label>`;
    return `<div class="grid">
      ${kpi("Line time back, per day", f(Math.round(minDay)), `${d.cyclesPerDay} cycles × ${S.fixedTotal - S.actualTotal} min`, { unit: "min" })}
      ${kpi("Value per day", "$" + f(Math.round(tot)), `uptime $${f(Math.round(upDay))} · water, chemicals, energy $${f(Math.round(waterDay + chemDay + enDay))}`)}
      ${kpi("Per month", "$" + f(Math.round(tot * 30)), `${f(Math.round(minDay * 30 / 60))} line-hours`)}
      ${kpi("Per year", "$" + f(Math.round(tot * 350)), `${f(Math.round(d.waterSaved * d.cyclesPerDay * 350 / 1000))}k gallons of water`)}
      <div class="card c5"><div class="ch"><h3>Assumptions, Frutero's to set</h3><span class="sub">change a value and the figures update</span></div><div class="stack">${inp("cyclesPerDay", "CIP cycles per day", 0.5)}${inp("lineHourValue", "Value of one line-hour, $", 50)}${inp("waterCost", "Water and effluent, $ per gallon", 0.001)}${inp("causticCost", "Caustic, $ per litre", 0.1)}${inp("acidCost", "Acid, $ per litre", 0.1)}${inp("energyCost", "Energy, $ per kWh", 0.01)}</div><p class="note" style="margin-top:8px">Per cycle the sensors save about ${d.waterSaved} gallons, ${d.causticSaved} L caustic, ${d.acidSaved} L acid and ${d.kwhSaved} kWh of heating. Line-hour value is the contribution of an hour of production; a 90 ml stick line at 16,900 pieces an hour makes it the largest term by far.</p></div>
      ${card("Where the minutes come from", table([{ h: "Phase", k: true, f: (p) => p.k }, { h: "Fixed", n: true, f: (p) => p.fixed + " min" }, { h: "Measured", n: true, f: (p) => p.actual + " min" }, { h: "Saved", n: true, f: (p) => `<b style="color:var(--good)">${p.fixed - p.actual} min</b>` }, { h: "Endpoint", f: (p) => esc(p.end) }], S.phases) + `<p class="note" style="margin-top:8px">A fixed recipe carries a safety margin on every step because nobody can see inside the pipe. The spectral sensor, conductivity, pH, turbidity and temperature on the return line show when each step has actually finished, and the record proves it.</p>`, { c: "c7" })}
      ${card("Savings, 14 days", CH.bars({ cats: S.cycles.map((c) => c.date), series: [{ data: S.cycles.map((c) => Math.round(c.saved / 60 * d.lineHourValue)), color: "var(--accent)" }, { data: S.cycles.map((c) => Math.round((2600 - c.water) * d.waterCost + (12 - c.caustic) * d.causticCost + (6 - c.acid) * d.acidCost + (95 - c.kwh) * d.energyCost)), color: "var(--teal)" }], stacked: true, h: 150, xEvery: 7, fmt: (v) => "$" + f(Math.round(v)) }) + legend([["var(--accent)", "line time"], ["var(--teal)", "water, chemicals, energy"]]), { c: "c12", sub: "dollars per cycle at the assumptions above" })}
    </div>`;
  }

  function cipSensorsTab() {
    const rows = [["Supply line", "Temperature", "RTD", "32 to 212 °F", "Jun 2028", "ok"], ["Supply line", "Flow", "Electromagnetic", "0 to 200 gal/min", "Sep 2028", "ok"], ["Supply line", "Pressure", "Piezo", "0 to 100 psi", "Sep 2028", "ok"], ["Supply line", "Conductivity", "Inductive", "0 to 200 mS/cm", "Jun 2028", "ok"], ["Supply line", "pH", "Glass electrode", "0 to 14", "Apr 2028", "warn"], ["Supply line", "Turbidity", "Nephelometric", "0 to 100 NTU", "Jun 2028", "ok"], ["Return line", "Temperature", "RTD", "32 to 212 °F", "Jun 2028", "ok"], ["Return line", "Flow", "Electromagnetic", "0 to 200 gal/min", "Sep 2028", "ok"], ["Return line", "Conductivity", "Inductive", "0 to 200 mS/cm", "Jun 2028", "ok"], ["Return line", "pH", "Glass electrode", "0 to 14", "Apr 2028", "warn"], ["Return line", "Turbidity", "Nephelometric", "0 to 100 NTU", "Jun 2028", "ok"], ["Return line", "Spectral absorbance", "Inline UV-Vis, 200 to 800 nm", "0 to 2 AU", "Jun 2028", "ok"], ["Tanks", "Level, 4 tanks", "Hydrostatic", "0 to 100 %", "Sep 2028", "ok"], ["Dosing", "Caustic and acid dosing", "Pump stroke counter", "", "", "ok"]];
    return `<div class="grid">
      ${card("Sensors on the CIP skid", table([{ h: "Where", k: true, f: (r) => r[0] }, { h: "Parameter", f: (r) => r[1] }, { h: "Type", f: (r) => r[2] }, { h: "Range", f: (r) => r[3] }, { h: "Calibration due", n: true, f: (r) => r[4] }, { h: "", f: (r) => pill(r[5], r[5] === "ok" ? "ok" : "due soon") }], rows), { c: "c8", sub: "hygienic, 3-A fittings; readings every second during a cycle" })}
      ${card("What each sensor settles", `<div class="stack"><div class="insight"><b>Conductivity</b><p>Caustic and acid strength on the supply; on the return, the moment a rinse has washed the chemical out.</p></div><div class="insight"><b>Spectral absorbance</b><p>Product residue by kind: protein, fat and chocolate, fruit colour. The endpoint of the pre-rinse and the caustic wash.</p></div><div class="insight"><b>Turbidity and contaminants</b><p>Suspended solids on the return; a contaminant index for anything that should not be there, such as detergent carry-over in the final rinse.</p></div><div class="insight"><b>Temperature, flow, pressure, level</b><p>Proof that the wash ran at the recipe's temperature and velocity, and that every tank had what the dosing needed.</p></div></div>`, { c: "c4" })}
    </div>`;
  }

  APP.views.cip = (s) => {
    const t = s.tab.cip;
    return `<div class="ph"><div><h1>CIP monitoring</h1><p>Clean-in-place cycles end on measured endpoints, not timers: 15 to 20 minutes back on the line per cycle, with the sensor record as the sanitation proof.</p></div></div>
      ${tabs("cip", [["live", "Live cycle"], ["history", "Cycle history"], ["savings", "Savings"], ["sensors", "Sensors"]], t)}
      ${t === "live" ? cipLive(s) : t === "history" ? cipHistory() : t === "savings" ? cipSavings(s) : cipSensorsTab()}`;
  };

  // ---- Bruce (canned, data-backed answers) ----
  const answers = [
    [/overnight|happened|night/i, () => `<b>Overnight, 22:00 to 06:00.</b><ul><li>Line 1 made ${f(S.shift.L1.out)} Mango sticks, ${pct(S.shift.L1.out, S.shift.L1.plan)}% of plan; OEE ${S.shift.L1.oee}%; 3 stops, 27 min, the longest the 14-minute reel change at 04:52.</li><li>Line 2 made ${f(S.shift.L2.out)} Tender coconut bars, OEE ${S.shift.L2.oee}%, and stopped at 06:08 on an R2 film splice.</li><li>Quality 98.1% first pass; off-centre sticks on C1 lane 3 crossed the limit at 05:52.</li><li>Cold rooms in band all night; cooler door open 11 min at 02:14, acknowledged in 3.</li><li>46 pallets built, 45 inside 20 minutes; P-0412 waited 23 min and is on QA hold.</li></ul>`],
    [/why.*(line 1|miss|plan)|lost|lose/i, () => `<b>Line 1 missed plan by 7,600 pieces.</b><ul><li>27 minutes of stops: reel changes 22 min (two), stick inserter jam 9 min, overload stop 4 min, less overlap.</li><li>Running speed averaged 16,900 against 17,500 best for this format: about 2,900 pieces.</li><li>2,480 rejects, mostly stick and coating.</li></ul>The reel changes are the lever: crew A does them in 8 minutes. Pre-staging reels at 01:30 recovers most of the gap.`],
    [/pallet|hold|qa check/i, () => `<b>One pallet needs a QA check: P-0412.</b> Mango stick 90 ml, lot L28-0314-A, 64 cases, first case 03:40, 23 minutes before the freezer door. The alert went to Dana R. at the 20-minute mark and was acknowledged in 2 minutes. The clip from C8 is attached. Release needs a core-temperature check on two cases; the other 45 pallets were inside the limit.`],
    [/dasher|service|maintenance|work order/i, () => `<b>The 2x2000 dasher is at 1,980 hours; Teknoice sets 2,000.</b> Tonight's CIP window at 06:30 has 40 minutes free, enough for the service. WO-0341 is assigned to Marco. The tray-chain inspection on the 18/800 is the other open item: two overload stops this week after warm restarts.`],
    [/cip|clean|sav/i, () => `<b>CIP this week: 58 minutes of line time back yesterday, about ${f(Math.round((S.fixedTotal - S.actualTotal) * S.cipDefaults.cyclesPerDay))} a day.</b> Cycles end on the return-line sensors: residue index under 0.15 after the pre-rinse, flat for three minutes in the caustic, conductivity back to supply in the rinses. Every cycle in the last 14 days verified; no repeats. CIP-1 is in the caustic wash now, tracking 19 minutes early.`],
    [/oee|crew|operator|shift/i, () => `<b>OEE this shift: line 1 at 78%, line 2 at 81%.</b> Crew C is 4 points behind crew A for the week, almost all of it reel changes (14 min against 8) and response to stops (5.2 min against 3.1). First-pass quality and pallet timing are within a point across crews.`],
    [/temperature|freezer|cold|cooler|zone/i, () => `<b>Cold rooms now:</b> freezer ${S.zones[0].now.toFixed(1)} °F, cooler ${S.zones[1].now.toFixed(1)} °F, hot box ${S.zones[2].now.toFixed(1)} °F, tunnel 1 ${S.zones[3].now.toFixed(1)} °F, dock ${S.zones[5].now.toFixed(1)} °F. All in band for the last 24 hours except the 11-minute cooler door at 02:14. Three defrost cycles, all within the set duration.`],
    [/ship|truck|order|erp|inventory/i, () => `<b>Shipping today: 66 pallets on three trucks.</b> 09:00 to Retail DC 1 (22 pallets, loading at door 2), 11:30 to Retail DC 2 (18, staged in aisle A), 14:00 to the club store DC (26, pick list released). Freezer at 318 of 552 positions. The oldest stock is the co-packer pints, 12 days, and the 14:00 pick takes it first.`],
    [/rfid|ble|trace/i, () => `<b>Pallets are traced with passive RFID on the SSCC label</b>: no battery, cents per pallet, read at the freezer door and the dock without anyone pointing a scanner. A BLE temperature tag is the option for pallets staged for reefer trucks. The Why RFID tab has the comparison.`],
  ];
  const fallback = () => `I can answer from the plant's own data: what happened overnight, why a line missed plan, which pallets need a QA check, what maintenance is due, what CIP saved, how the crews compare, the cold rooms, today's shipments. Try one of the questions below.`;
  const suggestions = ["What happened overnight?", "Why did line 1 miss plan?", "Which pallets need a QA check?", "What maintenance is due?", "How much did CIP save?", "How do the crews compare?"];
  function ask(q) {
    const box = document.querySelector("#bruce .msgs");
    box.insertAdjacentHTML("beforeend", `<div class="msg me">${esc(q)}</div>`);
    const a = (answers.find((x) => x[0].test(q)) || [null, fallback])[1]();
    setTimeout(() => { box.insertAdjacentHTML("beforeend", `<div class="msg ai">${a}</div>`); box.scrollTop = box.scrollHeight; }, 350);
    box.scrollTop = box.scrollHeight;
  }
  function openBruce(q) { document.getElementById("bruce").classList.add("open"); document.getElementById("fab").classList.add("hidden"); if (q) ask(q); }
  function closeBruce() { document.getElementById("bruce").classList.remove("open"); document.getElementById("fab").classList.remove("hidden"); }

  // ---- boot and delegation ----
  function boot() {
    document.querySelector("#bruce .sug").innerHTML = suggestions.map((q) => `<button data-bruce="${esc(q)}">${esc(q)}</button>`).join("");
    document.querySelector("#bruce .msgs").innerHTML = `<div class="msg ai"><b>Good morning.</b> I read the plant's data: the controllers, the cameras, the cold rooms, the pallets, the CIP skid. Ask me anything about the night, or pick a question.</div>`;
    try { const v = localStorage.getItem("frutero-view"); if (v && APP.views[v]) APP.state.view = v; } catch (e) {}
    const h = (location.hash || "").slice(1); if (h && APP.views[h]) APP.state.view = h;
    APP.render();
    document.body.addEventListener("click", (ev) => {
      const t = ev.target.closest("[data-go],[data-tab],[data-seg],[data-drawer],[data-act],[data-bruce],#fab,#bruce .x,#drawer .x");
      if (!t) return;
      if (t.id === "fab") return openBruce();
      if (t.matches("#bruce .x")) return closeBruce();
      if (t.matches("#drawer .x")) return drawer.close();
      if (t.dataset.bruce) return openBruce(t.dataset.bruce);
      if (t.dataset.go) { const tab = t.dataset.tabTo; return APP.go(t.dataset.go, tab); }
      if (t.dataset.tab) { const [v, tab] = t.dataset.tab.split(":"); return APP.go(v, tab); }
      if (t.dataset.drawer) { const [k, id] = t.dataset.drawer.split(":"); const fn = { pallet: APP.palletDrawer, event: APP.eventDrawer, asset: APP.assetDrawer }[k]; if (fn) drawer.open(k === "pallet" ? "Pallet " + id : k === "event" ? "Event at " + id : S.assets.find((a) => a.id === id).name, fn(id)); return; }
      if (t.dataset.act) return act(t.dataset.act);
    });
    document.body.addEventListener("change", (ev) => {
      const sel = ev.target.closest("[data-assign]"); if (sel && sel.value) { const w = S.workOrders.find((x) => x.id === sel.dataset.assign); w.tech = sel.value; w.col = "assigned"; toast(`${w.id} assigned to ${w.tech}`); APP.render(); }
    });
    document.body.addEventListener("input", (ev) => {
      if (ev.target.id === "psearch") { APP.state.search = ev.target.value; const pos = ev.target.selectionStart; APP.render(); const el = document.getElementById("psearch"); el.focus(); el.setSelectionRange(pos, pos); }
      if (ev.target.dataset.cip) { APP.state.cipIn = { ...(APP.state.cipIn || {}), [ev.target.dataset.cip]: parseFloat(ev.target.value) || 0 }; const active = ev.target.dataset.cip; APP.render(); const el = document.querySelector(`[data-cip="${active}"]`); if (el) { el.focus(); } }
    });
    document.querySelector("#bruce form").addEventListener("submit", (ev) => { ev.preventDefault(); const i = ev.target.querySelector("input"); if (i.value.trim()) ask(i.value.trim()); i.value = ""; });
    document.getElementById("bruce").addEventListener("click", (ev) => { const b = ev.target.closest(".sug button"); if (b) ask(b.dataset.bruce); });
    setInterval(() => { S.tick(); APP.live(); }, 2000);
  }
  function act(a) {
    const [k, id] = a.split(":");
    if (k === "confirm" || k === "dismiss") { APP.state.confirmed[id] = k === "confirm" ? "ok" : "no"; toast(k === "confirm" ? `${id} confirmed; added to the training set` : `${id} marked not a defect`); APP.render(); }
    else if (k === "release" || k === "scrap" || k === "lotrelease") { toast(k === "lotrelease" ? `Lot ${id} released; posted to the ERP` : k === "release" ? `${id} released after the QA check` : `${id} sent to rework`); drawer.close(); }
    else if (k === "wo") { const i = S.insights[+id]; const n = "WO-0" + (344 + S.workOrders.length - 7); S.workOrders.unshift({ id: n, title: i.act.replace("Create work order: ", ""), machine: i.title.includes("dasher") ? "FRZ1" : i.title.includes("Chain") ? "TL1" : "CO2", est: 60, col: "open", tech: "", src: "Bruce suggestion", pri: "High" }); toast(`${n} created from the insight`); APP.go("maint", "work"); }
    else if (k === "wofrom") { const n = "WO-0" + (344 + S.workOrders.length - 7); S.workOrders.unshift({ id: n, title: "Follow-up on event " + id, machine: "", est: 30, col: "open", tech: "", src: "Event " + id, pri: "Medium" }); drawer.close(); toast(`${n} created`); APP.go("maint", "work"); }
    else if (k === "start") { const w = S.workOrders.find((x) => x.id === id); w.col = "progress"; w.hours = 0.1; toast(`${id} started; the clock is running`); APP.render(); }
    else if (k === "done") { const w = S.workOrders.find((x) => x.id === id); w.col = "done"; w.hours = (w.hours || 0.5) + 0.4; toast(`${id} closed; ${w.hours.toFixed(1)} h counted`); APP.render(); }
    else if (k === "note") toast("Added to the shift handover for crew C");
    else if (k === "autoplan") toast("Next week's plan drafted from the hour counters; 9 items, waiting for approval");
    else if (k === "lotgo") toast("Traced L28-0314-A: 6 pallets, 1 on hold");
  }
  window.addEventListener("DOMContentLoaded", boot);
})();
