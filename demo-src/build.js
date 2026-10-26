// Build the Frutero demo platform into one HTML file (artifact body: no doctype/html/head/body, title first).
const fs = require("fs"); const path = require("path");
const dir = __dirname; const [out, render] = process.argv.slice(2);
const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");
const css = read("style.css");
const js = ["sim.js", "charts.js", "ui.js", "views1.js", "views2.js", "views3.js"].map((f) => "// ===== " + f + " =====\n" + read(f)).join("\n\n");
let html = read("shell.html").replace("__CSS__", () => css).replace("__JS__", () => js);
if (html.indexOf("__CSS__") !== -1 || html.indexOf("__JS__") !== -1) throw new Error("placeholder left");
if (/<\/script>/.test(js)) throw new Error("script close tag inside js");
// syntax check of the JS with node (no DOM needed to parse)
try { new Function(js); } catch (e) { console.error("JS SYNTAX ERROR: " + e.message); process.exit(1); }
fs.writeFileSync(out, html);
if (render) fs.writeFileSync(render, "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>html,body{height:100%;margin:0}</style></head><body>" + html + "</body></html>");
console.log("built " + out + " (" + html.length + " bytes)");
