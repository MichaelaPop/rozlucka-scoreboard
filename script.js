const tasks = [
  { text: "Společně vymyslete jméno pro vašeho típka.", points: 5 },
  { text: "Udělejme společnou fotku \"Před\".", points: 5 },
  { text: "Vyfoť se s nevěstou v originální póze.", points: 10 },
  { text: "Udělej si crazy fotku s našim típkem.", points: 15 },
  { text: "Vyfoť tajně nejulítlejší outfit večera.", points: 20 },
  { text: "Vyfoť tajně někoho, kdo vypadá jako známá osobnost.", points: 20 },
  { text: "Udělej si selfie s naprostým cizincem.", points: 30 },
  { text: "Vyfoť nejvíc sexy týpka večera.", points: 25 },
  { text: "Vyfoť tajně holku, která má na sobě víc růžové než ty.", points: 15 },
  { text: "Zachyť nejvíc znechucený výraz večera.", points: 20 },
  { text: "Vyfoť náhodnou věc, která připomíná penis.", points: 25 },
  { text: "Udělejme společnou fotku \"PO\" (před odchodem první z nás).", points: 10 }
];

function initPage(name) {
  const taskList = document.getElementById('task-list');
  const scoreEl = document.getElementById('score');
  let stored = localStorage.getItem('tasks_' + name);
  let taskStates = stored ? JSON.parse(stored) : {};
  function render() {
    taskList.innerHTML = '';
    let total = 0;
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = name + '_task_' + index;
      checkbox.checked = !!taskStates[index];
      checkbox.addEventListener('change', () => {
        taskStates[index] = checkbox.checked;
        localStorage.setItem('tasks_' + name, JSON.stringify(taskStates));
        updateTotal();
      });
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      const spanPoints = document.createElement('span');
      spanPoints.className = 'points';
      spanPoints.textContent = '(' + task.points + ' bodů)';
      label.textContent = task.text + ' ';
      label.appendChild(spanPoints);
      li.appendChild(checkbox);
      li.appendChild(label);
      taskList.appendChild(li);
      if (checkbox.checked) total += task.points;
    });
    scoreEl.textContent = total;
    localStorage.setItem('score_' + name, total);
  }
  function updateTotal() {
    let total = 0;
    tasks.forEach((task, index) => {
      if (taskStates[index]) total += task.points;
    });
    scoreEl.textContent = total;
    localStorage.setItem('score_' + name, total);
  }
  render();
}

function initLeaderboard(names) {
  const tbody = document.querySelector('#leaderboard-table tbody');
  function update() {
    const rows = [];
    names.forEach(name => {
      const score = parseInt(localStorage.getItem('score_' + name)) || 0;
      rows.push({ name, score });
    });
    rows.sort((a, b) => b.score - a.score);
    tbody.innerHTML = '';
    rows.forEach(row => {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = row.name;
      const tdScore = document.createElement('td');
      tdScore.textContent = row.score;
      tr.appendChild(tdName);
      tr.appendChild(tdScore);
      tbody.appendChild(tr);
    });
  }
  update();
  window.addEventListener('storage', update);
  setInterval(update, 3000);
}
