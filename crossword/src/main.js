import './style.css'
import { elementMethods } from './baseline.js';
import { renderWordList } from './renderers.js';
import { WordList } from './wordlist.js';
import { Crossword, renderCrossword } from './crossword.js';

const { first } = elementMethods();
const root = first('#root');
root.innerHTML = '<div id="app"></div>';
const app = first('#app', root);

const wl = new WordList();
[
  ["повар", "такая профессия"],
  ["чай", "вкусный, делает меня человеком"],
  ["яблоки", "с ананасами"],
  ["сосисочки", "я — Никита Литвинков!"]
].forEach(([word, description]) => wl.addWord(word, description));

const crossword = new Crossword(10);
app.innerHTML = renderWordList(wl) + renderCrossword(crossword, wl);

app.addEventListener('click', (event) => {
  const cell = event.target.closest('.crossword-cell');
  if (cell) {
    handleCellClick(cell);
    return;
  }

  if (event.target.classList.contains('export-button')) {
    exportToPDF();
  }
});

function handleCellClick(cell) {
  const words = collectWords();
  if (!words.length) {
    alert('Сначала добавьте слова в таблицу!');
    return;
  }

  const position = { row: Number(cell.dataset.row), col: Number(cell.dataset.col) };
  openPlacementModal(words, ({ word, direction }) => {
    const result = crossword.placeWord(word, position.row, position.col, direction === 'horizontal');
    if (result.success) {
      updateGrid();
    } else {
      alert(result.error);
    }
  });
}

function collectWords() {
  return Array.from(document.querySelectorAll('.word-list tbody tr'))
    .map((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return null;
      return {
        word: cells[0].textContent.trim(),
        description: cells[1].textContent.trim(),
      };
    })
    .filter(Boolean);
}

function openPlacementModal(words, onPlace) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Добавить слово</h3>
      <select data-role="word">
        ${words.map(({ word }) => `<option value="${word}">${word}</option>`).join('')}
      </select>
      <div class="direction-options">
        <label><input type="radio" name="direction" value="horizontal"> По горизонтали</label>
        <label><input type="radio" name="direction" value="vertical" checked> По вертикали</label>
      </div>
      <div class="modal-buttons">
        <button data-action="place">Разместить</button>
        <button data-action="cancel">Отмена</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  const wordSelect = overlay.querySelector('[data-role="word"]');
  const placeButton = overlay.querySelector('[data-action="place"]');
  const cancelButton = overlay.querySelector('[data-action="cancel"]');

  placeButton.addEventListener('click', () => {
    const direction = overlay.querySelector('input[name="direction"]:checked').value;
    onPlace({ word: wordSelect.value, direction });
    close();
  });

  cancelButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
}

function updateGrid() {
  const wrapper = app.querySelector('.crossword-wrapper');
  if (wrapper) {
    wrapper.outerHTML = renderCrossword(crossword, wl);
  }
}

async function exportToPDF() {
  const doc = new (await import('jspdf')).default();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('Кроссворд', 105, 20, { align: 'center' });

  const grid = crossword.getGrid();
  const cellSize = 10;
  const startX = 20;
  const startY = 30;

  for (let row = 0; row < crossword.size; row++) {
    for (let col = 0; col < crossword.size; col++) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      doc.rect(x, y, cellSize, cellSize);
      if (grid[row][col]) {
        doc.setFontSize(10);
        doc.text(grid[row][col], x + cellSize / 2, y + cellSize / 2 + 2, { align: 'center' });
      }
    }
  }

  const words = wl.getWords();
  let y = startY + crossword.size * cellSize + 20;
  [['По горизонтали', true], ['По вертикали', false]].forEach(([title, isHorizontal]) => {
    const entries = crossword.getPlacedWords().filter((w) => w.isHorizontal === isHorizontal);
    if (!entries.length) return;
    doc.setFontSize(12);
    doc.text(title, startX, y);
    y += 10;
    doc.setFontSize(10);
    entries.forEach(({ word }) => {
      const data = words.find((item) => item.word === word.toLowerCase());
      if (data) {
        doc.text(`• ${word.toLowerCase()}: ${data.description}`, startX, y);
        y += 7;
      }
    });
    y += 5;
  });

  doc.save('crossword.pdf');
}
