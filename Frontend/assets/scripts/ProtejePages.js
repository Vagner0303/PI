const baseApi = 'http://localhost:3000'

document.addEventListener("DOMContentLoaded", async () => {

    const res = await fetch(`${baseApi}/me`, {
        credentials: "include"
    })

    if (!res.ok) {
        window.location.href = '../pages/login.html'
        return
    }

    const data = await res.json()

    // Preenche o campo de nome no perfil (span/div, usa textContent)
    const perfilNome = document.querySelector('.perfil-nome')
    if (perfilNome) {
        perfilNome.textContent = capitalizarNome(data.user.name)
    }

    // Preenche o input de nome na config (input, usa .value)
    const nomeConfig = document.querySelector('.nome-config')
    if (nomeConfig) {
        nomeConfig.value = capitalizarNome(data.user.name)
    }

    const avatar = document.querySelector('.avatar')
    if (avatar) {
        avatar.textContent = gerarIniciais(data.user.name)
    }

    const avatar2 = document.querySelector('.avatar2')
    if (avatar2) {
        avatar2.textContent = gerarIniciais(data.user.name)
    }

    // Foto de perfil: se o usuário tiver uma, ela substitui as iniciais
    const avatarUrl = data.user.avatar_url ?? data.user.avatarUrl
    if (avatarUrl) {
        document.querySelectorAll('.avatar, .avatar2').forEach(el => {
            el.style.backgroundImage = `url("${baseApi}${avatarUrl}")`
            el.textContent = ''
        })
    }
})

function capitalizarNome(nome) {
    return nome
        .toLowerCase()
        .split(' ')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
        .join(' ')
}

function gerarIniciais(nome) {
    const palavras = nome.trim().split(' ')

    if (palavras.length === 1) {
        return palavras[0].charAt(0).toUpperCase()
    }

    const primeira = palavras[0].charAt(0)
    const ultima = palavras[palavras.length - 1].charAt(0)

    return (primeira + ultima).toUpperCase()
}

// ===== Tempo de estudo (conta só com a aba visível) =====
;(() => {
    const ENVIAR_A_CADA = 30 // segundos
    let pendente = 0

    setInterval(() => {
        if (document.visibilityState !== 'visible') return
        pendente++
        if (pendente >= ENVIAR_A_CADA) enviar()
    }, 1000)

    function enviar(keepalive = false) {
        if (pendente < 5) return Promise.resolve()
        const segundos = pendente
        pendente = 0
        return fetch(`${baseApi}/desempenho/tempo`, {
            method: 'POST',
            credentials: 'include',
            keepalive,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ segundos })
        }).then((r) => { if (!r.ok) pendente += segundos })
          .catch(() => { pendente += segundos })
    }

    window.enviarTempoAgora = () => enviar()
    window.addEventListener('pagehide', () => enviar(true))
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') enviar(true)
    })
})()