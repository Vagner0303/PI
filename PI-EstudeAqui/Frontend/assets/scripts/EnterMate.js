/* ===== Config da API ===== */
const BASE_URL = "http://localhost:3000";
const API_URL = `${BASE_URL}/materias`;

function getHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

/* ===== Pega o id da matéria na URL: EnterMate.html?materiaId=5 ===== */
const params = new URLSearchParams(window.location.search);
const materiaId = params.get("materiaId");

/* ===== Elementos da matéria ===== */
const elBreadcrumb = document.querySelector("#materia-breadcrumb");
const elNome = document.querySelector("#materia-nome");
const elProfessor = document.querySelector("#materia-professor");
const elDescricao = document.querySelector("#materia-descricao");

/* ===== Elementos das tarefas ===== */
const btnAdicionarTarefa = document.querySelector("#btn-adicionar-tarefa");
const dropdownTarefa = document.querySelector("#tarefa-dropdown");
const inputTarefaTitulo = document.querySelector("#tarefa-titulo");
const elTarefaErro = document.querySelector("#tarefa-erro");
const btnSalvarTarefa = document.querySelector("#btn-salvar-tarefa");
const elListaTarefas = document.querySelector("#lista-tarefas");
const elFiltroTodas = document.querySelector("#filtro-todas");

/* ===== Elementos dos links ===== */
const btnAdicionarLink = document.querySelector("#btn-adicionar-link");
const dropdownLink = document.querySelector("#link-dropdown");
const inputLinkNome = document.querySelector("#link-nome");
const inputLinkUrl = document.querySelector("#link-url");
const elLinkErro = document.querySelector("#link-erro");
const btnSalvarLink = document.querySelector("#btn-salvar-link");
const elListaLinks = document.querySelector("#lista-links");

/* ===== Elementos das anotações ===== */
const btnAdicionarNota = document.querySelector("#btn-adicionar-nota");
const dropdownNota = document.querySelector("#nota-dropdown");
const inputNotaTitulo = document.querySelector("#nota-titulo");
const inputNotaTexto = document.querySelector("#nota-texto");
const elNotaErro = document.querySelector("#nota-erro");
const btnSalvarNota = document.querySelector("#btn-salvar-nota");
const elListaNotas = document.querySelector("#lista-notas");

/* ===== Carrega a matéria ===== */
async function carregarMateria() {
    if (!materiaId) {
        window.location.href = "./materias.html";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${materiaId}`, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });

        if (res.status === 404) throw new Error("Matéria não encontrada.");
        if (!res.ok) throw new Error("Erro ao buscar a matéria.");

        const materia = await res.json();
        preencherMateria(materia);
    } catch (err) {
        console.error(err);
        elNome.textContent = "Matéria não encontrada";
        elBreadcrumb.textContent = "Erro";
        elProfessor.textContent = "";
        elDescricao.textContent = err.message;
    }
}

function preencherMateria(materia) {
    document.title = `EstudeAqui - ${materia.nome}`;

    /* textContent já escapa HTML, então é seguro */
    elBreadcrumb.textContent = materia.nome;
    elNome.textContent = materia.nome;
    elProfessor.textContent = materia.professor
        ? `Professor: ${materia.professor}`
        : "Professor não informado";
    elDescricao.textContent = materia.descricao || "";
}

/* =========================================================
   TAREFAS
   ========================================================= */

/* ===== Tarefas: dropdown ===== */
function mostrarErroTarefa(msg) {
    elTarefaErro.textContent = msg;
    elTarefaErro.hidden = !msg;
}

function alternarDropdownTarefa(abrir) {
    dropdownTarefa.hidden = !abrir;

    if (abrir) {
        inputTarefaTitulo.focus();
    } else {
        inputTarefaTitulo.value = "";
        mostrarErroTarefa("");
    }
}

btnAdicionarTarefa.addEventListener("click", (e) => {
    e.stopPropagation();

    /* fecha os outros dropdowns, se estiverem abertos */
    if (!dropdownLink.hidden) alternarDropdown(false);
    if (!dropdownNota.hidden) alternarDropdownNota(false);

    alternarDropdownTarefa(dropdownTarefa.hidden);
});

/* fecha ao clicar fora */
document.addEventListener("click", (e) => {
    if (!dropdownTarefa.hidden && !dropdownTarefa.contains(e.target)) {
        alternarDropdownTarefa(false);
    }
});

/* Enter no input também salva */
inputTarefaTitulo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnSalvarTarefa.click();
});

/* ===== Tarefas: listar ===== */
async function carregarTarefas() {
    try {
        const res = await fetch(`${BASE_URL}/materias/${materiaId}/tarefas`, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Erro ao buscar tarefas.");

        renderizarTarefas(await res.json());
    } catch (err) {
        console.error(err);
        elListaTarefas.textContent = err.message;
    }
}

function renderizarTarefas(tarefas) {
    elListaTarefas.replaceChildren();
    elFiltroTodas.textContent = `Todas (${tarefas.length})`;

    if (tarefas.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "vazio";
        vazio.textContent = "Nenhuma tarefa adicionada ainda.";
        elListaTarefas.appendChild(vazio);
        return;
    }

    tarefas.forEach((tarefa) => {
        const item = document.createElement("div");
        item.className = "tarefa";

        const titulo = document.createElement("span");
        titulo.className = "tarefa-titulo";
        titulo.textContent = tarefa.titulo;

        const acoes = document.createElement("div");
        acoes.className = "tarefa-acoes";

        const entrar = document.createElement("a");
        entrar.href = "#";
        entrar.className = "btn-entrar";
        entrar.textContent = "Entrar";

        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.className = "btn-excluir-link";
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => excluirTarefa(tarefa.id));

        acoes.append(entrar, btnExcluir);
        item.append(titulo, acoes);
        elListaTarefas.appendChild(item);
    });
}

/* ===== Tarefas: excluir ===== */
async function excluirTarefa(id) {
    if (!confirm("Excluir esta tarefa?")) return;

    try {
        const res = await fetch(`${BASE_URL}/tarefas/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Erro ao excluir a tarefa.");

        carregarTarefas();
    } catch (err) {
        alert(err.message);
    }
}

/* ===== Tarefas: criar ===== */
btnSalvarTarefa.addEventListener("click", async () => {
    const titulo = inputTarefaTitulo.value.trim();

    if (!titulo) {
        mostrarErroTarefa("Digite o nome da tarefa.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/materias/${materiaId}/tarefas`, {
            method: "POST",
            credentials: "include",
            headers: getHeaders(),
            body: JSON.stringify({ titulo })
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || "Erro ao criar a tarefa.");
        }

        alternarDropdownTarefa(false);
        carregarTarefas();
    } catch (err) {
        mostrarErroTarefa(err.message);
    }
});

/* =========================================================
   LINKS
   ========================================================= */

/* ===== Links: dropdown ===== */
function mostrarErroLink(msg) {
    elLinkErro.textContent = msg;
    elLinkErro.hidden = !msg;
}

function alternarDropdown(abrir) {
    dropdownLink.hidden = !abrir;

    if (abrir) {
        inputLinkNome.focus();
    } else {
        inputLinkNome.value = "";
        inputLinkUrl.value = "";
        mostrarErroLink("");
    }
}

btnAdicionarLink.addEventListener("click", (e) => {
    e.stopPropagation();

    /* fecha os outros dropdowns, se estiverem abertos */
    if (!dropdownNota.hidden) alternarDropdownNota(false);
    if (!dropdownTarefa.hidden) alternarDropdownTarefa(false);

    alternarDropdown(dropdownLink.hidden);
});

/* fecha o dropdown ao clicar fora dele */
document.addEventListener("click", (e) => {
    if (!dropdownLink.hidden && !dropdownLink.contains(e.target)) {
        alternarDropdown(false);
    }
});

/* ===== Links: listar ===== */
async function carregarLinks() {
    try {
        const res = await fetch(`${BASE_URL}/materias/${materiaId}/links`, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Erro ao buscar links.");

        renderizarLinks(await res.json());
    } catch (err) {
        console.error(err);
        elListaLinks.textContent = err.message;
    }
}

function renderizarLinks(links) {
    elListaLinks.replaceChildren();

    if (links.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "vazio";
        vazio.textContent = "Nenhum link adicionado ainda.";
        elListaLinks.appendChild(vazio);
        return;
    }

    links.forEach((link) => {
        const item = document.createElement("div");
        item.className = "link-item";

        const info = document.createElement("div");
        info.className = "link-info";

        const nome = document.createElement("strong");
        nome.className = "link-nome";
        nome.textContent = link.nome;

        const a = document.createElement("a");
        a.href = link.url;
        a.textContent = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        info.append(nome, a);

        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.className = "btn-excluir-link";
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => excluirLink(link.id));

        item.append(info, btnExcluir);
        elListaLinks.appendChild(item);
    });
}

/* ===== Links: criar ===== */
btnSalvarLink.addEventListener("click", async () => {
    const nome = inputLinkNome.value.trim();
    const url = inputLinkUrl.value.trim();

    if (!nome || !url) {
        mostrarErroLink("Preencha o nome e o link.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/materias/${materiaId}/links`, {
            method: "POST",
            credentials: "include",
            headers: getHeaders(),
            body: JSON.stringify({ nome, url })
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || "Erro ao salvar o link.");
        }

        alternarDropdown(false);
        carregarLinks();
    } catch (err) {
        mostrarErroLink(err.message);
    }
});

/* ===== Links: excluir ===== */
async function excluirLink(id) {
    if (!confirm("Excluir este link?")) return;

    try {
        const res = await fetch(`${BASE_URL}/links/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Erro ao excluir o link.");

        carregarLinks();
    } catch (err) {
        alert(err.message);
    }
}

/* =========================================================
   ANOTAÇÕES
   ========================================================= */

/* ===== Anotações: dropdown ===== */
function mostrarErroNota(msg) {
    elNotaErro.textContent = msg;
    elNotaErro.hidden = !msg;
}

function alternarDropdownNota(abrir) {
    dropdownNota.hidden = !abrir;

    if (abrir) {
        inputNotaTitulo.focus();
    } else {
        inputNotaTitulo.value = "";
        inputNotaTexto.value = "";
        mostrarErroNota("");
    }
}

btnAdicionarNota.addEventListener("click", (e) => {
    e.stopPropagation();

    /* fecha os outros dropdowns, se estiverem abertos */
    if (!dropdownLink.hidden) alternarDropdown(false);
    if (!dropdownTarefa.hidden) alternarDropdownTarefa(false);

    alternarDropdownNota(dropdownNota.hidden);
});

/* fecha ao clicar fora */
document.addEventListener("click", (e) => {
    if (!dropdownNota.hidden && !dropdownNota.contains(e.target)) {
        alternarDropdownNota(false);
    }
});

/* ===== Anotações: listar ===== */
async function carregarAnotacoes() {
    try {
        const res = await fetch(`${BASE_URL}/materias/${materiaId}/anotacoes`, {
            method: "GET",
            credentials: "include",
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Erro ao buscar anotações.");

        renderizarAnotacoes(await res.json());
    } catch (err) {
        console.error(err);
        elListaNotas.textContent = err.message;
    }
}

function formatarData(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderizarAnotacoes(notas) {
    elListaNotas.replaceChildren();

    if (notas.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "vazio";
        vazio.textContent = "Nenhuma anotação adicionada ainda.";
        elListaNotas.appendChild(vazio);
        return;
    }

    notas.forEach((nota) => {
        const article = document.createElement("article");
        article.className = "nota";

        /* topo: ícone + título */
        const topo = document.createElement("header");
        topo.className = "nota-topo";

        const icone = document.createElement("span");
        icone.className = "nota-icone";
        const i = document.createElement("i");
        i.setAttribute("data-lucide", "sticky-note");
        icone.appendChild(i);

        const h3 = document.createElement("h3");
        h3.textContent = nota.titulo;

        topo.append(icone, h3);

        /* texto: cada linha vira um <p> (textContent = seguro contra XSS) */
        const texto = document.createElement("div");
        texto.className = "nota-texto";
        nota.texto
            .split("\n")
            .filter((l) => l.trim() !== "")
            .forEach((linha) => {
                const p = document.createElement("p");
                p.textContent = linha;
                texto.appendChild(p);
            });

        const data = document.createElement("time");
        data.className = "nota-data";
        data.textContent = formatarData(nota.criadaEm);

        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.className = "btn-excluir-link";
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => excluirAnotacao(nota.id));

        article.append(topo, texto, data, btnExcluir);
        elListaNotas.appendChild(article);
    });

    lucide.createIcons(); // desenha os ícones criados dinamicamente
}

/* ===== Anotações: criar ===== */
btnSalvarNota.addEventListener("click", async () => {
    const titulo = inputNotaTitulo.value.trim();
    const texto = inputNotaTexto.value.trim();

    if (!titulo || !texto) {
        mostrarErroNota("Preencha o título e o texto.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/materias/${materiaId}/anotacoes`, {
            method: "POST",
            credentials: "include",
            headers: getHeaders(),
            body: JSON.stringify({ titulo, texto })
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || "Erro ao salvar a anotação.");
        }

        alternarDropdownNota(false);
        carregarAnotacoes();
    } catch (err) {
        mostrarErroNota(err.message);
    }
});

/* ===== Anotações: excluir ===== */
async function excluirAnotacao(id) {
    if (!confirm("Excluir esta anotação?")) return;

    try {
        const res = await fetch(`${BASE_URL}/anotacoes/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Erro ao excluir a anotação.");

        carregarAnotacoes();
    } catch (err) {
        alert(err.message);
    }
}

/* ===== Inicialização ===== */
carregarMateria();
carregarTarefas();
carregarLinks();
carregarAnotacoes();