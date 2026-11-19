(() => {
  const CHAVE_DESPESAS = 'expensepro-despesas';
  const formulario = document.querySelector('#form-despesa');

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = new FormData(formulario);
    let despesas = [];

    try {
      const salvas = JSON.parse(localStorage.getItem(CHAVE_DESPESAS) || '[]');
      if (Array.isArray(salvas)) despesas = salvas;
    } catch {
      despesas = [];
    }

    despesas.push({
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      descricao: String(dados.get('descricao') || '').trim(),
      valor: Number(dados.get('valor')),
      data: String(dados.get('data') || ''),
      categoria: String(dados.get('categoria') || ''),
      observacao: String(dados.get('observacao') || '').trim()
    });

    localStorage.setItem(CHAVE_DESPESAS, JSON.stringify(despesas));
    window.location.href = 'revisao.html';
  });
})();
