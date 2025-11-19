export class Crossword {
  constructor(size = 10) {
    this.size = size;
    this.grid = Array(size).fill(null).map(() => Array(size).fill(''));
    this.placedWords = [];
  }

  canPlace(word, row, col, direction) {
    if (direction === 'across') {
      if (col + word.length > this.size) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = this.grid[row][col + i];
        if (cell !== '' && cell !== word[i]) return false;
      }
    } else {
      if (row + word.length > this.size) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = this.grid[row + i][col];
        if (cell !== '' && cell !== word[i]) return false;
      }
    }
    return true;
  }

  placeWord(wordObj, row, col, direction) {
    const { word } = wordObj;
    if (!this.canPlace(word, row, col, direction)) return false;

    if (direction === 'across') {
      for (let i = 0; i < word.length; i++) this.grid[row][col + i] = word[i];
    } else {
      for (let i = 0; i < word.length; i++) this.grid[row + i][col] = word[i];
    }

    this.placedWords.push({ ...wordObj, row, col, direction });
    return true;
  }

  removeWord(index) {
    const w = this.placedWords[index];
    this.placedWords.splice(index, 1);
    // Rebuild grid
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(''));
    this.placedWords.forEach(pw => {
      const word = pw.word;
      if (pw.direction === 'across') {
        for (let i = 0; i < word.length; i++) this.grid[pw.row][pw.col + i] = word[i];
      } else {
        for (let i = 0; i < word.length; i++) this.grid[pw.row + i][pw.col] = word[i];
      }
    });
  }

  getGrid() { return this.grid; }
  getAcross() { return this.placedWords.filter(w => w.direction === 'across'); }
  getDown() { return this.placedWords.filter(w => w.direction === 'down'); }
}
