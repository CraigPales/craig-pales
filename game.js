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

    draw(ctx, scrollOffset) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - scrollOffset, this.y, this.size, 0, Math.PI * 2);
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

    draw(ctx, scrollOffset) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Draw a jagged, irregular triangle/shard shape
        ctx.moveTo(this.x - scrollOffset, this.y);
        ctx.lineTo(this.x - scrollOffset + this.size, this.y + this.size * 0.3);
        ctx.lineTo(this.x - scrollOffset + this.size * 0.3, this.y + this.size);
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

    draw(ctx, scrollOffset) {
        ctx.save();
        ctx.translate(this.x - scrollOffset, this.y);
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

    draw(ctx, scrollOffset) {
        ctx.save();
        ctx.translate(this.x - scrollOffset, this.y);
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

// Thrown Knife Projectiles (used by player and knife-thrower thugs)
class KnifeProjectile {
    constructor(x, y, vx, vy, isPlayerOwned = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.isPlayerOwned = isPlayerOwned;
        this.width = 16;
        this.height = 6;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx, scrollOffset) {
        ctx.save();
        ctx.translate(this.x - scrollOffset, this.y);
        if (this.vx < 0) {
            ctx.scale(-1, 1);
        }
        ctx.fillStyle = '#e2e8f0'; // bright silver steel
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        
        // Draw a sleek knife shape
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(4, -2);
        ctx.lineTo(8, 0); // pointed tip
        ctx.lineTo(4, 2);
        ctx.lineTo(-8, 2);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        // Handle
        ctx.fillStyle = '#475569'; // dark slate handle
        ctx.fillRect(-12, -1.5, 4, 3);
        ctx.fillStyle = '#b91c1c'; // red wrap
        ctx.fillRect(-14, -2, 2, 4);
        
        ctx.restore();
    }
}

// Destructible Crates / Barrels
class DestructibleObject {
    constructor(x, y, type = 'crate', content = 'knife') {
        this.x = x; // world X coordinate
        this.y = y;
        this.type = type; // 'crate' or 'barrel'
        this.content = content; // 'knife', 'meat', or 'gold'
        this.width = 36;
        this.height = 36;
        this.health = 2; // requires 2 hits to break
        this.flashTimer = 0;
    }
    
    draw(ctx, scrollOffset) {
        const sx = this.x - scrollOffset;
        if (sx < -50 || sx > 850) return; // out of screen
        
        ctx.save();
        if (this.flashTimer > 0) {
            this.flashTimer--;
            ctx.filter = 'brightness(1.8)';
        }
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3.5;
        
        if (this.type === 'crate') {
            // Draw wooden crate
            ctx.fillStyle = '#a0522d'; // sienna brown
            ctx.beginPath();
            ctx.rect(sx, this.y, this.width, this.height);
            ctx.fill(); ctx.stroke();
            
            // Planks lines
            ctx.strokeStyle = '#5c2d16';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            // diagonal planks X
            ctx.moveTo(sx + 4, this.y + 4);
            ctx.lineTo(sx + this.width - 4, this.y + this.height - 4);
            ctx.moveTo(sx + this.width - 4, this.y + 4);
            ctx.lineTo(sx + 4, this.y + this.height - 4);
            // borders
            ctx.rect(sx + 3, this.y + 3, this.width - 6, this.height - 6);
            ctx.stroke();
        } else {
            // Draw barrel
            ctx.fillStyle = '#b25d38'; // terracotta brown
            ctx.beginPath();
            ctx.roundRect(sx, this.y, this.width, this.height, [6]);
            ctx.fill(); ctx.stroke();
            
            // Metal hoops
            ctx.fillStyle = '#475569';
            ctx.fillRect(sx, this.y + 8, this.width, 4);
            ctx.fillRect(sx, this.y + 24, this.width, 4);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(sx, this.y + 8, this.width, 4);
            ctx.strokeRect(sx, this.y + 24, this.width, 4);
            
            // Vertical barrel lines
            ctx.strokeStyle = '#5c2d16';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(sx + 10, this.y + 1); ctx.quadraticCurveTo(sx + 8, this.y + 18, sx + 10, this.y + this.height - 1);
            ctx.moveTo(sx + 26, this.y + 1); ctx.quadraticCurveTo(sx + 28, this.y + 18, sx + 26, this.y + this.height - 1);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// Items dropped by destructibles
class PickableItem {
    constructor(x, y, type = 'knife') {
        this.x = x;
        this.y = y;
        this.vy = -3.5; // slight upward bounce on spawn
        this.gravity = 0.25;
        this.groundY = y + 12; // align to base level of crate/barrel
        this.type = type; // 'knife', 'meat', 'gold'
        this.width = 24;
        this.height = 24;
        this.bobOffset = 0;
        this.isGrounded = false;
    }
    
    update() {
        if (!this.isGrounded) {
            this.vy += this.gravity;
            this.y += this.vy;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.isGrounded = true;
            }
        } else {
            this.bobOffset = Math.sin(performance.now() * 0.007) * 4;
        }
    }
    
    draw(ctx, scrollOffset) {
        const sx = this.x - scrollOffset;
        if (sx < -50 || sx > 850) return;
        
        ctx.save();
        ctx.translate(sx + 12, this.y + 12 + this.bobOffset);
        
        ctx.shadowColor = this.type === 'meat' ? '#ef4444' : (this.type === 'gold' ? '#fbbf24' : '#60a5fa');
        ctx.shadowBlur = 10;
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;
        
        if (this.type === 'meat') {
            // Juicy T-bone steak
            ctx.fillStyle = '#ef4444'; // Red meat
            ctx.beginPath();
            ctx.ellipse(0, 0, 11, 7, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            
            // Bone
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-4, -1, 3, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
        } else if (this.type === 'gold') {
            // Gold bar
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.roundRect(-10, -5, 20, 10, [2]);
            ctx.fill(); ctx.stroke();
            // Highlight
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-8, -2); ctx.lineTo(8, -2);
            ctx.stroke();
        } else {
            // Knife item (angled)
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.rect(-8, -2, 12, 4);
            ctx.lineTo(8, 0);
            ctx.lineTo(4, 2);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(-12, -1.5, 4, 3);
        }
        
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
            knives: 0,
            isDucking: false,
            jumpsLeft: 2
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
        
        // Level definition data
        this.currentLevel = 1;
        this.levelData = [
            {
                name: "Stage 1: Dojo Training Grounds",
                background: "dojo",
                length: 1800,
                bossName: "Sensei O'Kuma",
                bossStyle: 'elder',
                platforms: [
                    { x: 450, y: 270, w: 180, h: 16 },
                    { x: 800, y: 190, w: 220, h: 16 },
                    { x: 1200, y: 270, w: 180, h: 16 }
                ],
                destructibles: [
                    { x: 300, y: 314, type: 'barrel', content: 'meat' },
                    { x: 600, y: 234, type: 'crate', content: 'knife' },
                    { x: 950, y: 314, type: 'crate', content: 'gold' },
                    { x: 1400, y: 314, type: 'barrel', content: 'knife' }
                ]
            },
            {
                name: "Stage 2: Brooklyn Subway Path",
                background: "subway",
                length: 2000,
                bossName: "Subway Slasher Billy",
                bossStyle: 'leather-red',
                platforms: [
                    { x: 400, y: 280, w: 160, h: 16 },
                    { x: 480, y: 200, w: 160, h: 16 },
                    { x: 560, y: 120, w: 160, h: 16 },
                    { x: 1000, y: 280, w: 160, h: 16 },
                    { x: 1080, y: 200, w: 160, h: 16 },
                    { x: 1160, y: 120, w: 160, h: 16 },
                    { x: 1500, y: 200, w: 240, h: 16 }
                ],
                destructibles: [
                    { x: 350, y: 314, type: 'crate', content: 'knife' },
                    { x: 750, y: 164, type: 'barrel', content: 'meat' },
                    { x: 1100, y: 314, type: 'crate', content: 'meat' },
                    { x: 1500, y: 164, type: 'crate', content: 'knife' }
                ]
            },
            {
                name: "Stage 3: Gritty New York Streets",
                background: "new-york",
                length: 2200,
                bossName: "Goon Master Craig Clones",
                bossStyle: 'vigilante-clone',
                platforms: [
                    { x: 350, y: 280, w: 180, h: 16 },
                    { x: 440, y: 200, w: 180, h: 16 },
                    { x: 530, y: 120, w: 180, h: 16 },
                    { x: 850, y: 200, w: 200, h: 16 },
                    { x: 1200, y: 280, w: 180, h: 16 },
                    { x: 1290, y: 200, w: 180, h: 16 },
                    { x: 1380, y: 120, w: 180, h: 16 },
                    { x: 1750, y: 200, w: 200, h: 16 }
                ],
                destructibles: [
                    { x: 500, y: 234, type: 'barrel', content: 'meat' },
                    { x: 800, y: 154, type: 'crate', content: 'knife' },
                    { x: 1200, y: 314, type: 'barrel', content: 'gold' },
                    { x: 1700, y: 314, type: 'crate', content: 'meat' }
                ]
            },
            {
                name: "Stage 4: Rooftop Showdown",
                background: "rooftop",
                length: 2400,
                bossName: "The Dark Arts Master Craig",
                bossStyle: 'dark-master',
                platforms: [
                    { x: 300, y: 280, w: 160, h: 16 },
                    { x: 380, y: 200, w: 160, h: 16 },
                    { x: 460, y: 120, w: 160, h: 16 },
                    { x: 900, y: 280, w: 160, h: 16 },
                    { x: 980, y: 200, w: 160, h: 16 },
                    { x: 1060, y: 120, w: 160, h: 16 },
                    { x: 1500, y: 280, w: 160, h: 16 },
                    { x: 1580, y: 200, w: 160, h: 16 },
                    { x: 1660, y: 120, w: 160, h: 16 },
                    { x: 2000, y: 200, w: 200, h: 16 }
                ],
                destructibles: [
                    { x: 450, y: 244, type: 'crate', content: 'meat' },
                    { x: 900, y: 314, type: 'barrel', content: 'knife' },
                    { x: 1300, y: 244, type: 'crate', content: 'knife' },
                    { x: 1700, y: 314, type: 'barrel', content: 'meat' }
                ]
            }
        ];

        this.platforms = [];
        this.destructibles = [];
        this.items = [];

        // Game loop states
        this.gameState = 'playing'; // 'start', 'playing', 'gameover', 'victory', 'levelclear'
        this.thugSpawnTimer = 0;
        this.keys = {};

        // Bind Controls
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);

        this.bindVirtualButtons();

        // Load level 1
        this.loadLevel(1);

        // Start Animation Loop
        this.lastTime = performance.now();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    loadLevel(lvlNum) {
        this.currentLevel = lvlNum;
        const data = this.levelData[lvlNum - 1];
        this.levelLength = data.length;
        this.scrollOffset = 0;
        this.gameProgress = 0;
        this.boss = null;
        this.thugs = [];
        this.projectiles = [];
        this.debris = [];
        this.slashes = [];
        this.particles = [];
        
        // Deep copy platforms and destructibles
        this.platforms = data.platforms.map(p => ({...p}));
        this.destructibles = data.destructibles.map(d => new DestructibleObject(d.x, d.y, d.type, d.content));
        this.items = [];
    }

    advanceLevel() {
        if (this.currentLevel < 4) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
            this.player.health = Math.min(100, this.player.health + 40); // Restore health
            this.player.x = 100;
            this.player.y = this.groundY;
            this.player.vy = 0;
            this.player.state = 'idle';
            this.gameState = 'playing';
            gameAudio.playVictory();
        } else {
            this.gameState = 'victory';
            this.player.state = 'victory';
            gameAudio.playVictory();
        }
    }

    destroy() {
        this.destroyed = true;
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
        this.unbindVirtualButtons();
    }

    triggerJump() {
        if (this.gameState !== 'playing') return;
        if (this.player.state === 'hurt' || this.player.state === 'victory') return;
        
        let playerOnGround = this.player.y >= this.groundY;
        if (!playerOnGround) {
            const pxLeft = this.player.x + 10;
            const pxRight = this.player.x + this.player.width - 10;
            for (const plat of this.platforms) {
                const platScreenX = plat.x - this.scrollOffset;
                if (pxRight > platScreenX && pxLeft < platScreenX + plat.w) {
                    if (Math.abs((this.player.y + this.player.height) - plat.y) < 2) {
                        playerOnGround = true;
                        break;
                    }
                }
            }
        }

        if (playerOnGround) {
            this.player.vy = -11.5;
            this.player.state = 'jumping';
            this.player.jumpsLeft = 1;
            gameAudio.playJump();
        } else if (this.player.jumpsLeft > 0) {
            this.player.vy = -10.5;
            this.player.state = 'jumping';
            this.player.jumpsLeft = 0;
            gameAudio.playJump();

            // Spawn smoke/dust particles
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.5 + Math.random() * 2;
                this.particles.push(new GoreParticle(
                    this.player.x + this.player.width/2,
                    this.player.y + this.player.height,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - 0.5,
                    3 + Math.random() * 4,
                    '#e2e8f0'
                ));
            }
        }
    }

    handleKeyDown(e) {
        gameAudio.init(); // enable sound on first interaction
        const code = e.code;
        this.keys[code] = true;

        if (this.gameState === 'levelclear') {
            if (code === 'KeyJ' || code === 'KeyZ' || code === 'Space' || code === 'Enter') {
                this.advanceLevel();
            }
            return;
        }

        if (this.gameState === 'gameover' || this.gameState === 'victory') {
            this.resetGame();
            return;
        }

        if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') {
            this.triggerJump();
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
        bindBtn('btn-duck', () => { this.keys['KeyS'] = true; this.keys['ArrowDown'] = true; }, () => { this.keys['KeyS'] = false; this.keys['ArrowDown'] = false; });
        bindBtn('btn-right', () => { this.keys['KeyD'] = true; this.keys['ArrowRight'] = true; }, () => { this.keys['KeyD'] = false; this.keys['ArrowRight'] = false; });
        bindBtn('btn-jump', () => { this.triggerJump(); }, () => {});
        bindBtn('btn-punch', () => {
            if (this.gameState === 'gameover' || this.gameState === 'victory') {
                this.resetGame();
            } else if (this.gameState === 'levelclear') {
                this.advanceLevel();
            } else {
                this.triggerAttack('punch');
            }
        });
        bindBtn('btn-kick', () => {
            if (this.gameState === 'gameover' || this.gameState === 'victory') {
                this.resetGame();
            } else if (this.gameState === 'levelclear') {
                this.advanceLevel();
            } else {
                this.triggerAttack('kick');
            }
        });
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
        this.player.vy = 0;
        this.player.x = 100;
        this.player.y = this.groundY;
        this.player.state = 'idle';
        this.player.knives = 0;
        
        if (this.currentLevel >= 4 && this.gameState === 'victory') {
            this.currentLevel = 1;
            this.player.score = 0;
        }
        
        this.gameState = 'playing';
        this.thugSpawnTimer = 0;
        this.loadLevel(this.currentLevel);
    }

    triggerAttack(type) {
        if (this.player.state === 'hurt' || this.player.state === 'victory') return;
        this.player.state = 'attacking';
        this.player.attackType = type;
        this.player.stateTimer = 10; // attack lasts 10 frames
        
        if (type === 'punch' && this.player.knives > 0) {
            this.player.knives--;
            gameAudio.playSlice(); // throw knife sound
            const kVx = this.player.facing * 8.5;
            this.projectiles.push(new KnifeProjectile(
                this.player.x + (this.player.facing === 1 ? 40 : 5) + this.scrollOffset, // Spawn in world space
                this.player.y + 30,
                kVx,
                0,
                true // isPlayerOwned = true
            ));
            return; // skip close range check since we threw a blade!
        }
        
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
            const dist = Math.abs((this.player.x + this.player.width/2) - (thug.x - this.scrollOffset + thug.width/2));
            const yDist = Math.abs(this.player.y - thug.y);

            // Facing correct direction check
            const correctDirection = (this.player.facing === 1 && (thug.x - this.scrollOffset) > this.player.x) ||
                                     (this.player.facing === -1 && (thug.x - this.scrollOffset) < this.player.x);

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

        // 2. Check destructibles
        for (let i = this.destructibles.length - 1; i >= 0; i--) {
            const dest = this.destructibles[i];
            const dist = Math.abs((this.player.x + this.player.width/2) - (dest.x - this.scrollOffset + dest.width/2));
            const yDist = Math.abs(this.player.y - dest.y);
            const correctDirection = (this.player.facing === 1 && dest.x - this.scrollOffset > this.player.x) ||
                                     (this.player.facing === -1 && dest.x - this.scrollOffset < this.player.x);

            if (dist < range && yDist < 40 && correctDirection) {
                dest.health--;
                dest.flashTimer = 8;
                gameAudio.playPunch();
                
                if (dest.health <= 0) {
                    gameAudio.playGlassShatter();
                    // Spawn wooden shards
                    for (let k = 0; k < 6; k++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 1 + Math.random() * 3;
                        this.particles.push(new GoreParticle(
                            dest.x + dest.width/2,
                            dest.y + dest.height/2,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed - 1,
                            3 + Math.random() * 4,
                            '#a0522d'
                        ));
                    }
                    // Spawn pickable item
                    this.items.push(new PickableItem(dest.x, dest.y, dest.content));
                    this.destructibles.splice(i, 1);
                }
            }
        }

        // 3. Check boss
        if (this.boss) {
            const dist = Math.abs((this.player.x + this.player.width/2) - (this.boss.x - this.scrollOffset + this.boss.width/2));
            const yDist = Math.abs(this.player.y - this.boss.y);
            const correctDirection = (this.player.facing === 1 && (this.boss.x - this.scrollOffset) > this.player.x) ||
                                     (this.player.facing === -1 && (this.boss.x - this.scrollOffset) < this.player.x);

            if (dist < range + 20 && yDist < 50 && correctDirection) {
                this.boss.health--;
                this.boss.flashTimer = 8;
                
                if (this.boss.health <= 0) {
                    // Defeated Boss!
                    gameAudio.playVictory();
                    this.spawnGore(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2, 'boss');
                    this.boss = null;
                    
                    if (this.currentLevel === 4) {
                        this.gameState = 'victory';
                        this.player.state = 'victory';
                    } else {
                        this.gameState = 'levelclear';
                        this.player.state = 'victory';
                    }
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
        if (this.gameState === 'gameover' || this.gameState === 'victory' || this.gameState === 'levelclear') {
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

        // Ducking & Ground Check for Crouch
        const isDuckKey = this.keys['KeyS'] || this.keys['ArrowDown'];
        let playerOnGround = this.player.y >= this.groundY;
        if (!playerOnGround) {
            const pxLeft = this.player.x + 10;
            const pxRight = this.player.x + this.player.width - 10;
            for (const plat of this.platforms) {
                const platScreenX = plat.x - this.scrollOffset;
                if (pxRight > platScreenX && pxLeft < platScreenX + plat.w) {
                    if (Math.abs((this.player.y + this.player.height) - plat.y) < 2) {
                        playerOnGround = true;
                        break;
                    }
                }
            }
        }

        const wantsToDuck = isDuckKey && playerOnGround && this.player.state !== 'hurt';

        if (wantsToDuck) {
            if (!this.player.isDucking) {
                this.player.isDucking = true;
                this.player.y += 30;
                this.player.height = 45;
            }
            this.player.vx = 0;
            if (this.player.state !== 'attacking' && this.player.state !== 'hurt') {
                this.player.state = 'ducking';
            }
        } else {
            if (this.player.isDucking) {
                this.player.isDucking = false;
                this.player.y -= 30;
                this.player.height = 75;
            }
            if (this.player.state !== 'attacking' && this.player.state !== 'hurt') {
                this.player.vx = moveInput * 4.5;
                if (moveInput !== 0) {
                    this.player.state = (this.player.y < this.groundY) ? 'jumping' : 'walking';
                } else {
                    this.player.state = (this.player.y < this.groundY) ? 'jumping' : 'idle';
                }
            }
        }

        // Apply Gravity & Platform Landing Check
        this.player.vy += 0.55; // gravity force
        const nextY = this.player.y + this.player.vy;
        const prevBottom = this.player.y + this.player.height;
        const nextBottom = nextY + this.player.height;
        
        let landed = false;
        let targetY = this.groundY;
        
        if (nextY >= this.groundY) {
            landed = true;
            targetY = this.groundY;
        } else {
            // Check platforms landing (only if falling down)
            if (this.player.vy >= 0) {
                const pxLeft = this.player.x + 10;
                const pxRight = this.player.x + this.player.width - 10;
                for (const plat of this.platforms) {
                    const platScreenX = plat.x - this.scrollOffset;
                    if (pxRight > platScreenX && pxLeft < platScreenX + plat.w) {
                        if (prevBottom <= plat.y && nextBottom >= plat.y) {
                            landed = true;
                            targetY = plat.y - this.player.height;
                            break;
                        }
                    }
                }
            }
        }
        
        if (landed) {
            this.player.y = targetY;
            this.player.vy = 0;
            this.player.jumpsLeft = 2; // Reset double jump
            if (this.player.state === 'jumping') {
                this.player.state = 'idle';
            }
        } else {
            this.player.y = nextY;
            if (this.player.y < this.groundY && this.player.state !== 'hurt' && this.player.state !== 'attacking') {
                this.player.state = 'jumping';
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
                    const isThrower = (this.currentLevel > 1 && Math.random() < 0.15 + this.currentLevel * 0.08);
                    this.thugs.push({
                        x: 820 + this.scrollOffset, // Spawn in world space
                        y: this.groundY,
                        width: 40,
                        height: 75,
                        speed: 1.8 + Math.random() * 0.8,
                        facing: -1,
                        style: Math.floor(Math.random() * 5),
                        isKnifeThrower: isThrower,
                        throwCooldown: 40 + Math.random() * 60
                    });
                }
            }
        } else {
            // Level Scroll at 100%: Spawn Boss if not spawned yet
            if (!this.boss && this.gameState === 'playing') {
                const lvlData = this.levelData[this.currentLevel - 1];
                const maxHp = 5 + this.currentLevel * 2;
                this.boss = {
                    name: lvlData.bossName,
                    style: lvlData.bossStyle,
                    x: 820 + this.scrollOffset, // Spawn in world space
                    y: this.groundY,
                    width: 55,
                    height: 95,
                    speed: 1.0 + this.currentLevel * 0.1,
                    health: maxHp,
                    maxHealth: maxHp,
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
            
            // Thugs walk towards Craig or keep distance if throwers
            const dist = Math.abs((this.player.x + this.player.width/2) - (thug.x - this.scrollOffset + thug.width/2));
            const yDist = Math.abs(this.player.y - thug.y);
            const dir = (this.player.x - (thug.x - this.scrollOffset) > 0) ? 1 : -1;
            
            if (thug.isKnifeThrower) {
                // Keep range distance
                if (dist > 250) {
                    thug.x += dir * thug.speed;
                    thug.facing = dir;
                } else {
                    thug.facing = dir;
                    thug.throwCooldown--;
                    if (thug.throwCooldown <= 0) {
                        thug.throwCooldown = 110 + Math.random() * 80;
                        // Throw knife
                        const kVx = thug.facing * 5.5;
                        this.projectiles.push(new KnifeProjectile(
                            thug.x + (thug.facing === 1 ? 40 : -10),
                            thug.y + 30,
                            kVx,
                            0,
                            false
                        ));
                    }
                }
            } else {
                // Regular walk up and punch
                thug.x += dir * thug.speed;
                thug.facing = dir;

                // Collision check: Thug punches player
                if (dist < 32 && yDist < 30 && this.player.state !== 'hurt' && this.player.state !== 'victory') {
                    this.triggerPlayerHurt(10);
                }
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
                const dir = (this.player.x - (this.boss.x - this.scrollOffset) > 0) ? 1 : -1;
                this.boss.x += dir * this.boss.speed;
                this.boss.facing = dir;
            }

            if (this.boss.flashTimer > 0) this.boss.flashTimer--;

            // Boss attacks
            this.boss.throwTimer--;
            if (this.boss.throwTimer <= 0) {
                this.boss.throwTimer = 110 + Math.random() * 60; // 2-3 seconds
                const bVx = this.boss.facing * 6.5;
                
                if (this.boss.style === 'elder') {
                    // Sensei throws a fast shuriken (using KnifeProjectile)
                    this.projectiles.push(new KnifeProjectile(
                        this.boss.x + (this.boss.facing === 1 ? 50 : -10),
                        this.boss.y + 25,
                        bVx * 1.2,
                        0,
                        false
                    ));
                } else if (this.boss.style === 'leather-red') {
                    // Billy throws knives
                    this.projectiles.push(new KnifeProjectile(
                        this.boss.x + (this.boss.facing === 1 ? 50 : -10),
                        this.boss.y + 25,
                        bVx,
                        0,
                        false
                    ));
                } else if (this.boss.style === 'dark-master') {
                    // Dark Master throws 3 knives spread shot!
                    this.projectiles.push(new KnifeProjectile(this.boss.x + (this.boss.facing === 1 ? 50 : -10), this.boss.y + 25, bVx, -1.5, false));
                    this.projectiles.push(new KnifeProjectile(this.boss.x + (this.boss.facing === 1 ? 50 : -10), this.boss.y + 25, bVx, 0, false));
                    this.projectiles.push(new KnifeProjectile(this.boss.x + (this.boss.facing === 1 ? 50 : -10), this.boss.y + 25, bVx, 1.5, false));
                } else {
                    // Clone/default: throws bottles
                    this.projectiles.push(new BottleProjectile(
                        this.boss.x + (this.boss.facing === 1 ? 50 : -10),
                        this.boss.y + 25,
                        bVx,
                        -3
                    ));
                }
            }

            // Contact damage with Boss
            const dist = Math.abs((this.player.x + this.player.width/2) - (this.boss.x - this.scrollOffset + this.boss.width/2));
            const yDist = Math.abs(this.player.y - this.boss.y);
            if (dist < 42 && yDist < 40 && this.player.state !== 'hurt' && this.player.state !== 'victory') {
                this.triggerPlayerHurt(20);
            }
        }

        // Update Projectiles (bottles/knives)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update();

            let destroyed = false;

            if (proj.isPlayerOwned) {
                // Check thug hits
                for (let j = this.thugs.length - 1; j >= 0; j--) {
                    const thug = this.thugs[j];
                    const dist = Math.abs(proj.x - (thug.x + thug.width/2));
                    const yDist = Math.abs(proj.y - (thug.y + thug.height/2));
                    if (dist < 25 && yDist < 40) {
                        gameAudio.playSlice();
                        this.player.score += 150;
                        this.spawnGore(thug.x + thug.width/2, thug.y + thug.height/2, 'thug', thug.style);
                        this.thugs.splice(j, 1);
                        destroyed = true;
                        break;
                    }
                }
                
                // Check boss hits
                if (!destroyed && this.boss) {
                    const dist = Math.abs(proj.x - (this.boss.x + this.boss.width/2));
                    const yDist = Math.abs(proj.y - (this.boss.y + this.boss.height/2));
                    if (dist < 30 && yDist < 50) {
                        this.boss.health--;
                        this.boss.flashTimer = 8;
                        gameAudio.playSlice();
                        destroyed = true;
                        
                        if (this.boss.health <= 0) {
                            gameAudio.playVictory();
                            this.spawnGore(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2, 'boss');
                            this.boss = null;
                            if (this.currentLevel === 4) {
                                this.gameState = 'victory';
                                this.player.state = 'victory';
                            } else {
                                this.gameState = 'levelclear';
                                this.player.state = 'victory';
                            }
                        } else {
                            this.boss.vx = this.player.facing * 3;
                            this.boss.vy = -2.5;
                        }
                    }
                }
            } else {
                // Enemy projectile hitting player
                const dist = Math.abs((proj.x - this.scrollOffset) - (this.player.x + this.player.width/2));
                const yDist = Math.abs(proj.y - (this.player.y + this.player.height/2));

                if (dist < 25 && yDist < 35 && this.player.state !== 'hurt' && this.player.state !== 'victory') {
                    if (proj instanceof BottleProjectile) {
                        gameAudio.playGlassShatter();
                        this.triggerPlayerHurt(15);
                    } else {
                        gameAudio.playSlice();
                        this.triggerPlayerHurt(12);
                    }
                    destroyed = true;
                }
            }

            // Impact ground or out of bounds
            if (!destroyed && (proj.y > this.groundY + 60 || proj.x - this.scrollOffset < -100 || proj.x - this.scrollOffset > 900)) {
                if (proj instanceof BottleProjectile) {
                    gameAudio.playGlassShatter();
                }
                destroyed = true;
            }

            if (destroyed) {
                this.projectiles.splice(i, 1);
            }
        }

        // Update Pickable Items
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update();
            
            // Check collision with player
            const dist = Math.abs((item.x - this.scrollOffset) - this.player.x);
            const yDist = Math.abs(item.y - this.player.y);
            
            if (dist < 30 && yDist < 60) {
                // Pick up!
                if (item.type === 'meat') {
                    this.player.health = Math.min(100, this.player.health + 35);
                    gameAudio.playVictory();
                } else if (item.type === 'knife') {
                    this.player.knives += 3;
                    gameAudio.playVictory();
                } else if (item.type === 'gold') {
                    this.player.score += 500;
                    gameAudio.playVictory();
                }
                this.items.splice(i, 1);
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
        const bgType = this.levelData[this.currentLevel - 1].background;
        if (bgType === 'dojo') {
            this.ctx.fillStyle = '#2b1810';
        } else if (bgType === 'subway') {
            this.ctx.fillStyle = '#1c1917';
        } else if (bgType === 'rooftop') {
            this.ctx.fillStyle = '#0a0e17';
        } else {
            this.ctx.fillStyle = '#080c14'; // dark sky
        }
        this.ctx.fillRect(0, 0, 800, 480);

        // Parallax Layers
        this.drawParallaxStars();
        this.drawParallaxBuildings();
        this.drawRoadAndWalls();

        // Draw Platforms
        this.drawPlatforms();

        // Draw Destructibles
        this.destructibles.forEach(d => d.draw(this.ctx, this.scrollOffset));

        // Draw Items
        this.items.forEach(item => item.draw(this.ctx, this.scrollOffset));

        // Draw Debris (behind characters)
        this.debris.forEach(d => d.draw(this.ctx, this.scrollOffset));

        // Draw Thugs
        this.thugs.forEach(thug => this.drawThug(thug));

        // Draw Boss
        if (this.boss) this.drawBoss();

        // Draw Player (Craig)
        this.drawCraig();

        // Draw Projectiles
        this.projectiles.forEach(p => p.draw(this.ctx, this.scrollOffset));

        // Draw Slashes (on top)
        this.slashes.forEach(s => s.draw(this.ctx));

        // Draw Particles
        this.particles.forEach(p => p.draw(this.ctx, this.scrollOffset));

        // Draw UI Hud
        this.drawHUD();

        // Draw Overlays
        if (this.gameState === 'gameover') {
            this.drawGameOverScreen();
        } else if (this.gameState === 'victory') {
            this.drawVictoryScreen();
        } else if (this.gameState === 'levelclear') {
            this.drawLevelClearScreen();
        }
    }

    // --- Parallax Background Artworks ---

    drawParallaxStars() {
        const bgType = this.levelData[this.currentLevel - 1].background;
        if (bgType === 'dojo' || bgType === 'subway') {
            return; // Indoor stage
        }

        const offset = this.scrollOffset * 0.05;
        this.ctx.fillStyle = '#ffffff';
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
        if (bgType === 'rooftop') {
            this.ctx.fillStyle = '#fbbf24'; // large golden moon
            this.ctx.shadowColor = '#d97706';
            this.ctx.shadowBlur = 40;
            this.ctx.beginPath();
            this.ctx.arc(mx, 75, 35, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.fillStyle = '#f4f1de';
            this.ctx.beginPath();
            this.ctx.arc(mx, 75, 25, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawParallaxBuildings() {
        const bgType = this.levelData[this.currentLevel - 1].background;
        
        if (bgType === 'dojo') {
            // Draw Shoji screens sliding behind
            const offset = this.scrollOffset * 0.2;
            this.ctx.fillStyle = '#f5f5f4'; // paper color
            
            for (let i = 0; i < 5; i++) {
                let px = (i * 300 - offset) % 1500;
                if (px < -260) px += 1500;
                
                // Screen body
                this.ctx.fillRect(px, 120, 240, 230);
                
                // Grids
                this.ctx.strokeStyle = '#442816'; // wood frame
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(px, 120, 240, 230);
                
                this.ctx.strokeStyle = '#6b4226';
                this.ctx.lineWidth = 1.5;
                // horizontal dividers
                for (let y = 120 + 38; y < 350; y += 38) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, y); this.ctx.lineTo(px + 240, y);
                    this.ctx.stroke();
                }
                // vertical dividers
                for (let x = px + 48; x < px + 240; x += 48) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 120); this.ctx.lineTo(x, 350);
                    this.ctx.stroke();
                }
            }
            return;
        }
        
        if (bgType === 'subway') {
            // Draw subway tiled wall background
            const offset = this.scrollOffset * 0.2;
            this.ctx.fillStyle = '#d6d3d1'; // tiled wall color
            this.ctx.fillRect(0, 100, 800, 250);
            
            // Tile grid lines
            this.ctx.strokeStyle = '#a8a29e';
            this.ctx.lineWidth = 1;
            let tileOffset = -offset % 40;
            for (let x = tileOffset; x < 840; x += 40) {
                this.ctx.beginPath(); this.ctx.moveTo(x, 100); this.ctx.lineTo(x, 350); this.ctx.stroke();
            }
            for (let y = 100; y < 350; y += 20) {
                this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(800, y); this.ctx.stroke();
            }
            
            // Dark arched tunnel alcoves
            this.ctx.fillStyle = '#1c1917';
            for (let i = 0; i < 4; i++) {
                let ax = (i * 350 - offset) % 1400;
                if (ax < -120) ax += 1400;
                
                this.ctx.beginPath();
                this.ctx.roundRect(ax, 140, 120, 210, [40, 40, 0, 0]);
                this.ctx.fill();
            }
            return;
        }

        if (bgType === 'rooftop') {
            // Draw rooftop water tower and distant buildings silhouette
            const offset = this.scrollOffset * 0.25;
            this.ctx.fillStyle = '#0f172a'; // very dark slate
            
            const structures = [
                { x: 50, w: 100, h: 280, type: 'watertower' },
                { x: 220, w: 140, h: 240, type: 'building' },
                { x: 420, w: 90, h: 200, type: 'building' },
                { x: 580, w: 160, h: 300, type: 'building' }
            ];
            
            structures.forEach(s => {
                let sx = (s.x - offset) % 850;
                if (sx < -s.w) sx += 850;
                
                if (s.type === 'watertower') {
                    // Legs
                    this.ctx.strokeStyle = '#0f172a';
                    this.ctx.lineWidth = 4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(sx + 20, 350); this.ctx.lineTo(sx + 30, 270);
                    this.ctx.moveTo(sx + 80, 350); this.ctx.lineTo(sx + 70, 270);
                    this.ctx.stroke();
                    // Tower body
                    this.ctx.fillRect(sx + 25, 200, 50, 70);
                    // Cone roof
                    this.ctx.beginPath();
                    this.ctx.moveTo(sx + 20, 200);
                    this.ctx.lineTo(sx + 50, 160);
                    this.ctx.lineTo(sx + 80, 200);
                    this.ctx.closePath();
                    this.ctx.fill();
                } else {
                    this.ctx.fillRect(sx, 350 - s.h, s.w, s.h);
                }
            });
            return;
        }

        // Default: New York Street buildings
        const offset = this.scrollOffset * 0.25;
        this.ctx.fillStyle = '#141a29'; // dark skyline color
        
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
            this.ctx.fillStyle = '#141a29';
            this.ctx.globalAlpha = 1.0;
        });
    }

    drawRoadAndWalls() {
        const offset = this.scrollOffset;
        const bgType = this.levelData[this.currentLevel - 1].background;
        
        if (bgType === 'dojo') {
            // Dojo wooden floor and pillars
            this.ctx.fillStyle = '#442816'; // wooden panels wall
            this.ctx.fillRect(0, 240, 800, 110);
            
            this.ctx.strokeStyle = '#2b1810';
            this.ctx.lineWidth = 2;
            for (let y = 240; y < 350; y += 28) {
                this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(800, y); this.ctx.stroke();
            }
            
            // Wooden floor base
            this.ctx.fillStyle = '#8b5a2b';
            this.ctx.fillRect(0, 350, 800, 130);
            
            this.ctx.strokeStyle = '#2b1810';
            this.ctx.lineWidth = 5;
            this.ctx.beginPath(); this.ctx.moveTo(0, 350); this.ctx.lineTo(800, 350); this.ctx.stroke();
            
            this.ctx.strokeStyle = '#5c3d24';
            this.ctx.lineWidth = 2;
            let floorOffset = -offset % 90;
            for (let fx = floorOffset; fx < 850; fx += 90) {
                this.ctx.beginPath();
                this.ctx.moveTo(fx, 350);
                this.ctx.lineTo(fx - 50, 480);
                this.ctx.stroke();
            }
            
            // Dojo Pillars (wooden logs)
            let pillarX = (300 - offset) % 500;
            if (pillarX < -40) pillarX += 500;
            this.ctx.save();
            this.ctx.fillStyle = '#5c3d24';
            this.ctx.strokeStyle = '#1a0e08';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.roundRect(pillarX, 100, 35, 250, [2]);
            this.ctx.fill(); this.ctx.stroke();
            this.ctx.restore();
            return;
        }
        
        if (bgType === 'subway') {
            this.ctx.fillStyle = '#334155'; // tiled platform wall bottom
            this.ctx.fillRect(0, 240, 800, 110);
            
            this.ctx.fillStyle = '#1e293b'; // concrete platform
            this.ctx.fillRect(0, 350, 800, 130);
            
            // Yellow safety line
            this.ctx.fillStyle = '#eab308';
            this.ctx.fillRect(0, 350, 800, 15);
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(0, 350, 800, 15);
            
            this.ctx.strokeStyle = '#0f172a';
            this.ctx.lineWidth = 2.5;
            let tileOffset = -offset % 100;
            for (let fx = tileOffset; fx < 850; fx += 100) {
                this.ctx.beginPath();
                this.ctx.moveTo(fx, 365);
                this.ctx.lineTo(fx - 40, 480);
                this.ctx.stroke();
            }
            
            // Subway Steel Pillars (Red)
            let pillarX = (250 - offset) % 400;
            if (pillarX < -40) pillarX += 400;
            this.ctx.save();
            this.ctx.fillStyle = '#b91c1c';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.fillRect(pillarX, 80, 30, 270);
            this.ctx.strokeRect(pillarX, 80, 30, 270);
            this.ctx.fillStyle = '#7f1d1d';
            this.ctx.fillRect(pillarX + 5, 100, 20, 10);
            this.ctx.fillRect(pillarX + 5, 200, 20, 10);
            this.ctx.fillRect(pillarX + 5, 300, 20, 10);
            this.ctx.restore();
            return;
        }

        if (bgType === 'rooftop') {
            this.ctx.fillStyle = '#0f172a';
            this.ctx.fillRect(0, 240, 800, 110);
            
            this.ctx.strokeStyle = '#334155';
            this.ctx.lineWidth = 1.5;
            let fenceOffset = -offset % 30;
            this.ctx.save();
            this.ctx.beginPath();
            for (let fx = fenceOffset; fx < 820; fx += 20) {
                this.ctx.moveTo(fx, 240); this.ctx.lineTo(fx + 20, 350);
                this.ctx.moveTo(fx + 20, 240); this.ctx.lineTo(fx, 350);
            }
            this.ctx.stroke();
            this.ctx.restore();
            
            this.ctx.fillStyle = '#475569';
            this.ctx.fillRect(0, 350, 800, 130);
            
            this.ctx.fillStyle = '#334155';
            this.ctx.fillRect(0, 350, 800, 10);
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2.5;
            this.ctx.strokeRect(0, 350, 800, 10);
            
            this.ctx.strokeStyle = '#1e293b';
            this.ctx.lineWidth = 2;
            let crackOffset = -offset % 120;
            for (let fx = crackOffset; fx < 850; fx += 120) {
                this.ctx.beginPath();
                this.ctx.moveTo(fx, 360);
                this.ctx.lineTo(fx - 30, 480);
                this.ctx.stroke();
            }
            return;
        }

        // Default New York Street
        this.ctx.fillStyle = '#221814'; // brick wall
        this.ctx.fillRect(0, 240, 800, 110);

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

        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 350, 800, 130);

        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 350);
        this.ctx.lineTo(800, 350);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#1a202c';
        this.ctx.lineWidth = 2.5;
        let groundOffset = -offset % 100;
        for (let gx = groundOffset; gx < 850; gx += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(gx, 350);
            this.ctx.lineTo(gx - 40, 480);
            this.ctx.stroke();
        }

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
        
        this.ctx.fillStyle = '#ffe3a8';
        this.ctx.shadowColor = '#ffb703';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(lampX - 25, 175, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawPlatforms() {
        this.platforms.forEach(plat => {
            const sx = plat.x - this.scrollOffset;
            if (sx < -plat.w || sx > 800) return; // offscreen
            
            this.ctx.save();
            const bgType = this.levelData[this.currentLevel - 1].background;
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3.5;
            
            if (bgType === 'dojo') {
                // Wooden platform
                this.ctx.fillStyle = '#8b5a2b';
                this.ctx.fillRect(sx, plat.y, plat.w, plat.h);
                this.ctx.strokeRect(sx, plat.y, plat.w, plat.h);
                this.ctx.strokeStyle = '#5c3d24';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(sx, plat.y + plat.h/2); this.ctx.lineTo(sx + plat.w, plat.y + plat.h/2);
                this.ctx.stroke();
            } else if (bgType === 'subway') {
                // Steel girder
                this.ctx.fillStyle = '#475569';
                this.ctx.fillRect(sx, plat.y, plat.w, plat.h);
                this.ctx.strokeRect(sx, plat.y, plat.w, plat.h);
                this.ctx.strokeStyle = '#1e293b';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                for (let px = sx; px < sx + plat.w; px += 20) {
                    this.ctx.moveTo(px, plat.y);
                    this.ctx.lineTo(px + 10, plat.y + plat.h);
                    this.ctx.moveTo(px + 10, plat.y);
                    this.ctx.lineTo(px, plat.y + plat.h);
                }
                this.ctx.stroke();
            } else {
                // Concrete scaffold
                this.ctx.fillStyle = '#64748b';
                this.ctx.fillRect(sx, plat.y, plat.w, plat.h);
                this.ctx.strokeRect(sx, plat.y, plat.w, plat.h);
                
                // Caution stripes
                this.ctx.fillStyle = '#fbbf24';
                for (let px = sx; px < sx + plat.w; px += 30) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, plat.y);
                    this.ctx.lineTo(px + 10, plat.y);
                    this.ctx.lineTo(px + 20, plat.y + plat.h);
                    this.ctx.lineTo(px + 10, plat.y + plat.h);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }
            this.ctx.restore();
        });
    }

    drawLevelClearScreen() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(10, 12, 16, 0.9)';
        this.ctx.fillRect(0, 0, 800, 480);

        this.ctx.fillStyle = '#ffb703';
        this.ctx.font = '800 48px "Outfit", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.levelData[this.currentLevel - 1].name.toUpperCase()} CLEAR!`, 400, 190);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '500 18px "Inter", sans-serif';
        this.ctx.fillText(`CURRENT SCORE: ${this.player.score}`, 400, 240);
        this.ctx.fillText("You are advancing deeper into the dark arts path...", 400, 280);

        this.ctx.fillStyle = '#ff6a00';
        this.ctx.font = '700 16px "Outfit", sans-serif';
        this.ctx.fillText("PRESS J, Z OR TAP ACTION BUTTON TO START NEXT STAGE", 400, 345);

        this.ctx.restore();
    }

    // --- Drawing Characters ---

    drawCraig() {
        const p = this.player;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        
        // Squish character if ducking (height shrinks from 75 to 45)
        if (p.isDucking) {
            this.ctx.scale(1, 0.6);
        }
        
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
            
            // Continuous muscle arm path (eliminates stacked circles)
            this.ctx.beginPath();
            this.ctx.moveTo(13, 20); // Shoulder top
            this.ctx.quadraticCurveTo(2, 22, 1, 30); // Deltoid/bicep curve
            this.ctx.quadraticCurveTo(0, 38, 3, 41); // Forearm bulge
            this.ctx.lineTo(8, 41);
            this.ctx.quadraticCurveTo(11, 36, 10, 29); // Inner forearm
            this.ctx.lineTo(13, 26);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            // Fist Lobe
            this.ctx.beginPath();
            this.ctx.arc(5, 42, 4.5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

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
        this.ctx.fillStyle = 'rgba(84, 28, 14, 0.15)';
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
        this.ctx.moveTo(13, 33); this.ctx.quadraticCurveTo(17, 34, 22, 33);
        this.ctx.moveTo(14, 38); this.ctx.quadraticCurveTo(17, 39, 22, 38);
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
                // Deltoid to fist extending to the right in a continuous contour path
                const armGrad = this.ctx.createLinearGradient(20, 24, 60, 24);
                armGrad.addColorStop(0, skinHighlight);
                armGrad.addColorStop(0.5, skinMid);
                armGrad.addColorStop(1, skinShadow);
                this.ctx.fillStyle = armGrad;

                // Continuous punching arm path (no stacked balls)
                this.ctx.beginPath();
                this.ctx.moveTo(22, 18); // Shoulder top
                this.ctx.quadraticCurveTo(34, 16, 48, 19); // Top edge
                this.ctx.lineTo(52, 21); // Wrist top
                this.ctx.lineTo(52, 27); // Wrist bottom
                this.ctx.quadraticCurveTo(36, 29, 22, 28); // Underarm/elbow
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();

                // Fist
                this.ctx.beginPath();
                this.ctx.arc(56, 24, 6.5, 0, Math.PI * 2);
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

                // Draw front sleeved arm pulled back to chest as guard (bent elbow)
                this.ctx.fillStyle = saffronGrad;
                this.ctx.strokeStyle = '#000';
                this.ctx.beginPath();
                this.ctx.moveTo(22, 20); // Shoulder
                this.ctx.lineTo(13, 26); // Upper arm
                this.ctx.lineTo(17, 34); // Forearm
                this.ctx.lineTo(21, 30); // Inner fold
                this.ctx.closePath();
                this.ctx.fill(); this.ctx.stroke();
                
                // Fist
                this.ctx.fillStyle = skinGrad;
                this.ctx.beginPath();
                this.ctx.arc(17, 34, 4.5, 0, Math.PI * 2);
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
            // Idle front arm (sleeved in saffron terracotta) - smooth drape path
            this.ctx.fillStyle = saffronGrad;
            
            this.ctx.beginPath();
            this.ctx.moveTo(27, 20); // Neck/shoulder joint
            this.ctx.quadraticCurveTo(39, 18, 41, 26); // Outer deltoid
            this.ctx.quadraticCurveTo(43, 33, 40, 37); // Sleeve drape down
            this.ctx.lineTo(32, 38);
            this.ctx.quadraticCurveTo(28, 30, 27, 24); // Inner armpit
            this.ctx.closePath();
            this.ctx.fill(); this.ctx.stroke();
            
            // Cuff ellipse
            this.ctx.beginPath();
            this.ctx.ellipse(36, 37.5, 4, 1.5, 0, 0, Math.PI * 2);
            this.ctx.stroke();

            // Hand (bare skin) sticking out
            this.ctx.fillStyle = skinGrad;
            this.ctx.beginPath();
            this.ctx.arc(36, 42, 4.5, 0, Math.PI * 2); // Fist
            this.ctx.fill(); this.ctx.stroke();
        }

        // 5. Head & Face (Tapered oval shape, realistic features, scar under right eye)
        const headGrad = this.ctx.createRadialGradient(20, 6, 2, 22, 10, 10);
        headGrad.addColorStop(0, skinHighlight);
        headGrad.addColorStop(0.5, skinMid);
        headGrad.addColorStop(1, skinShadow);
        
        // Shaded ears (smaller realistic lobes)
        this.ctx.fillStyle = headGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.ellipse(14.5, 9.5, 1.5, 2.5, Math.PI / 10, 0, Math.PI * 2);
        this.ctx.ellipse(29.5, 9.5, 1.5, 2.5, -Math.PI / 10, 0, Math.PI * 2);
        this.ctx.fill(); this.ctx.stroke();
        
        // Tapered oval head shape
        this.ctx.beginPath();
        this.ctx.moveTo(16, 7);
        this.ctx.quadraticCurveTo(22, 1, 28, 7); // Skull cap
        this.ctx.quadraticCurveTo(29, 14, 25, 17); // Right jaw
        this.ctx.lineTo(19, 17); // Chin
        this.ctx.quadraticCurveTo(15, 14, 16, 7); // Left jaw
        this.ctx.closePath();
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

            // Open gritting teeth mouth (smooth shape, not barcode)
            this.ctx.fillStyle = '#4a121a'; // dark red mouth interior
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1.8;
            this.ctx.beginPath();
            this.ctx.roundRect(17, 13.5, 10, 3.5, [1]);
            this.ctx.fill();
            this.ctx.stroke();

            // Teeth line
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(17.5, 15.2); this.ctx.lineTo(26.5, 15.2);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawThug(thug) {
        this.ctx.save();
        this.ctx.translate(thug.x - this.scrollOffset, thug.y);

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
        this.ctx.translate(b.x - this.scrollOffset, b.y);

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
        this.ctx.fillText(`${this.levelData[this.currentLevel - 1].name.toUpperCase()} PROGRESS`, 25, 65);

        // Knives inventory counter
        this.ctx.fillStyle = '#ffb703';
        this.ctx.font = '800 15px "Outfit", sans-serif';
        this.ctx.fillText(`🗡️ x ${this.player.knives}`, 25, 85);

        // Player Health Bar
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '500 10px "Outfit", sans-serif';
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
            this.ctx.fillText(`BOSS: ${this.boss.name.toUpperCase()}`, 300, 30);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.fillRect(300, 38, 200, 12);
            
            this.ctx.fillStyle = '#ff6a00'; // orange
            this.ctx.fillRect(300, 38, 200 * (this.boss.health / this.boss.maxHealth), 12);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
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
        this.ctx.fillText(`PRESS ANY KEY OR TAP CONTROLLER TO RESTART STAGE ${this.currentLevel}`, 400, 310);

        this.ctx.restore();
    }

    drawVictoryScreen() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(10, 12, 16, 0.85)';
        this.ctx.fillRect(0, 0, 800, 480);

        this.ctx.fillStyle = '#ffb703';
        this.ctx.font = '800 52px "Outfit", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("ALL STAGES COMPLETE!", 400, 190);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '500 18px "Inter", sans-serif';
        this.ctx.fillText("You conquered all 4 stages of the Forbidden Shaolin Arts and sliced NYC clean!", 400, 240);
        this.ctx.fillText(`FINAL SCORE: ${this.player.score}`, 400, 280);

        this.ctx.fillStyle = '#00b4d8';
        this.ctx.font = '700 16px "Outfit", sans-serif';
        this.ctx.fillText("PRESS ANY KEY OR TAP TO PLAY AGAIN FROM STAGE 1", 400, 330);

        this.ctx.restore();
    }
}

// Export class globally
window.RetroGameController = RetroGameController;
