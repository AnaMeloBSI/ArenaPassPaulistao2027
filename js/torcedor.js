window.ArenaPassState = {
  percentualAjuste: 0,
  tempoRestante: 299
};

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarTotalTorcedor() {
  const selectSetor = document.getElementById("select-setor");
  const selectQtd = document.getElementById("select-qtd");
  const valorTotalEl = document.getElementById("valor-total");
  const badgeAjusteEl = document.getElementById("badge-ajuste-ativo");

  if (!selectSetor || !selectQtd || !valorTotalEl) return;

  const precoBase = parseFloat(selectSetor.value);
  const qtd = parseInt(selectQtd.value, 10);
  const fator = 1 + window.ArenaPassState.percentualAjuste / 100;

  const total = precoBase * fator * qtd;
  valorTotalEl.textContent = `Total: ${formatarMoeda(total)}`;

  Array.from(selectSetor.options).forEach((opt) => {
    const base = parseFloat(opt.value);
    const nomeSetor = opt.textContent.split("—")[0].trim();
    opt.textContent = `${nomeSetor} — ${formatarMoeda(base * fator)}`;
  });

  if (badgeAjusteEl) {
    if (window.ArenaPassState.percentualAjuste !== 0) {
      const sinal = window.ArenaPassState.percentualAjuste > 0 ? "+" : "";
      badgeAjusteEl.textContent = `Ajuste demanda: ${sinal}${window.ArenaPassState.percentualAjuste}%`;
      badgeAjusteEl.classList.remove("d-none");
    } else {
      badgeAjusteEl.classList.add("d-none");
    }
  }
}

function iniciarCronometroReserva() {
  const timerEl = document.getElementById("timer-reserva");
  if (!timerEl) return;

  setInterval(() => {
    if (window.ArenaPassState.tempoRestante <= 0) {
      timerEl.textContent = "00:00";
      timerEl.classList.replace("bg-primary", "bg-danger");
      return;
    }

    const min = String(Math.floor(window.ArenaPassState.tempoRestante / 60)).padStart(2, "0");
    const seg = String(window.ArenaPassState.tempoRestante % 60).padStart(2, "0");
    timerEl.textContent = `${min}:${seg}`;
    window.ArenaPassState.tempoRestante -= 1;
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  const selectSetor = document.getElementById("select-setor");
  const selectQtd = document.getElementById("select-qtd");
  const btnPagamento = document.getElementById("btn-ir-pagamento");

  if (selectSetor) selectSetor.addEventListener("change", atualizarTotalTorcedor);
  if (selectQtd) selectQtd.addEventListener("change", atualizarTotalTorcedor);

  if (btnPagamento) {
    btnPagamento.addEventListener("click", () => {
      const setorTexto = selectSetor.options[selectSetor.selectedIndex].text;
      const qtdTexto = selectQtd.options[selectQtd.selectedIndex].text;
      const totalTexto = document.getElementById("valor-total").textContent;
      const tempoTexto = document.getElementById("timer-reserva").textContent;

      const corpoModal = document.getElementById("modal-pagamento-corpo");
      corpoModal.innerHTML = `
        <p class="mb-2"><strong>Partida:</strong> Palmeiras × Corinthians</p>
        <p class="mb-2"><strong>Setor:</strong> ${setorTexto}</p>
        <p class="mb-2"><strong>Quantidade:</strong> ${qtdTexto}</p>
        <p class="mb-2"><strong>${totalTexto}</strong></p>
        <div class="alert alert-info py-2 mb-0 small">
          Preço garantido dentro da janela de reserva (${tempoTexto} restantes).
        </div>
      `;

      const modal = new bootstrap.Modal(document.getElementById("modalPagamento"));
      modal.show();
    });
  }

  atualizarTotalTorcedor();
  iniciarCronometroReserva();
});