// Player: clase del jugador y el objeto Players que los actualiza y dibuja.
class Player {
    constructor(id, x, color, laserColor) {
        this.id = id;
        this.x = x;
        this.y = canvas.height / 2;
        this.size = CONFIG.player.size;
        this.speed = CONFIG.player.speed;
        this.color = color;
        this.laserColor = laserColor;
        this.angle = 0;
        this.score = 0;
        this.lives = CONFIG.player.lives;
        this.hitCooldown = 0;
        this.lastShot = 0;
    }

    get alive() { return this.lives > 0; }

    // El jugador 2 solo participa en modo de 2 jugadores
    get active() { return this.id === 1 || numPlayers === 2; }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.score = 0;
        this.lives = CONFIG.player.lives;
        this.hitCooldown = 0;
    }

    clampToScreen() {
        this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
    }

    shoot() {
        if (!this.alive || !this.active) return;
        const now = Date.now();
        if (now - this.lastShot < CONFIG.weapon.cooldownMs) return;
        this.lastShot = now;
        Projectiles.fireLaser(this);
        playLaserSFX();
    }

    draw() {
        if (!this.alive || !this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.shadowBlur = 20; ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(0, -5, this.size / 2 + 12, 10);
        ctx.restore();
    }
}

const player1 = new Player(1, canvas.width / 3, CONFIG.player.p1Color, CONFIG.weapon.p1LaserColor);
const player2 = new Player(2, (canvas.width / 3) * 2, CONFIG.player.p2Color, CONFIG.weapon.p2LaserColor);

const Players = {
    list: [player1, player2],

    // Actualiza movimiento, puntería y disparo. Devuelve cuánto se movió el jugador 1.
    update() {
        let movedX = 0;
        let movedY = 0;

        if (player1.hitCooldown > 0) player1.hitCooldown--;
        if (player2.hitCooldown > 0) player2.hitCooldown--;

        // Jugador 1: teclas configurables + ratón
        if (player1.alive) {
            if (Controls.isDown('p1Up'))    { player1.y -= player1.speed; movedY = -player1.speed; }
            if (Controls.isDown('p1Down'))  { player1.y += player1.speed; movedY = player1.speed; }
            if (Controls.isDown('p1Left'))  { player1.x -= player1.speed; movedX = -player1.speed; }
            if (Controls.isDown('p1Right')) { player1.x += player1.speed; movedX = player1.speed; }
            player1.clampToScreen();

            player1.angle = Math.atan2(Input.mouse.y - player1.y, Input.mouse.x - player1.x);
            if (Input.mouse.down) player1.shoot();
        }

        // Jugador 2: teclas configurables + puntería automática (Bot)
        if (numPlayers === 2 && player2.alive) {
            if (Controls.isDown('p2Up'))    player2.y -= player2.speed;
            if (Controls.isDown('p2Down'))  player2.y += player2.speed;
            if (Controls.isDown('p2Left'))  player2.x -= player2.speed;
            if (Controls.isDown('p2Right')) player2.x += player2.speed;
            player2.clampToScreen();

            Bot.aim(player2);
        }

        if (Controls.isDown('p2Shoot')) player2.shoot(); // mantener = disparo continuo

        return { movedX, movedY };
    },

    draw() {
        player1.draw();
        player2.draw();
    }
};
