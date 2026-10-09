(() => {
    const baseApi = 'http://localhost:3000';

    const valor = document.getElementById('materias-criadas-valor');
    if (!valor) return;

    async function carregarTotalMaterias() {
        try {
            const resposta = await fetch(`${baseApi}/materias`, { credentials: 'include' });
            if (!resposta.ok) return;

            const materias = await resposta.json();
            valor.textContent = Array.isArray(materias) ? materias.length : 0;
        } catch (erro) {
            console.error('Erro ao carregar total de matérias:', erro);
        }
    }

    carregarTotalMaterias();
})();