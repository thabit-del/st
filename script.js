// Edit this object to personalize the name, birth date, letter, and optional local music file.
const CONFIG = {
  name: "سماح",
  nameLatin: "SAMAH",
  nickname: "سمسم",
  // Use two digits for day/month and four for year; replace these placeholders with her real birthday.
  birthday: { day: "20", month: "11", year: "2005" },
  letter: "يا سمسم يا أجمل هدية جابتها لي الحياة، كل عام وانتي حبيبتي وفرحة قلبي وأجمل تفاصيل أيامي. اليوم مو بس يوم ميلادك، اليوم ذكرى ميلاد الإنسانة اللي خلت لحياتي معنى أجمل، واللي صارت ضحكتها تسعدني ووجودها يطمن قلبي. أتمنى لك عمر مليان فرح وراحة وتحقيق أمنيات، وأتمنى أكون معك في كل أعياد ميلادك القادمة، وأحتفل فيك كل سنة وأشوف ابتسامتك قدامي. أحبك يا سماح، وكل عام وانتي لي أجمل حكاية ❤️",
  // Optional: set to a local file such as "assets/music.mp3". Leave blank to use the synthesized melody.
  musicPath: ""
};

const SURPRISE_PASSWORD = "دلوعة ثابت";
const body = document.body;
const lockScreen = document.querySelector(".surprise-lock");
const lockForm = document.querySelector(".lock-form");
const passwordInput = document.querySelector("#surprise-password");
const lockError = document.querySelector(".lock-error");
const intro = document.querySelector(".intro");
const startButton = document.querySelector(".start-button");
const musicButton = document.querySelector(".music-toggle");
const musicStatus = document.querySelector(".music-status");
const canvas = document.querySelector(".fx-canvas");
const context = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const particles = [];
let animationFrame = 0;
let lastParticleTime = 0;
let audioContext;
let musicTimer;
let musicEnabled = false;
let giftOpened = false;
let letterStarted = false;
let finalCelebrationStarted = false;

const titleName = CONFIG.nameLatin.charAt(0) + CONFIG.nameLatin.slice(1).toLowerCase();
document.title = `Happy Birthday ${titleName} ❤️`;
document.querySelector(".birthday-date").setAttribute("aria-label", `تاريخ ميلاد ${CONFIG.name}`);
document.querySelector(".date-day").textContent = CONFIG.birthday.day;
document.querySelector(".date-month").textContent = CONFIG.birthday.month;
document.querySelector(".date-year").textContent = CONFIG.birthday.year;
if (Object.values(CONFIG.birthday).some((value) => /^(DD|MM|YYYY)$/.test(value))) {
  document.querySelector(".birthday-date").classList.add("is-placeholder");
}
document.querySelector(".gift-reveal span").textContent = CONFIG.name;
document.querySelector(".samah-name").textContent = CONFIG.nameLatin;
document.querySelector(".candles .section-title em").textContent = `يا ${CONFIG.nickname}`;
document.querySelector(".start-button span:first-child").textContent = `افتحي مفاجأتك يا ${CONFIG.nickname}`;

lockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value !== SURPRISE_PASSWORD) {
    passwordInput.setAttribute("aria-invalid", "true");
    lockError.textContent = "مو هي الكلمة يا دلوعتي، جربي مرة ثانية 🤍";
    lockError.classList.remove("is-error");
    void lockError.offsetWidth;
    lockError.classList.add("is-error");
    passwordInput.select();
    return;
  }

  passwordInput.removeAttribute("aria-invalid");
  lockError.textContent = "";
  passwordInput.disabled = true;
  lockForm.querySelector("button").disabled = true;
  document.querySelector("main").hidden = false;
  musicButton.hidden = false;
  body.classList.remove("is-locked");
  lockScreen.setAttribute("aria-hidden", "true");
  lockScreen.classList.add("is-unlocking");
  window.setTimeout(() => {
    lockScreen.hidden = true;
    startButton.focus({ preventScroll: true });
  }, reduceMotion ? 20 : 700);
});

passwordInput.addEventListener("input", () => {
  passwordInput.removeAttribute("aria-invalid");
  lockError.textContent = "";
  lockError.classList.remove("is-error");
});

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas, { passive: true });

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function addParticle(kind, x = randomBetween(0, window.innerWidth), y = -24) {
  const symbols = kind === "petal" ? ["✿", "❀", "♥"] : kind === "heart" ? ["♥", "♡"] : ["✦", "·"];
  particles.push({
    kind, symbol: symbols[Math.floor(Math.random() * symbols.length)],
    x, y, size: randomBetween(kind === "gold" ? 5 : 12, kind === "gold" ? 12 : 25),
    speed: randomBetween(kind === "gold" ? .5 : 1, kind === "gold" ? 1.5 : 3.2),
    drift: randomBetween(-.7, .7), rotation: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-.025, .025), opacity: randomBetween(.55, .96),
    color: kind === "gold" ? "#f5d686" : kind === "heart" ? (Math.random() > .5 ? "#e96b83" : "#ffd5d8") : (Math.random() > .5 ? "#c93452" : "#f2abb8")
  });
}

function drawParticles(timestamp) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  context.clearRect(0, 0, width, height);
  const raining = body.classList.contains("is-open");
  if (raining && timestamp - lastParticleTime > (reduceMotion ? 550 : 230)) {
    lastParticleTime = timestamp;
    const density = reduceMotion ? 1 : (window.innerWidth < 600 ? 1 : 2);
    for (let i = 0; i < density; i += 1) addParticle(Math.random() > .23 ? "petal" : "gold");
    if (finalCelebrationStarted && Math.random() > .35) addParticle("heart");
  }
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.y += particle.speed;
    particle.x += particle.drift + Math.sin(particle.y / 50) * .5;
    particle.rotation += particle.spin;
    particle.opacity -= particle.y > height * .8 ? .002 : 0;
    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = Math.max(0, particle.opacity);
    context.fillStyle = particle.color;
    context.shadowColor = particle.color;
    context.shadowBlur = particle.kind === "gold" ? 13 : 7;
    context.font = `${particle.size}px serif`;
    context.fillText(particle.symbol, 0, 0);
    context.restore();
    if (particle.y > height + 40 || particle.opacity <= 0) particles.splice(i, 1);
  }
  animationFrame = window.requestAnimationFrame(drawParticles);
}
animationFrame = window.requestAnimationFrame(drawParticles);

function burst(x, y, count = 34) {
  for (let i = 0; i < count; i += 1) {
    const kind = i % 4 === 0 ? "gold" : (i % 3 === 0 ? "heart" : "petal");
    const angle = (Math.PI * 2 * i) / count;
    const particle = {
      kind,
      symbol: kind === "gold" ? "✦" : kind === "heart" ? "♥" : "❀",
      x, y, size: randomBetween(9, 21), speed: randomBetween(2, 5),
      drift: Math.cos(angle) * randomBetween(1, 4),
      rotation: angle, spin: randomBetween(-.07, .07), opacity: 1,
      color: kind === "gold" ? "#ffe5a0" : kind === "heart" ? "#ff8ba1" : "#f2a4b4",
      burstVelocityY: Math.sin(angle) * randomBetween(1.5, 4)
    };
    particles.push(particle);
  }
  const start = performance.now();
  function animateBurst(now) {
    if (now - start > 1000) return;
    particles.forEach((particle) => {
      if (particle.burstVelocityY !== undefined) {
        particle.y += particle.burstVelocityY;
        particle.burstVelocityY += .055;
        particle.opacity -= .012;
      }
    });
    window.requestAnimationFrame(animateBurst);
  }
  window.requestAnimationFrame(animateBurst);
}

function beginJourney() {
  if (body.classList.contains("is-open")) return;
  body.classList.add("is-open");
  const journey = document.querySelector(".journey");
  journey.hidden = false;
  intro.classList.add("is-leaving");
  window.setTimeout(() => {
    intro.hidden = true;
    document.querySelector("#birthday").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    window.setTimeout(() => document.querySelector(".birthday-date").classList.add("is-visible"), 350);
  }, reduceMotion ? 20 : 1000);
  for (let i = 0; i < 32; i += 1) addParticle(i % 4 === 0 ? "heart" : "petal", randomBetween(0, window.innerWidth), randomBetween(0, window.innerHeight));
  if (CONFIG.musicPath) startFileMusic();
}
startButton.addEventListener("click", beginJourney);

const birthdayObserver = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) document.querySelector(".birthday-date").classList.add("is-visible");
}, { threshold: .35 });
birthdayObserver.observe(document.querySelector("#birthday"));

const blowButton = document.querySelector(".blow-button");
blowButton.addEventListener("click", () => {
  const candles = document.querySelector(".candles");
  if (candles.classList.contains("is-blown")) return;
  candles.classList.add("is-blown");
  blowButton.disabled = true;
  const message = document.querySelector(".candle-message");
  message.textContent = "أمنيتكِ وصلت للسماء يا سمسم ♥";
  message.classList.add("is-visible");
  const bounds = document.querySelector(".cake").getBoundingClientRect();
  burst(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 42);
});

document.querySelector(".gift-button").addEventListener("click", (event) => {
  if (giftOpened) return;
  giftOpened = true;
  event.currentTarget.classList.add("is-open");
  document.querySelector(".gift-reveal").classList.add("is-visible");
  const bounds = event.currentTarget.getBoundingClientRect();
  burst(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 52);
});

function typeLetter() {
  if (letterStarted) return;
  letterStarted = true;
  const target = document.querySelector(".letter-text");
  const cursor = document.querySelector(".typing-cursor");
  const signature = document.querySelector(".letter-signature");
  if (reduceMotion) {
    target.textContent = CONFIG.letter;
    cursor.hidden = true;
    signature.classList.add("is-visible");
    return;
  }
  let index = 0;
  const writeNext = () => {
    const chunk = CONFIG.letter.slice(index, index + 2);
    target.append(document.createTextNode(chunk));
    index += chunk.length;
    if (index < CONFIG.letter.length) {
      window.setTimeout(writeNext, chunk.endsWith("،") || chunk.endsWith(".") ? 190 : 48);
    } else {
      cursor.hidden = true;
      signature.classList.add("is-visible");
    }
  };
  writeNext();
}
const letterObserver = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) typeLetter();
}, { threshold: .35 });
letterObserver.observe(document.querySelector("#letter"));

const finaleObserver = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting) && !finalCelebrationStarted) {
    finalCelebrationStarted = true;
    for (let i = 0; i < 55; i += 1) addParticle(i % 3 === 0 ? "heart" : "petal", randomBetween(0, window.innerWidth), randomBetween(-window.innerHeight, window.innerHeight));
    for (let i = 0; i < 5; i += 1) window.setTimeout(() => burst(randomBetween(window.innerWidth * .12, window.innerWidth * .88), randomBetween(window.innerHeight * .1, window.innerHeight * .55), 26), i * 420);
  }
}, { threshold: .4 });
finaleObserver.observe(document.querySelector("#finale"));

document.querySelector(".restart-button").addEventListener("click", () => {
  body.classList.remove("is-open");
  const journey = document.querySelector(".journey");
  journey.hidden = true;
  intro.hidden = false;
  intro.classList.remove("is-leaving");
  giftOpened = false;
  letterStarted = false;
  finalCelebrationStarted = false;
  document.querySelector(".gift-button").classList.remove("is-open");
  document.querySelector(".gift-reveal").classList.remove("is-visible");
  document.querySelector(".letter-text").textContent = "";
  document.querySelector(".typing-cursor").hidden = false;
  document.querySelector(".letter-signature").classList.remove("is-visible");
  document.querySelector(".candles").classList.remove("is-blown");
  document.querySelector(".blow-button").disabled = false;
  document.querySelector(".candle-message").classList.remove("is-visible");
  document.querySelector(".candle-message").textContent = "";
  document.querySelector(".birthday-date").classList.remove("is-visible");
  particles.length = 0;
  musicEnabled = false;
  stopMusic();
  updateMusicButton();
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

function updateMusicButton() {
  musicButton.setAttribute("aria-pressed", String(musicEnabled));
  musicButton.setAttribute("aria-label", musicEnabled ? "إيقاف الموسيقى" : "تشغيل الموسيقى");
  musicStatus.textContent = musicEnabled ? "الموسيقى تعمل" : "الموسيقى متوقفة";
}

function startFileMusic() {
  const music = new Audio(CONFIG.musicPath);
  music.loop = true;
  music.volume = .35;
  return music.play().then(() => { window.currentMusic = music; musicEnabled = true; updateMusicButton(); })
    .catch(() => { musicStatus.textContent = "تعذّر تشغيل ملف الموسيقى. تحققي من مساره."; });
}

function playTone(frequency, startAt, duration, volume) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + .08);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + .03);
}

function startSynthMusic() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume();
  const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
  let noteIndex = 0;
  const playPhrase = () => {
    if (!musicEnabled) return;
    const now = audioContext.currentTime;
    const base = notes[noteIndex % notes.length];
    playTone(base, now, 1.7, .028);
    playTone(base * 1.5, now, 2.1, .012);
    noteIndex += 1;
  };
  playPhrase();
  musicTimer = window.setInterval(playPhrase, 1900);
  musicEnabled = true;
  updateMusicButton();
}

function stopMusic() {
  if (musicTimer) window.clearInterval(musicTimer);
  musicTimer = undefined;
  if (window.currentMusic) {
    window.currentMusic.pause();
    window.currentMusic.currentTime = 0;
    window.currentMusic = undefined;
  }
  if (audioContext && audioContext.state !== "closed") audioContext.suspend();
}

musicButton.addEventListener("click", async () => {
  if (musicEnabled) {
    musicEnabled = false;
    stopMusic();
    updateMusicButton();
    return;
  }
  if (CONFIG.musicPath) {
    try {
      await startFileMusic();
    } catch {
      musicStatus.textContent = "تعذّر تشغيل ملف الموسيقى. تحققي من مساره.";
    }
    return;
  }
  try {
    startSynthMusic();
  } catch {
    musicStatus.textContent = "تعذّر تشغيل الموسيقى على هذا الجهاز.";
  }
});

window.addEventListener("pagehide", () => {
  window.cancelAnimationFrame(animationFrame);
  stopMusic();
});
