// UI: elementos del DOM, marcador, indicador de power-ups y selector de modo.
let numPlayers = 2;

// Se mantiene como función global porque el HTML la llama (onclick="setGameMode(1)")
function setGameMode(n) {
    numPlayers = n;
    if (n === 1) {
        document.getElementById('mode1Btn').classList.add('selected');
        document.getElementById('mode2Btn').classList.remove('selected');
        document.getElementById('boxP2').style.opacity = '0.3';
    } else {
        document.getElementById('mode2Btn').classList.add('selected');
        document.getElementById('mode1Btn').classList.remove('selected');
        document.getElementById('boxP2').style.opacity = '1';
    }
}

const UI = {
    el: {
        score1: document.getElementById('score1'),
        lives1: document.getElementById('lives1'),
        score2: document.getElementById('score2'),
        lives2: document.getElementById('lives2'),
        hud1: document.getElementById('hud1'),
        hud2: document.getElementById('hud2'),
        wave: document.getElementById('wave'),
        startScreen: document.getElementById('startScreen'),
        gameOverScreen: document.getElementById('gameOverScreen'),
        finalScoresText: document.getElementById('finalScoresText'),
        powerupIndicator: document.getElementById('powerupIndicator'),
        startBtn: document.getElementById('startBtn'),
        restartBtn: document.getElementById('restartBtn')
    },

    update() {
        this.el.score1.textContent = player1.score;
        this.el.lives1.textContent = Math.max(0, player1.lives);
        if (numPlayers === 2) {
            this.el.score2.textContent = player2.score;
            this.el.lives2.textContent = Math.max(0, player2.lives);
        }
        this.el.wave.textContent = Waves.number;
    },

    refreshPowerups() {
        let html = '';
        if (Powerups.freezeActive) html += '<div style="color:#00ffff">❄️ CONGELACIÓN ACTIVA</div>';
        if (Powerups.ghostActive) html += '<div style="color:#9b30ff">👻 FANTASMAS ALIADOS</div>';
        this.el.powerupIndicator.innerHTML = html;
        this.el.powerupIndicator.style.display = html ? 'block' : 'none';
    },

    showHud() {
        this.el.hud2.style.display = numPlayers === 1 ? 'none' : 'block';
    },

    hideScreens() {
        this.el.startScreen.style.display = 'none';
        this.el.gameOverScreen.style.display = 'none';
        this.el.powerupIndicator.style.display = 'none';
    },

    showGameOver() {
        if (numPlayers === 1) {
            this.el.finalScoresText.textContent = `Puntuación: ${player1.score}`;
        } else {
            this.el.finalScoresText.innerHTML = `Puntuación P1: <span id="finalScore1">${player1.score}</span> | Puntuación P2: <span id="finalScore2">${player2.score}</span>`;
        }
        this.el.gameOverScreen.style.display = 'flex';
    }
};
