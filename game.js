// revisar codigo).
// Game: inicio, fin de partida, actualización y bucle principal.
let gameRunning = false;

const Game = {
    start() {
        initAudioContext();
        gameRunning = true;

        Waves.reset();
        Powerups.reset();
        Zombies.reset();
        Projectiles.reset();
        Particles.reset();
        GhostAllies.reset();

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        player1.reset(cx, cy);

        if (numPlayers === 1) {
            player2.lives = 0;
        } else {
            player1.x = canvas.width / 3;
            player2.reset((canvas.width / 3) * 2, cy);
        }

        UI.showHud();
        UI.update();
        UI.hideScreens();
        Controls.setButtonVisible(false);

        if (musicPlaying) startProceduralMusic();
    },

    gameOver() {
        gameRunning = false;
        Controls.setButtonVisible(true);
        stopProceduralMusic();
        playHitSFX();
        UI.showGameOver();
    },

    // Termina la partida si ya no queda ningún jugador vivo
    checkGameOver() {
        const allDead = player1.lives <= 0 && (numPlayers === 1 || player2.lives <= 0);
        if (allDead) this.gameOver();
    },

    update() {
        if (!gameRunning) return;

        Powerups.updateTimers();
        const { movedX, movedY } = Players.update();
        Renderer.scroll(movedX, movedY);
        Projectiles.update();
        Powerups.update();
        GhostAllies.update();
        Zombies.update();
        Particles.update();
    },

    // Bucle de paso fijo: va igual de rápido en monitores de 60, 120 o 144 Hz
    lastFrameTime: performance.now(),
    accumulator: 0,

    loop(now) {
        Game.accumulator += Math.min(now - Game.lastFrameTime, 100);
        Game.lastFrameTime = now;
        while (Game.accumulator >= CONFIG.stepMs - 1) {
            Game.update();
            Game.accumulator -= CONFIG.stepMs;
        }
        Renderer.draw();
        requestAnimationFrame(Game.loop);
    },

    init() {
        UI.el.startBtn.addEventListener('click', () => Game.start());
        UI.el.restartBtn.addEventListener('click', () => Game.start());
        requestAnimationFrame(Game.loop);
    }
};

Game.init();
