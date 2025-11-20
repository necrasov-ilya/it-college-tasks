export class Crossword {
  constructor(size = 10) {
    this.size = size;
    this.grid = Array(size).fill(null).map(() => Array(size).fill(''));
    this.placedWords = [];
  }

  placeWord(word, row, col, isHorizontal) {
    const letters = word.toUpperCase().split('');
    
    if (isHorizontal) {
      if (col + letters.length > this.size) {
        return { success: false, error: 'Слово не помещается!' };
      }
      for (let i = 0; i < letters.length; i++) {
        const existing = this.grid[row][col + i];
        if (existing && existing !== letters[i]) {
          return { success: false, error: 'Слово конфликтует с другим словом!' };
        }
      }
      for (let i = 0; i < letters.length; i++) this.grid[row][col + i] = letters[i];
    } else {
      if (row + letters.length > this.size) {
        return { success: false, error: 'Слово не помещается!' };
      }
      for (let i = 0; i < letters.length; i++) {
        const existing = this.grid[row + i][col];
        if (existing && existing !== letters[i]) {
          return { success: false, error: 'Слово конфликтует с другим словом!' };
        }
      }
      for (let i = 0; i < letters.length; i++) this.grid[row + i][col] = letters[i];
    }
    
    this.placedWords.push({ word, row, col, isHorizontal });
    return { success: true };
  }

  getGrid() {
    return this.grid;
  }

  getPlacedWords() {
    return this.placedWords;
  }
}

export function renderCrossword(crossword, wordList) {
  const grid = crossword.getGrid();
  const placedWords = crossword.getPlacedWords();
  
  let gridHTML = '<div class="crossword-grid">';
  for (let row = 0; row < crossword.size; row++) {
    for (let col = 0; col < crossword.size; col++) {
      gridHTML += `<div class="crossword-cell" data-row="${row}" data-col="${col}">${grid[row][col]}</div>`;
    }
  }
  gridHTML += '</div>';

  const words = wordList.getWords();
  const horizontal = placedWords.filter(w => w.isHorizontal);
  const vertical = placedWords.filter(w => !w.isHorizontal);

  let infoHTML = '<div class="crossword-info">';
  
  if (horizontal.length > 0) {
    infoHTML += '<h3>По горизонтали</h3><ul>';
    horizontal.forEach(({ word }) => {
      const wordData = words.find(w => w.word === word.toLowerCase());
      if (wordData) {
        infoHTML += `<li><strong>${word.toLowerCase()}</strong>: ${wordData.description}</li>`;
      }
    });
    infoHTML += '</ul>';
  }

  if (vertical.length > 0) {
    infoHTML += '<h3>По вертикали</h3><ul>';
    vertical.forEach(({ word }) => {
      const wordData = words.find(w => w.word === word.toLowerCase());
      if (wordData) {
        infoHTML += `<li><strong>${word.toLowerCase()}</strong>: ${wordData.description}</li>`;
      }
    });
    infoHTML += '</ul>';
  }

  infoHTML += '</div>';

  const wrapperHTML = `
    <div class="crossword-wrapper">
      ${gridHTML}
      ${infoHTML}
      <button class="export-button">Экспорт в PDF</button>
    </div>
  `;

  return wrapperHTML;
}
