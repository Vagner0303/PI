const botaoAddData = document.querySelector(".add-data");
const dropdown = document.querySelector(".cronograma-dropdown");

botaoAddData.addEventListener("click", function(event) {
    event.preventDefault(); // evita que o link recarregue a página (href="")
    dropdown.classList.toggle("open");
});

document.addEventListener("click", function(event) {
    const cliqueForaDoDropdown = !dropdown.contains(event.target);
    const cliqueForaDoBotao = !botaoAddData.contains(event.target);

    if (cliqueForaDoDropdown && cliqueForaDoBotao) {
        dropdown.classList.remove("open");
    }
});