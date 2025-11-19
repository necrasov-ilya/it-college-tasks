import './style.css'
import { renderWordList, renderGrid, renderPlacedWords } from './renderers.js';
import { WordList } from './wordlist.js';
import { Crossword } from './crossword.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const root = document.querySelector("#root");

root.innerHTML =`
  <div id="app">
    <div id="word-bank"></div>
    <hr/>
    <button id="export-btn">Экспорт в PDF</button>
    <div class="crossword-container">
      <div id="grid-container"></div>
      <div id="lists-container"></div>
    </div>
  </div>
  <div id="modal" class="modal" style="display: none;">
    <div class="modal-content">
      <h3>Добавить слово</h3>
      <select id="word-select"></select>
      <div>
        <label><input type="radio" name="direction" value="across" checked> По горизонтали</label>
        <label><input type="radio" name="direction" value="down"> По вертикали</label>
      </div>
      <button id="place-btn">Разместить</button>
      <button id="cancel-btn">Отмена</button>
    </div>
  </div>
`;

const wl = new WordList();
const cw = new Crossword(10);

wl.addWord("повар", "такая профессия");
wl.addWord("чай", "вкусный, делает меня человеком");
wl.addWord("яблоки", "с ананасами");
wl.addWord("сосисочки", "я — Никита Литвинков!");

let selectedCell = null;

const render = () => {
  // Render Word Bank
  document.getElementById('word-bank').innerHTML = renderWordList(wl);
  
  // Render Grid
  document.getElementById('grid-container').innerHTML = renderGrid(cw);
  
  // Render Placed Lists
  document.getElementById('lists-container').innerHTML = renderPlacedWords(cw);

  // Word Bank Events
  document.getElementById('add-btn').onclick = () => {
    const word = document.getElementById('new-word').value;
    const desc = document.getElementById('new-desc').value;
    if (word && desc) {
      wl.addWord(word, desc);
      render();
    }
  };

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = (e) => {
      const word = e.target.dataset.word;
      wl.removeWord(word);
      render();
    };
  });

  // Grid Events
  document.querySelectorAll('.cell').forEach(cell => {
    cell.onclick = (e) => {
      selectedCell = { 
        row: parseInt(e.target.dataset.row), 
        col: parseInt(e.target.dataset.col) 
      };
      openModal();
    };
  });
};

// Modal Logic
const modal = document.getElementById('modal');
const wordSelect = document.getElementById('word-select');

function openModal() {
  wordSelect.innerHTML = wl.getWords().map(w => `<option value="${w.word}">${w.word}</option>`).join('');
  modal.style.display = 'flex';
}

document.getElementById('cancel-btn').onclick = () => {
  modal.style.display = 'none';
};

document.getElementById('place-btn').onclick = () => {
  const wordText = wordSelect.value;
  const direction = document.querySelector('input[name="direction"]:checked').value;
  const wordObj = wl.getWords().find(w => w.word === wordText);
  
  if (wordObj && selectedCell) {
    const success = cw.placeWord(wordObj, selectedCell.row, selectedCell.col, direction);
    if (!success) {
      alert('Слово не помещается или конфликтует!');
    } else {
      render();
      modal.style.display = 'none';
    }
  }
};

// PDF Export
document.getElementById('export-btn').onclick = () => {
  const element = document.querySelector('.crossword-container');
  html2canvas(element).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10);
    pdf.save("crossword.pdf");
  });
};

render();
