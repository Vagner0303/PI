// Compartilhado entre as páginas. Ajuste a URL do seu backend.
// Se o seu projeto já define uma constante de URL da API em outro script, use a mesma aqui.
window.AVATAR_API_URL = window.AVATAR_API_URL || 'http://localhost:3000';

// Aplica (ou remove) a foto em todos os avatares da página
function aplicarAvatar(url) {
    document.querySelectorAll('.avatar, .avatar2').forEach(el => {
        if (url) {
            el.style.backgroundImage = `url("${window.AVATAR_API_URL}${url}")`;
            el.textContent = ''; // remove a inicial do nome, se houver
        } else {
            el.style.backgroundImage = '';
        }
    });
}

// Chame quando os dados do usuário chegarem do backend:
//   aplicarAvatar(usuario.avatar_url);