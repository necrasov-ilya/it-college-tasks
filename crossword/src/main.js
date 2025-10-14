import './style.css'

// Вот эту часть, если нет желания реализовывать, можно убрать
import { elementMethods } from './baseline.js';

// Этот код не меняем
import { renderWordList } from './renderers.js';
import { WordList } from './wordlist.js';

// Эту часть можно делать через обычные querySelector-ы
const { first } = elementMethods();
const root = first("#root");

root.innerHTML =`
  <div id="app">
  </div>
`;

const app = root.first("#app");

// Код, начиная с этого места НЕ меняем
const wl = new WordList();

wl.addWord("повар", "такая профессия");
wl.addWord("чай", "вкусный, делает меня человеком");
wl.addWord("яблоки", "с ананасами");
wl.addWord("сосисочки", "я — Никита Литвинков!");

root.first('#app').innerHTML = renderWordList(wl);
