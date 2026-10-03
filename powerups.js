// Powerups: orbes de congelación y fantasmas, y el estado de sus efectos activos.
const Powerups = {
    list: [],
    freezeActive: false,
    freezeTimer: 0,
    ghostActive: false,
    ghostTimer: 0,

    reset() {
        this.list = [];
        this.freezeActive = false;
        this.freezeTimer = 0;
        this.ghostActive = false;
        this.ghostTimer = 0;
    },

    spawn(x, y) {
        const type = Math.random() < 0.5 ? 'freeze' : 'ghost';
        this.list.push({
            x, y,
            size: CONFIG.powerups.size,
            type,
            color: type === 'freeze' ? '#00ffff' : '#9b30ff',
            pulse: 0
        });
    },

    // Cuenta atrás de los efectos activos
    updateTimers() {
        if (this.freezeActive) {
            this.freezeTimer--;
            if (this.freezeTimer <= 0) {
                this.freezeActive = false;
                UI.refreshPowerups();
                Zombies.list.forEach(z => z.frozen = false);
            }
        }

        if (this.ghostActive) {
            this.ghostTimer--;
            if (this.ghostTimer <= 0) {
                this.ghostActive = false;
                UI.refreshPowerups();
            }
        }
    },

    activate(type) {
        if (type === 'freeze') {
            this.freezeActive = true;
            this.freezeTimer = CONFIG.powerups.freezeFrames;
            Zombies.list.forEach(z => z.frozen = true);
        } else {
            this.ghostActive = true;
            this.ghostTimer = CONFIG.powerups.ghostFrames;
        }
        UI.refreshPowerups();
    },

    update() {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const powerup = this.list[i];
            powerup.pulse += 0.1;

            const collected = Players.list.some(p =>
                p.active && p.alive &&
                Math.hypot(p.x - powerup.x, p.y - powerup.y) < p.size / 2 + powerup.size
            );

            if (collected) {
                playPowerupSFX();
                Particles.create(powerup.x, powerup.y, powerup.color, 20);
                this.activate(powerup.type);
                this.list.splice(i, 1);
                continue;
            }

            if (powerup.x < 0 || powerup.x > canvas.width || powerup.y < 0 || powerup.y > canvas.height) {
                this.list.splice(i, 1);
            }
        }
    },

    draw() {
        for (const powerup of this.list) {
            const pulseSize = powerup.size + Math.sin(powerup.pulse) * 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = powerup.color;
            ctx.fillStyle = powerup.color;
            ctx.beginPath();
            ctx.arc(powerup.x, powerup.y, pulseSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(powerup.type === 'freeze' ? '❄️' : '👻', powerup.x, powerup.y);
        }
    }
};
