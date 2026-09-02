const missions = [
  { name: "Пробудите склон", text: "Соберите ростки, чтобы вернуть ландшафту жизнь.", icon: "♧", good: ["♧", "✦", "❋"], bad: ["■", "▰"], goal: 8, seconds: 25, image: "../images/routes.webp", alt: "Экологическая тропа на зелёном склоне" },
  { name: "Сохраните берег", text: "Соберите волны и оставьте берег свободным для людей.", icon: "≋", good: ["≋", "◌", "✦"], bad: ["▰", "◆"], goal: 10, seconds: 25, image: "../images/hero.webp", alt: "Свободный берег Бухты Космонавтов" },
  { name: "Зажгите маяк", text: "Соберите последние огни и покажите путь в будущее.", icon: "⌁", good: ["⌁", "✦", "◇"], bad: ["■", "◆"], goal: 12, seconds: 28, image: "../images/sunset.webp", alt: "Закат над будущим комплексом Горизонт 45" },
];
const $ = (id) => document.getElementById(id);
let round = 0, score = 0, collected = 0, lives = 3, combo = 0, timeLeft = 0;
let timerId = null, spawnId = null, playing = false, soundOn = true, audioContext = null;
let roundStartedAt = 0, pausedAt = 0;

function haptic(pattern = 20) { navigator.vibrate?.(pattern); }
function tone(frequency = 520, duration = 0.07) {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {}
}
const soundtracks = [
  { tempo: 430, notes: [261.63, 329.63, 392, 329.63, 293.66, 349.23] },
  { tempo: 350, notes: [220, 293.66, 329.63, 392, 329.63, 293.66] },
  { tempo: 290, notes: [196, 246.94, 293.66, 392, 493.88, 392, 293.66] },
];
const MUSIC_PART_SECONDS = 8;
function makeSoundtrack() {
  const sampleRate = 8000;
  const duration = MUSIC_PART_SECONDS * soundtracks.length;
  const samples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeText = (offset, text) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  writeText(0, "RIFF"); view.setUint32(4, 36 + samples * 2, true); writeText(8, "WAVE");
  writeText(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeText(36, "data"); view.setUint32(40, samples * 2, true);
  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    const part = Math.min(soundtracks.length - 1, Math.floor(time / MUSIC_PART_SECONDS));
    const localTime = time - part * MUSIC_PART_SECONDS;
    const track = soundtracks[part];
    const stepLength = track.tempo / 1000;
    const step = Math.floor(localTime / stepLength);
    const noteTime = localTime % stepLength;
    const frequency = track.notes[step % track.notes.length];
    const envelope = Math.min(1, noteTime * 18) * Math.exp(-noteTime * (part === 2 ? 2.5 : 3.4));
    const melody = Math.sin(2 * Math.PI * frequency * localTime) * envelope * 0.2;
    const pad = Math.sin(2 * Math.PI * frequency * 0.5 * localTime) * 0.065;
    const shimmer = part === 2 ? Math.sin(2 * Math.PI * frequency * 2 * localTime) * envelope * 0.035 : 0;
    const fade = Math.min(1, localTime * 2, (MUSIC_PART_SECONDS - localTime) * 2);
    const sample = Math.max(-1, Math.min(1, (melody + pad + shimmer) * fade));
    view.setInt16(44 + index * 2, sample * 32767, true);
  }
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}
const musicPlayer = new Audio(makeSoundtrack());
musicPlayer.preload = "auto";
musicPlayer.playsInline = true;
musicPlayer.volume = 0.52;
let musicPart = 0;
musicPlayer.addEventListener("timeupdate", () => {
  const start = musicPart * MUSIC_PART_SECONDS;
  if (musicPlayer.currentTime >= start + MUSIC_PART_SECONDS - 0.08) musicPlayer.currentTime = start;
});
async function startMusic() {
  if (!soundOn) return false;
  musicPart = Math.min(round, soundtracks.length - 1);
  const start = musicPart * MUSIC_PART_SECONDS;
  if (musicPlayer.currentTime < start || musicPlayer.currentTime >= start + MUSIC_PART_SECONDS) musicPlayer.currentTime = start;
  try {
    await musicPlayer.play();
    $("soundButton").classList.remove("attention");
    $("soundtrackStatus").textContent = "♪ музыка миссии включена";
    return true;
  } catch {
    $("soundButton").classList.add("attention");
    $("soundtrackStatus").textContent = "Нажмите ♪, чтобы включить музыку";
    return false;
  }
}
function stopMusic() { musicPlayer.pause(); }
function showScreen(id) {
  ["intro", "missionScreen", "result", "gameover"].forEach((name) => { $(name).hidden = name !== id; });
}
function prepareMission() {
  const mission = missions[round];
  stopRound();
  $("missionIcon").textContent = mission.icon;
  $("goalIcon").textContent = mission.icon;
  $("missionKicker").textContent = `МИССИЯ ${round + 1} ИЗ 3`;
  $("missionTitle").textContent = mission.name;
  $("missionText").textContent = mission.text;
  $("missionImage").src = mission.image;
  $("missionImage").alt = mission.alt;
  $("missionScreen").dataset.mission = String(round);
  $("goalCount").textContent = mission.goal;
  $("missionButton").firstChild.textContent = round === 0 ? "Начать миссию " : "Продолжить ";
  showScreen("missionScreen");
  startMusic();
}
function startRound() {
  const mission = missions[round];
  collected = 0; lives = 3; combo = 0; timeLeft = mission.seconds; playing = true;
  showScreen("");
  $("hud").hidden = false; $("timer").hidden = false; $("lives").hidden = false;
  $("roundLabel").textContent = `${round + 1} / 3`;
  $("missionName").textContent = mission.name;
  $("timerBar").style.transform = "scaleX(1)";
  $("timer").classList.remove("danger");
  $("tip").hidden = false;
  setTimeout(() => { if (playing) $("tip").hidden = true; }, 2600);
  startMusic();
  updateHud(); spawnTarget(false); spawnTarget(false);
  setTimeout(() => spawnTarget(true), 700);
  scheduleSpawn();
  roundStartedAt = Date.now();
  timerId = setInterval(() => {
    if (!playing) return;
    timeLeft = Math.max(0, mission.seconds - (Date.now() - roundStartedAt) / 1000);
    $("timerBar").style.transform = `scaleX(${timeLeft / mission.seconds})`;
    $("timer").classList.toggle("danger", timeLeft < 7);
    if (timeLeft <= 0) failRound();
  }, 100);
}
function scheduleSpawn() {
  if (!playing) return;
  const delay = Math.max(460, 850 - round * 100 - collected * 10);
  spawnId = setTimeout(() => {
    spawnTarget(Math.random() < 0.25 + round * 0.04);
    if (Math.random() < 0.34 + round * 0.07) setTimeout(() => spawnTarget(Math.random() < 0.2), 150);
    scheduleSpawn();
  }, delay);
}
function spawnTarget(isBad) {
  if (!playing) return;
  const mission = missions[round];
  const target = document.createElement("button");
  target.type = "button";
  target.className = `target${isBad ? " bad" : ""}`;
  target.setAttribute("aria-label", isBad ? "Серый объект — не нажимать" : "Огонь Горизонта");
  const symbols = isBad ? mission.bad : mission.good;
  target.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  const size = isBad ? 60 : 66;
  const field = $("playfield").getBoundingClientRect();
  const topSafe = 108, bottomSafe = 24;
  target.style.left = `${8 + Math.random() * Math.max(10, field.width - size - 16)}px`;
  target.style.top = `${topSafe + Math.random() * Math.max(20, field.height - topSafe - size - bottomSafe)}px`;
  target.onclick = (event) => collect(event.currentTarget, isBad);
  $("targets").appendChild(target);
  setTimeout(() => {
    if (!target.isConnected) return;
    target.remove();
    if (!isBad) combo = 0;
  }, isBad ? 2100 : 2400 - round * 150);
}
function collect(target, isBad) {
  if (!playing || target.dataset.hit) return;
  target.dataset.hit = "1";
  if (isBad) {
    lives -= 1; combo = 0; score = Math.max(0, score - 3);
    target.classList.add("miss"); tone(145, 0.12); haptic([35, 35, 55]);
    flashCombo("−3 · берегите природу");
    setTimeout(() => target.remove(), 330);
    updateHud();
    if (lives <= 0) setTimeout(failRound, 350);
    return;
  }
  collected += 1; combo += 1;
  const bonus = combo >= 5 ? 3 : combo >= 3 ? 2 : 1;
  score += bonus; target.classList.add("pop"); tone(470 + combo * 35); haptic(18);
  flashCombo(combo >= 3 ? `Комбо ×${combo} · +${bonus} ✦` : `+${bonus} ✦`);
  setTimeout(() => target.remove(), 280);
  updateHud();
  if (collected >= missions[round].goal) setTimeout(winRound, 260);
}
function flashCombo(text) {
  const element = $("combo");
  element.textContent = text; element.classList.remove("show");
  void element.offsetWidth;
  element.classList.add("show");
}
function updateHud() {
  const mission = missions[round];
  $("score").textContent = score;
  $("progressBar").style.width = `${Math.min(100, collected / mission.goal * 100)}%`;
  $("lives").textContent = Array.from({ length: 3 }, (_, index) => index < lives ? "♧" : "·").join(" ");
}
function stopRound() {
  playing = false; clearInterval(timerId); clearTimeout(spawnId);
  $("targets").replaceChildren();
  $("hud").hidden = true; $("timer").hidden = true; $("lives").hidden = true; $("tip").hidden = true;
}
function winRound() {
  if (!playing) return;
  stopRound(); tone(760, 0.18); haptic([25, 30, 70]); round += 1;
  if (round < missions.length) prepareMission(); else finishGame();
}
function failRound() {
  if (!playing) return;
  stopRound(); showScreen("gameover");
}
function finishGame() {
  const previous = Number(localStorage.getItem("h45-lights-record") || 0);
  localStorage.setItem("h45-lights-record", String(Math.max(previous, score)));
  $("finalScore").textContent = score;
  $("recordLabel").textContent = score >= previous ? "Новый рекорд" : `Ваш рекорд: ${previous}`;
  showScreen("result");
}
function newGame() {
  stopRound(); round = 0; score = 0; collected = 0; lives = 3; $("score").textContent = "0"; prepareMission();
}
$("startButton").onclick = async () => { round = 0; await startMusic(); newGame(); };
$("missionButton").onclick = startRound;
$("retryButton").onclick = startRound;
$("againButton").onclick = newGame;
$("restartButton").onclick = () => { stopRound(); stopMusic(); round = 0; score = 0; showScreen("intro"); };
$("soundButton").onclick = async () => {
  soundOn = !soundOn;
  $("soundButton").textContent = soundOn ? "♪" : "×";
  $("soundButton").setAttribute("aria-label", soundOn ? "Выключить звук" : "Включить звук");
  if (soundOn) await startMusic(); else stopMusic();
};
$("shareButton").onclick = async () => {
  const text = `Я зажёг Горизонт и собрал ${score} огней ✦ Сможешь больше?`;
  try {
    if (navigator.share) await navigator.share({ title: "Огни Горизонта", text, url: location.href });
    else {
      await navigator.clipboard.writeText(`${text} ${location.href}`);
      flashCombo("Ссылка скопирована");
    }
  } catch {}
};
document.addEventListener("visibilitychange", () => {
  if (!playing) return;
  if (document.hidden) { pausedAt = Date.now(); musicPlayer.pause(); audioContext?.suspend?.(); }
  else if (pausedAt) {
    roundStartedAt += Date.now() - pausedAt;
    pausedAt = 0;
    if (soundOn) { audioContext?.resume?.(); startMusic(); }
  }
});
