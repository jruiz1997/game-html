// GhostAllies: fantasmas aliados que nacen de los zombis muertos con el power-up fantasma.
const GhostAllies = {
    list: [],

    reset() { this.list = []; },

    spawn(zombie) {
        const g = CONFIG.ghosts;
        this.list.push({
            x: zombie.x,
            y: zombie.y,
            size: zombie.size,                                   // mismo tamaño que el zombi
            speed: g.speed,
            life: zombie.isSpecial ? g.lifeSpecial : g.lifeNormal, // los jefes duran más
            color: '#9b30ff',
            health: zombie.maxHealth,                            // misma vida que el zombi
            maxHealth: zombie.maxHealth,
            damage: zombie.isSpecial ? g.damageSpecial : g.damageNormal,
            hitCooldown: 0,
            attackCooldown: 0,
            angle: 0,
            hasBazooka: zombie.shoots,                           // solo el Titán conserva la bazuca
            shootCooldown: g.rocket.firstCooldown
        });
    },

    update() {
        const g = CONFIG.ghosts;

        for (let i = this.list.length - 1; i >= 0; i--) {
            const ghost = this.list[i];
            ghost.life--;
            if (ghost.hitCooldown > 0) ghost.hitCooldown--;
            if (ghost.attackCooldown > 0) ghost.attackCooldown--;

            const closest = Bot.closest(ghost, Zombies.list);
            if (closest) {
                const angle = Math.atan2(closest.y - ghost.y, closest.x - ghost.x);
                ghost.angle = angle;
                ghost.x += Math.cos(angle) * ghost.speed;
                ghost.y += Math.sin(angle) * ghost.speed;

                // Bazuca del Titán fantasma
                if (ghost.hasBazooka) {
                    ghost.shootCooldown--;
                    if (ghost.shootCooldown <= 0) {
                        ghost.shootCooldown = g.rocket.cooldown;
                        Projectiles.rockets.push({
                            x: ghost.x, y: ghost.y,
                            vx: Math.cos(angle) * g.rocket.speed, vy: Math.sin(angle) * g.rocket.speed,
                            size: g.rocket.size, friendly: true, damage: g.rocket.damage
                        });
                        playHitSFX();
                    }
                }

                this.fight(ghost);
            }

            if (ghost.life <= 0 || ghost.health <= 0) {
                Particles.create(ghost.x, ghost.y, '#9b30ff', 12);
                this.list.splice(i, 1);
            }
        }
    },

    // Combate cuerpo a cuerpo contra el primer zombi que toque
    fight(ghost) {
        const g = CONFIG.ghosts;
        for (let j = Zombies.list.length - 1; j >= 0; j--) {
            const zombie = Zombies.list[j];
            if (Math.hypot(ghost.x - zombie.x, ghost.y - zombie.y) >= ghost.size / 2 + zombie.size / 2) continue;

            if (ghost.attackCooldown <= 0) {
                zombie.health -= ghost.damage;
                ghost.attackCooldown = g.attackCooldown;
                Particles.create(zombie.x, zombie.y, '#9b30ff', 4);
            }

            if (zombie.health <= 0) {
                Zombies.rewardAllyKill(zombie);
                Zombies.list.splice(j, 1);
                playExplosionSFX();
            } else if (ghost.hitCooldown <= 0) {
                // el zombi sobrevivió: el fantasma recibe daño
                ghost.health -= zombie.isSpecial ? 10 : 1;
                ghost.hitCooldown = g.hitCooldown;
                Particles.create(ghost.x, ghost.y, '#ffffff', 6);
            }
            break;
        }
    },

    draw() {
        for (const ghost of this.list) {
            ctx.save();
            ctx.globalAlpha = 0.6 + Math.sin(ghost.life * 0.1) * 0.2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = ghost.color;
            ctx.fillStyle = ghost.color;
            ctx.fillRect(ghost.x - ghost.size / 2, ghost.y - ghost.size / 2, ghost.size, ghost.size);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(ghost.x - ghost.size / 2, ghost.y - ghost.size / 2, ghost.size, ghost.size);

            if (ghost.hasBazooka) {
                ctx.translate(ghost.x, ghost.y);
                ctx.rotate(ghost.angle);
                ctx.fillStyle = '#ff3300';
                ctx.fillRect(0, -6, ghost.size / 2 + 18, 12);
            }
            ctx.restore();

            // Barra de vida para fantasmas con más de 1 de vida
            if (ghost.maxHealth > 1) {
                const pct = Math.max(0, ghost.health / ghost.maxHealth);
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#220022';
                ctx.fillRect(ghost.x - ghost.size / 2, ghost.y - ghost.size / 2 - 12, ghost.size, 5);
                ctx.fillStyle = '#9b30ff';
                ctx.fillRect(ghost.x - ghost.size / 2, ghost.y - ghost.size / 2 - 12, ghost.size * pct, 5);
            }
        }
    }
};
