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

// Sliced debris entities (split in half animation)
class SlicedDebris {
    constructor(x, y, vx, vy, type, part) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.rotation = Math.random() * Math.PI * 2;
        this.vRotation = (Math.random() - 0.5) * 0.2;
        this.type = type; // 'thug' or 'boss'
        this.part = part; // 'top' or 'bottom'
        this.life = 1.0;
    }

    update() {
        this.x += this.vx;
        this.vy += 0.4; // gravity
        this.y += this.vy;
        this.rotation += this.vRotation;
        this.life -= 0.015;
        this.vx *= 0.98;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.life);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;

        if (this.type === 'thug') {
            ctx.fillStyle = '#1c1c1e'; // black jacket
            if (this.part === 'top') {
                // Head + top chest
                ctx.beginPath();
                ctx.arc(0, -15, 12, 0, Math.PI * 2); // head
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = '#ffe3a8'; // skin
                ctx.beginPath();
                ctx.arc(-2, -15, 1.5, 0, Math.PI * 2); // eye
                ctx.fill();

                ctx.fillStyle = '#1c1c1e';
                ctx.beginPath();
                ctx.rect(-10, -5, 20, 15); // chest
                ctx.fill();
                ctx.stroke();

                // blood at cut edge
                ctx.fillStyle = '#b30000';
                ctx.beginPath();
                ctx.ellipse(0, 10, 10, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Legs
                ctx.fillStyle = '#2d3748'; // jeans
                ctx.beginPath();
                ctx.rect(-10, 0, 9, 20); // left leg
                ctx.rect(1, 0, 9, 20); // right leg
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#111'; // boots
                ctx.beginPath();
                ctx.rect(-12, 20, 11, 6);
                ctx.rect(1, 20, 11, 6);
                ctx.fill();
                ctx.stroke();

                // bloody cut surface
                ctx.fillStyle = '#b30000';
                ctx.beginPath();
                ctx.ellipse(0, 0, 10, 3.5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Boss (larger and burgundy jacket)
            ctx.fillStyle = '#5c0d12'; // burgundy
            if (this.part === 'top') {
                ctx.beginPath();
                ctx.arc(0, -20, 16, 0, Math.PI * 2); // large head
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffe3a8';
                ctx.beginPath();
                ctx.arc(-3, -20, 2, 0, Math.PI * 2); // eye
                ctx.fill();

                ctx.fillStyle = '#5c0d12';
                ctx.beginPath();
                ctx.rect(-14, -5, 28, 20); // chest
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#b30000';
                ctx.beginPath();
                ctx.ellipse(0, 15, 14, 4, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#222'; // pants
                ctx.beginPath();
                ctx.rect(-14, 0, 12, 25);
                ctx.rect(2, 0, 12, 25);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#444'; // giant boots
                ctx.beginPath();
                ctx.rect(-17, 25, 15, 8);
                ctx.rect(2, 25, 15, 8);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#b30000';
                ctx.beginPath();
                ctx.ellipse(0, 0, 14, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
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
                this.spawnGore(thug.x + thug.width/2, thug.y + thug.height/2, 'thug');

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

    spawnGore(x, y, type) {
        // Spawn flying sliced halves
        const forceX = this.player.facing * 3;
        this.debris.push(new SlicedDebris(x - 5, y - 10, forceX + (Math.random() - 0.5)*2, -4 + (Math.random() - 0.2)*-3, type, 'top'));
        this.debris.push(new SlicedDebris(x + 5, y + 10, -forceX * 0.5 + (Math.random() - 0.5)*2, -2 + (Math.random() - 0.2)*-2, type, 'bottom'));

        // Spawn blood particles
        for (let i = 0; i < 15; i++) {
            this.particles.push(new BloodParticle(
                x, y,
                (Math.random() - 0.5) * 8 + (this.player.facing * 3),
                (Math.random() - 0.8) * 8,
                2 + Math.random() * 4
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
                        facing: -1
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

        // Muscular Tanned skin color & Saffron Robe colors
        const skinColor = '#e89a80';
        const pantsColor = '#e05a10';
        const robeColor = '#e05a10';
        const sleeveColor = '#e05a10';
        const wrapColor = '#ffb703';
        const bootColor = '#2b2d42';

        // 1. Draw Legs
        this.ctx.fillStyle = pantsColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        
        // Stubby walking animation
        let legOffset = 0;
        if (p.state === 'walking') {
            legOffset = Math.sin(performance.now() * 0.015) * 8;
        }

        // Left leg (back)
        this.ctx.beginPath();
        this.ctx.roundRect(3 + legOffset, 48, 16, 22, [4]);
        this.ctx.fill();
        this.ctx.stroke();

        // Right leg (front)
        this.ctx.beginPath();
        this.ctx.roundRect(24 - legOffset, 48, 16, 22, [4]);
        this.ctx.fill();
        this.ctx.stroke();

        // Leg wraps (gold wraps on lower legs)
        this.ctx.fillStyle = wrapColor;
        this.ctx.beginPath();
        this.ctx.rect(3 + legOffset, 58, 16, 11);
        this.ctx.rect(24 - legOffset, 58, 16, 11);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw wrap bands (black lines)
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(3 + legOffset, 63); this.ctx.lineTo(19 + legOffset, 63);
        this.ctx.moveTo(24 - legOffset, 63); this.ctx.lineTo(40 - legOffset, 63);
        this.ctx.stroke();

        // Shoes
        this.ctx.fillStyle = bootColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.roundRect(1 + legOffset, 69, 19, 7, [3]);
        this.ctx.roundRect(22 - legOffset, 69, 19, 7, [3]);
        this.ctx.fill();
        this.ctx.stroke();

        // 2. Draw Arms (back - left sleeved arm)
        if (p.state !== 'attacking') {
            // Sleeve shoulder
            this.ctx.fillStyle = sleeveColor;
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3.5;
            this.ctx.beginPath();
            this.ctx.arc(4, 28, 11, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Forearm sleeve
            this.ctx.beginPath();
            this.ctx.arc(-2, 38, 9, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Hand (bare skin)
            this.ctx.fillStyle = skinColor;
            this.ctx.beginPath();
            this.ctx.arc(-5, 45, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }

        // 3. Torso (Bare chest on right, torn robe on left)
        this.ctx.fillStyle = skinColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.roundRect(4, 20, 37, 32, [6]);
        this.ctx.fill();
        this.ctx.stroke();

        // Muscle details (pecs / abs / vascular lines)
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(20, 29); this.ctx.lineTo(36, 29); // Right chest line (pec)
        this.ctx.moveTo(20, 29); this.ctx.lineTo(20, 39); // Sternum line
        this.ctx.moveTo(20, 39); this.ctx.lineTo(32, 39); // Abs row 1
        this.ctx.moveTo(20, 45); this.ctx.lineTo(30, 45); // Abs row 2
        this.ctx.stroke();

        // Torn robe covering left shoulder/torso half
        this.ctx.fillStyle = robeColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.moveTo(4, 20);
        this.ctx.lineTo(18, 20);
        this.ctx.lineTo(15, 26); // Jagged tear 1
        this.ctx.lineTo(21, 32); // Jagged tear 2
        this.ctx.lineTo(12, 38); // Jagged tear 3
        this.ctx.lineTo(18, 44); // Jagged tear 4
        this.ctx.lineTo(15, 52);
        this.ctx.lineTo(4, 52);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Waist Sash (Black belt)
        this.ctx.fillStyle = '#111';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(2, 46, 41, 7, [2]);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Hanging sash tails
        this.ctx.beginPath();
        this.ctx.moveTo(12, 53);
        this.ctx.lineTo(10, 68);
        this.ctx.lineTo(6, 67);
        this.ctx.lineTo(8, 53);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // 4. Front Arm (front - right bare muscular arm)
        this.ctx.fillStyle = skinColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        
        if (p.state === 'attacking') {
            if (p.attackType === 'punch') {
                // Punching bare arm: huge biceps & deltoid
                this.ctx.beginPath();
                this.ctx.arc(28, 24, 13, 0, Math.PI * 2); // Deltoid
                this.ctx.fill();
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(39, 23, 11, 0, Math.PI * 2); // Bicep
                this.ctx.fill();
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(50, 24, 10, 0, Math.PI * 2); // Forearm
                this.ctx.fill();
                this.ctx.stroke();
                
                // Giant Fist
                this.ctx.beginPath();
                this.ctx.arc(62, 24, 12, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();

                // Muscle definition lines
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(33, 20); this.ctx.quadraticCurveTo(39, 16, 45, 20);
                this.ctx.moveTo(46, 26); this.ctx.quadraticCurveTo(51, 28, 55, 25);
                this.ctx.stroke();
            } else {
                // Kick sweep bare leg: saffron pants, thick and dynamic
                this.ctx.fillStyle = pantsColor;
                this.ctx.beginPath();
                this.ctx.roundRect(25, 38, 40, 16, [4]);
                this.ctx.fill();
                this.ctx.stroke();
                
                this.ctx.fillStyle = bootColor;
                this.ctx.beginPath();
                this.ctx.roundRect(65, 36, 9, 20, [3]);
                this.ctx.fill();
                this.ctx.stroke();
            }
        } else {
            // Idle/walking flexed muscular arm
            this.ctx.beginPath();
            this.ctx.arc(38, 22, 13, 0, Math.PI * 2); // Deltoid
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(44, 32, 11, 0, Math.PI * 2); // Bicep
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(46, 44, 10, 0, Math.PI * 2); // Fist
            this.ctx.fill();
            this.ctx.stroke();

            // Muscle line
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(38, 28); this.ctx.quadraticCurveTo(43, 27, 45, 33);
            this.ctx.stroke();
        }

        // 5. Head & Face (Bald scalp, angry brows, gritted teeth)
        this.ctx.fillStyle = skinColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        
        // Bald head
        this.ctx.beginPath();
        this.ctx.arc(22, 2, 16, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Ears
        this.ctx.beginPath();
        this.ctx.arc(6, 2, 4, 0, Math.PI * 2);
        this.ctx.arc(38, 2, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Face details
        if (p.state === 'hurt') {
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 12px Courier';
            this.ctx.fillText('x', 13, 2);
            this.ctx.fillText('x', 25, 2);
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.moveTo(16, 8); this.ctx.lineTo(28, 6);
            this.ctx.stroke();
        } else {
            // Angry slanted white eyes
            this.ctx.fillStyle = '#fff';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            
            // Left eye
            this.ctx.beginPath();
            this.ctx.moveTo(11, 2);
            this.ctx.lineTo(19, 4);
            this.ctx.lineTo(16, -1);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            // Right eye
            this.ctx.beginPath();
            this.ctx.moveTo(33, 2);
            this.ctx.lineTo(25, 4);
            this.ctx.lineTo(28, -1);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            // Pupils
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(15, 2, 1.5, 0, Math.PI * 2);
            this.ctx.arc(29, 2, 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Thick angry eyebrows
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3.5;
            this.ctx.beginPath();
            this.ctx.moveTo(8, -4); this.ctx.lineTo(19, 1);
            this.ctx.moveTo(36, -4); this.ctx.lineTo(25, 1);
            this.ctx.stroke();

            // Forehead wrinkles / veins
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(18, -8); this.ctx.lineTo(22, -6);
            this.ctx.moveTo(22, -8); this.ctx.lineTo(26, -9);
            this.ctx.stroke();

            // Open gritting teeth mouth
            this.ctx.fillStyle = '#fff';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.roundRect(14, 7, 16, 8, [2]);
            this.ctx.fill();
            this.ctx.stroke();

            // Teeth grid
            this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(14, 11); this.ctx.lineTo(30, 11);
            this.ctx.moveTo(18, 7); this.ctx.lineTo(18, 15);
            this.ctx.moveTo(22, 7); this.ctx.lineTo(22, 15);
            this.ctx.moveTo(26, 7); this.ctx.lineTo(26, 15);
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

        // Thug Style: Black leather jacket, sunglasses, blue jeans
        // Legs
        this.ctx.fillStyle = '#2d3748'; // blue jeans
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.fillRect(4, 50, 12, 20);
        this.ctx.fillRect(24, 50, 12, 20);
        this.ctx.strokeRect(4, 50, 12, 20);
        this.ctx.strokeRect(24, 50, 12, 20);
        // boots
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(2, 70, 14, 6);
        this.ctx.fillRect(24, 70, 14, 6);
        this.ctx.strokeRect(2, 70, 14, 6);
        this.ctx.strokeRect(24, 70, 14, 6);

        // Torso jacket
        this.ctx.fillStyle = '#1c1c1e'; // black leather
        this.ctx.beginPath();
        this.ctx.roundRect(3, 20, 34, 32, [4]);
        this.ctx.fill();
        this.ctx.stroke();

        // collar detail
        this.ctx.fillStyle = '#444';
        this.ctx.beginPath();
        this.ctx.moveTo(12, 20); this.ctx.lineTo(20, 30); this.ctx.lineTo(28, 20);
        this.ctx.fill();
        
        // Head
        this.ctx.fillStyle = '#ffe3a8'; // skin
        this.ctx.beginPath();
        this.ctx.arc(20, 4, 15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Sunglasses (Shades)
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(10, -2, 20, 6);
        
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
