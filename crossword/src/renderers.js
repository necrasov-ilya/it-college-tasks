export function renderWordList(wordList) {
  const words = wordList.getWords();
  
  let tableHTML = `
    <div class="controls">
      <input type="text" id="new-word" placeholder="Слово" />
      <input type="text" id="new-desc" placeholder="Описание" />
      <button id="add-btn">Добавить</button>
    </div>
    <table class="word-list">
      <thead>
        <tr>
          <th>Слово</th>
          <th>Описание</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  words.forEach(({ word, description }) => {
    tableHTML += `
        <tr>
          <td>${word}</td>
          <td>${description}</td>
          <td><button class="delete-btn" data-word="${word}">Удалить</button></td>
        </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  return tableHTML;
}

export function renderGrid(crossword) {
  const grid = crossword.getGrid();
  let html = '<div class="grid">';
  grid.forEach((row, rIndex) => {
    row.forEach((cell, cIndex) => {
      html += `<div class="cell" data-row="${rIndex}" data-col="${cIndex}">${cell}</div>`;
    });
  });
  html += '</div>';
  return html;
}

export function renderPlacedWords(crossword) {
  const across = crossword.getAcross();
  const down = crossword.getDown();

  const listHtml = (title, items) => `
    <div>
      <h4>${title}</h4>
      <ul>${items.map(i => `<li>${i.word}: ${i.description}</li>`).join('')}</ul>
    </div>
  `;

  return `
    <div class="lists">
      ${listHtml('По горизонтали', across)}
      ${listHtml('По вертикали', down)}
    </div>
  `;
}
