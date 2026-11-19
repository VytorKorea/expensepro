(() => {
  const CHAVE_DESPESAS = 'expensepro-despesas';
  const lista = document.querySelector('#lista-despesas');
  const estadoVazio = document.querySelector('#estado-vazio');
  const formEdicao = document.querySelector('#form-edicao');
  const dialogEdicao = document.querySelector('#dialog-edicao');
  const dialogExclusao = document.querySelector('#dialog-exclusao');
  const mensagem = document.querySelector('#mensagem');
  const formFiltros = document.querySelector('#form-filtros');
  let despesas = carregarDespesas();
  let idPendenteExclusao = null;
  let temporizadorMensagem;

  function carregarDespesas() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE_DESPESAS) || '[]');
      return Array.isArray(dados) ? dados.filter((item) => item && typeof item === 'object') : [];
    } catch {
      return [];
    }
  }

  function salvarDespesas() {
    localStorage.setItem(CHAVE_DESPESAS, JSON.stringify(despesas));
  }

  function escapar(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (caractere) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[caractere]);
  }

  function formatarValor(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
  }

  function formatarData(data) {
    if (!data) return '—';
    const [ano, mes, dia] = String(data).split('-').map(Number);
    if (!ano || !mes || !dia) return escapar(data);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  }

  function atualizarResumo() {
    const total = despesas.reduce((soma, item) => soma + (Number(item.valor) || 0), 0);
    const categorias = new Set(despesas.map((item) => item.categoria).filter(Boolean));
    document.querySelector('#total-despesas').textContent = despesas.length.toLocaleString('pt-BR');
    document.querySelector('#valor-total').textContent = formatarValor(total);
    document.querySelector('#total-categorias').textContent = categorias.size.toLocaleString('pt-BR');
  }

  function obterFiltradas() {
    const busca = document.querySelector('#filtro-busca').value.trim().toLocaleLowerCase('pt-BR');
    const categoria = document.querySelector('#filtro-categoria').value;
    const data = document.querySelector('#filtro-data').value;
    return despesas.filter((item) => {
      const correspondeBusca = !busca || `${item.descricao || ''} ${item.observacao || ''}`.toLocaleLowerCase('pt-BR').includes(busca);
      return correspondeBusca && (!categoria || item.categoria === categoria) && (!data || item.data === data);
    }).sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
  }

  function desenharLista() {
    const filtradas = obterFiltradas();
    document.querySelector('#contador-lista').textContent = `${filtradas.length} ${filtradas.length === 1 ? 'registro' : 'registros'}`;
    estadoVazio.hidden = filtradas.length > 0;
    lista.innerHTML = filtradas.map((item) => `
      <tr>
        <td><span class="descricao-despesa">${escapar(item.descricao || 'Despesa sem descrição')}</span>${item.observacao ? `<span class="subdescricao">${escapar(item.observacao)}</span>` : ''}</td>
        <td><span class="data-despesa">${formatarData(item.data)}</span></td>
        <td><span class="categoria-tag">${escapar(item.categoria || 'Sem categoria')}</span></td>
        <td><span class="valor-despesa">${formatarValor(item.valor)}</span></td>
        <td><div class="acoes-linha"><button class="botao-icone" type="button" data-editar="${escapar(item.id)}" aria-label="Corrigir ${escapar(item.descricao || 'despesa')}" title="Corrigir">✎</button><button class="botao-icone excluir" type="button" data-excluir="${escapar(item.id)}" aria-label="Excluir ${escapar(item.descricao || 'despesa')}" title="Excluir">⌫</button></div></td>
      </tr>`).join('');
    atualizarResumo();
  }

  function avisar(texto) {
    mensagem.textContent = texto;
    window.clearTimeout(temporizadorMensagem);
    temporizadorMensagem = window.setTimeout(() => { mensagem.textContent = ''; }, 4000);
  }

  function abrirEdicao(id) {
    const despesa = despesas.find((item) => String(item.id) === String(id));
    if (!despesa) return;
    document.querySelector('#despesa-id').value = despesa.id;
    document.querySelector('#descricao').value = despesa.descricao || '';
    document.querySelector('#data').value = despesa.data || '';
    document.querySelector('#categoria').value = despesa.categoria || '';
    document.querySelector('#valor').value = despesa.valor ?? '';
    document.querySelector('#observacao').value = despesa.observacao || '';
    dialogEdicao.showModal();
    document.querySelector('#descricao').focus();
  }

  lista.addEventListener('click', (evento) => {
    const editar = evento.target.closest('[data-editar]');
    const excluir = evento.target.closest('[data-excluir]');
    if (editar) abrirEdicao(editar.dataset.editar);
    if (excluir) {
      idPendenteExclusao = excluir.dataset.excluir;
      dialogExclusao.showModal();
    }
  });

  formFiltros.addEventListener('input', desenharLista);
  formFiltros.addEventListener('change', desenharLista);
  formFiltros.addEventListener('reset', () => window.setTimeout(desenharLista));

  formEdicao.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const id = document.querySelector('#despesa-id').value;
    const atualizada = despesas.find((item) => String(item.id) === String(id));
    if (!atualizada) return;
    atualizada.descricao = document.querySelector('#descricao').value.trim();
    atualizada.data = document.querySelector('#data').value;
    atualizada.categoria = document.querySelector('#categoria').value;
    atualizada.valor = Number(document.querySelector('#valor').value);
    atualizada.observacao = document.querySelector('#observacao').value.trim();
    salvarDespesas();
    dialogEdicao.close();
    desenharLista();
    avisar('Despesa atualizada com sucesso.');
  });

  document.querySelector('#confirmar-exclusao').addEventListener('click', () => {
    if (idPendenteExclusao === null) return;
    despesas = despesas.filter((item) => String(item.id) !== String(idPendenteExclusao));
    idPendenteExclusao = null;
    salvarDespesas();
    dialogExclusao.close();
    desenharLista();
    avisar('Despesa excluída.');
  });

  document.querySelectorAll('[data-fechar]').forEach((botao) => {
    botao.addEventListener('click', () => botao.closest('dialog').close());
  });

  window.addEventListener('storage', (evento) => {
    if (evento.key === CHAVE_DESPESAS) {
      despesas = carregarDespesas();
      desenharLista();
    }
  });

  desenharLista();
})();
