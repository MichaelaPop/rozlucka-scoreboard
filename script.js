// Modified leaderboard and task logic with player avatars
// This file builds upon the original script from the Rozlučka scoreboard.
// In addition to tracking task completion and scores, it now knows how to
// display a small circular avatar next to each player's name on the
// leaderboard.  A mapping of player names to their avatar image filenames
// lives at the top of the file.  When rendering the leaderboard we use
// this map to insert an <img> element ahead of the player's name.

// Upravený seznam úkolů.  Opravili jsme formulace prvního a čtvrtého úkolu
// tak, aby odpovídaly požadovaným tvarům, a přidali jsme dva nové úkoly.
const tasks = [
  // Základní seznam úkolů bez textu "(opakovat)".  U opakovatelných úkolů
  // je přidána subDescription a subPoints pro tvorbu opakovaných podúkolů.
  {
    description: "Společně vymysleme jméno pro našeho týpka.",
    points: 5
  },
  {
    description: "Udělejme společnou fotku \"Před\".",
    points: 5
  },
  {
    description: "Vyfoť se s nevěstou v originální póze.",
    points: 10,
    subDescription: "Udělej si další fotku s nevěstou.",
    subPoints: 5
  },
  {
    description: "Udělej si crazy fotku s naším týpkem.",
    points: 15,
    subDescription: "Znovu se vyfoť s naším týpkem.",
    subPoints: 5
  },
  {
    description: "Měj na sobě alespoň 15 minut \"Sexy Borat\" triko.",
    points: 45
  },
  {
    description: "Vyvolej u někoho záchvat smíchu.",
    points: 50,
    subDescription: "Rozesměj někoho dalšího.",
    subPoints: 5
  },
  {
    description: "Vyfoť tajně nejulítlejší outfit večera.",
    points: 20,
    subDescription: "Zachyť další šílený outfit.",
    subPoints: 5
  },
  {
    description: "Vyfoť tajně někoho, kdo vypadá jako známá osobnost.",
    points: 20,
    subDescription: "Další celebritu prosím.",
    subPoints: 5
  },
  {
    description: "Udělej si selfie s naprostým cizincem.",
    points: 30,
    subDescription: "Je libo další neznámý?",
    subPoints: 5
  },
  {
    description: "Vyfoť nejvíc sexy týpka večera.",
    points: 25,
    subDescription: "Sem s dalším týpkem!",
    subPoints: 5
  },
  {
    description: "Vyfoť tajně holku, která má na sobě víc růžové než ty.",
    points: 15
  },
  {
    description: "Zachyť nejvíc znechucený výraz večera.",
    points: 20,
    subDescription: "Vyfoť další znechucený výraz.",
    subPoints: 5
  },
  {
    description: "Vyfoť náhodnou věc, která připomíná penis.",
    points: 25,
    subDescription: "Další pindík prosím.",
    subPoints: 5
  },
  {
    description: "Udělejme fotku se šesti Tomy a nevěstou.",
    points: 10
  },
  {
    description: "Udělej bláznivou selfie s co největším počtem Tomů.",
    points: 15
  },
  {
    description: "Udělejme společnou fotku \"PO\" (před odchodem první z nás).",
    points: 10
  }
];

// List of players for leaderboard and ranking.  Make sure the order here
// matches the order of the avatar images in the playerImages map below.
const players = ['Tínka','Míša','Mája','Masha','Žaneta','Sussi','Tereza'];

// Map each player's display name to the relative path of their avatar.
// These images live in the `avatars` folder at the root of the project.  If you
// rename your image files you should update the values below accordingly.
const playerImages = {
  'Tínka': 'avatars/tínka.png',
  'Míša': 'avatars/míša.png',
  'Mája': 'avatars/maja.png',
  'Masha': 'avatars/masha.png',
  'Žaneta': 'avatars/žaneta.png',
  'Sussi': 'avatars/sussi.png',
  'Tereza': 'avatars/tereza.png'
};

// Calculate maximum points based on tasks list
const maxPoints = tasks.reduce((sum, t) => sum + t.points, 0);

// Retrieve leaderboard data sorted descending
function getLeaderboardData() {
  const data = players.map(name => {
    const score = parseInt(localStorage.getItem(`score_${name}`) || "0", 10);
    return { name, score };
  });
  data.sort((a, b) => b.score - a.score);
  return data;
}

// Initialise an individual player's page.  Builds the checklist of tasks and
// wires up the handlers to update scores and UI on interaction.
function initPage(playerName) {
  const tasksList = document.getElementById("tasks");
  tasksList.innerHTML = "";
  // Pomocná funkce pro vytváření podúkolů v režimu, kdy se data ukládají
  // do localStorage.  Po splnění podúkolu se přičtou body a vygeneruje se
  // další podúkol, takže úkol lze plnit opakovaně.
  function createSubTaskElement(task) {
    if (!task.subDescription) return;
    const liSub = document.createElement('li');
    const labelSub = document.createElement('label');
    labelSub.textContent = `${task.subDescription} (${task.subPoints || 5} b.)`;
    const checkboxSub = document.createElement('input');
    checkboxSub.type = 'checkbox';
    checkboxSub.addEventListener('change', () => {
      if (checkboxSub.checked) {
        // Přičti body k dynamickému skóre hráčky a ulož
        const dynKey = `dynamic_${playerName}`;
        let dyn = parseInt(localStorage.getItem(dynKey) || "0", 10);
        dyn += task.subPoints || 5;
        localStorage.setItem(dynKey, dyn);
        // Aktualizuj celkové skóre a UI
        updateScore(playerName);
        // Odeber splněný podúkol z DOMu
        liSub.remove();
        // Vytvoř další podúkol
        createSubTaskElement(task);
      }
    });
    liSub.prepend(checkboxSub);
    liSub.appendChild(labelSub);
    tasksList.appendChild(liSub);
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.textContent = `${task.description} (${task.points} b.)`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const stored = JSON.parse(localStorage.getItem(`tasks_${playerName}`) || "[]");
    // Zjisti, zda byl úkol zaškrtnut dříve
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
      // Pokud je úkol opakovatelný a byl právě zaškrtnut poprvé,
      // vytvoř podúkol
      if (task.subDescription && checkbox.checked && !wasChecked) {
        createSubTaskElement(task);
      }
    });
    li.prepend(checkbox);
    li.appendChild(label);
    tasksList.appendChild(li);
    // Pokud byl úkol dříve zaškrtnut a je opakovatelný, zobraz rovnou podúkol
    if (task.subDescription && checkbox.checked) {
      createSubTaskElement(task);
    }
  });
  updateScore(playerName);
}

// Update the score for a single player and persist it to localStorage.  Also
// triggers updates to the extra UI (progress bar, motivational message).
function updateScore(playerName) {
  const checkedIndices = JSON.parse(localStorage.getItem(`tasks_${playerName}`) || "[]");
  // Základní body za úkoly
  const basePoints = checkedIndices.reduce((sum, i) => sum + tasks[i].points, 0);
  // Body získané z opakovaných podúkolů
  const dynamicPoints = parseInt(localStorage.getItem(`dynamic_${playerName}`) || "0", 10);
  const totalPoints = basePoints + dynamicPoints;
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = totalPoints;
  localStorage.setItem(`score_${playerName}`, totalPoints);
  updateExtraUI(playerName);
}

// Update UI elements that depend on a player's current score and ranking.  This
// function updates the player's position message, progress bar and
// motivational text.  It leaves the leaderboard itself alone; the
// leaderboard is refreshed separately by the initLeaderboard function.
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
    // Motivace se mění podle aktuálního skóre. Přidali jsme stupeň nad 170 bodů,
    // aby titul ultrapařmenka odpovídal novému maximálnímu počtu bodů.
    if (currentScore === 0) {
  message = "Holka, začni! Tohle není kavárna.";
} else if (currentScore <= 29) {
  message = "Už to jiskří, ale chce to přidat!";
} else if (currentScore <= 59) {
  message = "Rozjíždíš to! Jsi na dobré cestě ke slávě!";
} else if (currentScore <= 89) {
  message = "Už jsi legenda večera… skoro!";
} else if (currentScore <= 119) {
  message = "Tohle už není hra. To je tvá chvíle slávy";
} else if (currentScore <= 149) {
  message = "🔥 Královno chaosu! Ostatní nestíhají!";
} else if (currentScore <= 169) {
  message = "Už máš pomalu víc bodů než tvoje důstojnost!";
} else if (currentScore <= 199) {
  message = "Nevěsta je určitě pyšná… nebo aspoň pobavená.";
} else {
  message = "👑 Získáváš titul korunovaná ultrapařmenka! 👑";
}
    motivaceEl.textContent = message;
  }
}

// Initialise the leaderboard and keep it up to date.  This function builds
// table rows dynamically using the player list and their scores.  It also
// attaches an event listener to storage events and periodically re-renders
// the table every second.  Each player's avatar is shown before their name.
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
      // Build a cell that stacks the avatar above the player's name.
      const nameTd = document.createElement('td');
      // Create a wrapper so the avatar sits above the name.  Using a
      // dedicated wrapper allows us to center both elements easily with
      // simple CSS.  The wrapper uses flex column layout defined in
      // styles on index.html.
      const wrapper = document.createElement('div');
      wrapper.classList.add('player-cell');
      const img = document.createElement('img');
      img.src = playerImages[item.name] || '';
      img.alt = item.name;
      img.classList.add('avatar-small');
      const nameSpan = document.createElement('span');
      // Append the crown emoji only for the leader.
      nameSpan.textContent = item.name + (index === 0 ? ' 👑' : '');
      // Assemble wrapper
      wrapper.appendChild(img);
      wrapper.appendChild(nameSpan);
      nameTd.appendChild(wrapper);
      // Score column remains unchanged
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
