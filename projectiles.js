// Projectiles: láseres de los jugadores y cohetes (bazucas enemigas y aliadas).
const Projectiles = {
    lasers: [],
    rockets: [],

    reset() {
        this.lasers = [];
        this.rockets = [];
    },

    fireLaser(player) {
        const w = CONFIG.weapon;
        this.lasers.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(player.angle) * w.laserSpeed,
            vy: Math.sin(player.angle) * w.laserSpeed,
            size: w.laserSize,
            color: player.laserColor,
            owner: player.id
        });
    },

    offScreen(p) {
        return p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height;
    },

    // Un zombi acaba de morir por un láser
    onZombieKilled(zombie, laser, zombieIndex) {
        const owner = laser.owner === 1 ? player1 : player2;
        owner.score += zombie.reward;

        // Si el modo fantasma está activo, el zombi muerto se convierte en aliado
        if (Powerups.ghostActive) GhostAllies.spawn(zombie);

        Particles.create(zombie.x, zombie.y, '#00ff66', zombie.isBoss ? 40 : 18);

        // Probabilidad de soltar un power-up
        if (!zombie.isBoss && Math.random() < CONFIG.zombies.powerupDropChance) {
            Powerups.spawn(zombie.x, zombie.y);
        }

        Zombies.list.splice(zombieIndex, 1);
        playExplosionSFX();
        Waves.registerKill();
        UI.update();
    },

    updateLasers() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            laser.x += laser.vx;
            laser.y += laser.vy;

            if (this.offScreen(laser)) {
                this.lasers.splice(i, 1);
                continue;
            }

            for (let j = Zombies.list.length - 1; j >= 0; j--) {
                const zombie = Zombies.list[j];
                const dist = Math.hypot(laser.x - zombie.x, laser.y - zombie.y);

                if (dist < laser.size / 2 + zombie.size / 2) {
                    zombie.health--;
                    this.lasers.splice(i, 1);
                    Particles.create(zombie.x, zombie.y, zombie.isBoss ? '#ffaa00' : '#ffff00', zombie.isBoss ? 3 : 6);
                    if (zombie.health <= 0) this.onZombieKilled(zombie, laser, j);
                    break;
                }
            }
        }
    },

    updateRockets() {
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            rocket.x += rocket.vx;
            rocket.y += rocket.vy;

            if (this.offScreen(rocket)) {
                this.rockets.splice(i, 1);
                continue;
            }

            // Cohetes aliados: dañan zombis, nunca a los jugadores
            if (rocket.friendly) {
                for (let j = Zombies.list.length - 1; j >= 0; j--) {
                    const z = Zombies.list[j];
                    if (Math.hypot(rocket.x - z.x, rocket.y - z.y) < rocket.size + z.size / 2) {
                        z.health -= rocket.damage;
                        Particles.create(rocket.x, rocket.y, '#9b30ff', 25);
                        playExplosionSFX();
                        if (z.health <= 0) {
                            Zombies.rewardAllyKill(z);
                            Zombies.list.splice(j, 1);
                        }
                        this.rockets.splice(i, 1);
                        break;
                    }
                }
                continue;
            }

            // Cohetes enemigos: matan al jugador de un golpe
            for (const p of Players.list) {
                if (!p.active || !p.alive) continue;
                if (Math.hypot(p.x - rocket.x, p.y - rocket.y) < p.size / 2 + rocket.size / 2) {
                    p.lives = 0;
                    this.rockets.splice(i, 1);
                    Particles.create(p.x, p.y, '#ff0000', 35);
                    playExplosionSFX();
                    UI.update();
                    Game.checkGameOver();
                    break;
                }
            }
        }
    },

    update() {
        this.updateLasers();
        this.updateRockets();
    },

    draw() {
        for (const laser of this.lasers) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = laser.color;
            ctx.fillStyle = laser.color;
            ctx.beginPath();
            ctx.arc(laser.x, laser.y, laser.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const rocket of this.rockets) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = rocket.friendly ? '#9b30ff' : '#ff0000';
            ctx.fillStyle = rocket.friendly ? '#cc66ff' : '#ff3300';
            ctx.beginPath();
            ctx.arc(rocket.x, rocket.y, rocket.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
};
