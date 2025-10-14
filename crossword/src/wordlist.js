export class WordList {
  constructor() {
    this.words = [];
  }
  
  addWord(word, description) {
    this.words.push({ word, description });
  }
  
  getWords() {
    return this.words;
  }
}
