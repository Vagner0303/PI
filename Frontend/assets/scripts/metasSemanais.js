(async () => {
    const valor = document.getElementById('meta-semanal-valor')
    const legenda = document.getElementById('meta-semanal-legenda')
    const barra = document.getElementById('meta-semanal-barra')
    if (!valor) return

    try {
        const resp = await fetch('http://localhost:3000/metas/resumo-semanal', { credentials: 'include' })
        if (!resp.ok) return

        const { total, concluidas, percentual } = await resp.json()

        valor.textContent = `${percentual}%`
        if (barra) barra.style.width = `${percentual}%`
        if (legenda) {
            legenda.textContent = total === 0
                ? 'Nenhuma meta esta semana'
                : `${concluidas} de ${total} metas concluídas`
        }
    } catch (e) {
        console.error('Erro ao carregar resumo de metas:', e)
    }
})()