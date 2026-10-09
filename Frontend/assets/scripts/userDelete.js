// userDelete.js

document.addEventListener("DOMContentLoaded", () => {
    const btnExcluirConta = document.querySelector(".botao-excluir-conta");

    if (btnExcluirConta) {
        btnExcluirConta.addEventListener("click", async () => {
            const confirmado = confirm(
                "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
            );

            if (!confirmado) return;

            try {
                // Busca o usuário logado
                const meRes = await fetch(`${baseApi}/me`, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                if (!meRes.ok) {
                    alert("Erro ao obter os dados do usuário.");
                    return;
                }

                const me = await meRes.json();

                // Exclui a conta
                const res = await fetch(`${baseApi}/users/${me.user.id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                if (!res.ok) {
                    const erro = await res.text();
                    console.error("Erro:", erro);
                    alert("Não foi possível excluir a conta.");
                    return;
                }

                const data = await res.json();

                console.log(data);

                if (data.success) {
                    alert(data.message);
                    window.location.href = "../pages/login.html";
                } else {
                    alert(data.message);
                }

            } catch (error) {
                console.error(error);
                alert("Erro ao conectar com o servidor.");
            }
        });
    }
});