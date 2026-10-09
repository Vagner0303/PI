(async function () {
    const alvo = document.getElementById("horas-semana-valor");
    if (!alvo) return;
    try {
        const resp = await fetch("http://localhost:3000/desempenho", { credentials: "include" });
        if (!resp.ok) return;
        const { horas_semana } = await resp.json();
        const min = Math.round(horas_semana * 60);
        alvo.textContent = `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}min`;
    } catch {}
})();