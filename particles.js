// Particles: partículas de explosión e impacto.
const Particles = {
    list: [],

    reset() { this.list = []; },

    create(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            this.list.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                decay: 0.025 + Math.random() * 0.02,
                color: color
            });
        }
    },

    update() {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const p = this.list[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) this.list.splice(i, 1);
        }
    },

    draw() {
        for (const p of this.list) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillRect(p.x, p.y, 4, 4);
            ctx.globalAlpha = 1.0;
        }
    }
};
