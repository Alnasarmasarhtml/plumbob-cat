/* =====================================================================
   $SIMSCAT — PLUMBOB CAT
   Schizo runtime: boot, audio, popups, cursor, plumbob storm.

   ⚠ EDIT THE CONFIG BLOCK BELOW WHEN YOU LAUNCH:
   - CA       → contract address
   - TWITTER  → x.com link
   - TELEGRAM → t.me link
   - DEX      → dexscreener link
   ===================================================================== */

const CONFIG = {
  CA:       "TBA — DROPS WHEN PLUMBOB GLOWS",   // <- paste contract address
  TWITTER:  "https://x.com/",                    // <- replace
  TELEGRAM: "https://t.me/",                     // <- replace
  DEX:      "https://dexscreener.com/",          // <- replace
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const PLUMBOB_SRC = "rotating plumbob.png";

/* ======================= apply CONFIG to DOM ======================= */
function wireConfig(){
  // contract
  const caEl = $("#caValue");
  if (caEl) caEl.textContent = CONFIG.CA;

  // socials (top bar + community)
  const setHref = (id, url) => { const a = $(id); if (a) a.href = url; };
  setHref("#sx",   CONFIG.TWITTER);
  setHref("#stg",  CONFIG.TELEGRAM);
  setHref("#sdex", CONFIG.DEX);
  setHref("#cX",   CONFIG.TWITTER);
  setHref("#cTg",  CONFIG.TELEGRAM);
  setHref("#cDex", CONFIG.DEX);
}

/* ======================= contract copy ======================= */
function wireCopy(){
  const bar  = $(".ca-bar");
  const btn  = $("#copyCa");
  const lbl  = $(".ca-label");
  const copy = async (e) => {
    e?.stopPropagation?.();
    try {
      await navigator.clipboard.writeText(CONFIG.CA);
      btn.classList.add("copied");
      const old = btn.textContent;
      btn.textContent = "COPIED ✓";
      lbl.textContent = "OK";
      spawnPopup({
        title: "CLIPBOARD",
        msg:   "$SIMSCAT contract copied. The plumbob saw it.",
      });
      setTimeout(() => {
        btn.textContent = old; btn.classList.remove("copied");
        lbl.textContent = "CA";
      }, 1600);
    } catch {
      // fallback for browsers without clipboard
      const r = document.createRange();
      const tmp = document.createElement("textarea");
      tmp.value = CONFIG.CA; document.body.appendChild(tmp);
      tmp.select(); document.execCommand("copy"); tmp.remove();
      btn.textContent = "COPIED ✓";
      setTimeout(() => btn.textContent = "COPY", 1400);
    }
  };
  bar?.addEventListener("click", copy);
  btn?.addEventListener("click", copy);
}

/* ======================= boot loader ======================= */
function bootSequence(){
  const boot = $("#boot");
  const fill = $(".boot-bar-fill");
  const pct  = $("#bootPct");
  const enter = $("#bootEnter");

  let p = 0;
  const tick = () => {
    p += Math.random() * 12 + 4;
    if (p > 100) p = 100;
    fill.style.width = p + "%";
    pct.textContent = Math.floor(p);
    if (p < 100) setTimeout(tick, 180 + Math.random() * 220);
  };
  tick();

  enter.addEventListener("click", () => {
    boot.classList.add("gone");
    document.body.classList.remove("no-scroll");
    setTimeout(() => boot.remove(), 700);
    startAudio();
    spawnPopup({
      title: "WELCOME, PLAYER",
      msg:   "Кот выбран. Кот в курсе. Music is now playing.",
      cta:   "ACKNOWLEDGE",
    });
  }, { once: true });
}

/* ======================= audio ======================= */
const AUDIO = { el: null, on: true };

function startAudio(){
  AUDIO.el = $("#bgAudio");
  if (!AUDIO.el) return;
  AUDIO.el.volume = 0.55;
  AUDIO.el.play().catch(() => {
    // some browsers still block — surface a message
    console.warn("audio autoplay blocked, click anywhere to start");
    document.addEventListener("click", () => AUDIO.el.play().catch(() => {}), { once: true });
  });
}

function wireMute(){
  const btn = $("#muteBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!AUDIO.el) return;
    AUDIO.on = !AUDIO.on;
    AUDIO.el.muted = !AUDIO.on;
    btn.textContent = AUDIO.on ? "🔊" : "🔇";
    btn.classList.toggle("muted", !AUDIO.on);
  });
}

/* ======================= floating plumbobs (margins only) ======================= */
const IS_TOUCH  = matchMedia("(hover: none), (pointer: coarse)").matches;
const IS_MOBILE = window.innerWidth <= 700;

function spawnPlumbobStorm(count){
  const layer = $("#plumbobLayer");
  if (!layer || IS_TOUCH) return;          // no decorative storm on touch
  if (count == null) count = IS_MOBILE ? 4 : 10;
  // hard cap right edge so plumbobs never push viewport past 100vw
  const SAFE_RIGHT_VW = IS_MOBILE ? 86 : 90;
  const SAFE_LEFT_VW  = IS_MOBILE ? 2  : 0;
  for (let i = 0; i < count; i++){
    const img = document.createElement("img");
    img.src = PLUMBOB_SRC;
    const left = Math.random() < .5;
    const x = left
      ? SAFE_LEFT_VW + Math.random() * 8
      : SAFE_RIGHT_VW + Math.random() * 6;
    const y = 4 + Math.random() * 88;
    const s = IS_MOBILE ? 22 + Math.random() * 18 : 28 + Math.random() * 36;
    const dly = Math.random() * 4;
    const spd = 3 + Math.random() * 5;
    img.style.cssText = `
      left:${x}vw; top:${y}vh;
      width:${s}px;
      animation-delay:-${dly}s, -${dly}s;
      animation-duration:${spd}s, ${spd * .8}s;
      opacity:${0.32 + Math.random() * 0.28};
    `;
    layer.appendChild(img);
  }
}

/* ======================= cursor trail + plumbob cursor ======================= */
function wireCursor(){
  const trail = $("#cursorTrail");
  const hud   = $("#hudCursor img");

  // touch devices: no fake cursor, no trail. Let the system finger be.
  if (IS_TOUCH){
    document.body.style.cursor = "auto";
    if (hud) hud.parentElement.style.display = "none";
    if (trail) trail.style.display = "none";
    return;
  }

  let last = 0;
  document.addEventListener("pointermove", (e) => {
    if (hud) {
      hud.style.left = e.clientX + "px";
      hud.style.top  = e.clientY + "px";
    }
    const now = performance.now();
    if (now - last < 28) return;
    last = now;
    const dot = document.createElement("span");
    dot.style.left = e.clientX + "px";
    dot.style.top  = e.clientY + "px";
    trail.appendChild(dot);
    setTimeout(() => dot.remove(), 800);
  }, { passive: true });
}

/* ======================= sims-style popups ======================= */
const POPUP_MSGS = [
  { title: "+10 VIBE",        msg: "Your Sim has reached MAXIMUM VIBE. Continue holding $SIMSCAT?" },
  { title: "NEED FULFILLED",  msg: "The cat has consumed $SIMSCAT. Hunger meter restored." },
  { title: "NEW MEMORY",      msg: "Your Sim remembers buying $SIMSCAT. +30 long-term mood." },
  { title: "NOTIFICATION",    msg: "An invisible player has selected you. The plumbob is green." },
  { title: "ACHIEVEMENT",     msg: "Diamond Paws unlocked. The cat purrs in your portfolio." },
  { title: "LIVE EVENT",      msg: "Виктория Шоу is performing «Просто» in your living room." },
  { title: "SOCIAL EVENT",    msg: "Telegram chat invites you to the disco. Decline impossible." },
  { title: "MOOD: ECSTATIC",  msg: "«Шопинг, модный лук, я звезда Ютуб.» — your Sim, just now." },
  { title: "PRICE ALERT",     msg: "$SIMSCAT mood ring is shifting GREEN. Plumbob is glowing." },
  { title: "CAT.exe",         msg: "Кот в курсе. Кот видит твой портфель. Кот доволен." },
  { title: "DAILY QUEST",     msg: "Hold for one (1) more candle. Reward: vibe." },
  { title: "WHISPERS",        msg: "«Лайк ведёт меня к мечте.» — voice in the simulation." },
];

function spawnPopup(pop){
  const layer = $("#popupLayer");
  if (!layer) return;

  const node = document.createElement("div");
  node.className = "popup";
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // popup width: 320 desktop, 84vw mobile (matches CSS clamp)
  const popWidth = vw <= 700 ? Math.min(320, vw * 0.84) : 320;
  const x = 12 + Math.random() * Math.max(20, vw - popWidth - 24);
  const y = 80 + Math.random() * Math.max(60, vh - 240);
  node.style.left = Math.max(8, Math.min(x, vw - popWidth - 8)) + "px";
  node.style.top  = Math.min(y, vh - 180) + "px";
  // tiny rotation for chaos (less on mobile)
  const rot = vw <= 700 ? (Math.random() * 2 - 1) : (Math.random() * 4 - 2);
  node.style.transform = `rotate(${rot.toFixed(1)}deg)`;

  node.innerHTML = `
    <div class="pop-head">
      <span>${escapeHtml(pop.title || "PLUMBOB OS")}</span>
      <button class="pop-x" type="button" aria-label="close">X</button>
    </div>
    <div class="pop-body">
      <div class="pop-icon"></div>
      <div>
        <div class="pop-msg">${escapeHtml(pop.msg || "...")}</div>
        ${pop.cta ? `<button class="pop-btn" type="button">${escapeHtml(pop.cta)}</button>` : ""}
      </div>
    </div>
  `;
  const close = () => { node.style.opacity = "0"; node.style.transition = "opacity .25s"; setTimeout(() => node.remove(), 260); };
  node.querySelector(".pop-x").addEventListener("click", close);
  node.querySelector(".pop-btn")?.addEventListener("click", close);
  layer.appendChild(node);

  // auto-dismiss
  setTimeout(close, 9000 + Math.random() * 4000);
}

function popupLoop(){
  const tick = () => {
    const visible = $$("#popupLayer .popup").length;
    if (visible < 3 && document.visibilityState === "visible"){
      spawnPopup(POPUP_MSGS[Math.floor(Math.random() * POPUP_MSGS.length)]);
    }
    setTimeout(tick, 9000 + Math.random() * 14000);
  };
  // first popup 5–10s after entering
  setTimeout(tick, 5000 + Math.random() * 5000);
}

/* ======================= reveal stats meters on scroll ======================= */
function revealMeters(){
  const bars = $$(".bar .meter span");
  const widths = bars.map(b => b.style.width || "");
  bars.forEach(b => b.style.width = "0%");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        const i = bars.indexOf(e.target.querySelector(".meter span"));
        if (i >= 0) bars[i].style.width = widths[i];
      }
    });
  }, { threshold: .35 });
  $$(".bar").forEach(b => io.observe(b));
}

/* ======================= glitch periodically on h2s ======================= */
function jitter(){
  const els = $$(".h2, .hero-title");
  setInterval(() => {
    const el = els[Math.floor(Math.random() * els.length)];
    if (!el) return;
    el.style.filter = "hue-rotate(60deg)";
    setTimeout(() => { el.style.filter = "" }, 120);
  }, 4500);
}

/* ======================= util ======================= */
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

/* ======================= init ======================= */
document.addEventListener("DOMContentLoaded", () => {
  wireConfig();
  wireCopy();
  wireMute();
  bootSequence();
  spawnPlumbobStorm();
  wireCursor();
  popupLoop();
  revealMeters();
  jitter();

  // hero video — try to play (it's muted so should auto)
  const v = $("#heroVid");
  v?.play?.().catch(() => {});
});
