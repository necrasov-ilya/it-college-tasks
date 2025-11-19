export class WordList {
  constructor() {
    this.words = [];
  }
  
  addWord(word, description) {
    this.words.push({ word, description });
  }

  removeWord(word) {
    this.words = this.words.filter(w => w.word !== word);
  }
  
  getWords() {
    return this.words;
  }
}
