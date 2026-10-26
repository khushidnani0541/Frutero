// ---------- Simulated plant: Frutero Ice Cream, Pottsville PA. All figures are sample data. ----------
const SIM = (() => {
  // seeded RNG so every load looks the same
  let seed = 20280314;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const nz = (a) => (rnd() - 0.5) * 2 * a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const T0 = new Date(2028, 2, 14, 6, 12, 0); // Tue 14 Mar 2028 06:12, night shift ending
  const start = Date.now();
  const now = () => new Date(T0.getTime() + (Date.now() - start));
  const hh = (d) => d.toTimeString().slice(0, 5);
  const fmtN = (n, d = 0) => Number(n).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
  const series = (n, f) => Array.from({ length: n }, (_, i) => f(i));

  // ---- Lines ----
  const lines = {
    L1: { id: "L1", name: "Line 1 · Stick line", machine: "Teknoline 18/800 GI", wrapper: "Teknowrap ML8, 8 lanes", freezer: "Teknofreeze 2x2000", nominal: 18000, plan: 15750, speed: 16900, product: "Mango stick 90 ml", format: "Stick, 90 ml", state: "running", since: "03:41", stop: null, oee: { a: 91, p: 89, q: 97.9 }, tunnel: -39, chain: 100, freezerLh: 1540, overrun: 98, overrunSet: 100 },
    L2: { id: "L2", name: "Line 2 · Bar line", machine: "Teknoline 9", wrapper: "Teknowrap R2", freezer: "Teknofreeze 2x1000", nominal: 12000, plan: 10500, speed: 0, product: "Tender coconut bar 31 ml", format: "Candy bar, 31 ml", state: "stopped", since: "06:08", stop: "R2 film splice", stopMin: 4, oee: { a: 93, p: 91, q: 98.4 }, tunnel: -38, chain: 100, freezerLh: 780, overrun: 97, overrunSet: 100 },
  };
  lines.L1.oeeV = Math.round(lines.L1.oee.a * lines.L1.oee.p * lines.L1.oee.q / 10000);
  lines.L2.oeeV = Math.round(lines.L2.oee.a * lines.L2.oee.p * lines.L2.oee.q / 10000);

  // hourly output for the last 24 h (index 0 = 23 h ago) and plan
  const hourly = (plan, dips) => series(24, (i) => { let v = plan * (0.93 + nz(0.05)); for (const d of dips) if (i === d[0]) v *= d[1]; return Math.round(v); });
  const out24 = { L1: hourly(15750, [[3, 0.55], [9, 0.78], [19, 0.6], [22, 0.84]]), L2: hourly(10500, [[6, 0.7], [14, 0.62], [23, 0.9]]) };
  const hourLabels = series(24, (i) => { const d = new Date(T0.getTime() - (23 - i) * 3600e3); return hh(d).slice(0, 2) + ":00"; });

  // ---- Overnight shift (22:00 to 06:00) ----
  const shift = {
    label: "Night shift, 22:00 to 06:00", crew: "Crew C", lead: "Dana R.",
    L1: { out: 118400, plan: 126000, oee: 78, a: 91, p: 89, q: 97.9, stops: 3, stopMin: 27, longest: "14 min, ML8 reel change", rejects: 2480, rej: { stick: 1120, coating: 900, wrap: 460 }, cases: 1240, shortCases: 2 },
    L2: { out: 79300, plan: 84000, oee: 81, a: 93, p: 91, q: 98.4, stops: 2, stopMin: 9, longest: "5 min, R2 film splice", rejects: 1290, rej: { shape: 480, coating: 610, wrap: 200 }, cases: 1410, shortCases: 0 },
    pallets: { built: 46, inside20: 45, over: 1, avgToFreezer: 11.4, maxOutside: 23 },
    cold: { freezer: -21, cooler: 41, hotbox: 14, dock: 37, events: 2 },
  };

  // ---- Quality: defect classes per camera ----
  const defects = [
    { cam: "C1", line: "L1", where: "After cutting", cls: "Missing stick", n: 410, limit: 450, rate: 0.35, trend: [31, 44, 52, 48, 55, 61, 58, 61] },
    { cam: "C1", line: "L1", where: "After cutting", cls: "Off-centre stick", n: 520, limit: 500, rate: 0.44, trend: [50, 58, 62, 71, 66, 74, 70, 69] },
    { cam: "C1", line: "L1", where: "After cutting", cls: "Deformed or short slice", n: 190, limit: 400, rate: 0.16, trend: [25, 22, 26, 24, 20, 25, 23, 25] },
    { cam: "C2", line: "L1", where: "ML8 infeed", cls: "Bare patch", n: 560, limit: 600, rate: 0.47, trend: [60, 64, 70, 72, 75, 78, 70, 71] },
    { cam: "C2", line: "L1", where: "ML8 infeed", cls: "Thin coating", n: 250, limit: 400, rate: 0.21, trend: [30, 28, 33, 31, 30, 34, 32, 32] },
    { cam: "C2", line: "L1", where: "ML8 infeed", cls: "Drips and tails", n: 90, limit: 300, rate: 0.08, trend: [12, 10, 11, 13, 12, 10, 11, 11] },
    { cam: "C3", line: "L1", where: "ML8 outlet", cls: "Empty or double bag", n: 460, limit: 500, rate: 0.39, trend: [52, 55, 58, 60, 57, 62, 59, 57] },
    { cam: "C4", line: "L2", where: "After cutting", cls: "Broken bar", n: 300, limit: 350, rate: 0.38, trend: [35, 38, 40, 37, 41, 36, 38, 35] },
    { cam: "C4", line: "L2", where: "After cutting", cls: "Double product", n: 180, limit: 300, rate: 0.23, trend: [20, 22, 24, 23, 21, 25, 22, 23] },
    { cam: "C5", line: "L2", where: "Pocket conveyor", cls: "Bare patch", n: 420, limit: 450, rate: 0.53, trend: [48, 50, 55, 52, 57, 54, 53, 51] },
    { cam: "C5", line: "L2", where: "Pocket conveyor", cls: "Thin coating", n: 190, limit: 300, rate: 0.24, trend: [22, 24, 25, 23, 24, 26, 23, 23] },
    { cam: "C6", line: "L2", where: "R2 outlet", cls: "Empty or double bag", n: 200, limit: 300, rate: 0.25, trend: [24, 25, 26, 25, 27, 24, 25, 24] },
  ];
  const model = { accuracy: 98.4, missed: 1.1, false: 0.5, retrained: "11 Mar 2028", images30d: 184200, labelled: 2000, drift: "stable", classes: 11 };
  // flagged images for QA review (synthetic drawings)
  const flagged = [
    { id: "IMG-7731", t: "05:52", cam: "C1", lane: 3, cls: "Off-centre stick", conf: 0.93, kind: "stick", off: 9 },
    { id: "IMG-7724", t: "05:47", cam: "C2", lane: 6, cls: "Bare patch", conf: 0.96, kind: "coat", off: 0 },
    { id: "IMG-7702", t: "05:31", cam: "C1", lane: 1, cls: "Missing stick", conf: 0.99, kind: "nostick", off: 0 },
    { id: "IMG-7688", t: "05:19", cam: "C5", lane: 2, cls: "Bare patch", conf: 0.91, kind: "coatbar", off: 0 },
    { id: "IMG-7650", t: "04:58", cam: "C4", lane: 4, cls: "Broken bar", conf: 0.97, kind: "broken", off: 0 },
    { id: "IMG-7611", t: "04:36", cam: "C3", lane: 7, cls: "Double bag", conf: 0.88, kind: "double", off: 0 },
  ];
  const rejHourly = { L1: series(8, (i) => ({ stick: Math.round(140 + nz(40)), coating: Math.round(112 + nz(35)), wrap: Math.round(58 + nz(20)) })), L2: series(8, (i) => ({ shape: Math.round(60 + nz(20)), coating: Math.round(76 + nz(25)), wrap: Math.round(25 + nz(10)) })) };
  const shiftHours = ["22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00"];

  // ---- Zones (temperatures, set points, alerts) ----
  const zones = [
    { id: "freezer", name: "Freezer, −20 °F", set: -20, alertAbove: -15, hold: 15, now: -21.2, sensors: "4 probes at rack height, 2 door contacts, defrost state", who: "Shift lead; owner after 15 min", pallets: 318, cap: 552, trend: series(48, (i) => -21.2 + nz(0.6) + (i > 20 && i < 24 ? 1.6 : 0)), doors: [{ t: "02:14", min: 11, where: "Cooler door", ack: "02:17, Dana R." }] },
    { id: "cooler", name: "Cooler, 40 °F", set: 40, alertAbove: 45, hold: 15, now: 41.3, sensors: "2 probes, 1 door contact", who: "Shift lead", pallets: 86, cap: 120, trend: series(48, (i) => 40.6 + nz(0.5) + (i >= 20 && i < 24 ? 2.4 : 0)) },
    { id: "hotbox", name: "Hot box, tempering", set: 14, band: [10, 20], now: 14.2, sensors: "1 probe; recipe from the production plan", who: "Shift lead, QA", pallets: 12, cap: 48, trend: series(48, (i) => 14.2 + nz(0.8)) },
    { id: "tunnel1", name: "Tunnel 18/800, line 1", set: -40, alertAbove: -31, now: -39.1, sensors: "Air temperature and chain speed from P3", who: "Line operator, maintenance", trend: series(48, (i) => -39.1 + nz(0.7) + (i === 11 ? 3.2 : 0)) },
    { id: "tunnel2", name: "Tunnel, line 2", set: -40, alertAbove: -31, now: -38.4, sensors: "Air temperature and chain speed from P4", who: "Line operator, maintenance", trend: series(48, (i) => -38.4 + nz(0.7)) },
    { id: "dock", name: "Dock, south end", set: 38, alertAbove: 50, now: 37.4, sensors: "Door contacts on 4 dock doors, 1 probe, camera C10", who: "Shipping, shift lead", trend: series(48, (i) => 37.4 + nz(1.2) + (i > 40 ? 2 : 0)) },
    { id: "choc", name: "Chocolate tanks", set: 113, band: [110, 116], now: 112.6, sensors: "Transmitters on both enrober tanks", who: "Line operator", trend: series(48, (i) => 112.6 + nz(0.9)) },
    { id: "mix", name: "Mix room, pasteuriser", set: 175, band: [175, 180], now: 176.1, sensors: "Pasteuriser chart and holding tube; mix tank 38 °F", who: "QA", trend: series(48, (i) => 176.1 + nz(0.6)) },
  ];
  const zoneEvents = [
    { t: "02:14", zone: "Cooler", what: "Door open 11 min", detail: "Forklift unloading mix; acknowledged 02:17 by Dana R.", sev: "warn" },
    { t: "03:40", zone: "Palletizing", what: "Pallet 0412 outside 23 min", detail: "Waited at end packaging; clip from C8 attached; QA check before release", sev: "bad" },
    { t: "00:52", zone: "Freezer", what: "Defrost cycle", detail: "Evaporator 2 defrost 28 min, within set", sev: "ok" },
    { t: "23:08", zone: "Tunnel 18/800", what: "Air −36 °F for 6 min", detail: "After reel change restart; back to −39 °F", sev: "ok" },
  ];

  // ---- Pallets, SSCC, ERP ----
  const skus = ["Mango stick 90 ml", "Tender coconut bar 31 ml", "Chiku stick 90 ml", "Sitafal bar 31 ml", "Guava stick 90 ml"];
  const pallets = [];
  for (let i = 0; i < 46; i++) {
    const built = new Date(T0.getTime() - (46 - i) * 10.4 * 60e3 - 20 * 60e3);
    const line = i % 5 === 0 ? "L2" : (i % 2 ? "L1" : "L2");
    const sku = line === "L1" ? (i % 3 === 0 ? "Chiku stick 90 ml" : "Mango stick 90 ml") : (i % 4 === 0 ? "Sitafal bar 31 ml" : "Tender coconut bar 31 ml");
    const outside = i === 33 ? 23 : clamp(Math.round(9 + nz(5)), 5, 19);
    const id = String(380 + i).padStart(4, "0");
    const status = i === 33 ? "hold" : (i > 43 ? "staged" : "freezer");
    pallets.push({ id: "P-" + id, sscc: "00 0860125 00000" + String(3812 + i).padStart(4, "0"), line, sku, lot: "L28-" + (line === "L1" ? "0314-A" : "0314-B"), cases: line === "L1" ? 64 : 80, built: hh(built), g1: hh(new Date(built.getTime() + 8 * 60e3)), g2: status === "staged" ? null : hh(new Date(built.getTime() + outside * 60e3)), outside, status, loc: status === "freezer" ? "F-" + String.fromCharCode(65 + (i % 6)) + (1 + (i % 12)) + "-" + (1 + (i % 3)) : (status === "staged" ? "Packaging exit" : "QA hold rack"), po: line === "L1" ? "PO-28-0411" : "PO-28-0409" });
  }
  const orders = [
    { po: "PO-28-0411", sku: "Mango stick 90 ml", line: "L1", planned: 20, built: 14, cases: 896, due: "16 Mar", customer: "Retail DC 1, Allentown", status: "In production" },
    { po: "PO-28-0409", sku: "Tender coconut bar 31 ml", line: "L2", planned: 24, built: 22, cases: 1760, due: "15 Mar", customer: "Retail DC 2, Carlisle", status: "In production" },
    { po: "PO-28-0412", sku: "Chiku stick 90 ml", line: "L1", planned: 12, built: 10, cases: 640, due: "17 Mar", customer: "Club store DC, Pottstown", status: "In production" },
    { po: "PO-28-0405", sku: "Sitafal bar 31 ml", line: "L2", planned: 16, built: 16, cases: 1280, due: "14 Mar", customer: "Retail DC 1, Allentown", status: "Ready to ship" },
    { po: "PO-28-0414", sku: "Guava stick 90 ml", line: "L1", planned: 18, built: 0, cases: 0, due: "19 Mar", customer: "Private label, Northeast", status: "Scheduled 15 Mar" },
  ];
  const inventory = [
    { sku: "Mango stick 90 ml", lot: "L28-0314-A", pallets: 14, cases: 896, age: "today", fefo: "11 Mar 2029" },
    { sku: "Mango stick 90 ml", lot: "L28-0312-A", pallets: 31, cases: 1984, age: "2 d", fefo: "9 Mar 2029" },
    { sku: "Tender coconut bar 31 ml", lot: "L28-0314-B", pallets: 22, cases: 1760, age: "today", fefo: "11 Mar 2029" },
    { sku: "Chiku stick 90 ml", lot: "L28-0313-A", pallets: 40, cases: 2560, age: "1 d", fefo: "10 Mar 2029" },
    { sku: "Sitafal bar 31 ml", lot: "L28-0311-B", pallets: 44, cases: 3520, age: "3 d", fefo: "8 Mar 2029" },
    { sku: "Guava stick 90 ml", lot: "L28-0308-A", pallets: 58, cases: 3712, age: "6 d", fefo: "5 Mar 2029" },
    { sku: "Pints, assorted (co-packer transfer)", lot: "CP-0302", pallets: 109, cases: 8720, age: "12 d", fefo: "27 Feb 2029" },
  ];
  const shipments = [
    { t: "09:00", id: "ASN-28-0614", to: "Retail DC 1, Allentown", pallets: 22, status: "Loading 08:30, door 2", temp: "Reefer pre-cooled −10 °F" },
    { t: "11:30", id: "ASN-28-0615", to: "Retail DC 2, Carlisle", pallets: 18, status: "Picked, staged in freezer aisle A", temp: "Awaiting truck" },
    { t: "14:00", id: "ASN-28-0616", to: "Club store DC, Pottstown", pallets: 26, status: "Pick list released to ERP", temp: "" },
  ];
  const genealogy = { batch: "MB-0314-03", gallons: 300, pasteurised: "03:10, 176 °F for 25 s", mixTemp: "38 °F", freezer: "Teknofreeze 2x2000, 1,540 L/h, overrun 98 %", run: "Line 1, 03:41 to 05:50, Mango stick 90 ml", pieces: 36400, cases: 569, pallets: ["P-0409", "P-0410", "P-0411", "P-0412", "P-0413", "P-0414"], po: "PO-28-0411", shipment: "ASN-28-0614 (planned)" };

  // ---- Crews and operators ----
  const crews = [
    { id: "A", name: "Crew A, days", lead: "Luis M.", oee: 82, out: 101, resp: 3.1, change: 24, fpq: 98.1, p20: 99, hours: 40 },
    { id: "B", name: "Crew B, evenings", lead: "Priya S.", oee: 80, out: 97, resp: 3.8, change: 29, fpq: 97.9, p20: 98, hours: 40 },
    { id: "C", name: "Crew C, nights", lead: "Dana R.", oee: 78, out: 94, resp: 5.2, change: 33, fpq: 97.6, p20: 97, hours: 40 },
  ];
  const stations = [
    { st: "Freezer and extruder, L1", who: "Operator 1", note: "Overrun held at 98 %, set 100 %", kpi: "Litres/h 1,540", state: "ok" },
    { st: "ML8 wrapper, L1", who: "Operator 2", note: "Reel change 14 min; target 8", kpi: "Lane discards 0.4 %", state: "warn" },
    { st: "Case packing, L1 and L2", who: "Operator 3", note: "2 short cases flagged by C7", kpi: "1,240 cases", state: "ok" },
    { st: "Palletizing and forklift", who: "Operator 4", note: "Pallet 0412 waited 23 min", kpi: "Avg to freezer 11.4 min", state: "warn" },
    { st: "R2 wrapper, L2", who: "Operator 5", note: "Film splice at 06:08, 4 min", kpi: "Print faults 0.2 %", state: "bad" },
  ];
  const oeeWeeks = { labels: ["W6", "W7", "W8", "W9", "W10", "W11"], L1: [71, 74, 76, 77, 79, 78], L2: [75, 77, 79, 80, 81, 81] };
  const losses = [
    { cause: "ML8 reel change", min: 186, kind: "Planned stop", machine: "ML8 wrapper" },
    { cause: "Stick inserter jam", min: 124, kind: "Breakdown", machine: "Teknoline 18/800" },
    { cause: "Format changeover", min: 118, kind: "Changeover", machine: "Both lines" },
    { cause: "R2 film splice", min: 84, kind: "Breakdown", machine: "R2 wrapper" },
    { cause: "Tunnel chain overload stop", min: 62, kind: "Breakdown", machine: "Teknoline 18/800" },
    { cause: "CIP overrun (freezer)", min: 58, kind: "Planned stop", machine: "Teknofreeze 2x2000" },
    { cause: "Cutting wire replacement", min: 35, kind: "Breakdown", machine: "Teknoline 9" },
    { cause: "Pick-up head fault", min: 28, kind: "Breakdown", machine: "Enrober L1" },
  ];
  const byProduct = [
    { sku: "Mango stick 90 ml", line: "L1", oee: 80, speed: 16900, fpq: 98.0, change: 26 },
    { sku: "Chiku stick 90 ml", line: "L1", oee: 77, speed: 16400, fpq: 97.4, change: 31 },
    { sku: "Guava stick 90 ml", line: "L1", oee: 74, speed: 15800, fpq: 97.1, change: 34 },
    { sku: "Tender coconut bar 31 ml", line: "L2", oee: 82, speed: 11200, fpq: 98.5, change: 22 },
    { sku: "Sitafal bar 31 ml", line: "L2", oee: 79, speed: 10900, fpq: 98.1, change: 25 },
  ];

  // ---- Downtime events and maintenance ----
  const events = [
    { t: "06:08", line: "L2", machine: "R2 wrapper", cause: "Film splice", min: 4, resp: 1.2, who: "Operator 5", status: "open", kind: "Breakdown" },
    { t: "04:52", line: "L1", machine: "ML8 wrapper", cause: "Reel change, lane 3 to 6", min: 14, resp: 2.0, who: "Operator 2", status: "closed", kind: "Planned stop" },
    { t: "03:30", line: "L1", machine: "Stick inserter 2", cause: "Stick jam", min: 9, resp: 4.5, who: "Operator 1", status: "closed", kind: "Breakdown" },
    { t: "02:12", line: "L2", machine: "Teknoline 9", cause: "Cutting wire check", min: 5, resp: 1.0, who: "Operator 5", status: "closed", kind: "Planned stop" },
    { t: "01:40", line: "L1", machine: "Tunnel 18/800", cause: "Chain overload stop", min: 4, resp: 3.0, who: "Maintenance, Omar", status: "closed", kind: "Breakdown" },
    { t: "23:05", line: "L1", machine: "ML8 wrapper", cause: "Reel change", min: 8, resp: 1.5, who: "Operator 2", status: "closed", kind: "Planned stop" },
    { t: "22:00", line: "L1", machine: "Teknoline 18/800", cause: "Format change to Mango 90 ml", min: 24, resp: 0, who: "Crew C", status: "closed", kind: "Changeover" },
  ];
  const assets = [
    { id: "FRZ1", name: "Teknofreeze 2x2000", hours: 1980, next: "Dasher service at 2,000 h", due: "Tonight", mtbf: 310, mttr: 38, state: "warn", health: 71 },
    { id: "FRZ2", name: "Teknofreeze 2x1000", hours: 1412, next: "Pump seal inspection at 1,500 h", due: "6 days", mtbf: 420, mttr: 32, state: "ok", health: 86 },
    { id: "TL1", name: "Teknoline 18/800 GI", hours: 1890, next: "Tray-chain tension check", due: "2 overload stops this week", mtbf: 96, mttr: 11, state: "warn", health: 68 },
    { id: "TL2", name: "Teknoline 9", hours: 1760, next: "Cutting wire set", due: "Weekly, Thu", mtbf: 150, mttr: 9, state: "ok", health: 82 },
    { id: "ML8", name: "Teknowrap ML8", hours: 1902, next: "Reel stand splice unit", due: "Top loss this week", mtbf: 42, mttr: 10, state: "warn", health: 64 },
    { id: "R2", name: "Teknowrap R2", hours: 1750, next: "Film tension rollers", due: "9 days", mtbf: 88, mttr: 6, state: "ok", health: 80 },
    { id: "ENR", name: "Enrober and chocolate tanks", hours: 1640, next: "Pump seal, tank 1", due: "4 days", mtbf: 260, mttr: 22, state: "ok", health: 84 },
    { id: "CO2", name: "CO2 pack, compressor 2", hours: 2210, next: "Capacity steps above normal", due: "Inspect this week", mtbf: 500, mttr: 90, state: "warn", health: 66 },
  ];
  const insights = [
    { sev: "warn", title: "Dasher service on the 2x2000 is due in about 20 running hours", body: "1,980 h on the dasher; Teknoice sets 2,000 h. Tonight's CIP window at 06:30 has 40 minutes free. Doing it then avoids a forced stop mid-shift on Thursday.", ev: "Freezer hour counter P1; last service 14 Dec 2027", act: "Create work order: dasher service, 40 min, tonight" },
    { sev: "bad", title: "Chain overload stops on the 18/800 tunnel are rising: 2 this week against 0.5 a week", body: "Both stops came within 15 minutes of a tunnel air temperature above −36 °F, after reel-change restarts. The pattern points at ice build-up on the tray chain rather than a mechanical fault.", ev: "P3 overload stop counter; tunnel air trend; event log 01:40 and Mon 03:12", act: "Create work order: tray-chain inspection and tension, 60 min" },
    { sev: "warn", title: "ML8 reel changes cluster between 02:00 and 05:00 and take 14 minutes against 8 on days", body: "Night crew C changes reels one lane at a time. Day crew A pre-stages reels and splices on the fly. 186 minutes lost this week, the top loss in the plant.", ev: "Film-speed signal from the reel encoders; event log; crew comparison", act: "Suggest: pre-stage reels at 01:30; splice training for crew C" },
    { sev: "warn", title: "CO2 pack compressor 2 is loading extra capacity steps for the same freezer load", body: "Capacity steps are 18 percent above the four-week norm at the same suction pressure and ambient. Early warning of a refrigerant charge or valve issue, before it shows as freezer temperature.", ev: "Refrigeration controller P10: capacity steps, suction pressure; freezer probes", act: "Create work order: refrigeration contractor check, this week" },
    { sev: "good", title: "Sensor-verified CIP saved 58 minutes of line time yesterday", body: "Three cycles finished 17 to 21 minutes early on measured endpoints, with final-rinse conductivity and residue index inside limits on every cycle.", ev: "CIP module: cycles 0313-1 to 0313-3", act: "See CIP" },
  ];
  const pmPlan = [
    { day: 0, what: "Dasher service, 2x2000", min: 40, who: "Marco", due: true }, { day: 0, what: "ML8 reel stand check", min: 30, who: "Jen" },
    { day: 1, what: "Tray-chain tension, 18/800", min: 60, who: "Omar", due: true }, { day: 1, what: "Camera lens clean, C1 to C6", min: 20, who: "Jen" },
    { day: 2, what: "Enrober pump seal, tank 1", min: 45, who: "Marco" }, { day: 2, what: "CIP valve seat inspection", min: 30, who: "Omar" },
    { day: 3, what: "Cutting wire set, Teknoline 9", min: 25, who: "Jen", done: false }, { day: 3, what: "CO2 pack, contractor visit", min: 120, who: "Contractor" },
    { day: 4, what: "Freezer-door portal reader check", min: 15, who: "Jen" }, { day: 4, what: "Pump seal inspection, 2x1000", min: 45, who: "Marco" },
    { day: 5, what: "Weekly wash-down audit", min: 60, who: "QA" },
    { day: 6, what: "R2 film tension rollers", min: 30, who: "Omar" },
  ];
  const workOrders = [
    { id: "WO-0341", title: "Dasher service, Teknofreeze 2x2000", machine: "FRZ1", est: 40, col: "assigned", tech: "Marco", src: "Bruce suggestion", pri: "High" },
    { id: "WO-0342", title: "Tray-chain inspection and tension", machine: "TL1", est: 60, col: "open", tech: "", src: "Bruce suggestion", pri: "High" },
    { id: "WO-0338", title: "ML8 splice unit, lane 3 to 6 sensor", machine: "ML8", est: 90, col: "progress", tech: "Jen", src: "Operator 2", pri: "Medium", hours: 1.5 },
    { id: "WO-0336", title: "Stick inserter 2, guide rail wear", machine: "TL1", est: 120, col: "progress", tech: "Omar", src: "Event 03:30", pri: "Medium", hours: 0.8 },
    { id: "WO-0330", title: "Cooler door closer adjustment", machine: "Cold rooms", est: 30, col: "done", tech: "Jen", src: "Zone event 02:14", pri: "Low", hours: 0.5 },
    { id: "WO-0327", title: "R2 print registration sensor", machine: "R2", est: 45, col: "done", tech: "Marco", src: "Operator 5", pri: "Low", hours: 0.7 },
    { id: "WO-0343", title: "Refrigeration contractor, compressor 2", machine: "CO2", est: 120, col: "open", tech: "", src: "Bruce suggestion", pri: "Medium" },
  ];
  const woHours = [{ m: "ML8 wrapper", h: 9.5 }, { m: "Stick inserters", h: 6.3 }, { m: "Freezer 2x1000", h: 4.0 }, { m: "Preventive, scheduled", h: 7.2 }, { m: "Cold rooms and doors", h: 1.5 }];
  const stopsHeat = series(7, (d) => series(24, (h) => { let v = rnd() < 0.72 ? 0 : Math.round(1 + rnd() * 2); if (h >= 2 && h <= 4 && rnd() < 0.5) v += 2; return v; }));

  // ---- CIP ----
  const circuits = [
    { id: "CIP-1", name: "Freezer 2x2000 and line 1 mix lines", state: "running", phase: 2, t: 12.4, cycleId: "0314-1" },
    { id: "CIP-2", name: "Freezer 2x1000 and line 2 mix lines", state: "due 06:40", phase: -1 },
    { id: "CIP-3", name: "Mix room: pasteuriser and tanks", state: "done 05:10", phase: 6 },
    { id: "CIP-4", name: "Fruit feeder and ripple pump", state: "every 2nd day", phase: -1 },
  ];
  const phases = [
    { k: "Pre-rinse", fixed: 10, actual: 6.5, end: "Return turbidity under 20 NTU and residue index under 0.15", color: "#5B86FF" },
    { k: "Caustic wash 1.5 %, 167 °F", fixed: 25, actual: 19, end: "Residue index flat for 3 min; conductivity steady at 48 mS/cm", color: "#1655F2" },
    { k: "Intermediate rinse", fixed: 8, actual: 5, end: "Return conductivity within 50 µS/cm of supply", color: "#5B86FF" },
    { k: "Acid wash 0.8 %, 140 °F", fixed: 15, actual: 12, end: "pH steady at 2.1 for 3 min; mineral index flat", color: "#6541C4" },
    { k: "Final rinse", fixed: 10, actual: 6, end: "Conductivity equal to supply ±20 µS/cm; pH 6.5 to 8.0; residue index under 0.05", color: "#5B86FF" },
    { k: "Sanitise", fixed: 5, actual: 5, end: "Contact time, fixed", color: "#1E8A6E" },
  ];
  const fixedTotal = phases.reduce((a, p) => a + p.fixed, 0), actualTotal = phases.reduce((a, p) => a + p.actual, 0);
  const cipSensors = {
    inlet: [{ k: "Temperature", v: 167.3, u: "°F", lo: 160, hi: 172 }, { k: "Flow", v: 118, u: "gal/min", lo: 100, hi: 130 }, { k: "Pressure", v: 42.1, u: "psi", lo: 35, hi: 50 }, { k: "Conductivity", v: 48.2, u: "mS/cm", lo: 45, hi: 52 }, { k: "pH", v: 12.6, u: "", lo: 12.2, hi: 13 }, { k: "Turbidity", v: 1.2, u: "NTU", lo: 0, hi: 5 }],
    outlet: [{ k: "Temperature", v: 161.8, u: "°F", lo: 155, hi: 172 }, { k: "Flow", v: 115, u: "gal/min", lo: 100, hi: 130 }, { k: "Conductivity", v: 47.6, u: "mS/cm", lo: 45, hi: 52 }, { k: "pH", v: 12.5, u: "", lo: 12, hi: 13 }, { k: "Turbidity", v: 9.4, u: "NTU", lo: 0, hi: 20 }, { k: "Residue index (spectral)", v: 0.21, u: "", lo: 0, hi: 1 }, { k: "Contaminant index", v: 0.06, u: "", lo: 0, hi: 0.2 }],
    tanks: [{ k: "Caustic tank", v: 71, u: "%" }, { k: "Acid tank", v: 64, u: "%" }, { k: "Recovered rinse water", v: 48, u: "%" }, { k: "Sanitiser", v: 82, u: "%" }],
  };
  // residue index decay during the caustic phase (per minute), and the spectral curves
  const residue = series(26, (i) => Math.max(0.04, 1.0 * Math.exp(-i / 6.2) + nz(0.015)));
  const wl = series(51, (i) => 250 + i * 10);
  const spectrum = {
    clean: wl.map((w) => 0.03 + 0.02 * Math.exp(-((w - 280) ** 2) / 800)),
    start: wl.map((w) => 0.08 + 0.55 * Math.exp(-((w - 280) ** 2) / 900) + 0.42 * Math.exp(-((w - 440) ** 2) / 2600) + 0.12 * Math.exp(-((w - 520) ** 2) / 900)),
    now: wl.map((w) => 0.04 + 0.12 * Math.exp(-((w - 280) ** 2) / 900) + 0.09 * Math.exp(-((w - 440) ** 2) / 2600) + 0.03 * Math.exp(-((w - 520) ** 2) / 900)),
  };
  const cycles = series(14, (i) => { const d = new Date(T0.getTime() - (14 - i) * 86400e3); const c = ["CIP-1", "CIP-2", "CIP-3"][i % 3]; const saved = clamp(Math.round(19 + nz(3)), 14, 22); return { id: d.toISOString().slice(5, 10).replace("-", "") + "-" + (1 + i % 3), date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), circuit: c, fixed: 73, actual: 73 - saved, saved, water: Math.round(2600 - saved * 36), caustic: (12 - saved * 0.15).toFixed(1), acid: (6 - saved * 0.08).toFixed(1), kwh: Math.round(95 - saved * 1.3), pass: true, rinse: (18 + nz(6)).toFixed(0) }; });
  const cipDefaults = { cyclesPerDay: 3.5, lineHourValue: 1500, waterCost: 0.008, causticCost: 1.2, acidCost: 1.5, energyCost: 0.12, waterSaved: 700, causticSaved: 3.0, acidSaved: 1.5, kwhSaved: 25 };

  // ---- Alerts (plant-wide) ----
  const alerts = [
    { t: "06:08", sev: "warn", title: "Line 2 stopped: R2 film splice", where: "R2 wrapper", open: true },
    { t: "03:40", sev: "bad", title: "Pallet P-0412 outside the freezer 23 min", where: "End packaging", open: true, note: "On QA hold; clip attached" },
    { t: "05:52", sev: "warn", title: "Off-centre stick above limit on C1, lane 3", where: "Line 1 cutting", open: true },
    { t: "02:14", sev: "ok", title: "Cooler door open 11 min, acknowledged", where: "Cooler", open: false },
  ];

  // ---- live tick (nudges live values) ----
  function tick() {
    const L1 = lines.L1; L1.speed = clamp(Math.round(L1.speed + nz(90)), 16300, 17400); L1.freezerLh = clamp(Math.round(L1.freezerLh + nz(8)), 1500, 1580); L1.tunnel = clamp(+(L1.tunnel + nz(0.2)).toFixed(1), -40.5, -38);
    for (const z of zones) z.now = +(z.now + nz(z.id === "mix" || z.id === "choc" ? 0.15 : 0.1)).toFixed(1);
    const c = circuits[0]; if (c.state === "running") { c.t = +(c.t + 2 / 60).toFixed(2); if (c.t > 19) { c.phase = Math.min(5, c.phase + 1); c.t = 0; } }
    cipSensors.outlet[4].v = +clamp(cipSensors.outlet[4].v + nz(0.3), 6, 12).toFixed(1);
    cipSensors.outlet[5].v = +clamp(cipSensors.outlet[5].v - 0.002 + nz(0.004), 0.04, 0.3).toFixed(3);
    cipSensors.inlet[0].v = +clamp(cipSensors.inlet[0].v + nz(0.2), 165, 170).toFixed(1);
    cipSensors.outlet[0].v = +clamp(cipSensors.outlet[0].v + nz(0.2), 159, 165).toFixed(1);
  }

  return { rnd, nz, clamp, now, hh, fmtN, series, lines, out24, hourLabels, shift, defects, model, flagged, rejHourly, shiftHours, zones, zoneEvents, pallets, orders, inventory, shipments, genealogy, skus, crews, stations, oeeWeeks, losses, byProduct, events, assets, insights, pmPlan, workOrders, woHours, stopsHeat, circuits, phases, fixedTotal, actualTotal, cipSensors, residue, wl, spectrum, cycles, cipDefaults, alerts, tick };
})();
