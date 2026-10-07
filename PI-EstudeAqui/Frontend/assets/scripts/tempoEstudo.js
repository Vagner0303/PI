(function () {
    const API = "http://localhost:3000";
    let materia = "";
    let segundos = 0;

    window.definirMateriaEstudo = (nome) => { materia = nome; };

    setInterval(() => { if (!document.hidden) segundos++; }, 1000);

    function enviar(arredondar) {
        if (!materia) return;
        const minutos = arredondar ? Math.round(segundos / 60) : Math.floor(segundos / 60);
        if (minutos < 1) return;
        segundos = arredondar ? 0 : segundos - minutos * 60;
        fetch(`${API}/desempenho`, {
            method: "POST",
            keepalive: true,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ materia, minutos_estudados: minutos }),
        }).catch(() => { segundos += minutos * 60; });
    }

    setInterval(() => enviar(false), 5 * 60 * 1000);
    document.addEventListener("visibilitychange", () => { if (document.hidden) enviar(false); });
    window.addEventListener("pagehide", () => enviar(true));
})();