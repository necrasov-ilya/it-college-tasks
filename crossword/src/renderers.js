export function renderWordList(wordList) {
  const words = wordList.getWords();
  
  let tableHTML = `
    <table class="word-list">
      <thead>
        <tr>
          <th>Слово</th>
          <th>Описание</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;
  
  words.forEach(({ word, description }) => {
    tableHTML += `
        <tr>
          <td>${word}</td>
          <td>${description}</td>
          <td><button class="row-delete" aria-label="Удалить строку" title="Удалить">✕</button></td>
        </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  queueMicrotask(() => {
    const table = document.querySelector('table.word-list');
    if (!table) return;
    if (table._deleteHandlerAttached) return; 
    table._deleteHandlerAttached = true;

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button.row-delete');
      if (!btn) return;
      const row = btn.closest('tr');
      if (row) row.remove();
    });
  });

  return tableHTML;
}
