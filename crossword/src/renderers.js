export function renderWordList(wordList) {
  const words = wordList.getWords();
  
  let tableHTML = `
    <div class="word-list-wrapper">
      <input type="text" id="new-word-input" placeholder="Слово">
      <input type="text" id="new-description-input" placeholder="Описание">
      <button type="button" class="word-list-add">Добавить</button>
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
          <td><button class="row-delete">Удалить</button></td>
        </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  </div>
  `;

  queueMicrotask(() => {
    const table = document.querySelector('table.word-list');
    if (!table) return;
    if (table._rowHandlersAttached) return; 
    table._rowHandlersAttached = true;

    table.addEventListener('click', (e) => {
      const btn = e.target.closest('button.row-delete');
      if (!btn) return;
      const row = btn.closest('tr');
      if (row) {
        row.remove();
        const event = new CustomEvent('wordListChanged');
        document.dispatchEvent(event);
      }
    });

    const addButton = document.querySelector('.word-list-add');
    if (addButton && !addButton._handlerAttached) {
      addButton._handlerAttached = true;
      addButton.addEventListener('click', () => {
        const wordInput = document.querySelector('#new-word-input');
        const descInput = document.querySelector('#new-description-input');
        
        const word = wordInput.value.trim();
        const description = descInput.value.trim();
        
        if (!word || !description) {
          alert('Заполните оба поля!');
          return;
        }
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${word}</td>
          <td>${description}</td>
          <td><button class="row-delete">Удалить</button></td>
        `;
        tbody.appendChild(row);
        
        wordInput.value = '';
        descInput.value = '';
        
        const event = new CustomEvent('wordListChanged');
        document.dispatchEvent(event);
      });
    }
  });

  return tableHTML;
}
