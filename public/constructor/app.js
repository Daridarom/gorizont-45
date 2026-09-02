const missions = [
  { name: "Пробудите склон", text: "Соберите ростки, чтобы вернуть ландшафту жизнь.", icon: "♧", good: ["♧", "✦", "❋"], bad: ["■", "▰"], goal: 8, seconds: 25 },
  { name: "Сохраните берег", text: "Соберите волны и оставьте берег свободным для людей.", icon: "≋", good: ["≋", "◌", "✦"], bad: ["▰", "◆"], goal: 10, seconds: 25 },
  { name: "Зажгите маяк", text: "Соберите последние огни и покажите путь в будущее.", icon: "⌁", good: ["⌁", "✦", "◇"], bad: ["■", "◆"], goal: 12, seconds: 28 },
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
  $("goalCount").textContent = mission.goal;
  $("missionButton").firstChild.textContent = round === 0 ? "Начать миссию " : "Продолжить ";
  showScreen("missionScreen");
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
  updateHud(); spawnTarget(false); scheduleSpawn();
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
    spawnTarget(Math.random() < 0.24 + round * 0.04);
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
$("startButton").onclick = newGame;
$("missionButton").onclick = startRound;
$("retryButton").onclick = startRound;
$("againButton").onclick = newGame;
$("restartButton").onclick = () => { stopRound(); round = 0; score = 0; showScreen("intro"); };
$("soundButton").onclick = () => {
  soundOn = !soundOn;
  $("soundButton").textContent = soundOn ? "♪" : "×";
  $("soundButton").setAttribute("aria-label", soundOn ? "Выключить звук" : "Включить звук");
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
  if (document.hidden) pausedAt = Date.now();
  else if (pausedAt) {
    roundStartedAt += Date.now() - pausedAt;
    pausedAt = 0;
  }
});
