import './style.css';
import { elementMethods } from './baseline.js';
import { renderWordList } from './renderers.js';
import { WordList } from './wordlist.js';
import { Crossword, renderCrossword } from './crossword.js';

const INITIAL_WORDS = [
  ['повар', 'такая профессия'],
  ['чай', 'вкусный, делает меня человеком'],
  ['яблоки', 'с ананасами'],
  ['сосисочки', 'я — Никита Литвинков!']
];

const { first } = elementMethods();
const app = createAppRoot();
const wordList = createWordList(INITIAL_WORDS);
const crossword = new Crossword(10);

renderInitialLayout();
app.addEventListener('click', handleAppClick);

function createAppRoot() {
  const root = first('#root');
  root.innerHTML = '<div id="app"></div>';
  return first('#app', root);
}

function createWordList(entries) {
  const list = new WordList();
  entries.forEach(([word, description]) => list.addWord(word, description));
  return list;
}

function renderInitialLayout() {
  app.innerHTML = renderWordList(wordList) + renderCrossword(crossword, wordList);
}

function handleAppClick(event) {
  const cell = event.target.closest('.crossword-cell');
  if (cell) {
    handleCellClick(cell);
    return;
  }

  if (event.target.closest('.export-button')) {
    exportToPDF();
  }
}

function handleCellClick(cell) {
  const words = collectWords();
  if (!words.length) {
    alert('Сначала добавьте слова в таблицу!');
    return;
  }

  const position = {
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col)
  };

  openPlacementModal(words, ({ word, direction }) => {
    const placement = crossword.placeWord(
      word,
      position.row,
      position.col,
      direction === 'horizontal'
    );

    if (!placement.success) {
      alert(placement.error);
      return;
    }

    updateGrid();
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
    if (event.target === overlay) {
      close();
    }
  });
}

function updateGrid() {
  const wrapper = app.querySelector('.crossword-wrapper');
  if (wrapper) {
    wrapper.outerHTML = renderCrossword(crossword, wordList);
  }
}

async function exportToPDF() {
  const doc = await createPdfDocument();
  const afterGridY = drawGrid(doc);
  writeClues(doc, afterGridY);
  doc.save('crossword.pdf');
}

async function createPdfDocument() {
  const Doc = (await import('jspdf')).default;
  const doc = new Doc();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('Кроссворд', 105, 20, { align: 'center' });
  return doc;
}

function drawGrid(doc) {
  const cellSize = 10;
  const startX = 20;
  const startY = 30;
  const grid = crossword.getGrid();

  for (let row = 0; row < crossword.size; row += 1) {
    for (let col = 0; col < crossword.size; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      doc.rect(x, y, cellSize, cellSize);
      if (grid[row][col]) {
        doc.setFontSize(10);
        doc.text(grid[row][col], x + cellSize / 2, y + cellSize / 2 + 2, { align: 'center' });
      }
    }
  }

  return startY + crossword.size * cellSize + 20;
}

function writeClues(doc, startY) {
  const words = wordList.getWords();
  let y = startY;

  [
    ['По горизонтали', true],
    ['По вертикали', false]
  ].forEach(([title, isHorizontal]) => {
    const entries = crossword.getPlacedWords().filter((word) => word.isHorizontal === isHorizontal);
    if (!entries.length) {
      return;
    }

    doc.setFontSize(12);
    doc.text(title, 20, y);
    y += 10;

    doc.setFontSize(10);
    entries.forEach(({ word }) => {
      const data = words.find((item) => item.word === word.toLowerCase());
      if (!data) {
        return;
      }

      doc.text(`• ${word.toLowerCase()}: ${data.description}`, 20, y);
      y += 7;
    });

    y += 5;
  });
}
