// Zombies: aparición, movimiento, colisiones con jugadores y dibujo.
const Zombies = {
    list: [],
    spawnTimer: 0,

    reset() { this.list = []; },

    spawn() {
        const m = CONFIG.zombies.spawnMargin;
        const edge = Math.floor(Math.random() * 4);
        let x, y;

        if (edge === 0)      { x = Math.random() * canvas.width; y = -m; }
        else if (edge === 1) { x = canvas.width + m; y = Math.random() * canvas.height; }
        else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + m; }
        else                 { x = -m; y = Math.random() * canvas.height; }

        // Zombi especial cada 3 oleadas
        if (Waves.specialDue()) {
            const tier = CONFIG.zombies.tiers.find(t => Waves.number <= t.maxWave);
            this.list.push({
                x, y,
                size: tier.size,
                speed: tier.speed,
                color: tier.color,
                health: tier.health,
                maxHealth: tier.health,
                reward: tier.reward,
                name: tier.name,
                shoots: !!tier.shoots,
                isBoss: true,
                isSpecial: true,
                shootCooldown: 0,
                frozen: Powerups.freezeActive
            });
            Waves.bossSpawned = true;
            return;
        }

        // Zombi normal
        const n = CONFIG.zombies.normal;
        this.list.push({
            x, y,
            size: n.size,
            speed: n.baseSpeed + Waves.number * n.speedPerWave,
            color: n.color,
            health: 1,
            maxHealth: 1,
            reward: n.reward,
            isBoss: false,
            isSpecial: false,
            frozen: Powerups.freezeActive
        });
    },

    // Elige a qué jugador persigue el zombi (el más cercano que siga vivo)
    pickTarget(zombie) {
        let target = player1;
        if (numPlayers === 2) {
            if (!player1.alive) target = player2;
            else if (player2.alive) {
                const d1 = (player1.x - zombie.x) ** 2 + (player1.y - zombie.y) ** 2;
                const d2 = (player2.x - zombie.x) ** 2 + (player2.y - zombie.y) ** 2;
                if (d2 < d1) target = player2;
            }
        }
        return target;
    },

    // Puntos y avance de oleada cuando un aliado mata a un zombi
    rewardAllyKill(zombie) {
        player1.score += zombie.reward;
        Particles.create(zombie.x, zombie.y, '#00ff66', zombie.isBoss ? 40 : 18);
        Waves.registerKill();
        UI.update();
    },

    // Aplica daño al jugador si el zombi lo toca. Devuelve true si hubo golpe.
    tryHitPlayer(p, zombie, index) {
        if (!p.active || !p.alive || p.hitCooldown > 0) return false;
        if (Math.hypot(p.x - zombie.x, p.y - zombie.y) >= p.size / 2 + zombie.size / 2) return false;

        p.lives--;
        p.hitCooldown = CONFIG.player.hitCooldown;
        UI.update();
        Particles.create(p.x, p.y, '#ff0055', 25);
        if (!zombie.isBoss) this.list.splice(index, 1);
        playHitSFX();
        Game.checkGameOver();
        return true;
    },

    update() {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const zombie = this.list[i];
            if (zombie.frozen) continue;

            const target = this.pickTarget(zombie);
            const angle = Math.atan2(target.y - zombie.y, target.x - zombie.x);
            zombie.x += Math.cos(angle) * zombie.speed;
            zombie.y += Math.sin(angle) * zombie.speed;

            // El Zombi Titán dispara una bazuca letal cuando ya está dentro de la pantalla
            if (zombie.shoots && zombie.x > 0 && zombie.x < canvas.width && zombie.y > 0 && zombie.y < canvas.height) {
                zombie.shootCooldown--;
                if (zombie.shootCooldown <= 0) {
                    const r = CONFIG.zombies.titanRocket;
                    zombie.shootCooldown = r.cooldown;
                    Projectiles.rockets.push({
                        x: zombie.x, y: zombie.y,
                        vx: Math.cos(angle) * r.speed, vy: Math.sin(angle) * r.speed,
                        size: r.size
                    });
                    playHitSFX();
                }
            }

            if (this.tryHitPlayer(player1, zombie, i)) continue;
            this.tryHitPlayer(player2, zombie, i);
        }

        // Aparición de nuevos zombis
        this.spawnTimer++;
        const s = CONFIG.zombies.spawnRate;
        const spawnRate = Math.max(s.min, s.base - Waves.number * s.perWave);
        if (this.spawnTimer >= spawnRate) {
            this.spawn();
            this.spawnTimer = 0;
        }
    },

    draw() {
        for (const zombie of this.list) {
            ctx.shadowBlur = zombie.isBoss ? 25 : 18;

            if (zombie.frozen) {
                ctx.shadowColor = '#00ffff';
                ctx.fillStyle = '#66ccff';
            } else {
                ctx.shadowColor = zombie.color;
                ctx.fillStyle = zombie.color;
            }

            ctx.fillRect(zombie.x - zombie.size / 2, zombie.y - zombie.size / 2, zombie.size, zombie.size);

            if (zombie.frozen) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(zombie.x - zombie.size / 3, zombie.y - zombie.size / 3);
                ctx.lineTo(zombie.x + zombie.size / 3, zombie.y + zombie.size / 3);
                ctx.moveTo(zombie.x + zombie.size / 3, zombie.y - zombie.size / 3);
                ctx.lineTo(zombie.x - zombie.size / 3, zombie.y + zombie.size / 3);
                ctx.stroke();
            }

            if (zombie.isSpecial) this.drawHealthBar(zombie);
        }
    },

    drawHealthBar(zombie) {
        const barX = zombie.x - zombie.size;
        const barY = zombie.y - zombie.size - 18;
        const pct = Math.max(0, zombie.health / zombie.maxHealth);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#220000';
        ctx.fillRect(barX, barY, zombie.size * 2, 8);
        ctx.fillStyle = zombie.color;
        ctx.fillRect(barX, barY, zombie.size * 2 * pct, 8);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, zombie.size * 2, 8);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`${zombie.name}: ${zombie.health}/${zombie.maxHealth}`, zombie.x, barY - 7);
    }
};
