// Bot: inteligencia de puntería automática (jugador 2 y fantasmas aliados).
const Bot = {
    // Devuelve el objetivo de la lista más cercano a "from", o null si la lista está vacía
    closest(from, targets) {
        if (targets.length === 0) return null;
        let best = targets[0];
        let minDist = (best.x - from.x) ** 2 + (best.y - from.y) ** 2;
        for (let i = 1; i < targets.length; i++) {
            const d = (targets[i].x - from.x) ** 2 + (targets[i].y - from.y) ** 2;
            if (d < minDist) {
                minDist = d;
                best = targets[i];
            }
        }
        return best;
    },

    // Apunta al jugador hacia el zombi más cercano
    aim(player) {
        const target = this.closest(player, Zombies.list);
        player.angle = target ? Math.atan2(target.y - player.y, target.x - player.x) : 0;
        return target;
    }
};
