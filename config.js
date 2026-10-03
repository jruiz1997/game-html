// CONFIG: todos los números ajustables del juego en un solo lugar.
const CONFIG = {
    stepMs: 1000 / 60,            // paso fijo del bucle (60 actualizaciones por segundo)

    player: {
        size: 32,
        speed: 5.5,
        lives: 3,
        hitCooldown: 60,          // frames de inmunidad tras recibir daño
        p1Color: '#00ffff',
        p2Color: '#ff00ff'
    },

    weapon: {
        cooldownMs: 130,
        laserSpeed: 16,
        laserSize: 8,
        p1LaserColor: '#ffff00',
        p2LaserColor: '#00ffff'
    },

    waves: {
        firstTarget: 10,          // zombis a matar en la oleada 1
        targetGrowth: 1.4,        // multiplicador de la meta por oleada
        specialEvery: 3           // cada cuántas oleadas sale un zombi especial
    },

    zombies: {
        spawnMargin: 60,
        normal: { size: 28, baseSpeed: 2.0, speedPerWave: 0.3, color: '#00ff66', reward: 100 },
        tiers: [                  // zombis especiales según la oleada
            { maxWave: 3,        name: 'Zombi Blindado', health: 50,  color: '#ffff00', size: 38, speed: 1.5, reward: 500 },
            { maxWave: 6,        name: 'Zombi Mutante',  health: 100, color: '#ff8800', size: 48, speed: 1.3, reward: 1000 },
            { maxWave: Infinity, name: 'Zombi Titán',    health: 800, color: '#ff0055', size: 75, speed: 0.8, reward: 5000, shoots: true }
        ],
        titanRocket: { cooldown: 180, speed: 5, size: 12 },
        spawnRate: { base: 80, perWave: 7, min: 20 },   // frames entre apariciones
        powerupDropChance: 0.05
    },

    powerups: {
        size: 20,
        freezeFrames: 600,        // 10 s
        ghostFrames: 900          // 15 s
    },

    ghosts: {
        speed: 3.5,
        lifeNormal: 480,          // 8 s
        lifeSpecial: 900,         // 15 s
        damageNormal: 1,
        damageSpecial: 5,
        attackCooldown: 10,
        hitCooldown: 30,
        rocket: { cooldown: 180, firstCooldown: 60, speed: 8, size: 12, damage: 100 }
    }
};
