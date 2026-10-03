// Input: estado del teclado y del ratón.
const Input = {
    keys: {},
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false },

    clear() {
        for (const k in this.keys) this.keys[k] = false;
        this.mouse.down = false;
    },

    init() {
        window.addEventListener('keydown', (e) => {
            if (Controls.handleKey(e)) return; // el menú de controles consumió la tecla
            Input.keys[e.key] = true;
            Input.keys[e.code] = true;
            if (gameRunning && (Controls.usesCode(e.code) ||
                ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))) {
                e.preventDefault(); // evita scroll y que Espacio active botones enfocados
            }
        });

        window.addEventListener('keyup', (e) => {
            Input.keys[e.key] = false;
            Input.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            Input.mouse.x = e.clientX;
            Input.mouse.y = e.clientY;
        });

        canvas.addEventListener('mousedown', () => {
            Input.mouse.down = true;
            if (gameRunning) player1.shoot();
        });

        window.addEventListener('mouseup', () => { Input.mouse.down = false; });
        window.addEventListener('blur', () => Input.clear());
    }
};

Input.init();
