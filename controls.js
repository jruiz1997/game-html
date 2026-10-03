// Controls: teclas configurables por acción, guardado en el navegador y menú para cambiarlas.
const Controls = {
    defaults: {
        p1Up: 'ArrowUp', p1Down: 'ArrowDown', p1Left: 'ArrowLeft', p1Right: 'ArrowRight',
        p2Up: 'KeyW', p2Down: 'KeyS', p2Left: 'KeyA', p2Right: 'KeyD', p2Shoot: 'Space'
    },
    labels: {
        p1Up: 'Arriba', p1Down: 'Abajo', p1Left: 'Izquierda', p1Right: 'Derecha',
        p2Up: 'Arriba', p2Down: 'Abajo', p2Left: 'Izquierda', p2Right: 'Derecha', p2Shoot: 'Disparar'
    },
    storageKey: 'zombieGameControls',

    map: {},          // acción -> código de tecla (e.code)
    keyNames: {},     // código -> texto a mostrar (respeta el idioma del teclado)
    rebinding: null,  // acción que espera una tecla nueva
    menuOpen: false,
    button: null,
    overlay: null,

    init() {
        this.map = { ...this.defaults };
        this.load();
        this.buildUI();
    },

    load() {
        try {
            const saved = JSON.parse(localStorage.getItem(this.storageKey));
            if (saved && saved.controls) {
                for (const a in this.defaults) {
                    if (typeof saved.controls[a] === 'string') this.map[a] = saved.controls[a];
                }
                this.keyNames = saved.keyNames || {};
            }
        } catch (err) { /* sin almacenamiento: valores por defecto */ }
    },

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify({ controls: this.map, keyNames: this.keyNames }));
        } catch (err) {}
    },

    isDown(action) { return !!Input.keys[this.map[action]]; },
    usesCode(code) { return Object.values(this.map).includes(code); },

    prettyKey(code) {
        if (this.keyNames[code]) return this.keyNames[code];
        const special = {
            Space: 'Espacio', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
            ShiftLeft: 'Shift Izq.', ShiftRight: 'Shift Der.', ControlLeft: 'Ctrl Izq.', ControlRight: 'Ctrl Der.',
            AltLeft: 'Alt Izq.', AltRight: 'Alt Der.', Enter: 'Enter', Tab: 'Tab', Backspace: 'Retroceso'
        };
        if (special[code]) return special[code];
        return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num ');
    },

    // Devuelve true si el menú consumió la tecla
    handleKey(e) {
        if (!this.menuOpen) return false;
        e.preventDefault();
        if (!this.rebinding) return true;

        if (e.code === 'Escape') {
            this.rebinding = null;
            this.render();
            return true;
        }

        // Si otra acción ya usa esa tecla, se intercambian
        for (const other in this.map) {
            if (other !== this.rebinding && this.map[other] === e.code) {
                this.map[other] = this.map[this.rebinding];
            }
        }
        this.map[this.rebinding] = e.code;
        if (e.key && e.key.length === 1) this.keyNames[e.code] = e.key.toUpperCase();
        else delete this.keyNames[e.code];

        this.rebinding = null;
        this.save();
        this.render();
        return true;
    },

    reset() {
        this.map = { ...this.defaults };
        this.keyNames = {};
        this.save();
        this.render();
    },

    setButtonVisible(v) { this.button.style.display = v ? 'block' : 'none'; },

    open() {
        this.menuOpen = true;
        this.rebinding = null;
        this.render();
        this.overlay.style.display = 'flex';
    },

    close() {
        this.menuOpen = false;
        this.rebinding = null;
        this.overlay.style.display = 'none';
        this.button.blur();
    },

    buildUI() {
        this.button = document.createElement('button');
        this.button.textContent = '⚙ CONTROLES';
        this.button.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:9998;padding:10px 16px;' +
            'background:#050508;color:#00ffff;border:2px solid #00ffff;border-radius:6px;cursor:pointer;' +
            'font:bold 14px Arial,sans-serif;box-shadow:0 0 12px #00ffff88;';
        this.button.addEventListener('click', () => Controls.open());
        document.body.appendChild(this.button);

        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:none;align-items:center;' +
            'justify-content:center;background:rgba(0,0,0,0.85);font-family:Arial,sans-serif;';
        document.body.appendChild(this.overlay);
    },

    render() {
        const section = (title, note, actions) => {
            const rows = actions.map(a => {
                const waiting = Controls.rebinding === a;
                return `<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0;">
                    <span>${Controls.labels[a]}</span>
                    <button data-action="${a}" style="min-width:130px;padding:8px 12px;cursor:pointer;border-radius:5px;
                        font:bold 14px Arial;background:${waiting ? '#ffff00' : '#111'};
                        color:${waiting ? '#000' : '#00ffff'};border:2px solid ${waiting ? '#ffff00' : '#00ffff'};">
                        ${waiting ? 'Presiona una tecla…' : Controls.prettyKey(Controls.map[a])}</button></div>`;
            }).join('');
            return `<div style="margin-bottom:18px;"><div style="color:#ff00ff;font-weight:bold;font-size:16px;">${title}</div>
                <div style="color:#888;font-size:12px;margin-bottom:6px;">${note}</div>${rows}</div>`;
        };

        this.overlay.innerHTML = `<div style="background:#0a0a12;border:2px solid #00ffff;border-radius:10px;padding:24px 28px;
            width:360px;max-width:92vw;max-height:90vh;overflow:auto;color:#fff;box-shadow:0 0 30px #00ffff66;">
            <div style="font-size:22px;font-weight:bold;color:#00ffff;margin-bottom:16px;text-align:center;">CONTROLES</div>
            ${section('Jugador 1', 'Apunta y dispara con el ratón', ['p1Up', 'p1Down', 'p1Left', 'p1Right'])}
            ${section('Jugador 2', 'Apunta automáticamente al zombi más cercano', ['p2Up', 'p2Down', 'p2Left', 'p2Right', 'p2Shoot'])}
            <div style="color:#888;font-size:12px;margin-bottom:12px;">Haz clic en una tecla y presiona la nueva.
                Si ya está en uso, se intercambian. Esc cancela.</div>
            <div style="display:flex;gap:10px;">
                <button id="ctrlReset" style="flex:1;padding:10px;cursor:pointer;background:#111;color:#ff8800;
                    border:2px solid #ff8800;border-radius:5px;font:bold 14px Arial;">Restablecer</button>
                <button id="ctrlClose" style="flex:1;padding:10px;cursor:pointer;background:#111;color:#00ff66;
                    border:2px solid #00ff66;border-radius:5px;font:bold 14px Arial;">Cerrar</button>
            </div></div>`;

        this.overlay.querySelectorAll('button[data-action]').forEach(b => {
            b.addEventListener('click', () => { Controls.rebinding = b.dataset.action; Controls.render(); });
        });
        document.getElementById('ctrlReset').addEventListener('click', () => Controls.reset());
        document.getElementById('ctrlClose').addEventListener('click', () => Controls.close());
    }
};

Controls.init();
