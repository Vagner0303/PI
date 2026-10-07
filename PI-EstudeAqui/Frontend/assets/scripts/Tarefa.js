/* ===== Config da API ===== */
const BASE_URL = "http://localhost:3000";

function getHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

/* ===== Ids na URL: tarefa.html?tarefaId=7&materiaId=5 ===== */
const params = new URLSearchParams(window.location.search);
const tarefaId = params.get("tarefaId");
let materiaId = params.get("materiaId");

/* ===== Elementos ===== */
const elLinkMateria = document.querySelector("#link-materia");
const elBreadcrumb = document.querySelector("#tarefa-breadcrumb");
const elNome = document.querySelector("#tarefa-nome");
const elSubtitulo = document.querySelector("#tarefa-subtitulo");

const elProgresso = document.querySelector("#progresso");
const elProgressoResumo = document.querySelector("#progresso-resumo");
const elProgressoAcertos = document.querySelector("#progresso-acertos");
const elProgressoBarra = document.querySelector("#progresso-barra");
const elProgressoPreenchido = document.querySelector("#progresso-preenchido");

const elBarraFiltros = document.querySelector("#barra-filtros");
const botoesFiltro = document.querySelectorAll(".filtro[data-filtro]");
const btnRegerar = document.querySelector("#btn-regerar");

const elEstado = document.querySelector("#estado");
const elEstadoTexto = document.querySelector("#estado-texto");
const elEstadoErro = document.querySelector("#estado-erro");
const btnGerar = document.querySelector("#btn-gerar");

const elLista = document.querySelector("#lista-atividades");

/* ===== Estado da tela ===== */
let atividades = [];
let filtroAtual = "todas";

const ROTULOS = {
    correta: "Correta",
    parcial: "Parcial",
    incorreta: "Incorreta"
};

/* pendente = ainda sem correção */
function statusDe(atividade) {
    return atividade.resultado || "pendente";
}

/* =========================================================
   Carregar a tarefa
   ========================================================= */
async function carregarTarefa() {
    if (!tarefaId) {
        window.location.href = "./materias.html";
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/tarefas/${tarefaId}`, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });

        if (res.status === 404) throw new Error("Tarefa não encontrada.");
        if (!res.ok) throw new Error("Erro ao buscar a tarefa.");

        const tarefa = await res.json();
        preencherTarefa(tarefa);

        /* se a URL não trouxe a matéria, pega da própria tarefa */
        materiaId = materiaId || tarefa.materiaId || tarefa.materia?.id;
        configurarLinkMateria(tarefa);
    } catch (err) {
        console.error(err);
        elNome.textContent = "Tarefa não encontrada";
        elBreadcrumb.textContent = "Erro";
        elSubtitulo.textContent = err.message;
    }
}

function preencherTarefa(tarefa) {
    document.title = `EstudeAqui - ${tarefa.titulo}`;
    elBreadcrumb.textContent = tarefa.titulo;
    elNome.textContent = tarefa.titulo;
    elSubtitulo.textContent = "Responda cada atividade e clique em Corrigir.";
}

async function configurarLinkMateria(tarefa) {
    if (materiaId) {
        elLinkMateria.href = `./EnterMate.html?materiaId=${encodeURIComponent(materiaId)}`;
    } else {
        elLinkMateria.href = "./materias.html";
    }

    /* nome da matéria: usa o que veio na tarefa ou busca na API */
    if (tarefa.materia?.nome) {
        elLinkMateria.textContent = tarefa.materia.nome;
        return;
    }

    if (!materiaId) return;

    try {
        const res = await fetch(`${BASE_URL}/materias/${materiaId}`, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });
        if (!res.ok) return;
        const materia = await res.json();
        elLinkMateria.textContent = materia.nome;
    } catch (err) {
        console.error(err);
    }
}

/* =========================================================
   Atividades: listar
   ========================================================= */
async function carregarAtividades() {
    try {
        const res = await fetch(`${BASE_URL}/tarefas/${tarefaId}/atividades`, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Erro ao buscar as atividades.");

        atividades = await res.json();
        atualizarTela();
    } catch (err) {
        console.error(err);
        elEstadoTexto.textContent = "Não foi possível carregar as atividades.";
        mostrarErroEstado(err.message);
    }
}

function mostrarErroEstado(msg) {
    elEstadoErro.textContent = msg;
    elEstadoErro.hidden = !msg;
}

/* decide o que mostrar: estado vazio ou lista */
function atualizarTela() {
    const temAtividades = atividades.length > 0;

    elEstado.hidden = temAtividades;
    elProgresso.hidden = !temAtividades;
    elBarraFiltros.hidden = !temAtividades;

    if (!temAtividades) {
        elEstadoTexto.textContent = "Esta tarefa ainda não tem atividades.";
        btnGerar.hidden = false;
        elLista.replaceChildren();
        return;
    }

    atualizarProgresso();
    atualizarFiltros();
    renderizarAtividades();
}

/* =========================================================
   Atividades: gerar
   ========================================================= */
async function gerarAtividades(substituir) {
    const botao = substituir ? btnRegerar : btnGerar;
    const textoOriginal = botao.innerHTML;

    botao.disabled = true;
    botao.textContent = "Gerando...";
    mostrarErroEstado("");

    try {
        const res = await fetch(`${BASE_URL}/tarefas/${tarefaId}/atividades/gerar`, {
            method: "POST",
            credentials: "include",
            headers: getHeaders(),
            body: JSON.stringify({ substituir })
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || "Erro ao gerar as atividades.");
        }

        atividades = await res.json();
        filtroAtual = "todas";
        atualizarTela();
    } catch (err) {
        console.error(err);
        elEstado.hidden = false;
        mostrarErroEstado(err.message);
    } finally {
        botao.disabled = false;
        botao.innerHTML = textoOriginal;
        lucide.createIcons();
    }
}

btnGerar.addEventListener("click", () => gerarAtividades(false));

btnRegerar.addEventListener("click", () => {
    if (!confirm("Gerar novas atividades? As atuais e suas respostas serão apagadas.")) return;
    gerarAtividades(true);
});

/* =========================================================
   Progresso e filtros
   ========================================================= */
function contar() {
    const total = atividades.length;
    const corretas = atividades.filter((a) => a.resultado === "correta").length;
    const parciais = atividades.filter((a) => a.resultado === "parcial").length;
    const incorretas = atividades.filter((a) => a.resultado === "incorreta").length;
    const respondidas = corretas + parciais + incorretas;

    return {
        total,
        corretas,
        parciais,
        incorretas,
        respondidas,
        pendentes: total - respondidas
    };
}

function atualizarProgresso() {
    const c = contar();
    const pct = c.total ? Math.round((c.respondidas / c.total) * 100) : 0;

    elProgressoResumo.textContent = `${c.respondidas} de ${c.total} respondidas`;
    elProgressoAcertos.textContent = `${c.corretas} ${c.corretas === 1 ? "acerto" : "acertos"}`;
    elProgressoPreenchido.style.width = `${pct}%`;
    elProgressoBarra.setAttribute("aria-valuenow", String(pct));
}

function atualizarFiltros() {
    const c = contar();
    const textos = {
        todas: `Todas (${c.total})`,
        pendente: `Pendentes (${c.pendentes})`,
        correta: `Acertos (${c.corretas})`,
        parcial: `Parciais (${c.parciais})`,
        incorreta: `Erros (${c.incorretas})`
    };

    botoesFiltro.forEach((btn) => {
        btn.textContent = textos[btn.dataset.filtro];
        btn.classList.toggle("ativo", btn.dataset.filtro === filtroAtual);
    });
}

botoesFiltro.forEach((btn) => {
    btn.addEventListener("click", () => {
        filtroAtual = btn.dataset.filtro;
        atualizarFiltros();
        renderizarAtividades();
    });
});

/* =========================================================
   Atividades: desenhar
   ========================================================= */
function renderizarAtividades() {
    elLista.replaceChildren();

    atividades.forEach((atividade, indice) => {
        if (filtroAtual !== "todas" && statusDe(atividade) !== filtroAtual) return;
        elLista.appendChild(criarCard(atividade, indice));
    });

    if (!elLista.children.length) {
        const vazio = document.createElement("p");
        vazio.className = "vazio";
        vazio.textContent = "Nenhuma atividade neste filtro.";
        elLista.appendChild(vazio);
    }
}

function criarCard(atividade, indice) {
    const status = statusDe(atividade);
    const jaCorrigida = status !== "pendente";

    const card = document.createElement("article");
    card.className = "atividade";
    card.dataset.resultado = status;

    /* topo: pergunta + selo */
    const topo = document.createElement("div");
    topo.className = "atividade-topo";

    const pergunta = document.createElement("p");
    pergunta.className = "atividade-pergunta";

    const numero = document.createElement("span");
    numero.className = "atividade-numero";
    numero.textContent = `${indice + 1}.`;

    pergunta.append(numero, document.createTextNode(atividade.pergunta));
    topo.appendChild(pergunta);

    if (jaCorrigida) {
        const selo = document.createElement("span");
        selo.className = `selo ${status}`;
        selo.textContent = ROTULOS[status];
        topo.appendChild(selo);
    }

    /* resposta */
    const campo = document.createElement("textarea");
    campo.placeholder = "Escreva sua resposta...";
    campo.maxLength = 2000;
    campo.value = atividade.respostaUsuario || "";
    campo.setAttribute("aria-label", `Resposta da atividade ${indice + 1}`);

    /* feedback (textContent = seguro contra XSS) */
    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.setAttribute("role", "status");
    feedback.hidden = !atividade.feedback;
    feedback.textContent = atividade.feedback || "";

    /* rodapé: botão corrigir */
    const rodape = document.createElement("div");
    rodape.className = "atividade-rodape";

    const dica = document.createElement("span");
    dica.className = "dica";
    dica.textContent = jaCorrigida
        ? "Você pode editar a resposta e corrigir de novo."
        : "Respostas com outras palavras também valem.";

    const botoes = document.createElement("div");
    botoes.className = "atividade-botoes";

    const btnCorrigir = document.createElement("button");
    btnCorrigir.type = "button";
    btnCorrigir.className = "add-materia";
    btnCorrigir.textContent = jaCorrigida ? "Corrigir de novo" : "Corrigir";
    btnCorrigir.addEventListener("click", () =>
        corrigir(atividade, campo, btnCorrigir, feedback)
    );

    botoes.appendChild(btnCorrigir);
    rodape.append(dica, botoes);

    card.append(topo, campo, feedback, rodape);
    return card;
}

/* =========================================================
   Corrigir resposta
   ========================================================= */
async function corrigir(atividade, campo, botao, elFeedback) {
    const resposta = campo.value.trim();

    if (!resposta) {
        elFeedback.hidden = false;
        elFeedback.textContent = "Escreva uma resposta antes de corrigir.";
        campo.focus();
        return;
    }

    const textoOriginal = botao.textContent;
    botao.disabled = true;
    campo.disabled = true;
    botao.textContent = "Corrigindo...";

    try {
        const res = await fetch(`${BASE_URL}/atividades/${atividade.id}/corrigir`, {
            method: "POST",
            credentials: "include",
            headers: getHeaders(),
            body: JSON.stringify({ resposta })
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || "Erro ao corrigir a resposta.");
        }

        const correcao = await res.json();

        /* guarda localmente e redesenha */
        atividade.respostaUsuario = resposta;
        atividade.resultado = correcao.resultado;
        atividade.feedback = correcao.feedback;

        atualizarProgresso();
        atualizarFiltros();
        renderizarAtividades();
    } catch (err) {
        console.error(err);
        elFeedback.hidden = false;
        elFeedback.textContent = err.message;
        botao.disabled = false;
        campo.disabled = false;
        botao.textContent = textoOriginal;
    }
}

/* ===== Inicialização ===== */
carregarTarefa();
carregarAtividades();