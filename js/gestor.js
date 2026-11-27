document.addEventListener("DOMContentLoaded", () => {
  const selectPartidaGestor = document.getElementById("select-partida-gestor");
  const selectAjuste = document.getElementById("select-ajuste-demanda");
  const boxConfirmacao = document.getElementById("box-confirmacao-gestor");
  const textoConfirmacao = document.getElementById("texto-confirmacao-gestor");
  const btnVoltar = document.getElementById("btn-voltar-ajuste");
  const btnConfirmar = document.getElementById("btn-confirmar-ajuste");
  const alertaSucesso = document.getElementById("alerta-sucesso-gestor");
  const textoSucesso = document.getElementById("texto-sucesso-gestor");
  const btnSalvarConfig = document.getElementById("btn-salvar-config");

  let ajustePendente = 0;

  function atualizarTabelaRelatorios(partida) {
    const corpoTabela = document.getElementById("corpo-tabela-relatorios");
    const rodapeTabela = document.getElementById("rodape-tabela-relatorios");
    const subtitulo = document.getElementById("relatorio-subtitulo-partida");
    const badgeAjuste = document.getElementById("relatorio-badge-ajuste");

    if (!corpoTabela || !partida) return;

    const fator = 1 + (partida.ajuste || 0) / 100;

    if (subtitulo) {
      subtitulo.textContent = `Partida: ${partida.nome} • ${partida.local}`;
    }
    if (badgeAjuste) {
      const sinal = partida.ajuste > 0 ? "+" : "";
      badgeAjuste.textContent =
        partida.ajuste === 0
          ? "Preço base (0%)"
          : `Ajuste dinâmico ativo: ${sinal}${partida.ajuste}%`;
    }

    const capArq = Math.round(partida.capacidadeTotal * 0.47);
    const capInf = Math.round(partida.capacidadeTotal * 0.31);
    const capSup = partida.capacidadeTotal - capArq - capInf;

    const vendArq = Math.round(partida.vendidos * 0.52);
    const vendInf = Math.round(partida.vendidos * 0.32);
    const vendSup = partida.vendidos - vendArq - vendInf;

    const setores = [
      { nome: "Arquibancada", capacidade: capArq, vendidos: vendArq, precoBase: 80 },
      { nome: "Cadeira inferior", capacidade: capInf, vendidos: vendInf, precoBase: 120 },
      { nome: "Cadeira superior", capacidade: capSup, vendidos: vendSup, precoBase: 160 }
    ];

    let receitaTotal = 0;

    corpoTabela.innerHTML = setores
      .map((s) => {
        const ocupSetor = Math.round((s.vendidos / s.capacidade) * 100);
        const precoFinal = s.precoBase * fator;
        const receitaSetor = s.vendidos * precoFinal;
        receitaTotal += receitaSetor;

        let corBadge = "bg-info text-dark";
        if (ocupSetor >= 75) corBadge = "bg-success";
        else if (ocupSetor >= 50) corBadge = "bg-warning text-dark";
        else corBadge = "bg-secondary";

        return `
          <tr>
            <td>${s.nome}</td>
            <td>${s.capacidade.toLocaleString("pt-BR")}</td>
            <td>${s.vendidos.toLocaleString("pt-BR")}</td>
            <td><span class="badge ${corBadge}">${ocupSetor}%</span></td>
            <td>${precoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td>${receitaSetor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
          </tr>
        `;
      })
      .join("");

    if (rodapeTabela) {
      const ocupacaoGeral = Math.round((partida.vendidos / partida.capacidadeTotal) * 100);
      rodapeTabela.innerHTML = `
        <tr>
          <td>Total da Arena</td>
          <td>${partida.capacidadeTotal.toLocaleString("pt-BR")}</td>
          <td>${partida.vendidos.toLocaleString("pt-BR")}</td>
          <td>${ocupacaoGeral}%</td>
          <td>—</td>
          <td>${receitaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
        </tr>
      `;
    }
  }

  window.sincronizarPainelGestor = function (partidaId) {
    const partida = window.ArenaPassState && window.ArenaPassState.partidas[partidaId];
    if (!partida) return;

    if (selectPartidaGestor) selectPartidaGestor.value = partidaId;
    if (selectAjuste) selectAjuste.value = String(partida.ajuste || 0);

    const kpiOcupacao = document.getElementById("kpi-ocupacao");
    const kpiBadgeStatus = document.getElementById("kpi-badge-status");
    const kpiVendidos = document.getElementById("kpi-vendidos");
    const kpiTendencia = document.getElementById("kpi-tendencia");

    if (kpiOcupacao) {
      kpiOcupacao.textContent = `${partida.ocupacao}%`;
      kpiOcupacao.className = `display-6 fw-bold text-${partida.corOcupacao}`;
    }
    if (kpiBadgeStatus) {
      kpiBadgeStatus.textContent = partida.statusOcupacao;
      kpiBadgeStatus.className = `badge bg-${partida.corOcupacao}-subtle text-${partida.corOcupacao}`;
    }
    if (kpiVendidos) {
      kpiVendidos.textContent = partida.vendidos.toLocaleString("pt-BR");
    }
    if (kpiTendencia) {
      kpiTendencia.textContent = partida.tendencia;
    }

    if (boxConfirmacao) boxConfirmacao.classList.add("d-none");
    if (alertaSucesso) alertaSucesso.classList.add("d-none");

    atualizarTabelaRelatorios(partida);
  };

  if (selectPartidaGestor) {
    selectPartidaGestor.addEventListener("change", () => {
      const idSelecionado = selectPartidaGestor.value;
      if (typeof window.selecionarPartidaArenaPass === "function") {
        window.selecionarPartidaArenaPass(idSelecionado);
      }
    });
  }

  if (!selectAjuste) return;

  selectAjuste.addEventListener("change", () => {
    const novoValor = parseInt(selectAjuste.value, 10);
    const teto = (window.ArenaPassState && window.ArenaPassState.tetoMaximo) || 30;

    if (Math.abs(novoValor) > teto) return;

    ajustePendente = novoValor;
    alertaSucesso.classList.add("d-none");

    const checkConfirmacao = document.getElementById("check-confirmacao-obrigatoria");
    if (checkConfirmacao && !checkConfirmacao.checked) {
      aplicarAjusteConfirmado();
      return;
    }

    const partidaAtual = window.ArenaPassState.partidas[window.ArenaPassState.partidaAtualId];
    const sinal = novoValor > 0 ? "+" : "";
    textoConfirmacao.textContent = `Aplicar ajuste de ${sinal}${novoValor}% para ${partidaAtual.nome}.`;
    boxConfirmacao.classList.remove("d-none");
  });

  btnVoltar.addEventListener("click", () => {
    selectAjuste.value = String(window.ArenaPassState.percentualAjuste);
    boxConfirmacao.classList.add("d-none");
  });

  function aplicarAjusteConfirmado() {
    const idAtual = window.ArenaPassState.partidaAtualId;
    const partidaAtual = window.ArenaPassState.partidas[idAtual];

    window.ArenaPassState.percentualAjuste = ajustePendente;
    if (partidaAtual) {
      partidaAtual.ajuste = ajustePendente;
    }

    boxConfirmacao.classList.add("d-none");

    const sinal = ajustePendente > 0 ? "+" : "";
    textoSucesso.textContent = `Ajuste de ${sinal}${ajustePendente}% confirmado para ${partidaAtual.nome}! Preços atualizados na Visão do Torcedor.`;
    alertaSucesso.classList.remove("d-none");

    atualizarTabelaRelatorios(partidaAtual);

    if (typeof atualizarTotalTorcedor === "function") {
      atualizarTotalTorcedor();
    }
  }

  btnConfirmar.addEventListener("click", aplicarAjusteConfirmado);

  if (btnSalvarConfig) {
    btnSalvarConfig.addEventListener("click", () => {
      const novoTeto = parseInt(document.getElementById("config-teto-variacao").value, 10) || 30;
      const minutos = parseInt(document.getElementById("config-tempo-reserva").value, 10) || 5;

      window.ArenaPassState.tetoMaximo = novoTeto;
      window.ArenaPassState.tempoRestante = minutos * 60 - 1;

      const textoValidade = document.getElementById("texto-validade-reserva");
      if (textoValidade) {
        textoValidade.textContent = `Válido por ${minutos} minuto${minutos > 1 ? "s" : ""}`;
      }

      const badgeTeto = document.getElementById("badge-teto-gestor");
      const textoPrevencao = document.getElementById("texto-prevencao-erros");
      if (badgeTeto) badgeTeto.textContent = `Limite de ajuste: ±${novoTeto}%`;
      if (textoPrevencao) {
        textoPrevencao.innerHTML = `<i class="bi bi-shield-check text-success me-1"></i>Prevenção de erros ativa: ajustes limitados a ±${novoTeto}%.`;
      }

      Array.from(selectAjuste.options).forEach((opt) => {
        const val = Math.abs(parseInt(opt.value, 10));
        opt.disabled = val > novoTeto;
      });

      const idAtual = window.ArenaPassState.partidaAtualId;
      const partidaAtual = window.ArenaPassState.partidas[idAtual];
      if (partidaAtual && Math.abs(partidaAtual.ajuste) > novoTeto) {
        partidaAtual.ajuste = 0;
        window.ArenaPassState.percentualAjuste = 0;
        selectAjuste.value = "0";
        atualizarTabelaRelatorios(partidaAtual);
        if (typeof atualizarTotalTorcedor === "function") atualizarTotalTorcedor();
      }

      const msg = document.getElementById("msg-config-salva");
      if (msg) {
        msg.classList.remove("d-none");
        setTimeout(() => msg.classList.add("d-none"), 3000);
      }
    });
  }

  window.sincronizarPainelGestor(window.ArenaPassState.partidaAtualId);
});