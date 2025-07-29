const tasks = [
  { description: "Společně vymyslete jméno pro vašeho típka.", points: 5 },
  { description: "Udělejme společnou fotku \"Před\".", points: 5 },
  { description: "Vyfoť se s nevěstou v originální póze.", points: 10 },
  { description: "Udělej si crazy fotku s našim típkem.", points: 15 },
  { description: "Vyfoť tajně nejulítlejší outfit večera.", points: 20 },
  { description: "Vyfoť tajně někoho, kdo vypadá jako známá osobnost.", points: 20 },
  { description: "Udělej si selfie s naprostým cizincem.", points: 30 },
  { description: "Vyfoť nejvíc sexy týpka večera.", points: 25 },
  { description: "Vyfoť tajně holku, která má na sobě víc růžové než ty.", points: 15 },
  { description: "Zachyť nejvíc znechucený výraz večera.", points: 20 },
  { description: "Vyfoť náhodnou věc, která připomíná penis.", points: 25 },
  { description: "Udělejme společnou fotku \"PO\" (před odchodem první z nás).", points: 10 }
];

// List of players for leaderboard and ranking
const players = ['Tínka','Míša','Mája','Masha','Žaneta','Sussi','Tereza'];

// Calculate maximum points based on tasks list
totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
const maxPoints = totalPoints;

// Retrieve leaderboard data sorted descending
function getLeaderboardData() {
  const data = players.map(name => {
    const score = parseInt(localStorage.getItem(`score_${name}`) || "0", 10);
    return { name, score };
  });
  data.sort((a, b) => b.score - a.score);
  return data;
}

function initPage(playerName) {
  const tasksList = document.getElementById("tasks");
  tasksList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.textContent = `${task.description} (${task.points} b.)`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const stored = JSON.parse(localStorage.getItem(`tasks_${playerName}`) || "[]");
    checkbox.checked = stored.includes(index);
    checkbox.addEventListener('change', () => {
      const checkedIndices = JSON.parse(localStorage.getItem(`tasks_${playerName}`) || "[]");
      if (checkbox.checked) {
        if (!checkedIndices.includes(index)) checkedIndices.push(index);
      } else {
        const idx = checkedIndices.indexOf(index);
        if (idx !== -1) checkedIndices.splice(idx, 1);
      }
      localStorage.setItem(`tasks_${playerName}`, JSON.stringify(checkedIndices));
      updateScore(playerName);
    });
    li.prepend(checkbox);
    li.appendChild(label);
    tasksList.appendChild(li);
  });
  updateScore(playerName);
}

function updateScore(playerName) {
  const checkedIndices = JSON.parse(localStorage.getItem(`tasks_${playerName}`) || "[]");
  const totalPoints = checkedIndices.reduce((sum, i) => sum + tasks[i].points, 0);
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = totalPoints;
  localStorage.setItem(`score_${playerName}`, totalPoints);
  updateExtraUI(playerName);
}

function updateExtraUI(playerName) {
  const leaderboard = getLeaderboardData();
  const position = leaderboard.findIndex(item => item.name === playerName) + 1;
  const currentScore = parseInt(localStorage.getItem(`score_${playerName}`) || "0", 10);
  const infoEl = document.getElementById('score-info');
  if (infoEl) {
    let ordinal = `${position}.`;
    infoEl.textContent = `Aktuální skóre: ${currentScore} bodů – Zatím jsi na ${ordinal} místě!`;
  }
  // update progress bar
  const progressPercent = Math.min((currentScore / maxPoints) * 100, 100);
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
  // update motivational message
  const motivaceEl = document.getElementById('motivace');
  if (motivaceEl) {
    let message = "";
    if (currentScore === 0) {
      message = "Holka, začni! Tohle není kavárna.";
    } else if (currentScore <= 30) {
      message = "Už to jiskří, ale chce to přidat!";
    } else if (currentScore <= 70) {
      message = "Rozjíždíš to! Jsi na dobré cestě ke slávě!";
    } else if (currentScore <= 120) {
      message = "Už jsi legenda večera… skoro!";
    } else {
      message = "🔥 Královno chaosu! Ostatní nestíhají!";
    }
    motivaceEl.textContent = message;
  }
}

function initLeaderboard() {
  const tbody = document.querySelector('tbody');
  function render() {
    const data = getLeaderboardData();
    tbody.innerHTML = "";
    data.forEach((item, index) => {
      const tr = document.createElement('tr');
      if (index === 0) {
        tr.classList.add('leader-row');
      }
      const nameTd = document.createElement('td');
      nameTd.textContent = item.name + (index === 0 ? ' 👑' : '');
      const scoreTd = document.createElement('td');
      scoreTd.textContent = item.score;
      tr.appendChild(nameTd);
      tr.appendChild(scoreTd);
      tbody.appendChild(tr);
    });
  }
  render();
  window.addEventListener('storage', render);
  setInterval(render, 1000);
}
