const botaoAddData = document.querySelector(".add-data");
const dropdown = document.querySelector(".cronograma-dropdown");
const botaoFechar = document.querySelector(".fechar-btn");

function abrirDropdown() {
    dropdown.classList.add("open");
}

function fecharDropdown() {
    dropdown.classList.remove("open");
}

botaoAddData.addEventListener("click", function (event) {
    event.preventDefault(); // evita que o link recarregue a página (href="")
    dropdown.classList.toggle("open");
});

if (botaoFechar) {
    botaoFechar.addEventListener("click", function (event) {
        event.preventDefault();
        fecharDropdown();
    });
}

document.addEventListener("click", function (event) {
    const cliqueForaDoDropdown = !dropdown.contains(event.target);
    const cliqueForaDoBotao = !botaoAddData.contains(event.target);

    if (cliqueForaDoDropdown && cliqueForaDoBotao) {
        fecharDropdown();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        fecharDropdown();
    }
});