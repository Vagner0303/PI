const API = "http://localhost:3000";
const MINUTOS_EIXO = 4 * 60; // topo do eixo Y (4h)

function formatarMinutos(total) {
    const min = Math.round(total);
    return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}min`;
}

function esc(texto) {
    const el = document.createElement("span");
    el.textContent = texto;
    return el.innerHTML;
}

async function carregarDesempenho() {
    try {
        const resp = await fetch(`${API}/desempenho`, { credentials: "include" });
        if (!resp.ok) throw new Error();
        const d = await resp.json();

        document.getElementById("horas-estudadas").textContent = formatarMinutos(d.horas_semana * 60);
        document.getElementById("taxa-acertos").textContent = `${d.taxa_acertos}%`;
        document.getElementById("taxa-erros").textContent = `${d.taxa_erros}%`;

        const grafico = document.querySelector(".grafico-barras");
        grafico.querySelectorAll(".barra-coluna").forEach((el) => el.remove());
        d.dias.forEach((dia) => {
            const altura = Math.min(100, (dia.minutos / MINUTOS_EIXO) * 100);
            const coluna = document.createElement("div");
            coluna.className = "barra-coluna";
            coluna.innerHTML = `<div class="barra" style="height:${altura}%" title="${formatarMinutos(dia.minutos)}"></div>`;
            grafico.appendChild(coluna);
        });

        const corpo = document.querySelector("#tabela-desempenho tbody");
        if (!d.materias.length) {
            corpo.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#9ca3af;padding:24px;">Nenhuma matéria criada</td></tr>`;
            return;
        }
        corpo.innerHTML = d.materias.map((m) => `
            <tr>
                <td><div class="materia-nome">${esc(m.materia)}</div></td>
                <td class="col-progresso">
                    <div class="progresso-linha">
                        <div class="meta-barra"><div class="meta-progresso" style="width:${m.percentual}%"></div></div>
                        <span class="valor-porc">${m.percentual}%</span>
                    </div>
                </td>
                <td>${m.acertos}/${m.total}</td>
            </tr>`).join("");
    } catch {
        document.getElementById("erro-desempenho").textContent = "Não foi possível carregar o desempenho.";
    }
}

carregarDesempenho();