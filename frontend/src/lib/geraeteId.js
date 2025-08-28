export function holeOderErzeugeGeraeteId() {
    let id = localStorage.getItem("lc_geraete_id");
    if (!id) {
        id = (self.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + "-" + Date.now();
        localStorage.setItem("lc_geraete_id", id);
    }
    return id;
}

export function geraeteName() {
    return navigator.userAgent || "Unbekanntes Gerät";
}
