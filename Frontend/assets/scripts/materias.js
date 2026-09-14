/* ===== Modal "Nova matéria" ===== */
const botaoAddMateria = document.querySelector(".add-materia");
const dropdown = document.querySelector(".cronograma-dropdown");
const botaoFechar = document.querySelector(".fechar-btn");

function abrirDropdown() {
    dropdown.classList.add("open");
}

function fecharDropdown() {
    dropdown.classList.remove("open");
}

if (botaoAddMateria && dropdown) {
    botaoAddMateria.addEventListener("click", function (event) {
        event.preventDefault(); // evita que o link recarregue a página (href="")
        dropdown.classList.toggle("open");
    });
}

if (botaoFechar && dropdown) {
    botaoFechar.addEventListener("click", function (event) {
        event.preventDefault();
        fecharDropdown();
    });
}

document.addEventListener("click", function (event) {
    if (!dropdown) return;

    const cliqueForaDoDropdown = !dropdown.contains(event.target);
    const cliqueForaDoBotao = !botaoAddMateria || !botaoAddMateria.contains(event.target);

    if (cliqueForaDoDropdown && cliqueForaDoBotao) {
        fecharDropdown();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        fecharDropdown();
        fecharTodosOsMenusPonto();
    }
});

/* Contador de caracteres da descrição */
const campoConteudo = document.querySelector("#conteudo");
const contador = document.querySelector(".contador");

if (campoConteudo && contador) {
    const max = campoConteudo.getAttribute("maxlength") || 0;

    campoConteudo.addEventListener("input", function () {
        contador.textContent = `${campoConteudo.value.length}/${max} caracteres`;
    });
}

/* ===== Menu de 3 pontos (editar / excluir) de cada card ===== */
const dropdownsPonto = document.querySelectorAll(".dropdown-ponto");

function fecharTodosOsMenusPonto(exceto) {
    dropdownsPonto.forEach(function (dropdownPonto) {
        if (dropdownPonto === exceto) return;
        const menu = dropdownPonto.querySelector(".menu-ponto");
        if (menu) menu.classList.remove("open");
    });
}

dropdownsPonto.forEach(function (dropdownPonto) {
    const menu = dropdownPonto.querySelector(".menu-ponto");
    if (!menu) return;

    dropdownPonto.addEventListener("click", function (event) {
        event.stopPropagation();
        const jaAberto = menu.classList.contains("open");
        fecharTodosOsMenusPonto();
        menu.classList.toggle("open", !jaAberto);
    });

    // evita que clicar dentro do menu (nos botões) feche ele antes da ação
    menu.addEventListener("click", function (event) {
        event.stopPropagation();
    });
});

document.addEventListener("click", function () {
    fecharTodosOsMenusPonto();
});