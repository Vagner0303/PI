(async function () {
    const container = document.getElementById("continuar-estudando");
    if (!container) return;

    const MAX_CARDS = 3;
    const BASE_URL = "http://localhost:3000";
    const API_URL = `${BASE_URL}/materias`;

    function getHeaders() {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }

    function escapeHtml(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    /* Texto da quantidade de tarefas (singular/plural) */
    function textoTarefas(qtd) {
        if (qtd === null) return "Tarefas indisponíveis";
        if (qtd === 0) return "Nenhuma tarefa";
        if (qtd === 1) return "1 tarefa";
        return `${qtd} tarefas`;
    }

    /* Busca quantas tarefas existem em uma matéria (null se der erro) */
    async function contarTarefas(materiaId) {
        try {
            const res = await fetch(`${BASE_URL}/materias/${encodeURIComponent(materiaId)}/tarefas`, {
                credentials: "include",
                headers: getHeaders()
            });
            if (!res.ok) return null;
            const tarefas = await res.json();
            return Array.isArray(tarefas) ? tarefas.length : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    /* 1) Lê a lista local (separada por usuário) */
    let ultimas = [];
    try {
        ultimas = JSON.parse(localStorage.getItem(chaveUltimasMaterias())) || [];
    } catch (e) {
        ultimas = [];
    }

    /* 2) Mantém só as matérias que existem e pertencem ao usuário logado.
          O GET /materias só devolve as matérias criadas por ele. */
    try {
        const res = await fetch(API_URL, {
            credentials: "include",
            headers: getHeaders()
        });

        if (res.ok) {
            const minhas = await res.json();
            const idsMinhas = new Set(minhas.map(function (m) { return String(m.id); }));

            ultimas = ultimas.filter(function (m) {
                return idsMinhas.has(String(m.id));
            });

            localStorage.setItem(chaveUltimasMaterias(), JSON.stringify(ultimas));
        } else {
            /* Não autenticado ou erro: não mostra nada */
            ultimas = [];
        }
    } catch (e) {
        console.error(e);
        ultimas = [];
    }

    /* 3) Renderiza */
    if (ultimas.length === 0) {
        container.innerHTML = `
            <p style="display:flex; margin-top:100px; opacity:.6; font-size:14px;">
                Nenhuma matéria para continuar estudando
            </p>`;
        return;
    }

    const exibidas = ultimas.slice(0, MAX_CARDS);

    /* Busca a quantidade de tarefas de todas as matérias em paralelo */
    const quantidades = await Promise.all(
        exibidas.map(function (m) { return contarTarefas(m.id); })
    );

    const cards = exibidas.map(function (materia, i) {
        return `
        <div class="card">
            <div class="card-topo2">
                <div class="card-icone2">
                    <i data-lucide="book-open"></i>
                </div>
            </div>

            <span class="card-valor2">${escapeHtml(materia.nome)}</span>
            <span class="card-legenda">${textoTarefas(quantidades[i])}</span>

            <a class="btn-entrar" href="./EnterMate.html?materiaId=${encodeURIComponent(materia.id)}">
                Entrar
            </a>
        </div>`;
    });

    /* Completa a linha com espaços invisíveis para a matéria mais recente ficar no começo */
    const vazios = [];
    for (let i = cards.length; i < MAX_CARDS; i++) {
        vazios.push(`<div class="card" aria-hidden="true" style="visibility:hidden; pointer-events:none;"></div>`);
    }

    container.innerHTML = cards.concat(vazios).join("");

    if (window.lucide) lucide.createIcons();
})();