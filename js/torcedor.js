window.ArenaPassState = {
  partidaAtualId: "palmeiras-corinthians",
  percentualAjuste: 0,
  tempoRestante: 299,
  tetoMaximo: 30,
  partidas: {
    "palmeiras-corinthians": {
      nome: "Palmeiras × Corinthians",
      local: "Allianz Parque • Domingo, 16:00",
      demanda: "Alta demanda",
      capacidadeTotal: 25600,
      ocupacao: 72,
      statusOcupacao: "Alta",
      corOcupacao: "danger",
      vendidos: 18450,
      tendencia: "+14% hoje",
      ajuste: 0
    },
    "saopaulo-santos": {
      nome: "São Paulo × Santos",
      local: "MorumBIS • Quarta-feira, 21:30",
      demanda: "Demanda moderada",
      capacidadeTotal: 24480,
      ocupacao: 58,
      statusOcupacao: "Moderada",
      corOcupacao: "warning",
      vendidos: 14200,
      tendencia: "+8% hoje",
      ajuste: 0
    },
    "corinthians-saopaulo": {
      nome: "Corinthians × São Paulo",
      local: "Neo Química Arena • Domingo, 18:30",
      demanda: "Alta demanda",
      capacidadeTotal: 26300,
      ocupacao: 84,
      statusOcupacao: "Alta",
      corOcupacao: "danger",
      vendidos: 22100,
      tendencia: "+19% hoje",
      ajuste: 0
    },
    "novorizontino-mirassol": {
      nome: "Novorizontino × Mirassol",
      local: "Jorge Ismael de Biasi • Sábado, 16:00",
      demanda: "Baixa procura",
      capacidadeTotal: 10060,
      ocupacao: 34,
      statusOcupacao: "Baixa",
      corOcupacao: "secondary",
      vendidos: 3420,
      tendencia: "-6% hoje",
      ajuste: 0
    },
    "pontepreta-guarani": {
      nome: "Ponte Preta × Guarani",
      local: "Moisés Lucarelli • Sábado, 19:00",
      demanda: "Baixa procura",
      capacidadeTotal: 12630,
      ocupacao: 41,
      statusOcupacao: "Baixa",
      corOcupacao: "secondary",
      vendidos: 5180,
      tendencia: "-4% hoje",
      ajuste: 0
    },
    "ituano-saobernardo": {
      nome: "Ituano × São Bernardo",
      local: "Novelli Júnior • Quinta-feira, 19:30",
      demanda: "Baixa procura",
      capacidadeTotal: 10320,
      ocupacao: 28,
      statusOcupacao: "Baixa",
      corOcupacao: "secondary",
      vendidos: 2890,
      tendencia: "-9% hoje",
      ajuste: 0
    }
  }
};

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

window.selecionarPartidaArenaPass = function (partidaId) {
  const partida = window.ArenaPassState.partidas[partidaId];
  if (!partida) return;

  window.ArenaPassState.partidaAtualId = partidaId;
  window.ArenaPassState.percentualAjuste = partida.ajuste || 0;

  const nomeEl = document.getElementById("nome-partida-atual");
  const localEl = document.getElementById("local-partida-atual");
  const badgeEl = document.getElementById("torcedor-demand-badge");

  if (nomeEl) nomeEl.textContent = partida.nome;
  if (localEl) localEl.textContent = partida.local;
  if (badgeEl) {
    const icone = partida.demanda === "Baixa procura" ? "bi-graph-down-arrow" : "bi-fire";
    badgeEl.innerHTML = `<i class="bi ${icone} me-1"></i> ${partida.demanda}`;
  }

  document.querySelectorAll(".btn-selecionar-jogo").forEach((b) => {
    if (b.dataset.id === partidaId) {
      b.classList.replace("btn-outline-primary", "btn-primary");
    } else {
      b.classList.replace("btn-primary", "btn-outline-primary");
    }
  });

  if (typeof window.sincronizarPainelGestor === "function") {
    window.sincronizarPainelGestor(partidaId);
  }

  atualizarTotalTorcedor();
};

function atualizarTotalTorcedor() {
  const selectSetor = document.getElementById("select-setor");
  const selectQtd = document.getElementById("select-qtd");
  const valorTotalEl = document.getElementById("valor-total");
  const badgeAjusteEl = document.getElementById("badge-ajuste-ativo");

  if (!selectSetor || !selectQtd || !valorTotalEl) return;

  const ajuste = window.ArenaPassState.percentualAjuste || 0;
  const fator = 1 + ajuste / 100;

  Array.from(selectSetor.options).forEach((opt) => {
    if (!opt.value) {
      opt.textContent = "Selecione o setor";
      return;
    }
    const base = parseFloat(opt.value);
    const nomeSetor = opt.textContent.split("—")[0].trim();
    opt.textContent = `${nomeSetor} — ${formatarMoeda(base * fator)}`;
  });

  const precoBase = parseFloat(selectSetor.value);
  const qtd = parseInt(selectQtd.value, 10) || 0;

  if (!isNaN(precoBase) && qtd > 0) {
    const total = precoBase * fator * qtd;
    valorTotalEl.textContent = `Total: ${formatarMoeda(total)}`;
  } else {
    valorTotalEl.textContent = "Total: R$ 0,00";
  }

  if (badgeAjusteEl) {
    if (ajuste !== 0) {
      const sinal = ajuste > 0 ? "+" : "";
      badgeAjusteEl.textContent = `Ajuste demanda: ${sinal}${ajuste}%`;
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

  if (selectSetor) selectSetor.addEventListener("change", atualizarTotalTorcedor);
  if (selectQtd) selectQtd.addEventListener("input", atualizarTotalTorcedor);

  atualizarTotalTorcedor();
  iniciarCronometroReserva();
});