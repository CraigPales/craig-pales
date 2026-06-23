// Craig Pales Retro Action Game Engine (Simplified, Stable NES Style)

// --- Sprite Cache & Chroma Key Engine ---
const spriteCache = {};
window.spriteCache = spriteCache;

function floodFillChromaKey(img, keyColor = {r: 0, g: 0, b: 0}, tolerance = 50) {
    const tempCanvas = document.createElement('canvas');
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);
    
    if (width === 0 || height === 0) return tempCanvas;
    
    try {
        const imgData = tempCtx.getImageData(0, 0, width, height);
        const data = imgData.data;
        
        // BFS queue and visited array to clean background black
        const visited = new Uint8Array(width * height);
        const queue = [];
        
        // Seed from all edges to clean the background black padding
        for (let x = 0; x < width; x++) {
            let idx = x;
            visited[idx] = 1;
            queue.push(idx);
            
            idx = (height - 1) * width + x;
            visited[idx] = 1;
            queue.push(idx);
        }
        for (let y = 1; y < height - 1; y++) {
            let idx = y * width;
            visited[idx] = 1;
            queue.push(idx);
            
            idx = y * width + (width - 1);
            visited[idx] = 1;
            queue.push(idx);
        }
        
        const tolSq = tolerance * tolerance;
        
        let qHead = 0;
        while (qHead < queue.length) {
            const currIdx = queue[qHead++];
            const currX = currIdx % width;
            const currY = Math.floor(currIdx / width);
            
            const r = data[currIdx * 4];
            const g = data[currIdx * 4 + 1];
            const b = data[currIdx * 4 + 2];
            const a = data[currIdx * 4 + 3];
            
            const distSq = (r - keyColor.r) * (r - keyColor.r) +
                           (g - keyColor.g) * (g - keyColor.g) +
                           (b - keyColor.b) * (b - keyColor.b);
            
            if (a === 0 || distSq < tolSq) {
                data[currIdx * 4 + 3] = 0; // Transparent
                
                const n1 = currIdx + 1;
                if (currX < width - 1 && !visited[n1]) { visited[n1] = 1; queue.push(n1); }
                
                const n2 = currIdx - 1;
                if (currX > 0 && !visited[n2]) { visited[n2] = 1; queue.push(n2); }
                
                const n3 = currIdx + width;
                if (currY < height - 1 && !visited[n3]) { visited[n3] = 1; queue.push(n3); }
                
                const n4 = currIdx - width;
                if (currY > 0 && !visited[n4]) { visited[n4] = 1; queue.push(n4); }
            }
        }
        
        // Post-process: clean up dark border pixels (anti-aliasing halo residue)
        const borderPixels = [];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                if (data[idx * 4 + 3] > 0) {
                    const n1 = idx + 1;
                    const n2 = idx - 1;
                    const n3 = idx + width;
                    const n4 = idx - width;
                    
                    if (data[n1 * 4 + 3] === 0 || data[n2 * 4 + 3] === 0 || data[n3 * 4 + 3] === 0 || data[n4 * 4 + 3] === 0) {
                        const r = data[idx * 4];
                        const g = data[idx * 4 + 1];
                        const b = data[idx * 4 + 2];
                        const distSq = (r - keyColor.r) * (r - keyColor.r) +
                                       (g - keyColor.g) * (g - keyColor.g) +
                                       (b - keyColor.b) * (b - keyColor.b);
                        if (distSq < 2025) { // 45^2
                            borderPixels.push(idx);
                        }
                    }
                }
            }
        }
        for (const idx of borderPixels) {
            data[idx * 4 + 3] = 0;
        }
        
        tempCtx.putImageData(imgData, 0, 0);
    } catch (e) {
        console.warn("Flood fill chroma key failed (CORS/context):", e);
    }
    return tempCanvas;
}

function getCentralComponent(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        
        const colActive = new Uint8Array(width);
        for (let x = 0; x < width; x++) {
            let active = false;
            for (let y = 0; y < height; y++) {
                if (data[(y * width + x) * 4 + 3] > 0) {
                    active = true;
                    break;
                }
            }
            colActive[x] = active ? 1 : 0;
        }
        
        const intervals = [];
        let inInterval = false;
        let startX = 0;
        for (let x = 0; x < width; x++) {
            if (colActive[x]) {
                if (!inInterval) {
                    startX = x;
                    inInterval = true;
                }
            } else {
                if (inInterval) {
                    intervals.push({start: startX, end: x - 1});
                    inInterval = false;
                }
            }
        }
        if (inInterval) {
            intervals.push({start: startX, end: width - 1});
        }
        
        if (intervals.length === 0) return {minX: 0, maxX: width - 1, minY: 0, maxY: height - 1};
        
        let bestInterval = intervals[0];
        let bestScore = -Infinity;
        const center = width / 2;
        
        for (const inter of intervals) {
            const w = inter.end - inter.start + 1;
            const interCenter = (inter.start + inter.end) / 2;
            const dist = Math.abs(interCenter - center);
            
            if (w < 25 && intervals.length > 1) continue;
            
            const score = w - dist * 1.5;
            if (score > bestScore) {
                bestScore = score;
                bestInterval = inter;
            }
        }
        
        let minY = height;
        let maxY = 0;
        let found = false;
        for (let y = 0; y < height; y++) {
            for (let x = bestInterval.start; x <= bestInterval.end; x++) {
                if (data[(y * width + x) * 4 + 3] > 0) {
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }
        
        if (!found) {
            return {minX: bestInterval.start, maxX: bestInterval.end, minY: 0, maxY: height - 1};
        }
        
        return {
            minX: bestInterval.start,
            maxX: bestInterval.end,
            minY: minY,
            maxY: maxY
        };
    } catch (e) {
        return {minX: 0, maxX: width - 1, minY: 0, maxY: height - 1};
    }
}

function trimImage(canvas) {
    if (canvas.width === 0 || canvas.height === 0) return canvas;
    
    try {
        const bounds = getCentralComponent(canvas);
        const trimWidth = bounds.maxX - bounds.minX + 1;
        const trimHeight = bounds.maxY - bounds.minY + 1;
        
        const trimmedCanvas = document.createElement('canvas');
        trimmedCanvas.width = trimWidth;
        trimmedCanvas.height = trimHeight;
        const trimmedCtx = trimmedCanvas.getContext('2d');
        
        trimmedCtx.drawImage(canvas, bounds.minX, bounds.minY, trimWidth, trimHeight, 0, 0, trimWidth, trimHeight);
        return trimmedCanvas;
    } catch (e) {
        console.warn("Trim image failed:", e);
        return canvas;
    }
}

function generateWalkFrames(canvas) {
    if (!canvas || canvas.width === 0 || canvas.height === 0) return [canvas, canvas, canvas];
    const w = canvas.width;
    const h = canvas.height;
    
    const f1 = canvas;
    
    const f2 = document.createElement('canvas');
    f2.width = Math.ceil(w * 1.05);
    f2.height = h;
    const ctx2 = f2.getContext('2d');
    ctx2.save();
    ctx2.translate(f2.width / 2, h);
    ctx2.scale(1.04, 0.95);
    ctx2.transform(1, 0, -0.06, 1, 0, 0); // Tilt forward slightly
    ctx2.drawImage(canvas, -w / 2, -h);
    ctx2.restore();
    
    const f3 = document.createElement('canvas');
    f3.width = Math.ceil(w * 1.05);
    f3.height = h;
    const ctx3 = f3.getContext('2d');
    ctx3.save();
    ctx3.translate(f3.width / 2, h);
    ctx3.scale(0.96, 1.05);
    ctx3.transform(1, 0, 0.06, 1, 0, 0); // Tilt backward slightly
    ctx3.drawImage(canvas, -w / 2, -h);
    ctx3.restore();
    
    return [f1, f2, f3];
}

function getSprite(src, keyColor = {r: 0, g: 0, b: 0}, tolerance = 40) {
    if (spriteCache[src]) return spriteCache[src];
    
    const img = new Image();
    img.src = src;
    const spriteObj = {
        loaded: false,
        img: img,
        canvas: null,
        dataUrl: '',
        walkFrames: []
    };
    
    const processImage = () => {
        if (spriteObj.loaded) return;
        if (img.naturalWidth === 0 || img.naturalHeight === 0) return;
        
        const transparentCanvas = floodFillChromaKey(img, keyColor, tolerance);
        const trimmedCanvas = trimImage(transparentCanvas);
        spriteObj.canvas = trimmedCanvas;
        spriteObj.walkFrames = generateWalkFrames(trimmedCanvas);
        try {
            spriteObj.dataUrl = trimmedCanvas.toDataURL();
        } catch (e) {
            // Silent block for local CORS
        }
        spriteObj.loaded = true;
        
        if (typeof window.updateDashboardPreview === 'function') {
            window.updateDashboardPreview();
        }
    };
    
    img.onload = processImage;
    
    if (img.complete) {
        setTimeout(processImage, 1);
    }
    
    spriteCache[src] = spriteObj;
    return spriteObj;
}

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
        this.screenShake = 0;
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

        // Preload sprites
        this.sprites = {
            bg_dojo: getSprite('assets/bg_dojo.png'),
            bg_subway: getSprite('assets/bg_subway.png'),
            bg_new_york: getSprite('assets/bg_new_york.png'),
            bg_rooftop: getSprite('assets/bg_rooftop.png'),
            
            craig_idle: getSprite('assets/craig_idle.png'),
            craig_walk: getSprite('assets/craig_walk.png'),
            craig_walk2: getSprite('assets/craig_walk2.png'),
            craig_jump: getSprite('assets/craig_jump.png'),
            craig_crouch: getSprite('assets/craig_crouch.png'),
            craig_punch: getSprite('assets/craig_punch.png'),
            craig_kick: getSprite('assets/craig_kick.png'),
            craig_hurt: getSprite('assets/craig_hurt.png'),
            craig_victory: getSprite('assets/craig_victory.png'),
            
            thug_leather: getSprite('assets/thug_leather.png'),
            thug_afro: getSprite('assets/thug_afro.png'),
            
            boss_sensei: getSprite('assets/boss_sensei.png'),
            boss_slasher: getSprite('assets/boss_slasher.png')
        };

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
        if (e.repeat) return;
        gameAudio.init(); // enable sound on first interaction
        const code = e.code;
        
        // Prevent default window scrolling for game controls
        const gameKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyJ', 'KeyK', 'KeyZ', 'KeyX'];
        if (gameKeys.includes(code)) {
            e.preventDefault();
        }

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
                btn._handlerDown = (evt) => {
                    evt.preventDefault();
                    gameAudio.init();
                    actionDown();
                };
                btn._handlerUp = (evt) => {
                    evt.preventDefault();
                    if (actionUp) actionUp();
                };
                btn.addEventListener('pointerdown', btn._handlerDown);
                btn.addEventListener('pointerup', btn._handlerUp);
                btn.addEventListener('pointercancel', btn._handlerUp);
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
                btn.removeEventListener('pointerdown', btn._handlerDown);
                btn.removeEventListener('pointerup', btn._handlerUp);
                btn.removeEventListener('pointercancel', btn._handlerUp);
            }
        };
        unbindBtn('btn-left');
        unbindBtn('btn-duck');
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
                this.screenShake = 6;
                
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
                this.screenShake = 4;
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
                this.screenShake = 8;
                
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
        if (this.screenShake > 0) {
            this.screenShake -= 0.8;
        }

        if (this.gameState === 'gameover' || this.gameState === 'victory' || this.gameState === 'levelclear') {
            // Update particles/debris even in post-game
            this.particles.forEach(p => p.update());
            this.debris.forEach(d => d.update());
            return;
        }

        // --- Player Controls & Physics ---
        if (this.player.isDucking) {
            this.player.crouchRatio = Math.min(1, (this.player.crouchRatio || 0) + 0.15);
        } else {
            this.player.crouchRatio = Math.max(0, (this.player.crouchRatio || 0) - 0.15);
        }
        
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
                    thug.isWalking = true;
                } else {
                    thug.facing = dir;
                    thug.isWalking = false;
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
                thug.isWalking = true;

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
                this.boss.isWalking = false;

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
                this.boss.isWalking = true;
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
        this.screenShake = 12;
        gameAudio.playHurt();

        if (this.player.health <= 0) {
            this.player.health = 0;
            this.gameState = 'gameover';
            gameAudio.playGameOver();
        }
    }

    draw() {
        this.ctx.save();
        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
        }

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

        this.ctx.restore();
    }

    // --- Parallax Background Artworks ---

    drawParallaxStars() {
        const bgType = this.levelData[this.currentLevel - 1].background;
        const spriteKey = `bg_${bgType.replace('-', '_')}`;
        const sprite = this.sprites[spriteKey];
        
        if (sprite && sprite.loaded) {
            const img = sprite.img;
            const drawH = 480;
            const drawW = (img.width / img.height) * drawH;
            const offset = this.scrollOffset * 0.15; // slow parallax scroll
            let xOffset = -offset % drawW;
            if (xOffset > 0) xOffset -= drawW;
            
            this.ctx.drawImage(img, xOffset, 0, drawW, drawH);
            this.ctx.drawImage(img, xOffset + drawW, 0, drawW, drawH);
            if (xOffset + drawW * 2 < 800) {
                this.ctx.drawImage(img, xOffset + drawW * 2, 0, drawW, drawH);
            }

            // Draw atmospheric rain for Stage 3: New York Streets
            if (bgType === 'new-york') {
                this.ctx.save();
                this.ctx.strokeStyle = 'rgba(156, 163, 175, 0.25)';
                this.ctx.lineWidth = 1;
                const time = performance.now() * 0.002;
                for (let i = 0; i < 25; i++) {
                    const rx = (Math.sin(i * 123.45 + time) * 0.5 + 0.5) * 800;
                    const ry = ((i * 456.78 + time * 200) % 480);
                    const len = 12 + Math.random() * 18;
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx, ry);
                    this.ctx.lineTo(rx - 2, ry + len);
                    this.ctx.stroke();
                }
                this.ctx.restore();
            }

            return; // Skip vector stars
        }

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
        const spriteKey = `bg_${bgType.replace('-', '_')}`;
        const sprite = this.sprites[spriteKey];
        
        if (sprite && sprite.loaded) {
            return; // Background already drawn in drawParallaxStars
        }
        
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
        let sprite = null;
        
        // Choose walk sprite cycle if walking
        if (p.state === 'walking') {
            const frameIdx = Math.floor(performance.now() / 150) % 4;
            if (frameIdx === 0) sprite = this.sprites.craig_walk;
            else if (frameIdx === 1 || frameIdx === 3) sprite = this.sprites.craig_idle;
            else sprite = this.sprites.craig_walk2;
        } else if (p.state === 'idle') {
            sprite = this.sprites.craig_idle;
        } else if (p.state === 'jumping') {
            sprite = this.sprites.craig_jump;
        } else if (p.state === 'ducking') {
            sprite = this.sprites.craig_crouch;
        } else if (p.state === 'attacking') {
            sprite = (p.attackType === 'kick') ? this.sprites.craig_kick : this.sprites.craig_punch;
        } else if (p.state === 'hurt') {
            sprite = this.sprites.craig_hurt;
        } else if (p.state === 'victory') {
            sprite = this.sprites.craig_victory;
        }
        
        // Swap to crouch sprite when crouchRatio is high
        const crouchRatio = p.crouchRatio || 0;
        const isCrouched = (p.isDucking || p.state === 'ducking') && crouchRatio > 0.5;
        if (isCrouched) {
            sprite = this.sprites.craig_crouch;
        }

        if (sprite && sprite.loaded && this.sprites.craig_idle && this.sprites.craig_idle.loaded) {
            this.ctx.save();
            const feetX = p.x + p.width / 2;
            const feetY = p.y + p.height;
            this.ctx.translate(feetX, feetY);
            
            if (p.facing === -1) {
                this.ctx.scale(-1, 1);
            }
            if (p.state === 'hurt') {
                this.ctx.translate((Math.random() - 0.5) * 8, 0);
            }
            
            // Proportional scaling relative to the idle sprite trimmed height
            const refIdleHeight = this.sprites.craig_idle.canvas.height;
            const baseScale = 110 / refIdleHeight;
            
            // Squash and stretch scale: apply only during transition, not to the crouched sprite itself
            const yScale = isCrouched ? 1.0 : (1 - crouchRatio * 0.35);
            const xScale = isCrouched ? 1.0 : (1 + crouchRatio * 0.15);
            
            this.ctx.scale(xScale, yScale);
            
            const drawW = sprite.canvas.width * baseScale;
            const drawH = sprite.canvas.height * baseScale;
            
            // Draw aura glow shadow effect behind Craig (at exact size to avoid white borders)
            this.ctx.save();
            this.ctx.shadowColor = '#a855f7';
            this.ctx.shadowBlur = 15;
            this.ctx.globalAlpha = 0.35 + Math.sin(performance.now() * 0.006) * 0.15;
            this.ctx.drawImage(sprite.canvas, -drawW / 2, -drawH, drawW, drawH);
            this.ctx.restore();
            
            // Draw character (foot-anchored: bottom of sprite is at y=0)
            this.ctx.drawImage(sprite.canvas, -drawW / 2, -drawH, drawW, drawH);
            this.ctx.restore();
        } else {
            this.drawCraigVector();
        }
    }

    drawCraigVector() {
        const p = this.player;
        this.ctx.save();
        
        // Align feet:
        // Standing: bounding box is height 75. Drawing is height 110. Top Y offset is -35.
        // Crouching: bounding box is height 45. Drawing is height 110. Top Y offset is -21.
        const drawX = p.x - 15;
        const drawY = p.isDucking ? (p.y - 21) : (p.y - 35);
        
        this.ctx.translate(drawX, drawY);
        
        // Flip character rendering depending on facing direction
        if (p.facing === -1) {
            this.ctx.scale(-1, 1);
            this.ctx.translate(-75, 0); // width of drawing is 75
        }
        
        if (p.isDucking) {
            this.ctx.scale(1, 0.6);
        }

        // Apply sprite shaking if hurt
        if (p.state === 'hurt') {
            this.ctx.translate((Math.random() - 0.5) * 8, 0);
        }

        // Muscular Tanned skin color & Saffron Robe colors (premium realistic 3D gradients)
        const skinShadow = '#541c0e';
        const skinHighlight = '#ffdfd3';
        const skinMid = '#cf7a5c';
        
        const skinGrad = this.ctx.createLinearGradient(10, 20, 65, 80);
        skinGrad.addColorStop(0, skinHighlight);
        skinGrad.addColorStop(0.5, skinMid);
        skinGrad.addColorStop(1, skinShadow);

        const saffronGrad = this.ctx.createLinearGradient(20, 20, 65, 80);
        saffronGrad.addColorStop(0, '#f97316'); // bright orange
        saffronGrad.addColorStop(0.5, '#c2410c'); // darker orange
        saffronGrad.addColorStop(1, '#7c2d12'); // shadow deep red-brown
        
        const wrapColor = '#ffb703';
        const bootColor = '#2b2d42';

        // 1. Draw Dark Arts Aura (glowing purple fires behind Craig)
        this.ctx.save();
        this.ctx.globalAlpha = 0.35 + Math.sin(performance.now() * 0.005) * 0.15;
        this.ctx.shadowColor = '#a855f7'; // purple glow
        this.ctx.shadowBlur = 18;
        this.ctx.fillStyle = 'rgba(168, 85, 247, 0.22)';
        
        const time = performance.now() * 0.003;
        for (let i = 0; i < 6; i++) {
            const fx = 37 + Math.sin(time + i * 1.5) * 22;
            const fy = 65 - i * 14 + Math.cos(time * 0.7 + i) * 12;
            const r = 16 + Math.sin(time * 1.2 + i) * 6;
            this.ctx.beginPath();
            this.ctx.arc(fx, fy, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();

        // 2. Legs (orange baggy monk pants)
        this.ctx.fillStyle = saffronGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        
        let legOffset = 0;
        if (p.state === 'walking') {
            legOffset = Math.sin(performance.now() * 0.015) * 8;
        }
        
        // Left Leg (back)
        this.ctx.beginPath();
        this.ctx.moveTo(25 + legOffset, 70);
        this.ctx.quadraticCurveTo(15 + legOffset, 80, 22 + legOffset, 100);
        this.ctx.lineTo(34 + legOffset, 100);
        this.ctx.quadraticCurveTo(38 + legOffset, 80, 37 + legOffset, 70);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // Right Leg (front)
        this.ctx.beginPath();
        this.ctx.moveTo(38 - legOffset, 70);
        this.ctx.quadraticCurveTo(37 - legOffset, 80, 42 - legOffset, 100);
        this.ctx.lineTo(54 - legOffset, 100);
        this.ctx.quadraticCurveTo(62 - legOffset, 80, 52 - legOffset, 70);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // 3. Gold Shin Wraps
        this.ctx.fillStyle = wrapColor;
        this.ctx.beginPath();
        this.ctx.moveTo(22 + legOffset, 90);
        this.ctx.lineTo(34 + legOffset, 90);
        this.ctx.lineTo(33 + legOffset, 103);
        this.ctx.lineTo(23 + legOffset, 103);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(42 - legOffset, 90);
        this.ctx.lineTo(54 - legOffset, 90);
        this.ctx.lineTo(53 - legOffset, 103);
        this.ctx.lineTo(43 - legOffset, 103);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // wrap strap lines detail
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(22 + legOffset, 94); this.ctx.lineTo(34 + legOffset, 94);
        this.ctx.moveTo(23 + legOffset, 98); this.ctx.lineTo(33 + legOffset, 98);
        this.ctx.moveTo(42 - legOffset, 94); this.ctx.lineTo(54 - legOffset, 94);
        this.ctx.moveTo(43 - legOffset, 98); this.ctx.lineTo(53 - legOffset, 98);
        this.ctx.stroke();

        // 4. Shoes
        this.ctx.fillStyle = bootColor;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.roundRect(20 + legOffset, 102, 16, 7, [2]);
        this.ctx.roundRect(40 - legOffset, 102, 16, 7, [2]);
        this.ctx.fill(); this.ctx.stroke();

        // 5. Back Arm (Bare Skin, Muscular, Vascular)
        if (p.state !== 'attacking') {
            this.ctx.fillStyle = skinGrad;
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3.5;
            
            this.ctx.beginPath();
            this.ctx.moveTo(22, 28); // Shoulder top
            this.ctx.quadraticCurveTo(8, 30, 7, 44); // Deltoid/bicep outer bulge
            this.ctx.quadraticCurveTo(5, 56, 10, 62); // Forearm outer bulge
            this.ctx.lineTo(18, 62); // Wrist bottom
            this.ctx.quadraticCurveTo(20, 52, 18, 42); // Inner forearm
            this.ctx.lineTo(24, 38); // Armpit
            this.ctx.closePath();
            this.ctx.fill(); this.ctx.stroke();

            // Fist
            this.ctx.beginPath();
            this.ctx.arc(14, 65, 7.5, 0, Math.PI * 2);
            this.ctx.fill(); this.ctx.stroke();

            // Bulging veins
            this.ctx.strokeStyle = '#38bdf8'; // light blue glowing veins
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(15, 32); this.ctx.quadraticCurveTo(11, 44, 13, 56);
            this.ctx.stroke();
        }

        // 6. Torso (Sculpted Chest & Diagonally Torn Robe)
        this.ctx.fillStyle = skinGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.roundRect(20, 26, 36, 44, [4]);
        this.ctx.fill(); this.ctx.stroke();

        // Pecs and abs definitions
        this.ctx.fillStyle = 'rgba(84, 28, 14, 0.2)';
        this.ctx.beginPath();
        // Left pec shadow (bare skin side)
        this.ctx.moveTo(37, 34);
        this.ctx.quadraticCurveTo(28, 38, 22, 34);
        this.ctx.lineTo(22, 40);
        this.ctx.quadraticCurveTo(28, 40, 37, 39);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#541c0e';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        // Sternum line
        this.ctx.moveTo(37, 32); this.ctx.lineTo(37, 65);
        // Pec border
        this.ctx.moveTo(22, 34); this.ctx.quadraticCurveTo(28, 38, 37, 38);
        // 6-pack abs lines
        this.ctx.moveTo(24, 48); this.ctx.quadraticCurveTo(30, 49, 37, 48);
        this.ctx.moveTo(24, 54); this.ctx.quadraticCurveTo(30, 55, 37, 54);
        this.ctx.moveTo(24, 60); this.ctx.quadraticCurveTo(30, 61, 37, 60);
        this.ctx.stroke();
        
        // Battle scar on chest
        this.ctx.strokeStyle = '#b91c1c';
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(24, 30); this.ctx.lineTo(31, 37);
        this.ctx.moveTo(27, 36); this.ctx.lineTo(30, 32);
        this.ctx.stroke();

        // Jagged saffron robe diagonally covering right chest
        this.ctx.fillStyle = saffronGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.moveTo(56, 26);
        this.ctx.lineTo(37, 26);
        this.ctx.lineTo(40, 32); // Torn jag
        this.ctx.lineTo(34, 38);
        this.ctx.lineTo(41, 45);
        this.ctx.lineTo(33, 53);
        this.ctx.lineTo(38, 62);
        this.ctx.lineTo(56, 62);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // Creases on saffron robe fabric
        this.ctx.strokeStyle = '#7c2d12';
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(51, 29); this.ctx.lineTo(44, 42);
        this.ctx.moveTo(53, 40); this.ctx.lineTo(46, 55);
        this.ctx.stroke();

        // Waist Sash (Black belt)
        this.ctx.fillStyle = '#111827';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.roundRect(17, 63, 41, 9, [2]);
        this.ctx.fill(); this.ctx.stroke();
        
        // Sash tails
        this.ctx.beginPath();
        this.ctx.moveTo(27, 72); this.ctx.lineTo(24, 88); this.ctx.lineTo(20, 87); this.ctx.lineTo(23, 72);
        this.ctx.moveTo(32, 72); this.ctx.lineTo(33, 93); this.ctx.lineTo(28, 91); this.ctx.lineTo(29, 72);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // 7. Front Arm (Vibrant Saffron Sleeve)
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        
        if (p.state === 'attacking') {
            if (p.attackType === 'punch') {
                // Massive bare punching arm extending forward
                const armGrad = this.ctx.createLinearGradient(35, 34, 85, 34);
                armGrad.addColorStop(0, skinHighlight);
                armGrad.addColorStop(0.5, skinMid);
                armGrad.addColorStop(1, skinShadow);
                this.ctx.fillStyle = armGrad;

                this.ctx.beginPath();
                this.ctx.moveTo(37, 26); // Shoulder top
                this.ctx.quadraticCurveTo(55, 23, 75, 27); // Top arm line
                this.ctx.lineTo(82, 30); // Wrist top
                this.ctx.lineTo(82, 38); // Wrist bottom
                this.ctx.quadraticCurveTo(57, 41, 37, 39); // Underarm
                this.ctx.closePath();
                this.ctx.fill(); this.ctx.stroke();

                // Punching fist
                this.ctx.fillStyle = skinGrad;
                this.ctx.beginPath();
                this.ctx.arc(87, 34, 8.5, 0, Math.PI * 2);
                this.ctx.fill(); this.ctx.stroke();

                // Vascular blue veins on punch arm
                this.ctx.strokeStyle = '#38bdf8';
                this.ctx.lineWidth = 1.8;
                this.ctx.beginPath();
                this.ctx.moveTo(41, 28); this.ctx.bezierCurveTo(52, 25, 62, 31, 74, 30);
                this.ctx.stroke();

                // Pull back guard sleeve
                this.ctx.fillStyle = saffronGrad;
                this.ctx.beginPath();
                this.ctx.moveTo(37, 30);
                this.ctx.lineTo(24, 38);
                this.ctx.lineTo(29, 48);
                this.ctx.lineTo(37, 42);
                this.ctx.closePath();
                this.ctx.fill(); this.ctx.stroke();

                this.ctx.fillStyle = skinGrad;
                this.ctx.beginPath();
                this.ctx.arc(29, 48, 6.5, 0, Math.PI * 2);
                this.ctx.fill(); this.ctx.stroke();
            } else {
                // Kick sweep (orange leg extension)
                this.ctx.fillStyle = saffronGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(37, 50, 48, 16, [4]);
                this.ctx.fill(); this.ctx.stroke();
                
                this.ctx.fillStyle = bootColor;
                this.ctx.beginPath();
                this.ctx.roundRect(85, 48, 9, 20, [3]);
                this.ctx.fill(); this.ctx.stroke();
            }
        } else {
            // Idle sleeved arm draping down
            this.ctx.fillStyle = saffronGrad;
            this.ctx.beginPath();
            this.ctx.moveTo(41, 26);
            this.ctx.quadraticCurveTo(57, 24, 60, 34); // Outer bicep
            this.ctx.quadraticCurveTo(62, 45, 57, 51); // Sleeve drape down
            this.ctx.lineTo(46, 52); // Cuff bottom
            this.ctx.quadraticCurveTo(42, 41, 41, 32); // Inner arm
            this.ctx.closePath();
            this.ctx.fill(); this.ctx.stroke();
            
            // Cuff outline
            this.ctx.beginPath();
            this.ctx.ellipse(51, 51.5, 5.5, 2, 0, 0, Math.PI * 2);
            this.ctx.stroke();

            // Hand sticking out
            this.ctx.fillStyle = skinGrad;
            this.ctx.beginPath();
            this.ctx.arc(51, 58, 6.5, 0, Math.PI * 2);
            this.ctx.fill(); this.ctx.stroke();
        }

        // 8. Head & Face (Hyper-detailed, Scar, Glowing Red Eyes)
        const headGrad = this.ctx.createRadialGradient(37, 10, 2, 37, 14, 14);
        headGrad.addColorStop(0, skinHighlight);
        headGrad.addColorStop(0.5, skinMid);
        headGrad.addColorStop(1, skinShadow);

        // Ears
        this.ctx.fillStyle = headGrad;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.ellipse(29, 14, 2, 3.5, Math.PI / 10, 0, Math.PI * 2);
        this.ctx.ellipse(45, 14, 2, 3.5, -Math.PI / 10, 0, Math.PI * 2);
        this.ctx.fill(); this.ctx.stroke();

        // Skull & Jawline (realistic tapered contour)
        this.ctx.beginPath();
        this.ctx.moveTo(31, 10);
        this.ctx.quadraticCurveTo(37, 2, 43, 10); // Skull
        this.ctx.quadraticCurveTo(45, 20, 41, 24); // Right jaw
        this.ctx.lineTo(33, 24); // Chin
        this.ctx.quadraticCurveTo(29, 20, 31, 10); // Left jaw
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // Neck
        this.ctx.fillStyle = headGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(33, 22);
        this.ctx.lineTo(33, 30);
        this.ctx.lineTo(41, 30);
        this.ctx.lineTo(41, 22);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();

        // Neck muscles shading lines
        this.ctx.strokeStyle = '#541c0e';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(34, 24); this.ctx.lineTo(34, 29);
        this.ctx.moveTo(40, 24); this.ctx.lineTo(40, 29);
        this.ctx.stroke();

        // Frowning Slanted Angry Glowing Eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#b91c1c'; // red outline
        this.ctx.lineWidth = 1.5;
        
        // Left eye
        this.ctx.beginPath();
        this.ctx.moveTo(31.5, 14); this.ctx.lineTo(36.5, 15); this.ctx.lineTo(35, 12);
        this.ctx.closePath(); this.ctx.fill(); this.ctx.stroke();

        // Right eye
        this.ctx.beginPath();
        this.ctx.moveTo(42.5, 14); this.ctx.lineTo(37.5, 15); this.ctx.lineTo(39, 12);
        this.ctx.closePath(); this.ctx.fill(); this.ctx.stroke();

        // Red pupils (Dark arts red eye glow)
        this.ctx.fillStyle = '#b91c1c';
        this.ctx.beginPath();
        this.ctx.arc(34, 14, 1.2, 0, Math.PI * 2);
        this.ctx.arc(40, 14, 1.2, 0, Math.PI * 2);
        this.ctx.fill();

        // Thick angry eyebrows
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(29, 10); this.ctx.lineTo(36.5, 13);
        this.ctx.moveTo(45, 10); this.ctx.lineTo(37.5, 13);
        this.ctx.stroke();

        // Nose
        this.ctx.strokeStyle = '#541c0e';
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(37, 13); this.ctx.lineTo(35.5, 17.5); this.ctx.lineTo(38.5, 17.5);
        this.ctx.stroke();

        // Cheek scar under right eye (our right)
        this.ctx.strokeStyle = '#dc2626';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(41.5, 16.5); this.ctx.lineTo(43, 20.5);
        this.ctx.stroke();

        // Open gritting teeth mouth
        this.ctx.fillStyle = '#450a0a'; // blood-dark mouth interior
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(32, 19, 10, 4, [1]);
        this.ctx.fill(); this.ctx.stroke();

        // Teeth line
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(32.5, 21); this.ctx.lineTo(41.5, 21);
        this.ctx.stroke();

        // 9. Hands glowing purple energy sparks overlay
        let bhX = 14, bhY = 65; // back hand
        let fhX = 51, fhY = 58; // front hand
        
        if (p.state === 'attacking') {
            if (p.attackType === 'punch') {
                bhX = 29; bhY = 48;
                fhX = 87; fhY = 34;
            }
        }
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.55 + Math.sin(performance.now() * 0.008) * 0.2;
        this.ctx.fillStyle = '#a855f7';
        this.ctx.shadowColor = '#ec4899';
        this.ctx.shadowBlur = 12;
        
        this.ctx.beginPath();
        this.ctx.arc(bhX, bhY, 8, 0, Math.PI * 2);
        this.ctx.arc(fhX, fhY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        this.ctx.restore();
    }

    drawThug(thug) {
        const feetX = thug.x - this.scrollOffset + thug.width / 2;
        const feetY = thug.y + thug.height;
        const sprite = (thug.style === 0 || thug.style === 2) ? this.sprites.thug_afro : this.sprites.thug_leather;
        
        if (sprite && sprite.loaded && this.sprites.craig_idle && this.sprites.craig_idle.loaded) {
            this.ctx.save();
            this.ctx.translate(feetX, feetY);
            
            const defaultFacing = (thug.style === 0 || thug.style === 2) ? -1 : 1;
            if (thug.facing !== defaultFacing) {
                this.ctx.scale(-1, 1);
            }
            
            // Choose active frame from walkFrames if walking
            let activeCanvas = sprite.canvas;
            if (thug.isWalking && sprite.walkFrames && sprite.walkFrames.length >= 3) {
                const walkCycle = Math.floor((performance.now() + (thug.x * 2.5)) / 150) % 3;
                activeCanvas = sprite.walkFrames[walkCycle];
            }
            
            // Scale using the Craig reference scale to ensure thugs and Craig are perfectly proportioned
            const refIdleHeight = this.sprites.craig_idle.canvas.height;
            const baseScale = 110 / refIdleHeight;
            
            const drawW = activeCanvas.width * baseScale;
            const drawH = activeCanvas.height * baseScale;
            
            this.ctx.drawImage(activeCanvas, -drawW / 2, -drawH, drawW, drawH);
            this.ctx.restore();
        } else {
            this.drawThugVector(thug);
        }
    }

    drawThugVector(thug) {
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
        const feetX = b.x - this.scrollOffset + b.width / 2;
        const feetY = b.y + b.height;
        let sprite = null;
        if (b.bossStyle === 'elder') sprite = this.sprites.boss_sensei;
        else if (b.bossStyle === 'leather-red') sprite = this.sprites.boss_slasher;
        else if (b.bossStyle === 'vigilante-clone') sprite = this.sprites.craig_idle;
        else if (b.bossStyle === 'dark-master') sprite = this.sprites.craig_victory;
        
        if (sprite && sprite.loaded && this.sprites.craig_idle && this.sprites.craig_idle.loaded) {
            this.ctx.save();
            this.ctx.translate(feetX, feetY);
            let defaultFacing = -1;
            if (b.bossStyle === 'elder' || b.bossStyle === 'vigilante-clone' || b.bossStyle === 'dark-master') {
                defaultFacing = 1;
            }
            if (b.facing !== defaultFacing) {
                this.ctx.scale(-1, 1);
            }
            
            // Choose active frame from walkFrames
            let activeCanvas = sprite.canvas;
            if (b.isWalking && sprite.walkFrames && sprite.walkFrames.length >= 3) {
                const walkCycle = Math.floor((performance.now() + (b.x * 2.5)) / 150) % 3;
                activeCanvas = sprite.walkFrames[walkCycle];
            }
            
            // Proportional scaling relative to the idle sprite height, bosses are slightly larger (120 reference height)
            const refIdleHeight = this.sprites.craig_idle.canvas.height;
            const baseScale = 120 / refIdleHeight;
            
            const drawW = activeCanvas.width * baseScale;
            const drawH = activeCanvas.height * baseScale;
            
            if (b.flashTimer > 0 && Math.floor(b.flashTimer / 2) % 2 === 0) {
                this.ctx.save();
                this.ctx.drawImage(activeCanvas, -drawW / 2, -drawH, drawW, drawH);
                this.ctx.globalCompositeOperation = 'source-atop';
                this.ctx.fillStyle = 'rgba(230, 57, 70, 0.6)';
                this.ctx.fillRect(-drawW / 2, -drawH, drawW, drawH);
                this.ctx.restore();
            } else {
                this.ctx.drawImage(activeCanvas, -drawW / 2, -drawH, drawW, drawH);
            }
            this.ctx.restore();
        } else {
            this.drawBossVector();
        }
    }

    drawBossVector() {
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

        // 1. Top Left Panel: Glassmorphism Card (Score, Progress, Knives)
        this.ctx.fillStyle = 'rgba(10, 15, 30, 0.75)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        
        // Draw card background
        this.ctx.beginPath();
        this.ctx.roundRect(15, 15, 220, 80, [10]);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Remove shadows for text/bars
        this.ctx.shadowBlur = 0;

        // Score Text
        this.ctx.fillStyle = '#ffb703'; // Gold
        this.ctx.font = '800 15px "Outfit", sans-serif';
        this.ctx.fillText(`SCORE: ${this.player.score}`, 30, 35);

        // Progress text and bar
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.beginPath();
        this.ctx.roundRect(30, 48, 190, 6, [3]);
        this.ctx.fill();

        const progressGrad = this.ctx.createLinearGradient(30, 0, 220, 0);
        progressGrad.addColorStop(0, '#00b4d8');
        progressGrad.addColorStop(1, '#0077b6');
        this.ctx.fillStyle = progressGrad;
        this.ctx.beginPath();
        this.ctx.roundRect(30, 48, 190 * this.gameProgress, 6, [3]);
        this.ctx.fill();

        this.ctx.fillStyle = '#8b949e';
        this.ctx.font = '700 9px "Outfit", sans-serif';
        this.ctx.fillText(`${this.levelData[this.currentLevel - 1].name.toUpperCase()}`, 30, 68);

        // Knives inventory
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '700 12px "Outfit", sans-serif';
        this.ctx.fillText(`🗡️ KNIVES: ${this.player.knives}`, 30, 85);

        // 2. Top Right Panel: Glassmorphism Card (Player Health)
        this.ctx.fillStyle = 'rgba(10, 15, 30, 0.75)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.roundRect(565, 15, 220, 50, [10]);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '800 11px "Outfit", sans-serif';
        this.ctx.fillText("VIGILANTE STATUS: CRAIG PALES", 580, 32);

        // Health Bar Track
        this.ctx.fillStyle = 'rgba(230, 57, 70, 0.15)';
        this.ctx.beginPath();
        this.ctx.roundRect(580, 40, 190, 12, [6]);
        this.ctx.fill();

        // Health Bar Fill (Gradient)
        if (this.player.health > 0) {
            const healthGrad = this.ctx.createLinearGradient(580, 0, 770, 0);
            healthGrad.addColorStop(0, '#c2410c'); // Deep orange-red
            healthGrad.addColorStop(1, '#ef4444'); // Bright neon red
            this.ctx.fillStyle = healthGrad;
            
            // Health Glow
            this.ctx.shadowColor = '#ef4444';
            this.ctx.shadowBlur = 4;
            
            this.ctx.beginPath();
            this.ctx.roundRect(580, 40, 190 * (this.player.health / 100), 12, [6]);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0; // Reset shadow
        }
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(580, 40, 190, 12, [6]);
        this.ctx.stroke();

        // 3. Boss Health Bar Overlay (Bottom Center - Cinematic Style)
        if (this.boss) {
            // Draw background bar at bottom center
            const bx = 150;
            const by = 430;
            const bw = 500;
            const bh = 14;

            this.ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
            this.ctx.strokeStyle = 'rgba(255, 106, 0, 0.3)';
            this.ctx.lineWidth = 2;
            
            // Background box for label and health track
            this.ctx.beginPath();
            this.ctx.roundRect(bx - 15, by - 25, bw + 30, bh + 35, [8]);
            this.ctx.fill();
            this.ctx.stroke();

            // Boss Name Text
            this.ctx.fillStyle = '#ff6a00'; // Orange
            this.ctx.font = '800 12px "Outfit", sans-serif';
            this.ctx.fillText(`WARNING: ${this.boss.name.toUpperCase()}`, bx, by - 10);

            // Boss Health Track
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            this.ctx.beginPath();
            this.ctx.roundRect(bx, by, bw, bh, [4]);
            this.ctx.fill();

            // Boss Health Fill (Orange-Red Gradient)
            if (this.boss.health > 0) {
                const bossGrad = this.ctx.createLinearGradient(bx, 0, bx + bw, 0);
                bossGrad.addColorStop(0, '#7c2d12');
                bossGrad.addColorStop(0.5, '#ea580c');
                bossGrad.addColorStop(1, '#ffedd5');
                this.ctx.fillStyle = bossGrad;
                
                this.ctx.shadowColor = '#ea580c';
                this.ctx.shadowBlur = 6;

                this.ctx.beginPath();
                this.ctx.roundRect(bx, by, bw * (this.boss.health / this.boss.maxHealth), bh, [4]);
                this.ctx.fill();
                
                this.ctx.shadowBlur = 0; // Reset shadow
            }

            // Outer border for track
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.roundRect(bx, by, bw, bh, [4]);
            this.ctx.stroke();
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
