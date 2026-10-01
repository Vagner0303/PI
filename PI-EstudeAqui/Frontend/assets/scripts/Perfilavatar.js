// Upload e remoção da foto de perfil (página de configurações).
// Arquivo separado para NÃO sobrescrever o config.js, que controla o tema.
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('avatar-input');
    const botaoSelecionar = document.querySelector('.botao-selecionar-foto');
    const botaoRemover = document.querySelector('.botao-remover-foto');
    const preview = document.querySelector('.avatar2');
    if (!input || !botaoSelecionar || !preview) return;

    const MAX_BYTES = 2 * 1024 * 1024;
    const TIPOS = ['image/png', 'image/jpeg'];

    // Procura o JWT nas chaves mais comuns (localStorage e sessionStorage).
    // Quando descobrir a chave certa do seu login, deixe só ela aqui.
    const CHAVES_TOKEN = ['token', 'authToken', 'accessToken', 'jwt', 'access_token'];
    const obterToken = () => {
        for (const chave of CHAVES_TOKEN) {
            const valor = localStorage.getItem(chave) || sessionStorage.getItem(chave);
            if (valor) return valor.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '');
        }
        return null;
    };

    // Só envia Authorization se existir token no storage (evita mandar "Bearer null")
    const cabecalhosAuth = () => {
        const token = obterToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    botaoSelecionar.addEventListener('click', () => input.click());

    input.addEventListener('change', async () => {
        const arquivo = input.files[0];
        if (!arquivo) return;

        if (!TIPOS.includes(arquivo.type)) {
            alert('Escolha uma imagem PNG ou JPG.');
            input.value = '';
            return;
        }
        if (arquivo.size > MAX_BYTES) {
            alert('A imagem deve ter no máximo 2MB.');
            input.value = '';
            return;
        }

        // pré-visualização imediata
        const urlLocal = URL.createObjectURL(arquivo);
        const imagemAnterior = preview.style.backgroundImage;
        preview.style.backgroundImage = `url("${urlLocal}")`;

        const formData = new FormData();
        formData.append('avatar', arquivo);

        botaoSelecionar.disabled = true;
        let manterPreview = false;
        try {
            const resp = await fetch(`${window.AVATAR_API_URL}/users/avatar`, {
                method: 'POST',
                headers: cabecalhosAuth(), // NÃO defina Content-Type
                credentials: 'include',    // envia o cookie de login (HttpOnly), se o seu login usar cookie
                body: formData
            });

            let dados = {};
            try { dados = await resp.json(); } catch (_) {}
            console.log('[avatar] resposta do servidor:', resp.status, dados);

            if (!resp.ok) {
                throw new Error(`Falha ao enviar (status ${resp.status}): ` +
                    (dados.message || dados.erro || 'sem mensagem do servidor'));
            }
            if (!dados.avatar_url) {
                throw new Error('O servidor respondeu OK, mas não devolveu avatar_url.');
            }

            // Só troca a pré-visualização pela foto do servidor se ela realmente carregar
            const urlFinal = `${window.AVATAR_API_URL}${dados.avatar_url}`;
            await new Promise((resolve) => {
                const teste = new Image();
                teste.onload = () => {
                    console.log('[avatar] imagem do servidor CARREGOU:', urlFinal);
                    aplicarAvatar(dados.avatar_url);
                    resolve();
                };
                teste.onerror = () => {
                    console.error('[avatar] imagem do servidor NÃO carregou:', urlFinal);
                    manterPreview = true; // mantém a prévia local na tela
                    alert('A foto foi enviada, mas o servidor não conseguiu entregá-la.\n' +
                          'Abra esta URL no navegador para ver o erro:\n' + urlFinal);
                    resolve();
                };
                teste.src = urlFinal;
            });
        } catch (e) {
            console.error('[avatar] falhou:', e);
            alert(e.message);
            preview.style.backgroundImage = imagemAnterior;
        } finally {
            botaoSelecionar.disabled = false;
            input.value = '';
            if (!manterPreview) URL.revokeObjectURL(urlLocal);
        }
    });

    if (botaoRemover) {
        botaoRemover.addEventListener('click', async () => {
            if (!confirm('Remover a sua foto de perfil?')) return;

            botaoRemover.disabled = true;
            try {
                const resp = await fetch(`${window.AVATAR_API_URL}/users/avatar`, {
                    method: 'DELETE',
                    headers: cabecalhosAuth(),
                    credentials: 'include'
                });
                const dados = await resp.json();
                if (!resp.ok) throw new Error(dados.message || dados.erro || 'Erro ao remover a foto.');

                // recarrega para voltar à inicial/cor padrão definida pelo usuario.js
                location.reload();
            } catch (e) {
                alert(e.message);
                botaoRemover.disabled = false;
            }
        });
    }
});