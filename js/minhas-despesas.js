// TODO: mostrar despesas e aplicar os filtros por categoria e data.
const despesas = JSON.parse(localStorage.getItem("expensepro-despesas") || "[]");

const listaDespesas = document.getElementById("listaDespesas");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroData = document.getElementById("filtroData");

// Formata os números para reais (exemplo: R$ 25,50).
function formatarReais(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Cria uma coluna da tabela com segurança, sem precisar escrever HTML no JavaScript.
function criarColuna(texto) {
  const coluna = document.createElement("td");
  coluna.textContent = texto;
  return coluna;
}

function mostrarDespesas() {
  const categoria = filtroCategoria.value;
  const data = filtroData.value;

  // Mantém a despesa se ela corresponder aos dois filtros escolhidos.
  const filtradas = despesas.filter(function (despesa) {
    const categoriaCorreta = categoria === "" || despesa.categoria === categoria;
    const dataCorreta = data === "" || despesa.data === data;
    return categoriaCorreta && dataCorreta;
  });

  listaDespesas.textContent = ""; // Remove as linhas anteriores antes de redesenhar.
  let total = 0;

  filtradas.forEach(function (despesa) {
    const linha = document.createElement("tr");
    const dataFormatada = (despesa.data || "").split("-").reverse().join("/");

    linha.appendChild(criarColuna(despesa.descricao));
    linha.appendChild(criarColuna(despesa.categoria));
    linha.appendChild(criarColuna(dataFormatada));

    const colunaValor = criarColuna(formatarReais(despesa.valor));
    colunaValor.className = "valor";
    linha.appendChild(colunaValor);

    listaDespesas.appendChild(linha);
    total += Number(despesa.valor);
  });

  document.getElementById("quantidadeDespesas").textContent = filtradas.length + " despesa(s)";
  document.getElementById("totalFiltrado").textContent = formatarReais(total);
  document.getElementById("mensagemVazia").hidden = filtradas.length > 0;
}

// Toda mudança de filtro redesenha a tabela.
filtroCategoria.addEventListener("change", mostrarDespesas);
filtroData.addEventListener("change", mostrarDespesas);

document.getElementById("limparFiltros").addEventListener("click", function () {
  filtroCategoria.value = "";
  filtroData.value = "";
  mostrarDespesas();
});

mostrarDespesas(); // Mostra as despesas ao abrir a página.
