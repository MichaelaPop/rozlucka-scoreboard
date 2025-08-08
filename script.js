// Script pro scoreboard (localStorage verze) – Varianta B s hvězdičkami

// ===== Seznam úkolů =====
const tasks = [
  { description: "Společně vymysleme jméno pro našeho týpka.", points: 5 },
  { description: "Udělejme společnou fotku \"Před\".", points: 5 },
  { description: "Vyfoť se s nevěstou v originální póze.", points: 10, subDescription: "Udělej si další fotku s nevěstou.", subPoints: 5 },
  { description: "Udělej si crazy fotku s naším týpkem.", points: 15, subDescription: "Znovu se vyfoť s naším týpkem.", subPoints: 5 },
  { description: "Měj na sobě alespoň 15 minut \"Sexy Borat\" triko.", points: 45 },
  { description: "Vyvolej u někoho záchvat smíchu.", points: 50, subDescription: "Rozesměj někoho dalšího.", subPoints: 5 },
  { description: "Vyfoť tajně nejulítlejší outfit večera.", points: 20, subDescription: "Zachyť další šílený outfit.", subPoints: 5 },
  { description: "Vyfoť tajně někoho, kdo vypadá jako známá osobnost.", points: 20, subDescription: "Další celebritu prosím.", subPoints: 5 },
  { description: "Udělej si selfie s naprostým cizincem.", points: 30, subDescription: "Je libo další neznámý?", subPoints: 5 },
  { description: "Vyfoť nejvíc sexy týpka večera.", points: 25, subDescription: "Sem s dalším týpkem!", subPoints: 5 },
  { description: "Vyfoť tajně holku, která má na sobě víc růžové než ty.", points: 15 },
  { description: "Zachyť nejvíc znechucený výraz večera.", points: 20, subDescription: "Vyfoť další znechucený výraz.", subPoints: 5 },
  { description: "Vyfoť náhodnou věc, která připomíná penis.", points: 25, subDescription: "Další pindík prosím.", subPoints: 5 },
  { description: "Udělejme fotku se šesti Tomy a nevěstou.", points: 10 },
  { description: "Udělej bláznivou selfie s co největším počtem Tomů.", points: 15 },
  { description: "Udělejme společnou fotku \"PO\" (před odchodem první z nás).", points: 10 }
];

const players = ['Tínka','Míša','Mája','Masha','Žaneta','Sussi','Tereza'];
const playerImages = {
  'Tínka': 'avatars/tínka.png',
  'Míša': 'avatars/míša.png',
  'Mája': 'avatars/maja.png',
  'Masha': 'avatars/masha.png',
  'Žaneta': 'avatars/žaneta.png',
  'Sussi': 'avatars/sussi.png',
  'Tereza': 'avatars/tereza.png'
};

const maxPoints = tasks.reduce((sum, t) => sum + t.points, 0);

function computeDynamicFromCounts(counts) {
  return counts.reduce((sum, c, i) => sum + (c * (tasks[i].subDescription ? (tasks[i].subPoints || 5) : 0)), 0);
}

function getLeaderboardData() {
  const data = players.map(name => {
    const counts = JSON.parse(localStorage.getItem(`repeatCounts_${name}`) || "[]");
    const score = parseInt(localStorage.getItem(`score_${name}`) || "0", 10);
    // Přepočet pro jistotu podle counts + zaškrtnutých hlavních
    const checked = JSON.parse(localStorage.getItem(`tasks_${name}`) || "[]");
    const base = checked.reduce((s, i) => s + tasks[i].points, 0);
    const dyn = computeDynamicFromCounts(counts);
    return { name, score: base + dyn };
  });
  data.sort((a, b) => b.score - a.score);
  return data;
}

function initPage(playerName) {
  const tasksList = document.getElementById("tasks");
  tasksList.innerHTML = "";

  const subTaskNodes = {};

  function renderStars(container, count, onRemoveOne) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.textContent = '⭐';
      s.title = 'Kliknutím odebereš 1 splnění (-5 b)';
      s.addEventListener('click', onRemoveOne);
      container.appendChild(s);
    }
  }

  function createOrUpdateSubtask(task, anchorLi, taskIndex) {
    if (!task.subDescription) return;
    if (subTaskNodes[taskIndex]) {
      subTaskNodes[taskIndex].remove();
      delete subTaskNodes[taskIndex];
    }
    const liSub = document.createElement('li');
    liSub.classList.add('subtask-item');

    const labelSub = document.createElement('label');
    labelSub.textContent = `${task.subDescription} (${task.subPoints || 5} b.)`;

    const checkboxSub = document.createElement('input');
    checkboxSub.type = 'checkbox';

    const starsWrap = document.createElement('span');
    starsWrap.className = 'subtask-stars';

    // načti counts
    const counts = JSON.parse(localStorage.getItem(`repeatCounts_${playerName}`) || "[]");
    while (counts.length < tasks.length) counts.push(0);

    function saveCounts(newCounts):
        # Save counts and recompute score
        localStorage.setItem(f"repeatCounts_{playerName}", JSON.stringify(newCounts))
        updateScore(playerName)

    def onRemoveStar(event=None):
        nonlocal counts
        if counts[taskIndex] > 0:
            counts[taskIndex] -= 1
            saveCounts(counts)
            renderStars(starsWrap, counts[taskIndex], onRemoveStar)

    renderStars(starsWrap, counts[taskIndex] or 0, onRemoveStar)

    checkboxSub.addEventListener('change', () => {
      if (checkboxSub.checked) {
        counts[taskIndex] = (counts[taskIndex] || 0) + 1;
        saveCounts(counts);
        checkboxSub.checked = false;
        renderStars(starsWrap, counts[taskIndex], onRemoveStar);
      }
    });

    liSub.prepend(checkboxSub);
    liSub.appendChild(labelSub);
    liSub.appendChild(starsWrap);

    anchorLi.insertAdjacentElement('afterend', liSub);
    subTaskNodes[taskIndex] = liSub;
  }

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
      const wasChecked = checkedIndices.includes(index);
      if (checkbox.checked) {
        if (!wasChecked) checkedIndices.push(index);
      } else {
        const idx = checkedIndices.indexOf(index);
        if (idx !== -1) checkedIndices.splice(idx, 1);
      }
      localStorage.setItem(`tasks_${playerName}`, JSON.stringify(checkedIndices));
      updateScore(playerName);

      if (task.subDescription && checkbox.checked && !wasChecked) {
        createOrUpdateSubtask(task, li, index);
      }
      if (!checkbox.checked && subTaskNodes[index]) {
        subTaskNodes[index].remove();
        delete subTaskNodes[index];
      }
    });

    li.prepend(checkbox);
    li.appendChild(label);
    tasksList.appendChild(li);

    // při načtení: pokud je hlavní úkol zaškrtnutý, ukaž podúkol
    if (task.subDescription && checkbox.checked) {
      createOrUpdateSubtask(task, li, index);
    }
  });

  updateScore(playerName);
}

function updateScore(playerName) {
  const checkedIndices = JSON.parse(localStorage.getItem(`tasks_${playerName}`) || "[]");
  const basePoints = checkedIndices.reduce((sum, i) => sum + tasks[i].points, 0);

  const counts = JSON.parse(localStorage.getItem(`repeatCounts_${playerName}`) || "[]");
  while (counts.length < tasks.length) counts.push(0);
  const dynamicPoints = computeDynamicFromCounts(counts);

  const totalPoints = basePoints + dynamicPoints;
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
    infoEl.textContent = `Aktuální skóre: ${currentScore} bodů – Zatím jsi na ${position}. místě!`;
  }
  const progressPercent = Math.min((currentScore / maxPoints) * 100, 100);
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) progressBar.style.width = `${progressPercent}%`;

  const motivaceEl = document.getElementById('motivace');
  if (motivaceEl) {
    let message = "";
    if (currentScore === 0) message = "Holka, začni! Tohle není kavárna.";
    else if (currentScore <= 29) message = "Už to jiskří, ale chce to přidat!";
    else if (currentScore <= 59) message = "Rozjíždíš to! Jsi na dobré cestě ke slávě!";
    else if (currentScore <= 89) message = "Už jsi legenda večera… skoro!";
    else if (currentScore <= 119) message = "Tohle už není hra. To je tvá chvíle slávy";
    else if (currentScore <= 149) message = "🔥 Královno chaosu! Ostatní nestíhají!";
    else if (currentScore <= 169) message = "Už máš pomalu víc bodů než tvoje důstojnost!";
    else if (currentScore <= 199) message = "Nevěsta je určitě pyšná… nebo aspoň pobavená.";
    else message = "👑 Získáváš titul korunovaná ultrapařmenka! 👑";
    motivaceEl.textContent = message;
  }
}

function getLeaderboardData() {
  const data = players.map(name => {
    const checked = JSON.parse(localStorage.getItem(`tasks_${name}`) || "[]");
    const base = checked.reduce((s, i) => s + tasks[i].points, 0);
    const counts = JSON.parse(localStorage.getItem(`repeatCounts_${name}`) || "[]");
    while (counts.length < tasks.length) counts.push(0);
    const dyn = computeDynamicFromCounts(counts);
    return { name, score: base + dyn };
  });
  data.sort((a, b) => b.score - a.score);
  return data;
}

function initLeaderboard() {
  const tbody = document.querySelector('tbody');
  function render() {
    const data = getLeaderboardData();
    tbody.innerHTML = "";
    data.forEach((item, index) => {
      const tr = document.createElement('tr');
      if (index === 0) tr.classList.add('leader-row');

      const nameTd = document.createElement('td');
      const wrapper = document.createElement('div');
      wrapper.classList.add('player-cell');
      const img = document.createElement('img');
      img.src = playerImages[item.name] || '';
      img.alt = item.name;
      img.classList.add('avatar-small');
      const nameSpan = document.createElement('span');
      nameSpan.textContent = item.name + (index === 0 ? ' 👑' : '');
      wrapper.appendChild(img);
      wrapper.appendChild(nameSpan);
      nameTd.appendChild(wrapper);

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
