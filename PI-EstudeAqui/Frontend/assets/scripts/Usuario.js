/* Id do usuário logado.
   O token fica em cookie httpOnly (o JS não consegue ler),
   então o id é gravado no localStorage durante o login. */
function getUsuarioId() {
    return localStorage.getItem("usuarioId") || "anonimo";
}

/* Chave do localStorage com as últimas matérias acessadas (separada por usuário) */
function chaveUltimasMaterias() {
    return `ultimasMaterias_${getUsuarioId()}`;
}

/* Chame no login, depois de receber a resposta do backend */
function salvarUsuarioLogado(user) {
    if (user && user.id !== undefined) {
        localStorage.setItem("usuarioId", String(user.id));
    }
}

/* Chame no logout */
function limparUsuarioLogado() {
    localStorage.removeItem("usuarioId");
}