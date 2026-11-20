(() => {
  const CHAVE_DESPESAS = 'expensepro-despesas';
  const formulario = document.querySelector('#form-despesa');
  const campoValor = document.querySelector('#valor');
  const erroValor = document.querySelector('#erro-valor');
  const campoData = document.querySelector('#data');
  const campoComprovante = document.querySelector('#comprovante');
  const nomeComprovante = document.querySelector('#comprovante-nome');
  const botaoSalvar = formulario.querySelector('button[type="submit"]');

  // Data de hoje já preenchida
  const hoje = new Date();
  campoData.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  // Mostra o nome do arquivo escolhido
  campoComprovante.addEventListener('change', () => {
    const arquivo = campoComprovante.files[0];
    nomeComprovante.textContent = arquivo ? `✓ ${arquivo.name}` : 'Anexar comprovante (opcional)';
  });

  // Erro vermelho do valor, igual à tela "Erro de preenchimento"
  function valorValido() {
    const ok = Number(campoValor.value) > 0;
    campoValor.classList.toggle('invalido', !ok);
    campoValor.setAttribute('aria-invalid', String(!ok));
    erroValor.hidden = ok;
    botaoSalvar.textContent = ok ? 'Salvar despesa' : 'Corrigir preenchimento';
    return ok;
  }
  campoValor.addEventListener('input', () => { if (!erroValor.hidden) valorValido(); });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!valorValido()) { campoValor.focus(); return; }
    if (!formulario.reportValidity()) return; // descrição, data e categoria

    const dados = new FormData(formulario);
    const arquivo = campoComprovante.files[0];
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
      observacao: String(dados.get('observacao') || '').trim(),
      comprovante: arquivo ? arquivo.name : '' // só o nome: o localStorage não comporta fotos
    });

    localStorage.setItem(CHAVE_DESPESAS, JSON.stringify(despesas));
    window.location.href = 'revisao.html';
  });
})();