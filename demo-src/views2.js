// ---------- Views: Production and OEE, Traceability and ERP ----------
(() => {
  const { esc, f, pill, dot, kpi, card, tile, table, tabs, legend, pct, progress } = UI;
  const S = SIM;

  // ---- Production ----
  const stationStrip = (L) => { const st = L.id === "L1" ? [["Freezer 2x2000", "ok"], ["Extruder, inserters", L.stop && L.stop.includes("inserter") ? "bad" : "ok"], ["Tunnel −40 °C", "ok"], ["Pick-up, enrobing", "ok"], ["ML8 wrapper", "ok"], ["Case packer", "warn"]] : [["Freezer 2x1000", "ok"], ["Extruder, cutting", "ok"], ["Tunnel, aftercooler", "ok"], ["Pick-up, enrobing", "ok"], ["R2 wrapper", L.state === "stopped" ? "bad" : "ok"], ["Case packer", "ok"]]; return `<div class="flow">${st.map((x) => `<div class="st ${x[1]}"><b>${dot(x[1])}${x[0]}</b></div>`).join("")}</div>`; };
  const lineCard = (L) => `<div class="card c6 ${L.state === "stopped" ? "alert" : ""}"><div class="ch"><h3>${esc(L.name)}</h3><span class="r">${L.state === "running" ? pill("ok", "running") : pill("warn", `stopped ${L.stopMin} min`)}</span></div>
    <div class="row" style="gap:16px;align-items:flex-start">
      <div class="gauge">${CH.ring(L.speed / L.nominal * 100, L.state === "running" ? "var(--good)" : "var(--warn)", `${Math.round(L.speed / L.nominal * 100)}%`)}<div><div class="kpi"><div class="l">Speed</div><div class="v" style="font-size:20px">${L.id === "L1" ? `<span data-live="l1speed">${f(L.speed)}</span>` : f(L.speed)}<small>pcs/h</small></div><div class="d">nominal ${f(L.nominal)} · plan ${f(L.plan)}</div></div></div></div>
      <div class="gauge">${CH.ring(L.oeeV, "var(--accent)", `${L.oeeV}%`)}<div><div class="kpi"><div class="l">OEE, this shift</div><div class="d">avail <b>${L.oee.a}</b> · perf <b>${L.oee.p}</b> · qual <b>${L.oee.q}</b></div></div></div></div>
    </div>
    <div class="kv" style="margin-top:10px"><span>Product</span><b>${esc(L.product)} · ${esc(L.format)}</b><span>${L.state === "running" ? "Running since" : "Stopped since"}</span><b>${L.since}${L.stop ? " · " + esc(L.stop) : ""}</b><span>Freezer</span><b>${L.id === "L1" ? `<span data-live="l1lh">${f(L.freezerLh)}</span>` : f(L.freezerLh)} L/h · overrun ${L.overrun}% (set ${L.overrunSet})</b><span>Tunnel</span><b>${L.id === "L1" ? `<span data-live="l1tunnel">${L.tunnel}</span>` : L.tunnel} °F · chain ${L.chain}%</b></div>
    <div style="margin-top:10px">${stationStrip(L)}</div></div>`;

  function pLines() {
    return `<div class="grid">
      ${lineCard(S.lines.L1)}${lineCard(S.lines.L2)}
      ${card("Output per hour, line 1", CH.bars({ cats: S.hourLabels, series: [{ data: S.out24.L1, color: "var(--accent)" }], plan: S.hourLabels.map(() => 15750), h: 160, xEvery: 8 }), { sub: "last 24 h against plan 15,750" })}
      ${card("Output per hour, line 2", CH.bars({ cats: S.hourLabels, series: [{ data: S.out24.L2, color: "var(--violet)" }], plan: S.hourLabels.map(() => 10500), h: 160, xEvery: 8 }), { sub: "last 24 h against plan 10,500" })}
      ${card("Next on the plan", table([{ h: "When", f: (r) => r[0] }, { h: "Line", f: (r) => r[1] }, { h: "Order", k: true, f: (r) => r[2] }, { h: "Product", f: (r) => r[3] }, { h: "Changeover", n: true, f: (r) => r[4] }], [["07:00", "L1", "PO-28-0412", "Chiku stick 90 ml, 12 pallets", "26 min, recipe on the panel"], ["06:40", "L2", "CIP-2 then PO-28-0409", "Tender coconut bar, 2 pallets to finish", "CIP 54 min"], ["15 Mar", "L1", "PO-28-0414", "Guava stick 90 ml, 18 pallets", "34 min, new format"]]), { c: "c7" })}
      ${card("What the panels report", `<p class="note">Counters, states, recipes and alarms come straight from the Siemens controllers over the read-only data interface written into the Teknoice order: production set and obtained, overrun, outlet temperature, tunnel air and chain speed, stops with the station at fault, piece counts and lane discards per wrapper lane, film speed from the reel encoders. Nothing is typed in and nothing is written back.</p>`, { c: "c5" })}
    </div>`;
  }

  function pOEE() {
    const sh = S.shift;
    return `<div class="grid">
      ${card("OEE waterfall, line 1", CH.waterfall(sh.L1.a, sh.L1.p, sh.L1.q), { c: "c6", sub: "night shift" })}
      ${card("OEE waterfall, line 2", CH.waterfall(sh.L2.a, sh.L2.p, sh.L2.q), { c: "c6", sub: "night shift" })}
      ${card("OEE by week", CH.line({ series: [{ data: S.oeeWeeks.L1, color: "var(--accent)" }, { data: S.oeeWeeks.L2, color: "var(--violet)" }], xLabels: S.oeeWeeks.labels, yMin: 60, yMax: 90, h: 160, limits: [{ y: 85, label: "target 85%", color: "var(--good)" }] }) + legend([["var(--accent)", "Line 1"], ["var(--violet)", "Line 2"]]), { c: "c6", sub: "six weeks since commissioning" })}
      ${card("Losses this week, minutes", CH.hbars(S.losses.map((l) => ({ k: l.cause, s: l.kind, v: l.min, t: l.min + " min", c: l.kind === "Breakdown" ? "bad" : l.kind === "Changeover" ? "warn" : "" }))), { c: "c6", sub: "Pareto from the event log" })}
      ${card("Stops by hour and day", CH.heat(S.stopsHeat, { rowLabels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"], label: "stops heatmap" }) + `<p class="note">Darker is more stops. The 02:00 to 04:00 band is the night reel-change cluster on the ML8.</p>`, { c: "c7", sub: "last 7 days, both lines" })}
      ${card("Where the shift went, line 1", CH.hbars([{ k: "Running at speed", v: 372, t: "372 min", c: "good" }, { k: "Running slow", v: 54, t: "54 min", c: "warn" }, { k: "Stops", v: 27, t: "27 min", c: "bad" }, { k: "Changeover", v: 24, t: "24 min", c: "warn" }, { k: "Quality loss", v: 3, t: "3 min", c: "bad" }]), { c: "c5", sub: "480 minutes" })}
    </div>`;
  }

  function pCrews() {
    return `<div class="grid">
      ${card("Crews this week", table([{ h: "Crew", k: true, f: (c) => `${esc(c.name)} <span class="s">lead ${esc(c.lead)}</span>` }, { h: "OEE", n: true, f: (c) => `<b>${c.oee}%</b>` }, { h: "Output vs plan", n: true, f: (c) => c.out + "%" }, { h: "Response to stops", n: true, f: (c) => c.resp.toFixed(1) + " min" }, { h: "Changeover", n: true, f: (c) => c.change + " min" }, { h: "First-pass quality", n: true, f: (c) => c.fpq + "%" }, { h: "Pallets in 20 min", n: true, f: (c) => c.p20 + "%" }], S.crews) + `<p class="note" style="margin-top:8px">Response time is the gap between a machine stop and the first operator action on the panel; changeover is panel recipe change to first good piece. Both come from the controllers, not from anyone watching people.</p>`, { c: "c8" })}
      ${card("What separates the crews", `<div class="stack"><div class="insight warn"><b>Night reel changes take 14 min against 8 on days</b><p>Crew C changes reels lane by lane. Crew A pre-stages and splices on the fly. 186 minutes a week.</p></div><div class="insight"><b>Crew C responds to stops in 5.2 min</b><p>Push alerts now go to the wrapper operator as well as the lead; the gap should close this week.</p></div><div class="insight good"><b>Crew A: 99% of pallets inside 20 min</b><p>The forklift run is timed from the first case; A keeps a pallet queue of one.</p></div></div>`, { c: "c4" })}
      ${card("Station board, night shift", table([{ h: "Station", k: true, f: (r) => r.st }, { h: "Who", f: (r) => r.who }, { h: "Measure", f: (r) => r.kpi }, { h: "Note", f: (r) => r.note }, { h: "", f: (r) => pill(r.state, r.state === "ok" ? "on track" : r.state === "warn" ? "watch" : "stopped") }], S.stations), { c: "c7" })}
      ${card("Skills and coverage", `<div class="stack">${[["Freezer and extruder", 3, 4], ["ML8 wrapper", 2, 4], ["R2 wrapper", 3, 4], ["Enrober and chocolate", 2, 4], ["Case packing", 4, 4], ["CIP and sanitation", 2, 4], ["Forklift, freezer-rated", 3, 4]].map((r) => `<div class="bar"><span><span>${r[0]}</span></span><i class="${r[1] < 3 ? "warn" : "good"}" style="width:${r[1] / r[2] * 100}%"></i><b>${r[1]} of ${r[2]}</b></div>`).join("")}</div><p class="note" style="margin-top:8px">Trained operators per station across the three crews; phase 3 adds the skills map to the plan so every shift has cover.</p>`, { c: "c5" })}
    </div>`;
  }

  function pProducts() {
    return `<div class="grid">
      ${card("OEE by product", table([{ h: "Product", k: true, f: (r) => r.sku }, { h: "Line", f: (r) => r.line }, { h: "OEE", n: true, f: (r) => `<b>${r.oee}%</b>` }, { h: "Best speed", n: true, f: (r) => f(r.speed) + " pcs/h" }, { h: "First-pass quality", n: true, f: (r) => r.fpq + "%" }, { h: "Changeover to", n: true, f: (r) => r.change + " min" }], S.byProduct) + `<p class="note" style="margin-top:8px">Guava sticks run 1,100 pcs/h slower than mango because the inclusion feeder dosing drifts; phase 3 ties the feeder speed to the recipe.</p>`, { c: "c7", sub: "six weeks" })}
      ${card("Changeover matrix, line 1", `<div class="scroll"><table class="tbl"><thead><tr><th>From \\ to</th><th class="n">Mango</th><th class="n">Chiku</th><th class="n">Guava</th></tr></thead><tbody>${[["Mango", "—", "24", "34"], ["Chiku", "26", "—", "31"], ["Guava", "29", "28", "—"]].map((r) => `<tr><td class="k">${r[0]}</td>${r.slice(1).map((v) => `<td class="n">${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="note" style="margin-top:8px">Minutes from recipe change to first good piece, measured. Scheduling mango before chiku saves 10 minutes a change.</p>`, { c: "c5" })}
      ${card("Yield and overrun, this shift", `<div class="tiles">${tile("Mix used", "3,120", "litres, from the batching scale", "", "L")}${tile("Pieces made", "118,400", "ML8 counter", "")}${tile("Yield", "97.2", "pieces against mix, recipe 90 ml", "ok", "%")}${tile("Overrun", "98", "set 100, freezer 2x2000", "warn", "%")}</div><p class="note" style="margin-top:8px">Overrun 2 points under set is about 1.3 percent more mix per piece; the freezer page flags it and the fill-weight tail on the quality page confirms it.</p>`, { c: "c12" })}
    </div>`;
  }

  APP.views.production = (s) => {
    const t = s.tab.production;
    return `<div class="ph"><div><h1>Production and OEE</h1><p>Both lines live from the controllers; losses by cause; the crews measured by what the machines record.</p></div></div>
      ${tabs("production", [["lines", "Lines live"], ["oee", "OEE and losses"], ["crews", "Crews and operators"], ["products", "Products and changeovers"]], t)}
      ${t === "lines" ? pLines() : t === "oee" ? pOEE() : t === "crews" ? pCrews() : pProducts()}`;
  };

  // ---- Traceability and ERP ----
  const palletRow = (p) => `data-drawer="pallet:${p.id}" class="click"`;
  const stPill = (p) => p.status === "freezer" ? pill("ok", "in freezer") : p.status === "staged" ? pill("info", "staged") : p.status === "hold" ? pill("bad", "QA hold") : pill("mute", p.status);
  function tPallets(s) {
    const ps = S.pallets.slice().reverse();
    const q = (s.search || "").toLowerCase();
    const rows = q ? ps.filter((p) => (p.id + p.sscc + p.sku + p.lot + p.po).toLowerCase().includes(q)) : ps;
    return `<div class="grid">
      ${kpi("In the freezer", "318<small>of 552</small>", "rack positions, three high")}
      ${kpi("Staged for the freezer", "2", "built in the last 10 minutes")}
      ${kpi("On QA hold", "1", "P-0412, 23 min outside")}
      ${kpi("Shipping today", "66", "3 trucks: 09:00, 11:30, 14:00", { unit: "pallets" })}
      <div class="card c12"><div class="ch"><h3>Where pallets are, right now</h3><span class="sub">each step is a read, not a keystroke</span></div><div class="flow">${[["Built, first case", "46 tonight", "ok"], ["Labelled at G1", "46 · RFID SSCC", "ok"], ["Freezer door G2", "43 read in", "ok"], ["Staged", "2 waiting", "warn"], ["QA hold", "1", "bad"], ["Picked for ASN", "22 staged aisle A", "ok"], ["Dock G3", "0 shipped yet", ""]].map((x) => `<div class="st ${x[2]}"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("")}</div></div>
      <div class="card c12"><div class="ch"><h3>Pallets built tonight</h3><span class="sub">click a pallet for its record</span><span class="r"><div class="search"><input id="psearch" type="search" placeholder="Find a pallet, SSCC, lot or order" value="${esc(s.search || "")}"></div></span></div>
        ${table([{ h: "Pallet", k: true, f: (p) => `${p.id} <span class="s">${p.sscc}</span>` }, { h: "Line", f: (p) => p.line }, { h: "Product", f: (p) => `${esc(p.sku)} <span class="s">${p.lot} · ${p.cases} cases · ${p.po}</span>` }, { h: "First case", n: true, f: (p) => p.built }, { h: "G1 label", n: true, f: (p) => p.g1 }, { h: "G2 freezer", n: true, f: (p) => p.g2 || "—" }, { h: "Outside", n: true, f: (p) => `<b style="color:${p.outside > 20 ? "var(--bad)" : p.outside > 16 ? "var(--warn)" : "var(--ink)"}">${p.outside} min</b>` }, { h: "Location", f: (p) => p.loc }, { h: "", f: stPill }], rows.slice(0, 18), { row: palletRow })}
        ${rows.length > 18 ? `<p class="note" style="margin-top:6px">${rows.length - 18} more; use the search box.</p>` : ""}</div>
    </div>`;
  }

  function tInventory() {
    const tot = S.inventory.reduce((a, r) => a + r.pallets, 0);
    return `<div class="grid">
      ${kpi("Freezer occupancy", `${pct(318, 552)}%`, "318 of 552 positions; 168 + 384 in two racking blocks")}
      ${kpi("Pallets by lot", String(tot), `${S.inventory.length} lots on hand`)}
      ${kpi("Oldest lot", "12 d", "co-packer pints transfer CP-0302; ships 14:00 today")}
      ${kpi("ERP sync", "06:10", "46 inventory moves posted tonight; next sync in 20 min")}
      ${card("Freezer inventory by lot", table([{ h: "Product", k: true, f: (r) => r.sku }, { h: "Lot", f: (r) => r.lot }, { h: "Pallets", n: true, f: (r) => f(r.pallets) }, { h: "Cases", n: true, f: (r) => f(r.cases) }, { h: "Age", n: true, f: (r) => r.age }, { h: "Best before", n: true, f: (r) => r.fefo }, { h: "FEFO", f: (r) => r.age === "12 d" ? pill("warn", "ship first") : r.age === "6 d" ? pill("info", "next") : pill("mute", "hold order") }], S.inventory), { c: "c8", sub: "first expired, first out" })}
      ${card("How the ERP and the floor agree", `<p class="note">The SSCC on the pallet label is the one key. Faclon prints it from the ERP production order, reads it at the freezer door and at the dock, and posts every move back: produced quantities by lot, pallets into the freezer, picks, and the advance ship notice. The ERP keeps the book stock; the floor keeps the physical truth; the two are compared every 20 minutes and any difference shows here before a cycle count finds it.</p><div class="tiles" style="margin-top:8px">${tile("Book vs floor", "0", "pallets different", "ok")}${tile("Moves posted", "46", "tonight", "")}${tile("Picks released", "22", "ASN-28-0614", "")}</div>`, { c: "c4" })}
      ${card("Rack occupancy by aisle", CH.hbars([{ k: "Aisle A, block 1", v: 52, t: "52 of 56" }, { k: "Aisle B, block 1", v: 48, t: "48 of 56" }, { k: "Aisle C, block 1", v: 40, t: "40 of 56" }, { k: "Aisle D, block 2", v: 66, t: "66 of 128" }, { k: "Aisle E, block 2", v: 60, t: "60 of 128" }, { k: "Aisle F, block 2", v: 52, t: "52 of 128" }]), { c: "c6", sub: "from the G2 read and the forklift put-away scan" })}
      ${card("Pints from the co-packer", `<p class="note">The co-packer's pints arrive on their own SSCC labels and go through the same dock read. The transfer lot CP-0302 is the oldest stock in the building and the ERP's pick list for the 14:00 truck already takes it first.</p>`, { c: "c6" })}
    </div>`;
  }

  function tOrders() {
    return `<div class="grid">
      ${card("Production orders from the ERP", table([{ h: "Order", k: true, f: (o) => o.po }, { h: "Product", f: (o) => `${esc(o.sku)} <span class="s">${o.line} · ${esc(o.customer)}</span>` }, { h: "Progress", f: (o) => `${progress(pct(o.built, o.planned))}<span class="s">${o.built} of ${o.planned} pallets · ${f(o.cases)} cases</span>` }, { h: "Due", n: true, f: (o) => o.due }, { h: "", f: (o) => o.status === "Ready to ship" ? pill("ok", o.status) : o.status.startsWith("Sched") ? pill("mute", o.status) : pill("info", o.status) }], S.orders), { c: "c7", sub: "live against the pallets built" })}
      ${card("Shipments today", `<ul class="list">${S.shipments.map((sh) => `<li><span class="t">${sh.t}</span><span class="m"><b>${sh.id} · ${esc(sh.to)}</b><span>${sh.pallets} pallets · ${esc(sh.status)}${sh.temp ? " · " + esc(sh.temp) : ""}</span></span></li>`).join("")}</ul><p class="note" style="margin-top:8px">A pallet scanned at the dock without a freezer entry, or a reefer warmer than −10 °F at the door, stops the load before it leaves.</p>`, { c: "c5" })}
      ${card("What flows between the ERP and the plant", `<div class="scroll"><table class="tbl"><thead><tr><th>From the ERP</th><th>From the plant</th></tr></thead><tbody><tr><td>Production orders: product, quantity, due date, customer</td><td>Pieces and cases produced per order, by the hour</td></tr><tr><td>Bill of materials and the recipe set for the panel</td><td>Mix used per batch, yield, overrun; rejects by class</td></tr><tr><td>Pallet label format and SSCC range</td><td>Every pallet: SSCC, lot, cases, built time, freezer in, location</td></tr><tr><td>Pick lists and the advance ship notice</td><td>Picks confirmed, dock reads, truck temperature at loading</td></tr><tr><td>Maintenance parts and purchase requests</td><td>Work orders closed, hours, parts used</td></tr></tbody></table></div><p class="note" style="margin-top:8px">Standard connectors for the common ERPs; the SSCC and the production order number are the only two keys needed.</p>`, { c: "c12" })}
    </div>`;
  }

  function tLots(s) {
    const g = S.genealogy;
    return `<div class="grid">
      <div class="card c12"><div class="ch"><h3>Lot genealogy</h3><span class="sub">from mix batch to truck, in one search</span></div><div class="search"><input id="lotsearch" type="search" placeholder="Lot, pallet, SSCC or order, e.g. L28-0314-A" value="L28-0314-A"><button class="btn pri" data-act="lotgo">Trace</button></div></div>
      <div class="card c12"><div class="flow">${[["Mix batch " + g.batch, g.gallons + " gal · " + g.pasteurised, "ok"], ["Freezer", g.freezer, "ok"], ["Line run", g.run, "ok"], ["Pieces", f(g.pieces) + " counted · " + f(g.cases) + " cases", "ok"], ["Pallets", g.pallets.length + " pallets, " + g.pallets[0] + " to " + g.pallets[g.pallets.length - 1], "warn"], ["Order", g.po, "ok"], ["Shipment", g.shipment, ""]].map((x) => `<div class="st ${x[2]}"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join("")}</div></div>
      ${card("Pallets in this lot", table([{ h: "Pallet", k: true, f: (p) => p.id }, { h: "SSCC", f: (p) => p.sscc }, { h: "Built", n: true, f: (p) => p.built }, { h: "Outside", n: true, f: (p) => p.outside + " min" }, { h: "Location", f: (p) => p.loc }, { h: "", f: stPill }], S.pallets.filter((p) => g.pallets.includes(p.id)), { row: palletRow }), { c: "c7" })}
      ${card("What a recall question gets", `<p class="note"><b>Which pallets hold mix batch MB-0314-03?</b> Six, listed left, one on hold. <b>Where are they?</b> Five in the freezer at the positions shown, one on the QA rack. <b>Were they ever warm?</b> No; the longest time outside the freezer was 23 minutes on P-0412, with the clip. <b>Was the mix pasteurised?</b> 176 °F for 25 seconds at 03:10, chart attached. <b>Which customer?</b> Retail DC 1 on ASN-28-0614, not yet shipped. Answered in seconds from the same records the retailer can audit.</p>`, { c: "c5" })}
    </div>`;
  }

  function tWhy() {
    const rows = [["Cost per pallet", "About $0.15 to 0.30, printed on the SSCC label the retailer needs anyway", "$3 to 25 per tag; reusable tags need a return loop at the dock", "Label only, no extra cost"], ["Battery", "None", "Coin cell, 1 to 3 years; capacity drops in the cold", "None"], ["−20 °F freezer", "Rated labels and adhesive; reads through frost", "Many tags rated to −4 °F only; industrial tags to −22 °F", "Scanner must see the label"], ["How it is read", "Portal at the freezer door and the dock; handheld or forklift reader as backup; no line of sight", "Beacons heard by fixed gateways; zone-level position", "A person points a scanner"], ["Continuous location", "At each gate; rack position from the put-away scan", "Yes, zone by zone, while the battery lasts", "No"], ["Temperature on the pallet", "No", "Yes, some tags log temperature", "No"], ["Retailer and ERP fit", "GS1 SSCC is the standard key; many retailers already mandate RFID", "Proprietary IDs; needs mapping to the SSCC", "SSCC barcode, standard"], ["Frozen product and water", "UHF is attenuated by water; mitigated with corner placement and two antennas per portal", "Not affected", "Not affected"], ["Verdict", "Recommended: the base for every pallet", "Option for staging and reefer trucks, where per-pallet temperature matters", "Fallback only"]];
    return `<div class="grid">
      <div class="card c12"><div class="ch"><h3>How to trace pallets: passive RFID on the SSCC label, with a BLE option</h3><span class="sub">the choice behind the pallet rule and the ERP link</span></div>
        <div class="scroll"><table class="cmp"><thead><tr><th></th><th>Passive UHF RFID on the SSCC label</th><th>BLE sticker or tag</th><th>Barcode scan only</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="k">${r[0]}</td><td class="${r[0] === "Verdict" ? "rec" : ""}">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table></div></div>
      ${card("Why RFID wins for Frutero", `<p class="note">Every pallet that leaves Pottsville needs a GS1 SSCC logistics label for the retailer. Printing that label on an RFID inlay costs cents, needs no battery, works at −20 °F and reads through frost and fog without anyone pointing anything. One portal at the freezer door closes the 20-minute clock; readers on the dock doors confirm the load; the forklift reader records the rack position. The same number lives in the ERP, on the advance ship notice and in the retailer's receiving system, so there is one key end to end.</p>`, { c: "c6" })}
      ${card("Where BLE still earns a place", `<p class="note">A battery tag that logs temperature is useful on the few pallets that stage outside the freezer for a reefer truck, and on the trucks themselves: it gives a temperature trace per pallet, not per room. Frutero can add a dozen reusable tags for that without changing the base system. Wiliot-style battery-free BLE labels are worth a trial later; today the cold rating and the reader density make them a second step, not the first.</p>`, { c: "c6" })}
      ${card("What it takes", `<div class="tiles">${tile("Printer", "1", "RFID label printer at palletizing, ERP-fed", "")}${tile("Portal", "1", "freezer door G2, two antennas", "")}${tile("Dock readers", "2", "doors 1 and 2; handheld for 3 and 4", "")}${tile("Forklift reader", "1", "optional, for rack position", "")}${tile("Labels", "~900", "a week, freezer-rated adhesive", "")}</div>`, { c: "c12" })}
    </div>`;
  }

  APP.views.trace = (s) => {
    const t = s.tab.trace;
    return `<div class="ph"><div><h1>Traceability and ERP</h1><p>Every pallet is a record: built, labelled, into the freezer, picked, loaded. The ERP holds the orders; the floor holds the truth; the SSCC joins the two.</p></div></div>
      ${tabs("trace", [["pallets", "Pallets live"], ["inventory", "Freezer inventory"], ["orders", "Orders and shipments"], ["lots", "Lot genealogy"], ["why", "Why RFID"]], t)}
      ${t === "pallets" ? tPallets(s) : t === "inventory" ? tInventory() : t === "orders" ? tOrders() : t === "lots" ? tLots(s) : tWhy()}`;
  };

  // drawer content for a pallet
  APP.palletDrawer = (id) => {
    const p = S.pallets.find((x) => x.id === id); if (!p) return "";
    return `<div class="kv"><span>SSCC</span><b>${p.sscc}</b><span>Product</span><b>${esc(p.sku)}</b><span>Lot</span><b>${p.lot}</b><span>Cases</span><b>${p.cases}</b><span>Order</span><b>${p.po}</b><span>Line</span><b>${p.line}</b><span>First case</span><b>${p.built}</b><span>Labelled, G1</span><b>${p.g1}</b><span>Freezer in, G2</span><b>${p.g2 || "not yet"}</b><span>Outside</span><b style="color:${p.outside > 20 ? "var(--bad)" : "inherit"}">${p.outside} min</b><span>Location</span><b>${p.loc}</b><span>Status</span><b>${stPill(p)}</b></div>
      ${p.outside > 20 ? `<div class="insight bad"><b>Over the 20-minute rule</b><p>Waited at end packaging from ${p.built}; alert sent at the 20-minute mark to the shift lead; acknowledged in 2 min. Clip from C8 attached. Release needs a QA check of the core temperature on two cases.</p><div class="acts"><button class="btn sm" data-act="release:${p.id}">Release after check</button><button class="btn sm ghost">Open clip</button></div></div>` : `<div class="insight good"><b>Inside the rule</b><p>From the first case to the freezer door in ${p.outside} minutes.</p></div>`}
      <div><div class="ch"><h3>Timeline</h3></div><ul class="list"><li><span class="t">${p.built}</span><span class="m"><b>First case counted, C${p.line === "L1" ? 7 : 8}</b><span>clock starts</span></span></li><li><span class="t">${p.g1}</span><span class="m"><b>SSCC label printed and applied, G1</b><span>from ${p.po}</span></span></li>${p.g2 ? `<li><span class="t">${p.g2}</span><span class="m"><b>Read at the freezer door, G2</b><span>clock stops at ${p.outside} min</span></span></li><li><span class="t">${p.g2}</span><span class="m"><b>Put away ${p.loc}</b><span>forklift reader</span></span></li>` : `<li><span class="t">now</span><span class="m"><b>Staged at packaging exit</b><span>waiting for the forklift</span></span></li>`}</ul></div>`;
  };
})();
