export function renderWordList(wordList) {
  const words = wordList.getWords();
  
  let tableHTML = `
    <div class="word-list-wrapper">
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
          <td class="editable">${word}</td>
          <td class="editable">${description}</td>
          <td><button class="row-delete" aria-label="Удалить строку" title="Удалить">✕</button></td>
        </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  </div>
  `;

  // Функционал удаления + inline-редактирования
  queueMicrotask(() => {
    const table = document.querySelector('table.word-list');
    if (!table) return;
    if (table._rowHandlersAttached) return; 
    table._rowHandlersAttached = true;

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button.row-delete');
      if (!btn) return;
      const row = btn.closest('tr');
      if (row) row.remove();
    });

    table.addEventListener('dblclick', (e) => {
      const cell = e.target.closest('td.editable');
      if (!cell || cell.isContentEditable) return;
      const original = cell.textContent;
      const blur = () => {
        cell.contentEditable = 'false';
        cell.removeEventListener('blur', blur);
        cell.removeEventListener('keydown', keydown);
      };
      const keydown = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          cell.blur();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          cell.textContent = original;
          cell.blur();
        }
      };
      cell.contentEditable = 'true';
      cell.focus();
      cell.addEventListener('blur', blur);
      cell.addEventListener('keydown', keydown);
    });

    });

  return tableHTML;
}
