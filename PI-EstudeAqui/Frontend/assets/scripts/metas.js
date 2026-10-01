(() => {
    const baseApi = 'http://localhost:3000';

    const corpoTabela = document.getElementById('corpo-metas');
    const listaPrincipais = document.getElementById('lista-principais');
    const statAndamento = document.getElementById('stat-andamento');
    const statPrincipais = document.getElementById('stat-principais');

    const MAX_PRINCIPAIS = 3;
    const cores = ['#2F6BFF', '#16A34A', '#F59E0B', '#7C3AED', '#DC2626'];
    const rotuloTipo = { diaria: 'Meta diária', semanal: 'Meta semanal', mensal: 'Meta mensal' };
    const iconeTipo = { diaria: 'sun', semanal: 'calendar-days', mensal: 'calendar-range' };

    let metas = [];

    /* ---------- utilidades ---------- */
    function esc(texto) {
        const div = document.createElement('div');
        div.textContent = texto ?? '';
        return div.innerHTML;
    }

    // Dias entre hoje e o prazo (YYYY-MM-DD). Negativo = vencido.
    function diasRestantes(prazo) {
        if (!prazo) return null;
        const [ano, mes, dia] = String(prazo).slice(0, 10).split('-').map(Number);
        const fim = new Date(ano, mes - 1, dia);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return Math.round((fim - hoje) / 86400000);
    }

    function textoPrazo(meta) {
        if (meta.status !== 'em_andamento') return '';
        const d = diasRestantes(meta.prazo);
        if (d === null) return 'Sem prazo';
        if (d > 1) return `Termina em ${d} dias`;
        if (d === 1) return 'Termina amanhã';
        if (d === 0) return 'Termina hoje';
        return `Prazo vencido há ${Math.abs(d)} dia${Math.abs(d) > 1 ? 's' : ''}`;
    }

    /* ---------- API ---------- */
    async function chamar(caminho, metodo = 'GET', corpo) {
        const resposta = await fetch(`${baseApi}${caminho}`, {
            method: metodo,
            credentials: 'include',
            headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
            body: corpo ? JSON.stringify(corpo) : undefined,
        });
        if (!resposta.ok) {
            let mensagem = 'Algo deu errado.';
            try { mensagem = (await resposta.json()).message || mensagem; } catch {}
            throw new Error(mensagem);
        }
        return resposta.status === 204 ? null : resposta.json();
    }

    async function carregar() {
        try {
            metas = await chamar('/metas');
        } catch (erro) {
            console.error('Erro ao carregar metas:', erro);
            metas = [];
        }
        renderizar();
    }

    /* ---------- render ---------- */
    function menuHTML(meta) {
        return `
            <div class="dropdown-ponto">
                <i data-lucide="ellipsis-vertical"></i>
                <div class="menu-ponto">
                    ${meta.status === 'nao_iniciada'
                        ? `<button class="item-menu iniciar" type="button" data-acao="iniciar" data-id="${meta.id}">Iniciar</button>`
                        : ''}
                    <button class="item-menu" type="button" data-acao="concluir" data-id="${meta.id}">Concluir</button>
                    <button class="item-menu principal" type="button" data-acao="principal" data-id="${meta.id}">
                        ${meta.principal ? 'Remover principal' : 'Marcar principal'}
                    </button>
                    <button class="item-menu excluir" type="button" data-acao="excluir" data-id="${meta.id}">Excluir</button>
                </div>
            </div>`;
    }

    function badgeHTML(meta) {
        return meta.status === 'em_andamento'
            ? '<span class="status-badge status-andamento">Em andamento</span>'
            : '<span class="status-badge status-naoiniciada">Não iniciada</span>';
    }

    function linhaHTML(meta, indice) {
        const cor = cores[indice % cores.length];
        const prazo = textoPrazo(meta);
        return `
            <tr>
                <td>
                    <div class="descricao-meta">
                        <span class="icone-meta" style="background:${cor};">
                            <i data-lucide="${iconeTipo[meta.tipo] || 'target'}"></i>
                        </span>
                        <div>
                            <p class="titulo-linha-meta">${esc(meta.titulo)}</p>
                            <p class="descrito-sub">${rotuloTipo[meta.tipo] || ''}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="data-meta">
                        ${prazo ? `<i data-lucide="calendar"></i> ${prazo}` : ''}
                    </div>
                </td>
                <td>${badgeHTML(meta)}</td>
                <td>${menuHTML(meta)}</td>
            </tr>`;
    }

    function principalHTML(meta) {
        const d = diasRestantes(meta.prazo);
        let faltam = '';
        if (meta.status === 'em_andamento') {
            if (d === null) faltam = '<p class="dias-sub">Sem prazo</p>';
            else if (d >= 0) faltam = `<p>Faltam</p><p class="dias-numero">${d} <span>${d === 1 ? 'dia' : 'dias'}</span></p>`;
            else faltam = `<p>Vencida há</p><p class="dias-numero">${Math.abs(d)} <span>dias</span></p>`;
        }
        return `
            <div class="item-principal">
                <div class="item-principal-topo">
                    <div>
                        <p class="titulo-obgp">${esc(meta.titulo)}</p>
                        <p class="subtitulo-obgp">${rotuloTipo[meta.tipo] || ''}</p>
                    </div>
                    ${menuHTML(meta)}
                </div>
                <div class="item-principal-rodape">
                    ${badgeHTML(meta)}
                    <div class="dias-faltam-texto">${faltam}</div>
                </div>
            </div>`;
    }

    function renderizar() {
        const principais = metas.filter(m => m.principal);
        const demais = metas.filter(m => !m.principal);

        if (listaPrincipais) {
            listaPrincipais.innerHTML = principais.length
                ? principais.map(principalHTML).join('')
                : '<p class="vazio-metas">Nenhuma meta principal ainda.</p>';
        }

        if (corpoTabela) {
            corpoTabela.innerHTML = demais.length
                ? demais.map(linhaHTML).join('')
                : '<tr><td colspan="4" class="vazio-metas">Nenhuma meta por aqui.</td></tr>';
        }

        const cardTabela = corpoTabela ? corpoTabela.closest('.cards-final') : null;
        if (cardTabela) cardTabela.classList.toggle('vazio', demais.length === 0);

        if (statAndamento) statAndamento.textContent = metas.filter(m => m.status === 'em_andamento').length;
        if (statPrincipais) statPrincipais.textContent = principais.length;

        if (window.lucide) window.lucide.createIcons();
    }

    /* ---------- modal "Nova meta" ---------- */
    const overlay = document.querySelector('.cronograma-container');
    const modalNovaMeta = document.getElementById('modal-nova-meta');
    const campoTitulo = document.getElementById('meta-titulo');
    const campoTipo = document.getElementById('meta-tipo');
    const campoPrazo = document.getElementById('meta-prazo');
    const botaoAdicionar = document.getElementById('botao-adicionar-meta');
    const botaoConfirmar = document.getElementById('modal-confirmar-meta');

    function abrirModalMeta() {
        if (!modalNovaMeta) return;
        if (campoPrazo) campoPrazo.min = new Date().toLocaleDateString('en-CA'); // hoje (YYYY-MM-DD)
        modalNovaMeta.classList.add('open');
        if (campoTitulo) campoTitulo.focus();
    }

    function fecharModalMeta() {
        if (modalNovaMeta) modalNovaMeta.classList.remove('open');
    }

    // Esses listeners são ligados ANTES de qualquer coisa que possa falhar
    if (botaoAdicionar) botaoAdicionar.addEventListener('click', abrirModalMeta);

    if (modalNovaMeta) {
        const btnFechar = modalNovaMeta.querySelector('.fechar-btn');
        if (btnFechar) btnFechar.addEventListener('click', fecharModalMeta);
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => { if (e.target === overlay) fecharModalMeta(); });
    }

    if (botaoConfirmar) {
        botaoConfirmar.addEventListener('click', async () => {
            const titulo = campoTitulo.value.trim();
            if (!titulo) { campoTitulo.focus(); return; }

            try {
                await chamar('/metas', 'POST', {
                    titulo,
                    tipo: campoTipo.value,
                    prazo: campoPrazo.value || null,
                });
                campoTitulo.value = '';
                campoPrazo.value = '';
                campoTipo.value = 'semanal';
                fecharModalMeta();
                await carregar();
            } catch (erro) {
                alert(erro.message);
            }
        });
    }

    /* ---------- menu de 3 pontinhos + ações (delegação de eventos) ---------- */
    function fecharMenus(exceto) {
        document.querySelectorAll('.dropdown-ponto.aberto').forEach(d => {
            if (d !== exceto) d.classList.remove('aberto');
        });
    }

    document.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('[data-acao]');
        const gatilho = evento.target.closest('.dropdown-ponto > :first-child');

        // abrir/fechar o menu
        if (gatilho) {
            const dropdown = gatilho.parentElement;
            const estavaAberto = dropdown.classList.contains('aberto');
            fecharMenus(dropdown);
            dropdown.classList.toggle('aberto', !estavaAberto);
            return;
        }

        // ação de um item do menu
        if (botao) {
            const id = Number(botao.dataset.id);
            const meta = metas.find(m => m.id === id);
            fecharMenus(null);
            if (!meta) return;

            try {
                switch (botao.dataset.acao) {
                    case 'iniciar':
                        await chamar(`/metas/${id}/iniciar`, 'PATCH');
                        break;
                    case 'concluir':
                        await chamar(`/metas/${id}/concluir`, 'PATCH');
                        break;
                    case 'principal':
                        if (!meta.principal && metas.filter(m => m.principal).length >= MAX_PRINCIPAIS) {
                            alert(`Você já tem ${MAX_PRINCIPAIS} metas principais. Remova uma para marcar outra.`);
                            return;
                        }
                        await chamar(`/metas/${id}/principal`, 'PATCH', { principal: !meta.principal });
                        break;
                    case 'excluir':
                        if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
                        await chamar(`/metas/${id}`, 'DELETE');
                        break;
                }
                await carregar();
            } catch (erro) {
                alert(erro.message);
            }
            return;
        }

        fecharMenus(null); // clique fora
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { fecharMenus(null); fecharModalMeta(); }
    });

    console.log('metas.js carregado');
    carregar();
})();