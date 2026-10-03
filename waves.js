// Waves: progreso de oleadas y conteo de zombis eliminados.
const Waves = {
    number: 1,
    killed: 0,
    toKill: CONFIG.waves.firstTarget,
    bossSpawned: false,

    reset() {
        this.number = 1;
        this.killed = 0;
        this.toKill = CONFIG.waves.firstTarget;
        this.bossSpawned = false;
    },

    // Se llama cada vez que muere un zombi; avanza de oleada si se alcanzó la meta
    registerKill() {
        this.killed++;
        if (this.killed >= this.toKill) {
            this.number++;
            this.killed = 0;
            this.toKill = Math.floor(this.toKill * CONFIG.waves.targetGrowth);
            this.bossSpawned = false; // permite el zombi especial de cada 3 oleadas
        }
    },

    // ¿Toca zombi especial ahora?
    specialDue() {
        return this.number % CONFIG.waves.specialEvery === 0 && !this.bossSpawned;
    }
};
