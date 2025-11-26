import './style.css'

// Вот эту часть, если нет желания реализовывать, можно убрать
import { elementMethods } from './baseline.js';

// Этот код не меняем
import { renderWordList } from './renderers.js';
import { WordList } from './wordlist.js';

// Эту часть можно делать через обычные querySelector-ы
const { first } = elementMethods();
const root = first("#root");

root.innerHTML = `
  <div id="app">
    <h1>Crossword</h1>
    <div class="tabs">
      <button class="tab active" data-tab="wordlist">Word List</button>
      <button class="tab" data-tab="grid">Grid</button>
    </div>
    <div class="tab-content" id="wordlist"></div>
    <div class="tab-content" id="grid" style="display: none;"></div>
    <div class="add-word-form">
      <input type="text" id="new-word" placeholder="Слово">
      <input type="text" id="new-desc" placeholder="Описание">
      <button id="add-word-btn">Добавить строку</button>
    </div>
  </div>
  <div id="modal" class="modal">
    <div class="modal-content">
      <h3>Выберите слово</h3>
      <div class="direction-btns">
        <button class="dir-btn" data-dir="horizontal">По горизонтали</button>
        <button class="dir-btn" data-dir="vertical">По вертикали</button>
      </div>
      <div id="word-options"></div>
      <button id="modal-close">Закрыть</button>
    </div>
  </div>
`;

const app = first("#app", root);
const wordlistTab = first("#wordlist", app);
const gridTab = first("#grid", app);

const tabs = app.querySelectorAll(".tab");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    
    const tabName = tab.dataset.tab;
    wordlistTab.style.display = tabName === "wordlist" ? "block" : "none";
    gridTab.style.display = tabName === "grid" ? "block" : "none";
  });
});

// Код, начиная с этого места НЕ меняем
const wl = new WordList();

wl.addWord("повар", "такая профессия");
wl.addWord("чай", "вкусный, делает меня человеком");
wl.addWord("яблоки", "с ананасами");
wl.addWord("сосисочки", "я — Никита Литвинков!");

wordlistTab.innerHTML = renderWordList(wl);

const GRID_SIZE = 10;
const gridData = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

function canPlaceWord(word, start, direction) {
  const fits = direction === 'horizontal'
    ? start.col + word.length <= GRID_SIZE
    : start.row + word.length <= GRID_SIZE;
  if (!fits) return { ok: false, reason: 'The word does not fit in the grid from this cell.' };

  for (let i = 0; i < word.length; i++) {
    const r = direction === 'horizontal' ? start.row : start.row + i;
    const c = direction === 'horizontal' ? start.col + i : start.col;
    const cell = gridData[r][c];
    if (cell && cell.letter !== word[i]) {
      return { ok: false, reason: 'This path is already occupied by another word.' };
    }
  }
  return { ok: true };
}

function removeWord(word) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (gridData[r][c]?.word === word) gridData[r][c] = null;
    }
  }
}

function renderGrid() {
  let html = '<table class="crossword-grid">';
  for (let row = 0; row < GRID_SIZE; row++) {
    html += '<tr>';
    for (let col = 0; col < GRID_SIZE; col++) {
      const letter = gridData[row][col]?.letter || '';
      html += `<td data-row="${row}" data-col="${col}">${letter}</td>`;
    }
    html += '</tr>';
  }
  html += '</table><div id="placed-words"></div>';
  gridTab.innerHTML = html;

  const seen = new Set();
  const placedWords = gridData.flat().filter(cell => {
    if (!cell || seen.has(cell.word)) return false;
    seen.add(cell.word);
    return true;
  });
  document.getElementById('placed-words').innerHTML = 
    placedWords.map(w => `<p class="placed-word" data-word="${w.word}"><strong>${w.word}</strong>: ${w.description}</p>`).join('');
}

renderGrid();

const modal = document.getElementById('modal');
const wordOptions = document.getElementById('word-options');
let selectedCell = null;
let selectedDirection = 'horizontal';

document.querySelector('.direction-btns').addEventListener('click', (e) => {
  const btn = e.target.closest('.dir-btn');
  if (!btn) return;
  document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedDirection = btn.dataset.dir;
});
document.querySelector('.dir-btn').classList.add('active');

gridTab.addEventListener('click', (e) => {
  const removable = e.target.closest('.placed-word');
  if (removable) {
    removeWord(removable.dataset.word);
    renderGrid();
    return;
  }

  const td = e.target.closest('td');
  if (!td) return;
  selectedCell = { row: +td.dataset.row, col: +td.dataset.col };
  const words = [...document.querySelectorAll('.word-list tbody tr')].map(row => {
    const cells = row.querySelectorAll('td.editable');
    return { word: cells[0].textContent, description: cells[1].textContent };
  });
  wordOptions.innerHTML = words.map((w, i) => 
    `<div class="word-option" data-index="${i}"><strong>${w.word}</strong><br><small>${w.description}</small></div>`
  ).join('');
  modal.style.display = 'flex';
});

wordOptions.addEventListener('click', (e) => {
  const option = e.target.closest('.word-option');
  if (!option) return;
  const cells = document.querySelectorAll('.word-list tbody tr')[option.dataset.index].querySelectorAll('td.editable');
  const word = cells[0].textContent;
  const description = cells[1].textContent;
  if (!selectedCell) return;

  const validation = canPlaceWord(word, selectedCell, selectedDirection);
  if (!validation.ok) {
    modal.style.display = 'none';
    alert(validation.reason);
    return;
  }
  
  for (let i = 0; i < word.length; i++) {
    const r = selectedDirection === 'horizontal' ? selectedCell.row : selectedCell.row + i;
    const c = selectedDirection === 'horizontal' ? selectedCell.col + i : selectedCell.col;
    gridData[r][c] = { letter: word[i], word, description };
  }
  renderGrid();
  modal.style.display = 'none';
});

document.getElementById('modal-close').addEventListener('click', () => modal.style.display = 'none');

document.getElementById('add-word-btn').addEventListener('click', () => {
  const wordInput = document.getElementById('new-word');
  const descInput = document.getElementById('new-desc');
  const tbody = document.querySelector('.word-list tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="editable">${wordInput.value.trim()}</td>
    <td class="editable">${descInput.value.trim()}</td>
    <td><button class="row-delete" aria-label="Удалить строку" title="Удалить">✕</button></td>
  `;
  tbody.appendChild(row);
  wordInput.value = '';
  descInput.value = '';
});
