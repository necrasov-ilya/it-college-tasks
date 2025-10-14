export function renderWordList(wordList) {
  const words = wordList.getWords();
  
  let tableHTML = `
    <table class="word-list">
      <thead>
        <tr>
          <th>Слово</th>
          <th>Описание</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  words.forEach(({ word, description }) => {
    tableHTML += `
        <tr>
          <td>${word}</td>
          <td>${description}</td>
        </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  return tableHTML;
}
