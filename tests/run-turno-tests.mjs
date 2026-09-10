#!/usr/bin/env node
// =====================================================================
//  Tests del carrusel de turnos/recordatorios — comedor.html
//  Matriz de contenido (4 resoluciones x 8 casos) + comprobaciones
//  funcionales de turnos, cuenta atrás, aparición/desaparición, recordatorios,
//  cierre, reloj y leyenda.
//  Uso: node tests/run-turno-tests.mjs    (requiere Google Chrome)
// =====================================================================
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MIME = { '.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg' };
const results = [];
const record = (test, result, evidence) => results.push({ test, result, evidence });

const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port;

const port = 9342; const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'turno-tests-'));
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--remote-debugging-port='+port,'--user-data-dir='+dir,'about:blank'], { stdio: 'ignore' });
let ws, id = 0; const pend = new Map();
for (let i = 0; i < 60; i++) {
  try {
    const l = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
    const pg = l.find((t) => t.type === 'page');
    if (pg) { ws = await new Promise((res, rej) => { const w = new WebSocket(pg.webSocketDebuggerUrl); w.onopen = () => res(w); w.onerror = rej; }); ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } }; break; }
  } catch (e) {}
  await sleep(250);
}
const send = (m, p = {}) => new Promise((res, rej) => { const mid = ++id; pend.set(mid, { res, rej }); ws.send(JSON.stringify({ id: mid, method: m, params: p })); });
const ev = async (x) => { const r = await send('Runtime.evaluate', { expression: x, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
const goto = async (w, h) => { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false }); await send('Page.navigate', { url: BASE + '/comedor.html?nc=' + Date.now() }); await sleep(2800); };

await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setBlockedURLs', { urls: ['*firebaseio.com*','*firebaseapp.com*','*googleapis.com*','*gstatic.com*','*mymemory*'] });

const REM = [
 { mensajeEs:'Recuerda separar los residuos en los contenedores correspondientes: organicos, envases y papel.', mensajeEn:'Please separate waste into the correct bins: organic, packaging and paper.', image:'./img/recordatorio_1.png' },
 { mensajeEs:'Devuelve la bandeja y los cubiertos a la zona del office antes de salir del comedor.', mensajeEn:'Return your tray and cutlery to the office area before leaving the dining room.', image:'./img/recordatorio_2.png' },
 { mensajeEs:'Manten un tono de voz moderado y respeta el descanso de los companeros de las mesas cercanas.', mensajeEn:'Please keep your voice down and respect the rest of colleagues at nearby tables.', image:'' },
 { mensajeEs:'Si tienes alguna alergia o intolerancia, consulta al personal antes de consumir cualquier plato.', mensajeEn:'If you have any allergy or intolerance, please ask the staff before consuming any dish.', image:'' }
];
const CASES = {
 A:{n:'A corto',antes:5,es:'Gracias!',en:'Thank you!',rem:0},
 B:{n:'B medio',antes:5,es:'Gracias! Por favor, libera tu mesa.',en:'Thank you! Please clear your table.',rem:0},
 C:{n:'C largo',antes:5,es:'Gracias por venir hoy! Por favor, recuerda liberar tu mesa y dejar la bandeja y los vasos en el office antes de salir.',en:'Thank you for coming today! Please remember to clear your table and leave your tray and glasses in the office before leaving.',rem:0},
 D:{n:'D muy largo',antes:5,es:'Gracias por acompanarnos en el servicio de hoy! Te recordamos que, al terminar, es importante liberar tu mesa para el siguiente turno, depositar la bandeja, los vasos y los cubiertos en la zona habilitada del office y dejar la silla en su sitio. Si has terminado antes de la hora prevista, agradecemos tu colaboracion para que el equipo pueda preparar la sala con tiempo suficiente.',en:'Thank you for joining us at the service today! As you finish, please remember to clear your table for the next shift, place your tray, glasses and cutlery in the designated office area, and leave your chair in place. If you have finished earlier than expected, we appreciate your help so the team can prepare the room in good time.',rem:0},
 E:{n:'E ES+EN largo',antes:5,es:'Agradecemos enormemente tu colaboracion durante el servicio de hoy; por favor, al finalizar, libera la mesa, deposita la bandeja y los cubiertos en el office y deja la sala lista para el siguiente turno.',en:'We truly appreciate your cooperation during today service; when you finish, please clear your table, place your tray and cutlery in the office and leave the room ready for the next shift.',rem:0},
 F:{n:'F varios recordatorios',antes:5,es:'Gracias por tu colaboracion.',en:'Thank you for your cooperation.',rem:4},
 G:{n:'G cuenta atras',antes:10,es:'El cambio de turno sera en unos minutos. Por favor, ve liberando tu mesa.',en:'The shift change will take place in a few minutes. Please start clearing your table.',rem:0},
 H:{n:'H maximo razonable',antes:10,es:'Gracias por acompanarnos en el servicio de hoy! Te recordamos que, al terminar, es importante liberar tu mesa para el siguiente turno, depositar la bandeja, los vasos y los cubiertos en la zona habilitada del office y dejar la silla en su sitio. Si has terminado antes de la hora prevista, agradecemos tu colaboracion para que el equipo pueda preparar la sala con tiempo suficiente.',en:'Thank you for joining us at the service today! As you finish, please remember to clear your table for the next shift, place your tray, glasses and cutlery in the designated office area, and leave your chair in place. If you have finished earlier than expected, we appreciate your help so the team can prepare the room in good time.',rem:4}
};
const REPORT = [
"(function(){var card=document.getElementById('turno-card-tv');var ov=document.getElementById('turno-overlay');var car=document.getElementById('turno-carousel');var track=document.getElementById('carousel-track');",
"var slides=Array.prototype.slice.call(track.children);var r=window.__lastTurnoReport||{ok:false,problems:[{type:'sin-report'}]};",
"var vw=window.innerWidth,vh=window.innerHeight;var cr=card.getBoundingClientRect();var dentro=(cr.left>=-1&&cr.right<=vw+1&&cr.top>=-1&&cr.bottom<=vh+1);",
"var clamp=false,so=0;slides.forEach(function(sl){Array.prototype.slice.call(sl.querySelectorAll('.slide-text-es,.slide-text-en,.slide-label')).forEach(function(el){if(getComputedStyle(el).webkitLineClamp!=='none')clamp=true;});if(sl.scrollHeight>sl.clientHeight+1)so++;});",
"return JSON.stringify({visible:ov.classList.contains('visible'),scale:r.scale,ok:r.ok,unfit:!!r.unfit,problemas:r.problems,slides:slides.length,dentro:dentro,clamp:clamp,so:so,cardH:card.offsetHeight,vh:vh});})()"
].join("\n");
const PAGE = [
"(function(){var car=document.getElementById('turno-carousel');var track=document.getElementById('carousel-track');var cur=track.children[currentSlideIndex];var cr=car.getBoundingClientRect();var bad=0;",
"Array.prototype.slice.call(cur.querySelectorAll('.slide-text-es,.slide-text-en,.slide-label,.slide-media')).forEach(function(el){var r=el.getBoundingClientRect();if(r.width===0&&r.height===0)return;if(r.left<cr.left-1||r.right>cr.right+1||r.top<cr.top-1||r.bottom>cr.bottom+1)bad++;});",
"return JSON.stringify({i:currentSlideIndex,dentro:bad===0});})()"
].join("\n");

// ── 1) Matriz de contenido ──
let mTotal = 0, mFail = 0; const mFailures = [];
for (const [w, h] of [[1280,720],[1920,1080],[2560,1440],[3840,2160]]) {
  await goto(w, h);
  for (const key of Object.keys(CASES)) {
    const c = CASES[key];
    const t = { hora:'14:00', minutosAntes:c.antes, label:'Cambio de Turno', mensajeEs:c.es, mensajeEn:c.en, bgColor:'#1e3a5f', textColor:'#ffffff' };
    await ev('remindersConfig=' + JSON.stringify(c.rem ? REM.slice(0, c.rem) : []) + '; carouselInterval=15; showTurno(' + JSON.stringify(t) + '); stopCarousel(); "ok"');
    await sleep(900);
    const rep = JSON.parse(await ev(REPORT));
    let pagesOk = true;
    for (let i = 0; i < rep.slides; i++) { await ev('goToPage(' + i + '); "ok"'); await sleep(650); const p = JSON.parse(await ev(PAGE)); if (!p.dentro) pagesOk = false; }
    mTotal++;
    const ok = rep.visible && rep.ok && rep.dentro && rep.clamp === false && rep.so === 0 && pagesOk;
    if (!ok) { mFail++; mFailures.push(w + 'x' + h + ' ' + c.n + ' ' + JSON.stringify(rep.problemas)); }
  }
}
record('Matriz carrusel (4 resoluciones x 8 casos)', mFail ? 'FAIL' : 'PASS', mTotal + ' casos, ' + mFail + ' fallos' + (mFail ? ': ' + mFailures.slice(0,3).join(' | ') : ', 0 clipping/truncado/solape'));

// ── 2) Comprobaciones funcionales ──
await goto(1920, 1080);
await ev('remindersConfig=' + JSON.stringify(REM.slice(0,3)) + '; carouselInterval=15; "ok"');
// checkTurnos dispara showTurno
await ev('turnosConfig=[{id:"t1",activo:true,hora:"14:00",minutosAntes:5,label:"Cambio de Turno",mensajeEs:"Gracias",mensajeEn:"Thank you"}]; firedTurnos.clear(); checkTurnos("13:55"); "ok"');
await sleep(500);
const fired = JSON.parse(await ev('JSON.stringify({visible:document.getElementById("turno-overlay").classList.contains("visible"),slides:document.getElementById("carousel-track").children.length})'));
record('checkTurnos dispara el turno (13:55 = 14:00 - 5 min)', fired.visible && fired.slides === 4 ? 'PASS' : 'FAIL', 'overlay=' + fired.visible + ', slides=' + fired.slides + ' (1 despedida + 3 recordatorios)');
// no re-dispara el mismo turno
await ev('checkTurnos("13:55"); "ok"');
record('No se repite el mismo turno (firedTurnos)', await ev('firedTurnos.size') === 1 ? 'PASS' : 'FAIL', 'firedTurnos.size=' + await ev('firedTurnos.size'));
// cuenta atrás avanza
const c1 = await ev('document.getElementById("turno-countdown-label").textContent');
await sleep(1200);
const c2 = await ev('document.getElementById("turno-countdown-label").textContent');
record('Cuenta atrás en marcha', /\d+:\d\d/.test(c2) && c1 !== c2 ? 'PASS' : 'FAIL', JSON.stringify(c1) + ' -> ' + JSON.stringify(c2));
// carrusel navega y muestra todas las diapositivas
let nav = true;
for (let i = 0; i < 4; i++) { await ev('goToPage(' + i + '); "ok"'); await sleep(120); if (await ev('currentSlideIndex') !== i) nav = false; }
record('Carrusel navega por las 4 diapositivas', nav ? 'PASS' : 'FAIL', 'currentSlideIndex recorrido 0..3');
// desaparece
await ev('dismissTurno(); "ok"');
await sleep(300);
const gone = JSON.parse(await ev('JSON.stringify({visible:document.getElementById("turno-overlay").classList.contains("visible"),timer:carouselTimer})'));
record('El carrusel desaparece y detiene el temporizador', !gone.visible && gone.timer === null ? 'PASS' : 'FAIL', 'visible=' + gone.visible + ', timer=' + gone.timer);
// recordatorios = 1 + n
await ev('remindersConfig=' + JSON.stringify(REM) + '; showTurno({hora:"14:00",minutosAntes:5,label:"T",mensajeEs:"a",mensajeEn:"b"}); stopCarousel(); "ok"');
record('Nº de diapositivas = 1 + recordatorios', await ev('document.getElementById("carousel-track").children.length') === 5 ? 'PASS' : 'FAIL', '4 recordatorios -> 5 diapositivas');
// cierre tiene prioridad
await ev('cierreConfig={activo:true}; refreshCierre(); "ok"');
await sleep(300);
const cierre = JSON.parse(await ev('JSON.stringify({cierre:document.getElementById("cierre-overlay").classList.contains("visible"),turno:document.getElementById("turno-overlay").classList.contains("visible")})'));
record('Cierre oculta el turno', cierre.cierre && !cierre.turno ? 'PASS' : 'FAIL', 'cierre=' + cierre.cierre + ', turno=' + cierre.turno);
await ev('cierreConfig={activo:false}; refreshCierre(); "ok"');
// reloj
const reloj = await ev('document.getElementById("header-time").textContent');
record('Reloj operativo (HH:MM)', /^\d{1,2}:\d{2}$/.test(reloj) ? 'PASS' : 'FAIL', 'header-time=' + reloj);
// leyenda
const leg = JSON.parse(await ev('JSON.stringify({n:document.querySelectorAll(".legend-item").length, first:document.querySelector(".legend-es")?.textContent})'));
record('Leyenda intacta (14 alérgenos)', leg.n === 14 ? 'PASS' : 'FAIL', 'items=' + leg.n + ', primero=' + leg.first);

// ── Salida ──
console.log('\n================ TURNOS ================');
const w1 = Math.max(...results.map((r) => r.test.length), 5);
console.log('TEST'.padEnd(w1) + ' | RESULTADO | EVIDENCIA');
console.log('-'.repeat(w1 + 40));
results.forEach((r) => console.log(r.test.padEnd(w1) + ' | ' + r.result.padEnd(9) + ' | ' + r.evidence));
const c = { PASS: 0, WARN: 0, FAIL: 0 };
results.forEach((r) => { c[r.result] = (c[r.result] || 0) + 1; });
console.log('-'.repeat(w1 + 40));
console.log('TOTAL: PASS=' + c.PASS + ' WARN=' + c.WARN + ' FAIL=' + c.FAIL);
try { ws.close(); } catch (e) {}
try { chrome.kill('SIGKILL'); } catch (e) {}
try { server.close(); } catch (e) {}
process.exit(c.FAIL ? 1 : 0);
