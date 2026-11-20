// TODO: somar as despesas por categoria no período selecionado.
// A mesma chave usada pelo cadastro do grupo.
const despesas = JSON.parse(localStorage.getItem("expensepro-despesas") || "[]");
const campoPeriodo = document.getElementById("periodo");
const tabela = document.getElementById("tabelaRelatorio");

function formatarReais(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mostrarRelatorio() {
  const periodo = campoPeriodo.value; // Exemplo: "2026-11"
  const totais = {};
  let totalGeral = 0;
  tabela.textContent = ""; // Apaga as linhas antigas.

  // Se não escolher um mês, mostra as despesas de todos os meses.
  const selecionadas = despesas.filter(function (despesa) {
    return periodo === "" || despesa.data.startsWith(periodo);
  });

  // Soma o valor das despesas de cada categoria.
  selecionadas.forEach(function (despesa) {
    const categoria = despesa.categoria;
    const valor = Number(despesa.valor);
    if (!totais[categoria]) {
      totais[categoria] = 0;
    }
    totais[categoria] += valor;
    totalGeral += valor;
  });

  let quantidadeCategorias = 0;
  for (const categoria in totais) {
    const linha = document.createElement("tr");
    const colunaCategoria = document.createElement("td");
    const colunaValor = document.createElement("td");

    colunaCategoria.textContent = categoria;
    colunaValor.textContent = formatarReais(totais[categoria]);
    colunaValor.className = "valor";
    linha.appendChild(colunaCategoria);
    linha.appendChild(colunaValor);
    tabela.appendChild(linha);
    quantidadeCategorias++;
  }

  document.getElementById("totalGeral").textContent = formatarReais(totalGeral);
  document.getElementById("quantidadeCategorias").textContent = quantidadeCategorias;
  document.getElementById("mensagemVazia").hidden = selecionadas.length > 0;
}

campoPeriodo.addEventListener("change", mostrarRelatorio);
mostrarRelatorio();
