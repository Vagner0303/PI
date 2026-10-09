(async () => {
    const alvo = document.getElementById('taxa-metas-valor') // AJUSTE para o id do seu HTML
    if (!alvo) return
    try {
        const resp = await fetch('http://localhost:3000/metas/resumo-semanal', { credentials: 'include' })
        if (!resp.ok) return
        const { percentual } = await resp.json()
        alvo.textContent = `${percentual}%`
        const barra = document.getElementById('taxa-metas-barra') // opcional
        if (barra) barra.style.width = `${percentual}%`
    } catch (e) {
        console.error('Erro ao carregar resumo de metas:', e)
    }
})()