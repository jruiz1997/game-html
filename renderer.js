// Canvas y Renderer: fondo con rejilla y orden de dibujado de todos los objetos.
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const Renderer = {
    gridOffsetX: 0,
    gridOffsetY: 0,

    // Mueve la rejilla de fondo (efecto de profundidad)
    scroll(movedX, movedY) {
        this.gridOffsetX -= movedX * 0.4 + 0.6;
        this.gridOffsetY -= movedY * 0.4 + 0.4;
    },

    drawGrid(size, offsetX, offsetY, color, lineWidth) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        for (let x = offsetX; x < canvas.width; x += size) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = offsetY; y < canvas.height; y += size) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
    },

    drawBackground() {
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const far = 90;
        this.drawGrid(far, this.gridOffsetX * 0.5 % far, this.gridOffsetY * 0.5 % far,
            'rgba(255, 0, 255, 0.04)', 1);

        const near = 50;
        this.drawGrid(near, this.gridOffsetX % near, this.gridOffsetY % near,
            'rgba(0, 255, 255, 0.12)', 1.5);
    },

    draw() {
        this.drawBackground();
        if (!gameRunning) return;

        Players.draw();
        Powerups.draw();
        GhostAllies.draw();
        Projectiles.draw();
        Zombies.draw();
        Particles.draw();
    }
};
