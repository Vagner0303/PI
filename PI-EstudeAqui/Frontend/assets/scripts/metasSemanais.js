(() => {
    const baseApi = 'http://localhost:3000';

    const valor = document.getElementById('meta-semanal-valor');
    const legenda = document.getElementById('meta-semanal-legenda');
    const barra = document.getElementById('meta-semanal-barra');
    if (!valor || !barra) return;

    async function carregarResumo() {
        try {
            const resposta = await fetch(`${baseApi}/metas/resumo-semanal`, { credentials: 'include' });
            if (!resposta.ok) return;

            const { total, concluidas, percentual } = await resposta.json();

            valor.textContent = `${percentual}%`;
            barra.style.width = `${percentual}%`;
            legenda.textContent = total === 0
                ? 'Nenhuma meta semanal esta semana'
                : `${concluidas} de ${total} metas concluídas`;
        } catch (erro) {
            console.error('Erro ao carregar metas semanais:', erro);
        }
    }

    carregarResumo();
})();