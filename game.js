// Craig Pales Retro Action Game Engine (Simplified, Stable NES Style)

class RetroAudio {
    constructor() {
        this.ctx = null;
    }

    init() {
        try {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        } catch (e) {
            console.warn("Audio Context init blocked or failed:", e);
        }
    }

    playJump() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch(e) {}
    }

    playPunch() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.setValueAtTime(80, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        } catch(e) {}
    }

    playSlice() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const bufferSize = this.ctx.sampleRate * 0.12;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2200, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        } catch(e) {}
    }

    playHurt() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(40, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch(e) {}
    }

    playVictory() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.1, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.25);
            });
        } catch(e) {}
    }

    playGameOver() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const notes = [196.00, 164.81, 130.81, 110.00];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.12, now + idx * 0.22);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.22 + 0.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.22);
                osc.stop(now + idx * 0.22 + 0.4);
            });
        } catch(e) {}
    }

    playGlassShatter() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(2500, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.15);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch(e) {}
    }
}

const gameAudio = new RetroAudio();

// Particles for Slicing Gore
class BloodParticle {
    constructor(x, y, vx, vy, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = '#e63946';
        this.life = 1.0;
        this.decay = 0.02 + Math.random() * 0.03;
    }

    update() {
        this.x += this.vx;
        this.vy += 0.3; // gravity
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Particle for Slicing Fabric & Meat Chunks
class GoreParticle {
    constructor(x, y, vx, vy, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.012 + Math.random() * 0.02;
    }

    update() {
        this.x += this.vx;
        this.vy += 0.35; // gravity
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Draw a jagged, irregular triangle/shard shape
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.size, this.y + this.size * 0.3);
        ctx.lineTo(this.x + this.size * 0.3, this.y + this.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// Sliced debris entities (split in half animation & cartoon meat dismemberment)
class SlicedDebris {
    constructor(x, y, vx, vy, type, part) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.rotation = Math.random() * Math.PI * 2;
        this.vRotation = (Math.random() - 0.5) * 0.25;
        this.type = type; // 'thug' or 'boss'
        this.part = part; // 'top' or 'bottom'
        this.life = 1.0;
        this.onGround = false;
        
        // Randomize the specific meat chunk type (e.g., T-bone steak, round steak with marrow bone, ribs)
        this.meatStyle = Math.floor(Math.random() * 3);
    }

    update() {
        if (!this.onGround) {
            this.x += this.vx;
            this.vy += 0.4; // gravity
            this.y += this.vy;
            this.rotation += this.vRotation;
            
            // Ground bounce/stop
            if (this.y >= 415) {
                this.y = 415 + (Math.random() - 0.5) * 5;
                this.vy = 0;
                this.vx = 0;
                this.vRotation = 0;
                this.onGround = true;
            }
        }
        
        // Slower decay so meat chunks persist on street pavement
        this.life -= 0.008;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.life);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;

        // Render dismembered cartoon meat cuts (steak/chops/ribs)
        if (this.part === 'top') {
            // Draw a T-bone steak / prime rib cut structure
            // Crimson meat outer body
            ctx.fillStyle = '#b31a1a';
            ctx.beginPath();
            ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Outer layer of white fat trimming
            ctx.strokeStyle = '#fbf5eb';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(0, 0, 22, -Math.PI*0.8, Math.PI*0.8);
            ctx.stroke();

            // Bone in the center (classic T-Bone shape)
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.fillStyle = '#f4f1de'; // Bone ivory white
            
            ctx.beginPath();
            // Vertical bar
            ctx.rect(-4, -12, 8, 24);
            // Horizontal crossbar
            ctx.rect(-12, -4, 24, 8);
            ctx.fill();
            ctx.stroke();
            
            // Tiny marrow center
            ctx.fillStyle = '#d4a373';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI*2);
            ctx.fill();

            // Blood droplets on cut surface
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(-12, 6, 3, 0, Math.PI*2);
            ctx.arc(10, -6, 2, 0, Math.PI*2);
            ctx.fill();
        } else {
            // Draw a cartoon round steak ring with a central circular marrow bone
            ctx.fillStyle = '#8a0f0f'; // Darker meat red
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Rib cross sections or fat lining
            ctx.strokeStyle = '#fbf5eb';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI*2);
            ctx.stroke();

            // Central circle hollow bone
            ctx.strokeStyle = '#000000';
            ctx.fillStyle = '#f4f1de'; // Bone
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Hollow marrow hole
            ctx.fillStyle = '#b31a1a'; // Bloody center
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Boss Glass Bottle Projectiles
class BottleProjectile {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.rotation = 0;
        this.vRotation = 0.15;
        this.width = 16;
        this.height = 8;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.vRotation;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#52b788'; // green glass
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        // Draw bottle shape
        ctx.beginPath();
        ctx.rect(-8, -3, 11, 6); // main body
        ctx.rect(3, -1.5, 5, 3); // neck
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// Slice Slash Visual Effect
class SliceSlashEffect {
    constructor(x, y, isKick) {
        this.x = x;
        this.y = y;
        this.isKick = isKick;
        this.points = [];
        this.maxAge = 12;
        this.age = 0;
        
        // Generate a crescent arc path
        const length = isKick ? 120 : 80;
        const angle = isKick ? 0.3 : -0.2;
        for (let i = 0; i < 6; i++) {
            const ratio = i / 5;
            const px = x + Math.cos(angle + (ratio - 0.5) * 1.8) * length * (0.8 + ratio * 0.4);
            const py = y + Math.sin(angle + (ratio - 0.5) * 1.8) * length * 0.4;
            this.points.push({ x: px, y: py });
        }
    }

    update() {
        this.age++;
    }

    draw(ctx) {
        if (this.points.length < 2) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - this.age / this.maxAge);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = this.isKick ? 8 : 5;
        ctx.shadowColor = '#00b4d8';
        ctx.shadowBlur = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }
}

// Main Retro Game Controller Class
class RetroGameController {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas element with ID '${canvasId}' not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        
        // Fix logical coordinate space to avoid resizing artifacts
        this.canvas.width = 800;
        this.canvas.height = 480;

        this.destroyed = false;
        
        // Player stats & state
        this.player = {
            x: 100,
            y: 350, // ground level
            vy: 0,
            vx: 0,
            width: 45,
            height: 75,
            facing: 1, // 1 = right, -1 = left
            state: 'idle', // idle, walking, jumping, attacking, hurt, victory
            stateTimer: 0,
            health: 100,
            score: 0,
            attackType: '', // 'punch' or 'kick'
        };

        this.groundY = 350;
        this.scrollOffset = 0;
        this.levelLength = 2000; // Walk 2000px to reach boss
        this.gameProgress = 0; // 0.0 to 1.0

        // Lists
        this.thugs = [];
        this.boss = null;
        this.projectiles = [];
        this.particles = [];
        this.debris = [];
        this.slashes = [];

        // Game loop states
        this.gameState = 'playing'; // 'start', 'playing', 'gameover', 'victory'
        this.thugSpawnTimer = 0;
        this.keys = {};

        // Bind Controls
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);

        this.bindVirtualButtons();

        // Start Animation Loop
        this.lastTime = performance.now();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    destroy() {
        this.destroyed = true;
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
        this.unbindVirtualButtons();
    }

    handleKeyDown(e) {
        gameAudio.init(); // enable sound on first interaction
        const code = e.code;
        this.keys[code] = true;

        if (this.gameState === 'gameover' || this.gameState === 'victory') {
            this.resetGame();
            return;
        }

        if (code === 'KeyJ' || code === 'KeyZ') {
            this.triggerAttack('punch');
        } else if (code === 'KeyK' || code === 'KeyX') {
            this.triggerAttack('kick');
        }
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    bindVirtualButtons() {
        const bindBtn = (id, actionDown, actionUp) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn._handlerDown = () => { gameAudio.init(); actionDown(); };
                btn._handlerUp = actionUp ? actionUp : () => {};
                btn.addEventListener('mousedown', btn._handlerDown);
                btn.addEventListener('mouseup', btn._handlerUp);
                btn.addEventListener('touchstart', btn._handlerDown, {passive: true});
                btn.addEventListener('touchend', btn._handlerUp, {passive: true});
            }
        };

        bindBtn('btn-left', () => { this.keys['KeyA'] = true; this.keys['ArrowLeft'] = true; }, () => { this.keys['KeyA'] = false; this.keys['ArrowLeft'] = false; });
        bindBtn('btn-right', () => { this.keys['KeyD'] = true; this.keys['ArrowRight'] = true; }, () => { this.keys['KeyD'] = false; this.keys['ArrowRight'] = false; });
        bindBtn('btn-jump', () => { this.keys['Space'] = true; }, () => { this.keys['Space'] = false; });
        bindBtn('btn-punch', () => { this.triggerAttack('punch'); });
        bindBtn('btn-kick', () => { this.triggerAttack('kick'); });
    }

    unbindVirtualButtons() {
        const unbindBtn = (id) => {
            const btn = document.getElementById(id);
            if (btn && btn._handlerDown) {
                btn.removeEventListener('mousedown', btn._handlerDown);
                btn.removeEventListener('mouseup', btn._handlerUp);
                btn.removeEventListener('touchstart', btn._handlerDown);
                btn.removeEventListener('touchend', btn._handlerUp);
            }
        };
        unbindBtn('btn-left');
        unbindBtn('btn-right');
        unbindBtn('btn-jump');
        unbindBtn('btn-punch');
        unbindBtn('btn-kick');
    }

    resetGame() {
        this.player.health = 100;
        this.player.score = 0;
        this.player.x = 100;
        this.player.y = this.groundY;
        this.player.vy = 0;
        this.player.state = 'idle';
        this.scrollOffset = 0;
        this.gameProgress = 0;
        this.thugs = [];
        this.boss = null;
        this.projectiles = [];
        this.particles = [];
        this.debris = [];
        this.slashes = [];
        this.gameState = 'playing';
        this.thugSpawnTimer = 0;
    }

    triggerAttack(type) {
        if (this.player.state === 'hurt' || this.player.state === 'victory') return;
        this.player.state = 'attacking';
        this.player.attackType = type;
        this.player.stateTimer = 10; // attack lasts 10 frames
        
        gameAudio.playPunch();

        // Spawn a slice slash visual effect
        const hitX = this.player.x + (this.player.facing === 1 ? 55 : -15);
        const hitY = this.player.y + 35;
        this.slashes.push(new SliceSlashEffect(hitX, hitY, type === 'kick'));

        // Check Hit Collision
        const range = type === 'kick' ? 75 : 55;
        
        // 1. Check thugs
        for (let i = this.thugs.length - 1; i >= 0; i--) {
            const thug = this.thugs[i];
            const dist = Math.abs((this.player.x + this.player.width/2) - (thug.x + thug.width/2));
            const yDist = Math.abs(this.player.y - thug.y);

            // Facing correct direction check
            const correctDirection = (this.player.facing === 1 && thug.x > this.player.x) ||
                                     (this.player.facing === -1 && thug.x < this.player.x);

            if (dist < range && yDist < 40 && correctDirection) {
                // Slice Thug in half!
                gameAudio.playSlice();
                this.player.score += 100;
                
                // Spawn Gore
                this.spawnGore(thug.x + thug.width/2, thug.y + thug.height/2, 'thug', thug.style);

                // Remove Thug
                this.thugs.splice(i, 1);
            }
        }

        // 2. Check boss
        if (this.boss) {
            const dist = Math.abs((this.player.x + this.player.width/2) - (this.boss.x + this.boss.width/2));
            const yDist = Math.abs(this.player.y - this.boss.y);
            const correctDirection = (this.player.facing === 1 && this.boss.x > this.player.x) ||
                                     (this.player.facing === -1 && this.boss.x < this.player.x);

            if (dist < range + 20 && yDist < 50 && correctDirection) {
                this.boss.health--;
                this.boss.flashTimer = 8;
                
                if (this.boss.health <= 0) {
                    // Defeated Boss!
                    gameAudio.playVictory();
                    this.spawnGore(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2, 'boss');
                    this.boss = null;
                    this.gameState = 'victory';
                    this.player.state = 'victory';
                } else {
                    gameAudio.playSlice();
                    this.boss.vx = this.player.facing * 4; // knockback
                    this.boss.vy = -3;
                }
            }
        }
    }

    spawnGore(x, y, type, style = 0) {
        // Spawn flying sliced halves (we push multiple steak cuts)
        const forceX = this.player.facing * 3;
        this.debris.push(new SlicedDebris(x - 10, y - 15, forceX + (Math.random() - 0.5)*3, -5 + (Math.random() - 0.2)*-4, type, 'top'));
        this.debris.push(new SlicedDebris(x + 10, y + 15, -forceX * 0.4 + (Math.random() - 0.5)*3, -3 + (Math.random() - 0.2)*-3, type, 'bottom'));
        
        // Push an extra middle T-bone steak slice for maximum dismemberment feel
        this.debris.push(new SlicedDebris(x, y, forceX * 0.8 + (Math.random() - 0.5)*4, -6 + (Math.random() - 0.2)*-4, type, 'top'));

        // Spawn a massive shower of blood particles
        for (let i = 0; i < 45; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            this.particles.push(new BloodParticle(
                x + (Math.random() - 0.5) * 10, 
                y + (Math.random() - 0.5) * 15,
                Math.cos(angle) * speed + (this.player.facing * 4),
                Math.sin(angle) * speed - (1 + Math.random() * 5),
                2.5 + Math.random() * 5.5
            ));
        }

        // Spawn flying fabric shards/clothing threads based on Thug style
        let clothColors = ['#1c1c1e', '#fff']; // default black & white
        if (type === 'thug') {
            if (style === 0) clothColors = ['#4b6584', '#e76f51', '#315a6b']; // denim blue, orange print, blue jeans
            else if (style === 1) clothColors = ['#b30000', '#57606f', '#ffe3a8']; // red shirt, grey vest, brown hair
            else if (style === 2) clothColors = ['#7a1c22', '#747d8c', '#d4a373']; // velvet red, grey bell-bottoms, tan beanie
            else if (style === 3) clothColors = ['#1c1c1e', '#ffb703']; // black dragon, gold
            else if (style === 4) clothColors = ['#1c1c1e', '#fff']; // black leather, white shirt
        } else if (type === 'boss') {
            clothColors = ['#5c0d12', '#222', '#ffe3a8']; // burgundy, black, skin
        }

        for (let i = 0; i < 12; i++) {
            const col = clothColors[Math.floor(Math.random() * clothColors.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 5;
            this.particles.push(new GoreParticle(
                x, y,
                Math.cos(angle) * speed + (this.player.facing * 2.5),
                Math.sin(angle) * speed - (2 + Math.random() * 4),
                4 + Math.random() * 6,
                col
            ));
        }
    }

    animate(now) {
        if (this.destroyed) return;
        
        const dt = now - this.lastTime;
        this.lastTime = now;

        this.update();
        this.draw();

        requestAnimationFrame(this.animate);
    }

    update() {
        if (this.gameState === 'gameover' || this.gameState === 'victory') {
            // Update particles/debris even in post-game
            this.particles.forEach(p => p.update());
            this.debris.forEach(d => d.update());
            return;
        }

        // --- Player Controls & Physics ---
        
        // Attack state timer decrements
        if (this.player.state === 'attacking') {
            this.player.stateTimer--;
            if (this.player.stateTimer <= 0) {
                this.player.state = 'idle';
            }
        }

        // Horizontal Movement
        let moveInput = 0;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            moveInput = -1;
            this.player.facing = -1;
        } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            moveInput = 1;
            this.player.facing = 1;
        }

        if (this.player.state !== 'attacking' && this.player.state !== 'hurt') {
            this.player.vx = moveInput * 4.5;
            if (moveInput !== 0) {
                this.player.state = (this.player.y < this.groundY) ? 'jumping' : 'walking';
            } else {
                this.player.state = (this.player.y < this.groundY) ? 'jumping' : 'idle';
            }
        }

        // Jump Mechanics
        const isJumpKey = this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space'];
        if (isJumpKey && this.player.y >= this.groundY && this.player.state !== 'hurt') {
            this.player.vy = -11.5;
            this.player.state = 'jumping';
            gameAudio.playJump();
        }

        // Apply Gravity
        this.player.vy += 0.55; // gravity force
        this.player.y += this.player.vy;
        
        if (this.player.y >= this.groundY) {
            this.player.y = this.groundY;
            this.player.vy = 0;
            if (this.player.state === 'jumping') {
                this.player.state = 'idle';
            }
        }

        // Move Player & Parallax Camera Scroll
        if (this.player.vx !== 0) {
            const nextX = this.player.x + this.player.vx;
            if (nextX > 320 && this.scrollOffset < this.levelLength) {
                // Scroll screen instead of moving character right
                this.scrollOffset += this.player.vx;
                if (this.scrollOffset > this.levelLength) {
                    this.scrollOffset = this.levelLength;
                }
            } else {
                this.player.x = Math.max(10, Math.min(750, nextX));
            }
        }

        // Calculate level completion progress
        this.gameProgress = this.scrollOffset / this.levelLength;

        // --- Enemies Spawning & Behavior ---
        
        // Spawn Regular Thugs
        if (this.gameProgress < 1.0) {
            this.thugSpawnTimer++;
            if (this.thugSpawnTimer > 90) {
                this.thugSpawnTimer = 0;
                if (this.thugs.length < 3) {
                    // Spawn a thug from right edge
                    this.thugs.push({
                        x: 820,
                        y: this.groundY,
                        width: 40,
                        height: 75,
                        speed: 1.8 + Math.random() * 0.8,
                        facing: -1,
                        style: Math.floor(Math.random() * 5) // random thug style matching reference image
                    });
                }
            }
        } else {
            // Level Scroll at 100%: Spawn Boss if not spawned yet
            if (!this.boss && this.gameState === 'playing') {
                this.boss = {
                    x: 820,
                    y: this.groundY,
                    width: 55,
                    height: 95,
                    speed: 1.2,
                    health: 5,
                    maxHealth: 5,
                    facing: -1,
                    throwTimer: 60,
                    flashTimer: 0,
                    vx: 0,
                    vy: 0
                };
            }
        }

        // Update Thugs
        for (let i = this.thugs.length - 1; i >= 0; i--) {
            const thug = this.thugs[i];
            
            // Thugs walk towards Craig
            const dir = (this.player.x - thug.x > 0) ? 1 : -1;
            thug.x += dir * thug.speed;
            thug.facing = dir;

            // Collision check: Thug punches player
            const dist = Math.abs((this.player.x + this.player.width/2) - (thug.x + thug.width/2));
            const yDist = Math.abs(this.player.y - thug.y);

            if (dist < 32 && yDist < 30 && this.player.state !== 'hurt' && this.player.state !== 'victory') {
                this.triggerPlayerHurt(10);
            }
        }

        // Update Boss
        if (this.boss) {
            // Apply physics to Boss for knockbacks
            if (this.boss.vy !== 0 || this.boss.y < this.groundY) {
                this.boss.vy += 0.5;
                this.boss.y += this.boss.vy;
                this.boss.x += this.boss.vx;
                this.boss.vx *= 0.95;

                if (this.boss.y >= this.groundY) {
                    this.boss.y = this.groundY;
                    this.boss.vy = 0;
                    this.boss.vx = 0;
                }
            } else {
                // Boss basic movement
                const dir = (this.player.x - this.boss.x > 0) ? 1 : -1;
                this.boss.x += dir * this.boss.speed;
                this.boss.facing = dir;
            }

            if (this.boss.flashTimer > 0) this.boss.flashTimer--;

            // Boss attacks: throw bottle
            this.boss.throwTimer--;
            if (this.boss.throwTimer <= 0) {
                this.boss.throwTimer = 110 + Math.random() * 60; // 2-3 seconds
                // Throw action
                const bVx = this.boss.facing * 6.5;
                this.projectiles.push(new BottleProjectile(
                    this.boss.x + (this.boss.facing === 1 ? 50 : -10),
                    this.boss.y + 25,
                    bVx,
                    -3
                ));
            }

            // Contact damage with Boss
            const dist = Math.abs((this.player.x + this.player.width/2) - (this.boss.x + this.boss.width/2));
            const yDist = Math.abs(this.player.y - this.boss.y);
            if (dist < 42 && yDist < 40 && this.player.state !== 'hurt' && this.player.state !== 'victory') {
                this.triggerPlayerHurt(20);
            }
        }

        // Update Projectiles (thrown bottles)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const bottle = this.projectiles[i];
            bottle.update();

            // Check collision with player
            const dist = Math.abs(bottle.x - (this.player.x + this.player.width/2));
            const yDist = Math.abs(bottle.y - (this.player.y + this.player.height/2));

            if (dist < 25 && yDist < 35 && this.player.state !== 'hurt') {
                gameAudio.playGlassShatter();
                this.triggerPlayerHurt(15);
                this.projectiles.splice(i, 1);
                continue;
            }

            // Ground impact
            if (bottle.y > this.groundY + 60) {
                gameAudio.playGlassShatter();
                this.projectiles.splice(i, 1);
            }
        }

        // Hurt state timer
        if (this.player.state === 'hurt') {
            this.player.stateTimer--;
            this.player.x -= this.player.facing * 1.5; // pushback
            if (this.player.stateTimer <= 0) {
                this.player.state = 'idle';
            }
        }

        // Update particles, slashes, and debris
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);

        this.debris.forEach(d => d.update());
        this.debris = this.debris.filter(d => d.life > 0);

        this.slashes.forEach(s => s.update());
        this.slashes = this.slashes.filter(s => s.age < s.maxAge);
    }

    triggerPlayerHurt(dmg) {
        this.player.health -= dmg;
        this.player.state = 'hurt';
        this.player.stateTimer = 18; // hurt frames
        this.player.vy = -3; // slight upward bounce
        gameAudio.playHurt();

        if (this.player.health <= 0) {
            this.player.health = 0;
            this.gameState = 'gameover';
            gameAudio.playGameOver();
        }
    }

    draw() {
        // Clear screen
        this.ctx.fillStyle = '#080c14'; // dark sky
        this.ctx.fillRect(0, 0, 800, 480);

        // Parallax Layers
        this.drawParallaxStars();
        this.drawParallaxBuildings();
        this.drawRoadAndWalls();

        // Draw Debris (behind characters)
        this.debris.forEach(d => d.draw(this.ctx));

        // Draw Thugs
        this.thugs.forEach(thug => this.drawThug(thug));

        // Draw Boss
        if (this.boss) this.drawBoss();

        // Draw Player (Craig)
        this.drawCraig();

        // Draw Projectiles
        this.projectiles.forEach(p => p.draw(this.ctx));

        // Draw Slashes (on top)
        this.slashes.forEach(s => s.draw(this.ctx));

        // Draw Particles
        this.particles.forEach(p => p.draw(this.ctx));

        // Draw UI Hud
        this.drawHUD();

        // Draw Overlays
        if (this.gameState === 'gameover') {
            this.drawGameOverScreen();
        } else if (this.gameState === 'victory') {
            this.drawVictoryScreen();
        }
    }

    // --- Parallax Background Artworks ---

    drawParallaxStars() {
        const offset = this.scrollOffset * 0.05;
        this.ctx.fillStyle = '#ffffff';
        // Static and moving tiny stars
        const stars = [
            { x: 50, y: 40 }, { x: 180, y: 70 }, { x: 300, y: 30 },
            { x: 450, y: 90 }, { x: 600, y: 50 }, { x: 740, y: 80 }
        ];
        stars.forEach(s => {
            let sx = (s.x - offset) % 800;
            if (sx < 0) sx += 800;
            this.ctx.fillRect(sx, s.y, 1.5, 1.5);
        });
        
        // Big round moon
        let mx = (620 - offset * 0.5);
        this.ctx.save();
        this.ctx.globalAlpha = 0.85;
        this.ctx.fillStyle = '#f4f1de';
        this.ctx.beginPath();
        this.ctx.arc(mx, 75, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawParallaxBuildings() {
        const offset = this.scrollOffset * 0.25;
        this.ctx.fillStyle = '#141a29'; // dark skyline color
        
        // Simple rectangular skyscrapers blocks
        const buildings = [
            { x: 20, w: 90, h: 220 },
            { x: 150, w: 110, h: 300 },
            { x: 300, w: 80, h: 180 },
            { x: 420, w: 100, h: 260 },
            { x: 580, w: 120, h: 320 },
            { x: 740, w: 80, h: 200 }
        ];

        buildings.forEach(b => {
            let bx = (b.x - offset) % 900;
            if (bx < -b.w) bx += 900;
            this.ctx.fillRect(bx, 380 - b.h, b.w, b.h);

            // Windows
            this.ctx.fillStyle = '#f4a261';
            this.ctx.globalAlpha = 0.25;
            for (let wy = 380 - b.h + 20; wy < 360; wy += 35) {
                for (let wx = bx + 15; wx < bx + b.w - 15; wx += 25) {
                    this.ctx.fillRect(wx, wy, 8, 12);
                }
            }
            this.ctx.fillStyle = '#141a29'; // restore building color
            this.ctx.globalAlpha = 1.0;
        });
    }

    drawRoadAndWalls() {
        const offset = this.scrollOffset;
        
        // Dark brick wall background
        this.ctx.fillStyle = '#221814'; // brick red/grey
        this.ctx.fillRect(0, 240, 800, 110);

        // Brick line patterns (moving at midground speed)
        this.ctx.strokeStyle = '#1b120f';
        this.ctx.lineWidth = 1.5;
        let wallOffset = -(offset * 0.8) % 120;
        for (let x = wallOffset; x < 850; x += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 240);
            this.ctx.lineTo(x, 350);
            this.ctx.stroke();
        }
        for (let y = 240; y < 350; y += 22) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(800, y);
            this.ctx.stroke();
        }

        // Sidewalk pavement base
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 350, 800, 130);

        // Curb border line
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 350);
        this.ctx.lineTo(800, 350);
        this.ctx.stroke();

        // Pavement crack separators (full foreground speed)
        this.ctx.strokeStyle = '#1a202c';
        this.ctx.lineWidth = 2.5;
        let groundOffset = -offset % 100;
        for (let gx = groundOffset; gx < 850; gx += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(gx, 350);
            this.ctx.lineTo(gx - 40, 480); // perspective slant
            this.ctx.stroke();
        }

        // Foreground Streetlamp (cycles dynamically)
        let lampX = (450 - offset) % 600;
        if (lampX < -50) lampX += 600;
        this.ctx.save();
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(lampX, 350);
        this.ctx.lineTo(lampX, 160);
        this.ctx.lineTo(lampX - 25, 160);
        this.ctx.stroke();
        // Glowing bulb
        this.ctx.fillStyle = '#ffe3a8';
        this.ctx.shadowColor = '#ffb703';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(lampX - 25, 175, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    // --- Drawing Characters ---

    drawCraig() {
        const p = this.player;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        
        // Apply sprite shaking if hurt
        if (p.state === 'hurt') {
            this.ctx.translate((Math.random() - 0.5) * 8, 0);
        }

        // Flip character rendering depending on facing direction
        if (p.facing === -1) {
            this.ctx.scale(-1, 1);
            this.ctx.translate(-p.width, 0);
        }

        // Muscular Tanned skin color & Saffron Robe colors (premium realistic 3D gradients)
        const skinShadow = '#612a1c';
        const skinHighlight = '#ffdfd3';
        const skinMid = '#cf7a5c';
        
        const skinGrad = this.ctx.createLinearGradient(0, 20, 45, 52);
        skinGrad.addColorStop(0, skinHighlight);
        skinGrad.addColorStop(0.5, skinMid);
        skinGrad.addColorStop(1, skinShadow);

        // Saffron fabric gradient
        const saffronGrad = this.ctx.createLinearGradient(4, 20, 41, 52);
        saffronGrad.addColorStop(0, '#d97332'); // Saffron highlight
        saffronGrad.addColorStop(0.6, '#a24a15'); // Saffron mid
        saffronGrad.addColorStop(1, '#672905'); // Saffron shadow
        
        const wrapColor = '#ffb703';
        const bootColor = '#2b2d42';

        // 1. Legs (Taller realistic legs)
        this.ctx.fillStyle = saffronGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        
        let legOffset = 0;
        if (p.state === 'walking') {
            legOffset = Math.sin(performance.now() * 0.015) * 8;
        }

        // Left leg (back)
        this.ctx.beginPath();
        this.ctx.moveTo(11 + legOffset, 48);
        this.ctx.lineTo(21 + legOffset, 48);
        this.ctx.lineTo(20 + legOffset, 72);
        this.ctx.lineTo(12 + legOffset, 72);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // Right leg (front)
        this.ctx.beginPath();
        this.ctx.moveTo(23 - legOffset, 48);
        this.ctx.lineTo(33 - legOffset, 48);
        this.ctx.lineTo(34 - legOffset, 72);
        this.ctx.lineTo(24 - legOffset, 72);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // Leg wraps (gold wraps on shins)
        this.ctx.fillStyle = wrapColor;
        this.ctx.beginPath();
        this.ctx.moveTo(12 + legOffset, 60);
        this.ctx.lineTo(20 + legOffset, 60);
        this.ctx.lineTo(20 + legOffset, 71);
        this.ctx.lineTo(12 + legOffset, 71);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(24 - legOffset, 60);
        this.ctx.lineTo(34 - legOffset, 60);
        this.ctx.lineTo(34 - legOffset, 71);
        this.ctx.lineTo(24 - legOffset, 71);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();
        
        // Wrap lines detail
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(12 + legOffset, 64); this.ctx.lineTo(20 + legOffset, 64);
        this.ctx.moveTo(12 + legOffset, 68); this.ctx.lineTo(20 + legOffset, 68);
        this.ctx.moveTo(24 - legOffset, 64); this.ctx.lineTo(34 - legOffset, 64);
        this.ctx.moveTo(24 - legOffset, 68); this.ctx.lineTo(34 - legOffset, 68);
        this.ctx.stroke();

        // Shoes
        this.ctx.fillStyle = bootColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.roundRect(10 + legOffset, 70, 12, 6, [2]);
        this.ctx.roundRect(22 - legOffset, 70, 13, 6, [2]);
        this.ctx.fill(); this.ctx.stroke();

        // 2. Back Arm (left - bare skin muscular, if not punching/attacking)
        if (p.state !== 'attacking') {
            this.ctx.fillStyle = skinGrad;
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3.5;
            this.ctx.beginPath();
            this.ctx.arc(10, 24, 6, 0, Math.PI * 2); // Deltoid
            this.ctx.fill(); this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(6, 32, 5.5, 0, Math.PI * 2); // Bicep
            this.ctx.fill(); this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(5, 42, 5, 0, Math.PI * 2); // Fist
            this.ctx.fill(); this.ctx.stroke();

            // Vein on bicep
            this.ctx.strokeStyle = '#6b8e8f';
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            this.ctx.moveTo(9, 21); this.ctx.quadraticCurveTo(7, 30, 5, 39);
            this.ctx.stroke();
        }

        // 3. Torso (Bare chest on left, saffron robe covering right chest diagonally)
        this.ctx.fillStyle = skinGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.roundRect(10, 18, 24, 28, [4]);
        this.ctx.fill();
        this.ctx.stroke();

        // Chest muscles shading (sculpted pecs / abs)
        this.ctx.fillStyle = 'rgba(84, 28, 14, 0.25)';
        this.ctx.beginPath();
        // Pec shadow (left side - bare skin)
        this.ctx.moveTo(22, 24);
        this.ctx.quadraticCurveTo(17, 28, 11, 24);
        this.ctx.lineTo(11, 29);
        this.ctx.quadraticCurveTo(17, 29, 22, 28);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#541c0e'; // Deep shadow line
        this.ctx.lineWidth = 2.2;
        this.ctx.beginPath();
        // Sternum line
        this.ctx.moveTo(22, 22); this.ctx.lineTo(22, 42);
        // Pec border
        this.ctx.moveTo(11, 24); this.ctx.quadraticCurveTo(17, 28, 22, 28);
        // Abs definition lines
        this.ctx.moveTo(13, 34); this.ctx.lineTo(31, 34);
        this.ctx.moveTo(14, 40); this.ctx.lineTo(30, 40);
        this.ctx.stroke();
        
        // Battle scar on bare chest
        this.ctx.strokeStyle = '#b31a1a';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(13, 20); this.ctx.lineTo(18, 25);
        this.ctx.moveTo(15, 24); this.ctx.lineTo(17, 21);
        this.ctx.stroke();

        // Jagged saffron robe covering right side of chest (our right)
        this.ctx.fillStyle = saffronGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.moveTo(34, 18);
        this.ctx.lineTo(22, 18);
        this.ctx.lineTo(24, 22); // Jagged tear
        this.ctx.lineTo(19, 27);
        this.ctx.lineTo(23, 32);
        this.ctx.lineTo(18, 38);
        this.ctx.lineTo(22, 46);
        this.ctx.lineTo(34, 46);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Creases on saffron robe fabric
        this.ctx.strokeStyle = '#672905';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(31, 20); this.ctx.lineTo(26, 30);
        this.ctx.moveTo(33, 28); this.ctx.lineTo(29, 38);
        this.ctx.stroke();

        // Waist Sash (Black belt)
        this.ctx.fillStyle = '#111';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(8, 44, 28, 6, [2]);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Sash tails
        this.ctx.beginPath();
        this.ctx.moveTo(15, 50); this.ctx.lineTo(13, 62); this.ctx.lineTo(10, 61); this.ctx.lineTo(12, 50);
        this.ctx.moveTo(18, 50); this.ctx.lineTo(19, 66); this.ctx.lineTo(16, 65); this.ctx.lineTo(15, 50);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // 4. Front Arm / Attack (front - right sleeved arm, unless attacking)
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        
        if (p.state === 'attacking') {
            if (p.attackType === 'punch') {
                // Punching bare arm (throws back bare arm forward as right cross!)
                // Deltoid to fist extending to the right
                const armGrad = this.ctx.createLinearGradient(20, 24, 60, 24);
                armGrad.addColorStop(0, skinHighlight);
                armGrad.addColorStop(0.5, skinMid);
                armGrad.addColorStop(1, skinShadow);
                this.ctx.fillStyle = armGrad;

                this.ctx.beginPath();
                this.ctx.arc(22, 24, 7.5, 0, Math.PI * 2); // Deltoid
                this.ctx.fill(); this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(34, 23, 6.5, 0, Math.PI * 2); // Bicep
                this.ctx.fill(); this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(45, 24, 6, 0, Math.PI * 2); // Forearm
                this.ctx.fill(); this.ctx.stroke();
                
                this.ctx.beginPath();
                this.ctx.arc(56, 24, 7.5, 0, Math.PI * 2); // Fist
                this.ctx.fill(); this.ctx.stroke();

                // Bulging green veins
                this.ctx.strokeStyle = '#6b8e8f';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(25, 20); this.ctx.bezierCurveTo(32, 18, 38, 22, 45, 21);
                this.ctx.stroke();

                // Muscle definition
                this.ctx.strokeStyle = '#541c0e';
                this.ctx.lineWidth = 2.2;
                this.ctx.beginPath();
                this.ctx.moveTo(27, 27); this.ctx.lineTo(40, 27);
                this.ctx.stroke();

                // Draw front sleeved arm pulled back to chest as guard
                this.ctx.fillStyle = saffronGrad;
                this.ctx.strokeStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(20, 28, 8, 0, Math.PI * 2); // shoulder sleeve
                this.ctx.fill(); this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(12, 34, 7, 0, Math.PI * 2); // elbow sleeve
                this.ctx.fill(); this.ctx.stroke();
                this.ctx.fillStyle = skinGrad;
                this.ctx.beginPath();
                this.ctx.arc(18, 36, 5, 0, Math.PI * 2); // fist
                this.ctx.fill(); this.ctx.stroke();
            } else {
                // Kick sweep pants leg (rich saffron terracotta)
                this.ctx.fillStyle = saffronGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(22, 36, 38, 12, [4]);
                this.ctx.fill();
                this.ctx.stroke();
                
                this.ctx.fillStyle = bootColor;
                this.ctx.beginPath();
                this.ctx.roundRect(60, 35, 7, 14, [3]);
                this.ctx.fill();
                this.ctx.stroke();
            }
        } else {
            // Idle front arm (sleeved in saffron terracotta)
            this.ctx.fillStyle = saffronGrad;
            this.ctx.beginPath();
            this.ctx.arc(34, 24, 7.5, 0, Math.PI * 2); // Sleeve deltoid
            this.ctx.fill(); this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(38, 33, 6.5, 0, Math.PI * 2); // Sleeve bicep
            this.ctx.fill(); this.ctx.stroke();

            // Hand (bare skin) sticking out
            this.ctx.fillStyle = skinGrad;
            this.ctx.beginPath();
            this.ctx.arc(38, 42, 5.5, 0, Math.PI * 2); // Fist
            this.ctx.fill(); this.ctx.stroke();
        }

        // 5. Head & Face (Bald sphere with radial lighting, angry features, scar under right eye)
        const headGrad = this.ctx.createRadialGradient(20, 6, 2, 22, 10, 10);
        headGrad.addColorStop(0, skinHighlight);
        headGrad.addColorStop(0.5, skinMid);
        headGrad.addColorStop(1, skinShadow);
        this.ctx.fillStyle = headGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        
        // Bald head
        this.ctx.beginPath();
        this.ctx.arc(22, 10, 8.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Shaded ears
        this.ctx.beginPath();
        this.ctx.arc(13.5, 10, 2.5, 0, Math.PI * 2);
        this.ctx.arc(30.5, 10, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Face details
        if (p.state === 'hurt') {
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 8px Courier';
            this.ctx.fillText('x', 18, 10);
            this.ctx.fillText('x', 24, 10);
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(19, 14); this.ctx.lineTo(25, 14);
            this.ctx.stroke();
        } else {
            // Angry slanted white eyes
            this.ctx.fillStyle = '#fff';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1.2;
            
            // Left eye
            this.ctx.beginPath();
            this.ctx.moveTo(16, 10); this.ctx.lineTo(20, 11); this.ctx.lineTo(19, 8);
            this.ctx.closePath(); this.ctx.fill(); this.ctx.stroke();

            // Right eye
            this.ctx.beginPath();
            this.ctx.moveTo(28, 10); this.ctx.lineTo(24, 11); this.ctx.lineTo(25, 8);
            this.ctx.closePath(); this.ctx.fill(); this.ctx.stroke();

            // Pupils
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(18, 10, 0.8, 0, Math.PI * 2);
            this.ctx.arc(26, 10, 0.8, 0, Math.PI * 2);
            this.ctx.fill();

            // Thick angry eyebrows
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2.2;
            this.ctx.beginPath();
            this.ctx.moveTo(14, 7); this.ctx.lineTo(20, 9);
            this.ctx.moveTo(30, 7); this.ctx.lineTo(24, 9);
            this.ctx.stroke();

            // Brow shadow line
            this.ctx.strokeStyle = 'rgba(84, 28, 14, 0.4)';
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            this.ctx.moveTo(16, 9.5); this.ctx.lineTo(28, 9.5);
            this.ctx.stroke();

            // Shaded nose
            this.ctx.strokeStyle = '#541c0e';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(22, 9.5); this.ctx.lineTo(21, 12); this.ctx.lineTo(23, 12);
            this.ctx.stroke();

            // Vertical eye scar under right eye (our right, Craig's left)
            this.ctx.strokeStyle = '#b31a1a';
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            this.ctx.moveTo(26, 12); this.ctx.lineTo(27, 15);
            this.ctx.stroke();

            // Open gritting teeth mouth
            this.ctx.fillStyle = '#fff';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1.8;
            this.ctx.beginPath();
            this.ctx.roundRect(17, 13.5, 10, 5, [1]);
            this.ctx.fill();
            this.ctx.stroke();

            // Teeth grid
            this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            this.ctx.lineWidth = 0.8;
            this.ctx.beginPath();
            this.ctx.moveTo(17, 16); this.ctx.lineTo(27, 16);
            this.ctx.moveTo(20, 13.5); this.ctx.lineTo(20, 18.5);
            this.ctx.moveTo(22, 13.5); this.ctx.lineTo(22, 18.5);
            this.ctx.moveTo(24, 13.5); this.ctx.lineTo(24, 18.5);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawThug(thug) {
        this.ctx.save();
        this.ctx.translate(thug.x, thug.y);

        if (thug.facing === 1) {
            this.ctx.scale(-1, 1);
            this.ctx.translate(-thug.width, 0);
        }

        const style = thug.style !== undefined ? thug.style : 0;
        
        let legColor = '#2d3748'; // default jeans
        let bootColor = '#111';
        let skinColor = '#fcd0a1';
        let hairColor = '#5c3d24';
        let shirtColor = '#e76f51';
        let jacketColor = '#1c1c1e';
        let isBellBottom = false;
        let hasAfro = false;
        let hasBeanie = false;
        let hasSunglasses = false;
        let hasMustache = false;
        let hasDragon = false;
        let hasGoldChain = false;
        let isOpenJacket = false;
        let hasSlickBackHair = false;
        let hasLongHair = false;

        if (style === 0) { // Style 0: Afro Vest Thug
            skinColor = '#703816'; // dark brown skin
            hairColor = '#1a1a1a'; // black afro
            legColor = '#3a5375'; // blue denim flare jeans
            shirtColor = '#c15c2d'; // orange printed shirt
            jacketColor = '#294366'; // blue denim vest
            isBellBottom = true;
            hasAfro = true;
            hasGoldChain = true;
            isOpenJacket = true;
            bootColor = '#5c3a21'; // brown boots
        } else if (style === 1) { // Style 1: Mustache Leather Thug
            skinColor = '#fcd0a1';
            hairColor = '#5c3a21'; // brown hair
            legColor = '#34495e'; // blue jeans
            shirtColor = '#a62115'; // red shirt collar
            jacketColor = '#1a1a1a'; // black leather jacket
            hasMustache = true;
            hasLongHair = true;
            isOpenJacket = true;
            bootColor = '#4d321f';
        } else if (style === 2) { // Style 2: Velvet Beanie Thug
            skinColor = '#fcd0a1';
            hairColor = '#5c3a21';
            legColor = '#576574'; // grey flare jeans
            shirtColor = '#ffffff'; // white graphic tee
            jacketColor = '#6b141a'; // velvet red blazer
            isBellBottom = true;
            hasBeanie = true;
            isOpenJacket = true;
            bootColor = '#3e2723';
        } else if (style === 3) { // Style 3: Dragon Yakuza Thug
            skinColor = '#fcd0a1';
            hairColor = '#1a1a1a'; // short black hair
            legColor = '#2e5282'; // blue jeans
            shirtColor = '#151515';
            jacketColor = '#111111'; // black satin bomber jacket
            hasDragon = true;
            hasSunglasses = true;
            isOpenJacket = false; // zipped up
            bootColor = '#151515';
        } else { // Style 4: Classic Leather Thug
            skinColor = '#fcd0a1';
            hairColor = '#1a1a1a'; // black hair
            legColor = '#1a1d24'; // dark blue/black jeans
            shirtColor = '#cfc5b3'; // tan tank top
            jacketColor = '#151515'; // black leather jacket open
            hasSlickBackHair = true;
            hasGoldChain = true;
            isOpenJacket = true;
            bootColor = '#4a3728';
        }

        // Let walking offset affect legs
        let legOffset = Math.sin(performance.now() * 0.012 + thug.x * 0.05) * 5;

        // 1. Draw Legs (Taller realistic proportions)
        this.ctx.fillStyle = legColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        if (isBellBottom) {
            // Left Leg (back)
            this.ctx.moveTo(9 + legOffset, 45);
            this.ctx.lineTo(19 + legOffset, 45);
            this.ctx.lineTo(21 + legOffset, 70);
            this.ctx.lineTo(7 + legOffset, 70);
            this.ctx.closePath();
            this.ctx.fill(); this.ctx.stroke();

            // Right Leg (front)
            this.ctx.beginPath();
            this.ctx.moveTo(21 - legOffset, 45);
            this.ctx.lineTo(31 - legOffset, 45);
            this.ctx.lineTo(33 - legOffset, 70);
            this.ctx.lineTo(19 - legOffset, 70);
            this.ctx.closePath();
            this.ctx.fill(); this.ctx.stroke();
        } else {
            // Left Leg
            this.ctx.roundRect(9 + legOffset, 45, 10, 25, [3]);
            // Right Leg
            this.ctx.roundRect(21 - legOffset, 45, 10, 25, [3]);
            this.ctx.fill(); this.ctx.stroke();
        }

        // Boots
        this.ctx.fillStyle = bootColor;
        this.ctx.beginPath();
        this.ctx.roundRect(6 + legOffset, 69, 14, 6, [2]);
        this.ctx.roundRect(19 - legOffset, 69, 14, 6, [2]);
        this.ctx.fill(); this.ctx.stroke();

        // 2. Draw Back Arm
        this.ctx.fillStyle = (style === 0) ? skinColor : jacketColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(3, 20, 6, 16, [3]);
        this.ctx.fill(); this.ctx.stroke();
        // Back Hand
        this.ctx.fillStyle = skinColor;
        this.ctx.beginPath();
        this.ctx.arc(6, 36, 4.5, 0, Math.PI * 2);
        this.ctx.fill(); this.ctx.stroke();

        // 3. Torso
        this.ctx.fillStyle = shirtColor;
        this.ctx.beginPath();
        this.ctx.roundRect(8, 17, 24, 28, [4]);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw jacket/vest on top
        this.ctx.fillStyle = jacketColor;
        if (isOpenJacket) {
            // Draw left and right panels open
            this.ctx.beginPath();
            this.ctx.roundRect(8, 17, 7, 28, [3]);
            this.ctx.roundRect(25, 17, 7, 28, [3]);
            this.ctx.fill(); this.ctx.stroke();
            
            // Draw lapels for velvet jacket (style 2)
            if (style === 2) {
                this.ctx.fillStyle = '#4a0e12'; // darker maroon lapel
                this.ctx.beginPath();
                this.ctx.moveTo(8, 17); this.ctx.lineTo(13, 27); this.ctx.lineTo(13, 17);
                this.ctx.moveTo(32, 17); this.ctx.lineTo(27, 27); this.ctx.lineTo(27, 17);
                this.ctx.fill();
            }
        } else {
            // Zipped / closed jacket
            this.ctx.beginPath();
            this.ctx.roundRect(8, 17, 24, 28, [4]);
            this.ctx.fill(); this.ctx.stroke();

            // Zipper / gold accents for Yakuza bomber jacket (style 3)
            if (style === 3) {
                this.ctx.strokeStyle = '#ffb703';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(20, 17); this.ctx.lineTo(20, 45);
                this.ctx.stroke();
            }
        }

        // Wallet chain detail for Classic Leather Thug (style 4)
        if (style === 4) {
            this.ctx.strokeStyle = '#bdc3c7'; // silver chain
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            this.ctx.arc(14, 46, 4, 0, Math.PI);
            this.ctx.stroke();
        }

        // Emblem/Details (Dragon/Gold chain)
        if (hasDragon) {
            // Gold Dragon motif on Yakuza chest (style 3)
            this.ctx.strokeStyle = '#ffb703';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(26, 26, 3, -Math.PI*0.5, Math.PI*0.7);
            this.ctx.stroke();
        }
        if (hasGoldChain) {
            this.ctx.strokeStyle = '#ffb703';
            this.ctx.lineWidth = 1.8;
            this.ctx.beginPath();
            this.ctx.arc(20, 19, 5, 0, Math.PI);
            this.ctx.stroke();
        }

        // 4. Draw Front Arm
        this.ctx.fillStyle = (style === 0) ? skinColor : jacketColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(31, 20, 6, 16, [3]);
        this.ctx.fill(); this.ctx.stroke();
        // Front Hand
        this.ctx.fillStyle = skinColor;
        this.ctx.beginPath();
        this.ctx.arc(34, 36, 4.5, 0, Math.PI * 2);
        this.ctx.fill(); this.ctx.stroke();

        // Style 3 bomber jacket cuff/collar stripes
        if (style === 3) {
            this.ctx.strokeStyle = '#ffb703';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(3, 32); this.ctx.lineTo(9, 32);
            this.ctx.moveTo(31, 32); this.ctx.lineTo(37, 32);
            this.ctx.stroke();
        }

        // 5. Head & Hair
        // Long hair or slicked back hair drawn behind head first
        this.ctx.fillStyle = hairColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;

        if (hasLongHair) {
            // Long hair locks behind neck
            this.ctx.beginPath();
            this.ctx.roundRect(11, 8, 18, 16, [4]);
            this.ctx.fill(); this.ctx.stroke();
        }

        // Head Base
        this.ctx.fillStyle = skinColor;
        this.ctx.beginPath();
        this.ctx.arc(20, 10, 7.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Hair on top of head
        this.ctx.fillStyle = hairColor;
        if (hasAfro) {
            // Afro puffy hair circles
            this.ctx.fillStyle = '#111';
            this.ctx.beginPath();
            this.ctx.arc(20, 3, 9, 0, Math.PI * 2);
            this.ctx.arc(13, 7, 7.5, 0, Math.PI * 2);
            this.ctx.arc(27, 7, 7.5, 0, Math.PI * 2);
            this.ctx.fill(); this.ctx.stroke();
        } else if (hasBeanie) {
            // Tan Beanie ellipse
            this.ctx.fillStyle = '#c89f74';
            this.ctx.beginPath();
            this.ctx.ellipse(20, 5, 8, 5, 0, 0, Math.PI * 2);
            this.ctx.fill(); this.ctx.stroke();
            // Side curls peaking out
            this.ctx.fillStyle = hairColor;
            this.ctx.beginPath();
            this.ctx.arc(13, 11, 2.5, 0, Math.PI * 2);
            this.ctx.arc(27, 11, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (hasSlickBackHair) {
            // Pompadour/Slick back black hair
            this.ctx.fillStyle = '#111';
            this.ctx.beginPath();
            this.ctx.arc(20, 4, 7, Math.PI, 0);
            this.ctx.lineTo(20, 2);
            this.ctx.closePath();
            this.ctx.fill(); this.ctx.stroke();
        } else if (style === 3) {
            // Short black hair Yakuza
            this.ctx.fillStyle = '#111';
            this.ctx.beginPath();
            this.ctx.arc(20, 5, 7.5, Math.PI, 0);
            this.ctx.fill(); this.ctx.stroke();
        }

        // Facial Hair (Mustache)
        if (hasMustache) {
            this.ctx.strokeStyle = hairColor;
            this.ctx.lineWidth = 2.2;
            this.ctx.beginPath();
            this.ctx.moveTo(16, 13.5);
            this.ctx.quadraticCurveTo(20, 14.5, 24, 13.5);
            this.ctx.stroke();
        }

        // Eyes / Sunglasses
        if (hasSunglasses) {
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.roundRect(14, 8, 12, 3.5, [1]);
            this.ctx.fill(); this.ctx.stroke();
        } else {
            // Standard angry dots eyes
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(17, 9.5, 1.2, 0, Math.PI * 2);
            this.ctx.arc(23, 9.5, 1.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Frowning eyebrows
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            this.ctx.moveTo(15, 8); this.ctx.lineTo(18, 9);
            this.ctx.moveTo(25, 8); this.ctx.lineTo(22, 9);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawBoss() {
        const b = this.boss;
        this.ctx.save();
        this.ctx.translate(b.x, b.y);

        if (b.facing === 1) {
            this.ctx.scale(-1, 1);
            this.ctx.translate(-b.width, 0);
        }

        // Apply hit flashing red
        if (b.flashTimer > 0 && Math.floor(b.flashTimer / 2) % 2 === 0) {
            this.ctx.fillStyle = '#e63946';
        }

        // Boss Style: Red burgundy leather jacket, massive trousers
        // Legs
        this.ctx.fillStyle = '#222'; // black pants
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.fillRect(6, 60, 16, 30);
        this.ctx.fillRect(32, 60, 16, 30);
        this.ctx.strokeRect(6, 60, 16, 30);
        this.ctx.strokeRect(32, 60, 16, 30);
        // giant boots
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(3, 90, 20, 8);
        this.ctx.fillRect(32, 90, 20, 8);
        this.ctx.strokeRect(3, 90, 20, 8);
        this.ctx.strokeRect(32, 90, 20, 8);

        // Massive torso
        this.ctx.fillStyle = b.flashTimer > 0 ? '#e63946' : '#5c0d12'; // burgundy
        this.ctx.beginPath();
        this.ctx.roundRect(4, 25, 47, 38, [6]);
        this.ctx.fill();
        this.ctx.stroke();

        // Golden chains logo on boss jacket chest
        this.ctx.strokeStyle = '#ffb703';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(28, 42, 6, 0, Math.PI);
        this.ctx.stroke();

        // Head
        this.ctx.fillStyle = '#ffe3a8';
        this.ctx.beginPath();
        this.ctx.arc(27, 6, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Eye Shades
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(15, -1, 24, 7);

        this.ctx.restore();
    }

    // --- HUD Details ---

    drawHUD() {
        this.ctx.save();

        // Score Panel
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '800 16px "Outfit", sans-serif';
        this.ctx.fillText(`SCORE: ${this.player.score}`, 25, 30);

        // Level Progress indicator
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.ctx.fillRect(25, 45, 180, 8);
        this.ctx.fillStyle = '#00b4d8';
        this.ctx.fillRect(25, 45, 180 * this.gameProgress, 8);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '500 10px "Outfit", sans-serif';
        this.ctx.fillText("STAGE 1 PROGRESS", 25, 65);

        // Player Health Bar
        this.ctx.fillText("VIGILANTE HEALTH", 610, 25);
        this.ctx.fillStyle = 'rgba(230, 57, 70, 0.2)';
        this.ctx.fillRect(610, 32, 160, 14);
        this.ctx.fillStyle = '#e63946'; // red health
        this.ctx.fillRect(610, 32, 160 * (this.player.health / 100), 14);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(610, 32, 160, 14);

        // Boss Health Bar overlay if boss active
        if (this.boss) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '800 16px "Outfit", sans-serif';
            this.ctx.fillText("BOSS: BILLY THE SLICER", 300, 30);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.fillRect(300, 38, 200, 12);
            
            this.ctx.fillStyle = '#ff6a00'; // orange
            this.ctx.fillRect(300, 38, 200 * (this.boss.health / this.boss.maxHealth), 12);
            this.ctx.strokeRect(300, 38, 200, 12);
        }

        this.ctx.restore();
    }

    drawGameOverScreen() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, 800, 480);

        this.ctx.fillStyle = '#e63946';
        this.ctx.font = '800 52px "Outfit", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("VIGILANTE DEFEATED", 400, 210);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '500 18px "Inter", sans-serif';
        this.ctx.fillText(`SCORE: ${this.player.score}`, 400, 260);
        this.ctx.fillStyle = '#ff6a00';
        this.ctx.font = '700 16px "Outfit", sans-serif';
        this.ctx.fillText("PRESS ANY KEY OR TAP CONTROLLER TO RESTART STAGE 1", 400, 310);

        this.ctx.restore();
    }

    drawVictoryScreen() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(10, 12, 16, 0.85)';
        this.ctx.fillRect(0, 0, 800, 480);

        this.ctx.fillStyle = '#ffb703';
        this.ctx.font = '800 52px "Outfit", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("STAGE 1 COMPLETE!", 400, 190);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '500 18px "Inter", sans-serif';
        this.ctx.fillText("You unleashed the Forbidden Shaolin Arts and sliced NYC clean!", 400, 240);
        this.ctx.fillText(`FINAL SCORE: ${this.player.score}`, 400, 280);

        this.ctx.fillStyle = '#00b4d8';
        this.ctx.font = '700 16px "Outfit", sans-serif';
        this.ctx.fillText("PRESS ANY KEY OR TAP TO PLAY STAGE 1 AGAIN", 400, 330);

        this.ctx.restore();
    }
}

// Export class globally
window.RetroGameController = RetroGameController;
