// Animasi selalu aktif, kecuali pengunjung mematikannya sendiri lewat menu cepat
const reduceMotion = document.documentElement.classList.contains("no-motion");
const finePointer = window.matchMedia("(pointer: fine)").matches;

// ===== Loader: hilang setelah halaman siap, lalu animasi hero dimulai =====
document.body.classList.add("loading");
const loader = document.querySelector(".loader");
let started = false;

function startPage() {
  if (started) return;
  started = true;
  loader.classList.add("done");
  document.body.classList.remove("loading");
  document.body.classList.add("ready");
  heroIntro();
}

window.addEventListener("load", () => setTimeout(startPage, 500));
setTimeout(startPage, 3000); // jaga-jaga kalau ada file yang lama dimuat

// ===== Foto profil: tampilkan inisial kalau foto belum ada =====
const photo = document.getElementById("profile-photo");
function showFallback() {
  photo.parentElement.classList.add("no-photo");
}
photo.addEventListener("error", showFallback);
if (photo.complete && photo.naturalWidth === 0) showFallback();

// ===== Menu hamburger (HP) =====
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open);
}

navToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

// ===== Efek saat scroll =====
const navbar = document.querySelector(".navbar");
const progressBar = document.querySelector(".scroll-progress");
const backToTop = document.querySelector(".back-to-top");
const sections = document.querySelectorAll("main section[id]");
const menuLinks = document.querySelectorAll(".nav-links a");
let lastY = 0;

function onScroll() {
  const y = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Garis progres di atas layar
  progressBar.style.transform = `scaleX(${maxScroll > 0 ? y / maxScroll : 0})`;

  // Navbar: beri latar saat discroll, sembunyi saat turun, muncul saat naik
  navbar.classList.toggle("scrolled", y > 20);
  const menuOpen = navLinks.classList.contains("open");
  navbar.classList.toggle("hidden", y > lastY && y > 300 && !menuOpen);
  lastY = y;

  backToTop.classList.toggle("show", y > 600);

  // Tandai menu sesuai bagian yang sedang dilihat
  let currentId = "home";
  sections.forEach((section) => {
    if (y >= section.offsetTop - 140) currentId = section.id;
  });
  menuLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ===== Animasi muncul saat di-scroll =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("visible");
      revealObserver.unobserve(el);

      // Setelah animasi selesai, lepas class reveal agar efek hover berjalan normal
      el.addEventListener("transitionend", function settle(e) {
        if (e.target !== el || e.propertyName !== "transform") return;
        el.classList.remove("reveal", "visible");
        el.style.removeProperty("--d");
        el.removeEventListener("transitionend", settle);
      });
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ===== Angka statistik menghitung naik =====
function animateCount(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const duration = 1600;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => {
  if (reduceMotion) {
    el.textContent = el.dataset.count + (el.dataset.suffix || "");
  } else {
    countObserver.observe(el);
  }
});

// ===== Efek kursor (hanya di laptop/PC) =====
const projectCards = document.querySelectorAll(".project-card");

if (finePointer && !reduceMotion) {
  // Cahaya lembut yang mengikuti kursor
  const glow = document.querySelector(".cursor-glow");
  let glowX = 0, glowY = 0, mouseX = 0, mouseY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.body.classList.add("has-pointer");
  });

  (function moveGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
    requestAnimationFrame(moveGlow);
  })();

  // Foto hero sedikit bergeser mengikuti kursor (efek kedalaman)
  const heroVisual = document.querySelector(".hero-visual");
  document.querySelector(".hero").addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    heroVisual.style.translate = `${x * -18}px ${y * -12}px`;
  });

  // Kartu proyek miring 3D + sorotan cahaya mengikuti kursor
  projectCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      card.style.setProperty("--mx", `${px}px`);
      card.style.setProperty("--my", `${py}px`);
      const x = px / rect.width - 0.5;
      const y = py / rect.height - 0.5;
      card.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // Tombol "magnetis" yang sedikit tertarik ke kursor
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

// ===== Notifikasi kecil (toast) =====
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ===== Ganti tema terang / gelap =====
const root = document.documentElement;

function setTheme(theme) {
  document.body.classList.add("theme-switching");
  if (theme === "light") {
    root.dataset.theme = "light";
  } else {
    delete root.dataset.theme;
  }
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {}
  setTimeout(() => document.body.classList.remove("theme-switching"), 450);
}

function toggleTheme() {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}

document.querySelector(".theme-toggle").addEventListener("click", () => {
  const next = toggleTheme();
  showToast(next === "light" ? "Tema terang aktif" : "Tema gelap aktif");
});

// ===== Jendela detail proyek =====
const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalTags = document.getElementById("modal-tags");
const modalLink = document.getElementById("modal-link");
const modalBanner = document.getElementById("modal-banner");
const modalNum = document.getElementById("modal-num");
let currentProject = 0;
let lastFocused = null;

function fillModal(card) {
  const data = card.querySelector(".project-data");
  const link = data.querySelector(".project-link");

  modalTitle.textContent = card.querySelector("h3").textContent;
  modalNum.textContent = card.querySelector(".project-num").textContent + " / " + String(projectCards.length).padStart(2, "0");

  // Banner memakai salinan mockup dari kartu
  modalBanner.innerHTML = "";
  modalBanner.appendChild(card.querySelector(".mock").cloneNode(true));

  modalDesc.innerHTML = "";
  modalDesc.appendChild(data.querySelector(".desc").cloneNode(true));
  const detail = data.querySelector(".project-detail");
  if (detail) modalDesc.appendChild(detail.content.cloneNode(true));

  modalTags.innerHTML = data.querySelector(".tags").innerHTML;

  modalLink.href = link.getAttribute("href");
  modalLink.innerHTML = `Buka ${link.textContent} <span class="arrow">↗</span>`;
}

function openModal(card) {
  currentProject = [...projectCards].indexOf(card);
  fillModal(card);
  lastFocused = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close").focus();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocused) lastFocused.focus();
}

function stepModal(direction) {
  currentProject = (currentProject + direction + projectCards.length) % projectCards.length;
  const box = modal.querySelector(".modal-box");
  box.style.opacity = "0";
  setTimeout(() => {
    fillModal(projectCards[currentProject]);
    box.style.opacity = "";
  }, 180);
}

projectCards.forEach((card) => {
  card.addEventListener("click", () => openModal(card));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(card);
    }
  });
});

modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
document.getElementById("modal-prev").addEventListener("click", () => stepModal(-1));
document.getElementById("modal-next").addEventListener("click", () => stepModal(1));

document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("open")) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowLeft") stepModal(-1);
  if (e.key === "ArrowRight") stepModal(1);
});

// ===== Terminal interaktif =====
const termBody = document.getElementById("terminal-body");
const termOutput = document.getElementById("terminal-output");
const termForm = document.getElementById("terminal-form");
const termInput = document.getElementById("terminal-input");
const cmdHistory = [];
let historyIndex = 0;

function print(html, className = "") {
  const line = document.createElement("div");
  line.className = "term-line " + className;
  line.innerHTML = html;
  termOutput.appendChild(line);
  termBody.scrollTop = termBody.scrollHeight;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const sectionIds = [...sections].map((s) => s.id);

const commands = {
  help: () => [
    '<span class="term-accent">Perintah yang tersedia:</span>',
    '  <span class="term-key">about</span>      Tentang saya',
    '  <span class="term-key">skills</span>     Daftar skill',
    '  <span class="term-key">projects</span>   Daftar proyek',
    '  <span class="term-key">education</span>  Riwayat pendidikan',
    '  <span class="term-key">contact</span>    Media sosial',
    '  <span class="term-key">open</span> &lt;n&gt;   Buka detail proyek ke-n (contoh: open 1)',
    '  <span class="term-key">goto</span> &lt;bagian&gt; Pindah ke bagian (proyek, kemampuan, ...)',
    '  <span class="term-key">theme</span>      Ganti tema terang/gelap',
    '  <span class="term-key">menu</span>       Buka menu cepat (Ctrl + K)',
    '  <span class="term-key">date</span>       Tanggal & jam sekarang',
    '  <span class="term-key">echo</span> &lt;teks&gt; Ulangi teks',
    '  <span class="term-key">clear</span>      Bersihkan layar',
    '<span class="term-muted">Tips: pakai ↑ ↓ untuk riwayat dan Tab untuk melengkapi perintah.</span>',
  ],
  about: () => [
    '<span class="term-accent">Logika Bijaksana</span>',
    "Pelajar SMK Rekayasa Perangkat Lunak di Bandung.",
    "Sedang fokus belajar web development dan desain antarmuka.",
  ],
  skills: () => {
    const names = [...document.querySelectorAll(".tool")].map((t) => t.textContent.trim());
    return [...names, "UI Design"].map((name) => `  <span class="term-ok">✔</span> ${name}`);
  },
  projects: () => {
    const lines = [...projectCards].map((card, i) =>
      `  <span class="term-key">${i + 1}.</span> ${card.querySelector("h3").textContent}`
    );
    return [...lines, '<span class="term-muted">Ketik "open 1" untuk melihat detail proyek pertama.</span>'];
  },
  education: () => [
    '<span class="term-accent">2025 — Sekarang</span>',
    "SMK Merdeka Bandung · Rekayasa Perangkat Lunak",
  ],
  contact: () => [
    'GitHub    : <a href="https://github.com/logitech1509" target="_blank" rel="noopener">logitech1509</a>',
    'Instagram : <a href="https://instagram.com/Logika_bijak" target="_blank" rel="noopener">@Logika_bijak</a>',
  ],
  open: (arg) => {
    const card = projectCards[Number(arg) - 1];
    if (!card) return [`<span class="term-err">Proyek "${escapeHtml(arg || "")}" tidak ada. Pilih 1–${projectCards.length}.</span>`];
    setTimeout(() => openModal(card), 300);
    return [`<span class="term-ok">Membuka "${card.querySelector("h3").textContent}"...</span>`];
  },
  goto: (arg) => {
    if (!sectionIds.includes(arg)) return [`<span class="term-err">Bagian tidak dikenal. Pilih: ${sectionIds.join(", ")}</span>`];
    setTimeout(() => document.getElementById(arg).scrollIntoView({ behavior: "smooth" }), 400);
    return [`<span class="term-ok">Menuju ke #${arg}...</span>`];
  },
  theme: () => {
    const next = toggleTheme();
    return [`<span class="term-ok">Tema diganti ke ${next === "light" ? "terang" : "gelap"}.</span>`];
  },
  date: () => [new Date().toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })],
  echo: (arg, raw) => [escapeHtml(raw || "")],
  whoami: () => ["pengunjung yang keren 😎"],
  sudo: () => ['<span class="term-err">Akses ditolak. Kamu bukan admin di sini 😄</span>'],
  clear: () => {
    termOutput.innerHTML = "";
    return [];
  },
};

function runCommand(input) {
  const raw = input.trim();
  print(`<span class="prompt-echo">logika@portfolio:~$</span> ${escapeHtml(raw)}`, "term-cmd");
  if (!raw) return;

  cmdHistory.push(raw);
  historyIndex = cmdHistory.length;

  const [name, ...rest] = raw.split(/\s+/);
  const command = commands[name.toLowerCase()];
  if (!command) {
    print(`<span class="term-err">Perintah tidak ditemukan: ${escapeHtml(name)}.</span> Ketik <span class="term-key">help</span>.`);
    return;
  }
  const output = command(rest[0], rest.join(" "));
  output.forEach((line) => print(line));
}

termForm.addEventListener("submit", (e) => {
  e.preventDefault();
  runCommand(termInput.value);
  termInput.value = "";
});

termInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && historyIndex > 0) {
    e.preventDefault();
    termInput.value = cmdHistory[--historyIndex];
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    historyIndex = Math.min(historyIndex + 1, cmdHistory.length);
    termInput.value = cmdHistory[historyIndex] || "";
  } else if (e.key === "Tab") {
    e.preventDefault();
    const typed = termInput.value.toLowerCase();
    const match = Object.keys(commands).find((c) => typed && c.startsWith(typed));
    if (match) termInput.value = match + " ";
  }
});

// Klik di mana saja di terminal langsung fokus ke input (kecuali saat memilih teks / klik link)
termBody.addEventListener("click", (e) => {
  if (e.target.closest("a") || window.getSelection().toString()) return;
  termInput.focus({ preventScroll: true });
});

document.querySelectorAll(".terminal-chips button").forEach((chip) => {
  chip.addEventListener("click", () => runCommand(chip.dataset.cmd));
});

print('<span class="term-accent">Selamat datang di terminal Logika 👋</span>');
print('Ketik <span class="term-key">help</span> untuk melihat daftar perintah.');

// ===== Efek huruf acak (scramble) =====
const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/";

function scramble(el, duration = 900) {
  if (reduceMotion || el.dataset.scrambling) return;
  const finalText = el.dataset.text || el.textContent;
  el.dataset.text = finalText;
  el.dataset.scrambling = "1";
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const revealed = Math.floor(progress * finalText.length);
    let out = "";
    for (let i = 0; i < finalText.length; i++) {
      const ch = finalText[i];
      out += i < revealed || ch === " " ? ch : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
    }
    el.textContent = out;
    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = finalText;
      delete el.dataset.scrambling;
    }
  }
  requestAnimationFrame(frame);
}

// Judul hero diacak saat halaman pertama dibuka
function heroIntro() {
  document.querySelectorAll(".hero-title .line").forEach((line, i) => {
    setTimeout(() => scramble(line, 1000), 200 + i * 150);
  });
}

// Label tiap bagian diacak saat terlihat di layar
const labelObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      scramble(entry.target, 700);
      labelObserver.unobserve(entry.target);
    });
  },
  { threshold: 1 }
);
document.querySelectorAll(".section-label, .panel-title").forEach((el) => labelObserver.observe(el));

// Menu navbar diacak saat disorot
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("mouseenter", () => scramble(link, 400));
});

// ===== Jam lokal Bandung + sapaan =====
const clockEl = document.querySelector(".clock");
const greetingEl = document.querySelector(".greeting");

function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
  const hour = Number(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false })) % 24;
  greetingEl.textContent =
    hour < 11 ? "Selamat pagi ☀️" : hour < 15 ? "Selamat siang 🌤️" : hour < 18 ? "Selamat sore 🌇" : "Selamat malam 🌙";
}
updateClock();
setInterval(updateClock, 10000);

// ===== Pita berjalan: gandakan isi supaya berputar tanpa putus =====
const marqueeTrack = document.querySelector(".marquee-track");
marqueeTrack.appendChild(marqueeTrack.firstElementChild.cloneNode(true));

// ===== Salin teks ke clipboard =====
async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // Cara lama untuk browser yang tidak mengizinkan clipboard API
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
  showToast(`${label} disalin: ${text}`);
}

// ===== Kursor kustom (hanya di laptop/PC) =====
if (finePointer && !reduceMotion) {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const ringLabel = ring.querySelector(".cursor-label");
  let mx = -100, my = -100, rx = -100, ry = -100;

  document.body.classList.add("custom-cursor");

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });

  // Cincin mengikuti dengan sedikit jeda supaya terasa halus
  (function followRing() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(followRing);
  })();

  document.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".project-card");
    const clickable = e.target.closest("a, button, .terminal-chips button, .palette-item");
    const typing = e.target.closest("input");

    ring.classList.toggle("label", !!card);
    ring.classList.toggle("hover", !card && !!clickable);
    ringLabel.textContent = card ? "Lihat" : "";
    ring.classList.toggle("hidden", !!typing);
    dot.classList.toggle("hidden", !!typing);
  });

  document.addEventListener("mousedown", () => document.body.classList.add("cursor-down"));
  document.addEventListener("mouseup", () => document.body.classList.remove("cursor-down"));
  document.addEventListener("mouseleave", () => document.body.classList.remove("custom-cursor"));
  document.addEventListener("mouseenter", () => document.body.classList.add("custom-cursor"));
}

// ===== Menu cepat (Ctrl + K) =====
const palette = document.getElementById("palette");
const paletteInput = document.getElementById("palette-input");
const paletteList = document.getElementById("palette-list");
let paletteItems = [];
let paletteIndex = 0;

function scrollToId(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

const paletteActions = [
  { group: "Navigasi", icon: "↑", label: "Ke atas", hint: "Beranda", run: () => scrollToId("home") },
  { group: "Navigasi", icon: "◧", label: "Karya Pilihan", hint: "#proyek", run: () => scrollToId("proyek") },
  { group: "Navigasi", icon: "✦", label: "Yang Saya Pelajari", hint: "#kemampuan", run: () => scrollToId("kemampuan") },
  { group: "Navigasi", icon: "→", label: "Cara Saya Bekerja", hint: "#proses", run: () => scrollToId("proses") },
  {
    group: "Navigasi", icon: ">_", label: "Terminal", hint: "#terminal",
    run: () => {
      scrollToId("terminal");
      setTimeout(() => termInput.focus({ preventScroll: true }), 700);
    },
  },
  { group: "Navigasi", icon: "@", label: "Kontak", hint: "#kontak", run: () => scrollToId("kontak") },
  ...[...projectCards].map((card, i) => ({
    group: "Proyek",
    icon: String(i + 1).padStart(2, "0"),
    label: card.querySelector("h3").textContent,
    hint: "Detail",
    run: () => openModal(card),
  })),
  { group: "Aksi", icon: "◐", label: "Ganti tema terang/gelap", hint: "Tema", run: () => document.querySelector(".theme-toggle").click() },
  {
    group: "Aksi", icon: "≋",
    label: reduceMotion ? "Nyalakan animasi" : "Matikan animasi",
    hint: "Muat ulang",
    run: () => {
      try {
        localStorage.setItem("motion", reduceMotion ? "on" : "off");
      } catch (e) {}
      location.reload();
    },
  },
  { group: "Aksi", icon: "⧉", label: "Salin username GitHub", hint: "logitech1509", run: () => copyText("logitech1509", "Username GitHub") },
  { group: "Aksi", icon: "⧉", label: "Salin username Instagram", hint: "@Logika_bijak", run: () => copyText("@Logika_bijak", "Username Instagram") },
  { group: "Aksi", icon: "↗", label: "Buka GitHub", hint: "Tab baru", run: () => window.open("https://github.com/logitech1509", "_blank", "noopener") },
  { group: "Aksi", icon: "↗", label: "Buka Instagram", hint: "Tab baru", run: () => window.open("https://instagram.com/Logika_bijak", "_blank", "noopener") },
];

function renderPalette() {
  const query = paletteInput.value.trim().toLowerCase();
  paletteItems = paletteActions.filter((a) => (a.label + " " + a.hint + " " + a.group).toLowerCase().includes(query));
  paletteIndex = Math.min(paletteIndex, Math.max(paletteItems.length - 1, 0));

  paletteList.innerHTML = "";
  if (!paletteItems.length) {
    paletteList.innerHTML = `<li class="palette-empty">Tidak ada hasil untuk "${escapeHtml(query)}"</li>`;
    return;
  }

  let lastGroup = "";
  paletteItems.forEach((action, i) => {
    if (action.group !== lastGroup) {
      lastGroup = action.group;
      const groupEl = document.createElement("li");
      groupEl.className = "palette-group";
      groupEl.textContent = action.group;
      paletteList.appendChild(groupEl);
    }
    const item = document.createElement("li");
    item.className = "palette-item" + (i === paletteIndex ? " active" : "");
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", i === paletteIndex);
    item.innerHTML = `<span class="p-icon">${action.icon}</span><span>${action.label}</span><span class="p-hint">${action.hint}</span>`;
    item.addEventListener("mousemove", () => {
      if (paletteIndex === i) return;
      paletteIndex = i;
      highlightPalette();
    });
    item.addEventListener("click", () => runPalette(i));
    paletteList.appendChild(item);
  });
}

function highlightPalette() {
  paletteList.querySelectorAll(".palette-item").forEach((el, i) => {
    el.classList.toggle("active", i === paletteIndex);
    el.setAttribute("aria-selected", i === paletteIndex);
    if (i === paletteIndex) el.scrollIntoView({ block: "nearest" });
  });
}

function openPalette() {
  palette.classList.add("open");
  palette.setAttribute("aria-hidden", "false");
  paletteInput.value = "";
  paletteIndex = 0;
  renderPalette();
  setTimeout(() => paletteInput.focus(), 50);
}

function closePalette() {
  palette.classList.remove("open");
  palette.setAttribute("aria-hidden", "true");
}

function runPalette(i) {
  const action = paletteItems[i];
  if (!action) return;
  closePalette();
  setTimeout(action.run, 150);
}

paletteInput.addEventListener("input", () => {
  paletteIndex = 0;
  renderPalette();
});

paletteInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    paletteIndex = (paletteIndex + 1) % paletteItems.length;
    highlightPalette();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    paletteIndex = (paletteIndex - 1 + paletteItems.length) % paletteItems.length;
    highlightPalette();
  } else if (e.key === "Enter") {
    e.preventDefault();
    runPalette(paletteIndex);
  }
});

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    palette.classList.contains("open") ? closePalette() : openPalette();
  } else if (e.key === "Escape" && palette.classList.contains("open")) {
    closePalette();
  }
});

document.querySelector(".cmdk-btn").addEventListener("click", openPalette);
palette.querySelector("[data-palette-close]").addEventListener("click", closePalette);

// Perintah terminal tambahan untuk membuka menu cepat
commands.menu = () => {
  setTimeout(openPalette, 200);
  return ['<span class="term-ok">Membuka menu cepat... (bisa juga dengan Ctrl + K)</span>'];
};

// ===== Tahun otomatis di footer =====
document.getElementById("year").textContent = new Date().getFullYear();
