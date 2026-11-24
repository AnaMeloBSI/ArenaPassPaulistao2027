document.addEventListener("DOMContentLoaded", () => {
  const selectAjuste = document.getElementById("select-ajuste-demanda");
  const boxConfirmacao = document.getElementById("box-confirmacao-gestor");
  const textoConfirmacao = document.getElementById("texto-confirmacao-gestor");
  const btnVoltar = document.getElementById("btn-voltar-ajuste");
  const btnConfirmar = document.getElementById("btn-confirmar-ajuste");
  const alertaSucesso = document.getElementById("alerta-sucesso-gestor");
  const textoSucesso = document.getElementById("texto-sucesso-gestor");

  let ajustePendente = 0;

  if (!selectAjuste) return;

  selectAjuste.addEventListener("change", () => {
    const novoValor = parseInt(selectAjuste.value, 10);

    if (Math.abs(novoValor) > 30) return;

    ajustePendente = novoValor;
    alertaSucesso.classList.add("d-none");

    const sinal = novoValor > 0 ? "+" : "";
    textoConfirmacao.textContent = `Aplicar ajuste de ${sinal}${novoValor}% por demanda.`;
    boxConfirmacao.classList.remove("d-none");
  });

  btnVoltar.addEventListener("click", () => {
    selectAjuste.value = String(window.ArenaPassState.percentualAjuste);
    boxConfirmacao.classList.add("d-none");
  });

  btnConfirmar.addEventListener("click", () => {
    window.ArenaPassState.percentualAjuste = ajustePendente;
    boxConfirmacao.classList.add("d-none");

    const sinal = ajustePendente > 0 ? "+" : "";
    textoSucesso.textContent = `Ajuste de ${sinal}${ajustePendente}% confirmado! Preços atualizados na Visão do Torcedor.`;
    alertaSucesso.classList.remove("d-none");

    if (typeof atualizarTotalTorcedor === "function") {
      atualizarTotalTorcedor();
    }
  });
});