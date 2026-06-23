// Craig Pales Cartoon Studio - Application Logic (Video Player Mode)

// Global State
const state = {
    version: 8,
    activeTab: 'game',
    storyboard: [
        {
            id: 1,
            title: "Downtown Arrival (New York Alley)",
            desc: "Craig walks downtown near a dark New York alley, observing the city's crime and injustice.",
            bg: 'new-york',
            outfit: 'monk-robe',
            expression: 'determined',
            pose: 'standing-calm',
            dialogue: "This city is filled with crime and corruption. I must watch from the shadows.",
            specialEffect: ''
        },
        {
            id: 2,
            title: "Shaolin Training (Learning Kung Fu)",
            desc: "Flashback: Young Craig learns kung fu in the Dojo under the guidance of the Temple Elder, who warns him never to use the forbidden arts.",
            bg: 'dojo',
            outfit: 'young-robe',
            expression: 'calm',
            pose: 'standing-calm',
            dialogue: "Remember Craig: you must never use the forbidden arts under any circumstance!",
            specialEffect: 'training'
        },
        {
            id: 3,
            title: "The Kidnapping (Ambushed)",
            desc: "Flashback: Mysterious syndicate agents ambush Craig at the temple.",
            bg: 'shaolin',
            outfit: 'monk-robe',
            expression: 'determined',
            pose: 'fighting',
            dialogue: "Who are you? Stay back! I am sworn to peace!",
            specialEffect: 'ambush'
        },
        {
            id: 4,
            title: "The Subway Captivity",
            desc: "Craig awakens chained to the wall of a dark NYC subway tunnel.",
            bg: 'subway',
            outfit: 'monk-robe',
            expression: 'determined',
            pose: 'standing-calm',
            dialogue: "They brought me to New York in chains. But steel cannot hold me.",
            specialEffect: ''
        },
        {
            id: 5,
            title: "Breaking the Chains (Escape)",
            desc: "Craig easily shatters the metal chains using simple Shaolin body strength.",
            bg: 'subway',
            outfit: 'monk-robe',
            expression: 'determined',
            pose: 'victory',
            dialogue: "I am free. Now I must find a way to the surface.",
            specialEffect: 'chains'
        },
        {
            id: 6,
            title: "The Alleyway Confrontation",
            desc: "Emerging into a gritty New York alley, Craig witnesses gang members threatening a local citizen.",
            bg: 'new-york',
            outfit: 'monk-robe',
            expression: 'determined',
            pose: 'fighting',
            dialogue: "Let the citizen go. There is no need for violence here.",
            specialEffect: ''
        },
        {
            id: 7,
            title: "First Slice (Forbidden Art Unleashed)",
            desc: "Faced with drawing blades, Craig punches a thug, only for the forbidden fist to slice him in half like butter.",
            bg: 'new-york',
            outfit: 'monk-robe',
            expression: 'fury',
            pose: 'fighting',
            dialogue: "The Forbidden Fist! It cuts through bone and steel like butter!",
            specialEffect: 'blood'
        },
        {
            id: 8,
            title: "Vigilante Rising (The Vigilante Suit)",
            desc: "Craig stands on a dark NYC rooftop in his new dark vigilante hooded outfit, committing to clean the streets.",
            bg: 'rooftop',
            outfit: 'vigilante-outfit',
            expression: 'determined',
            pose: 'victory',
            dialogue: "I will hide my face in this dark suit. I am the protector of New York.",
            specialEffect: 'rooftop-fury'
        }
    ],
    selectedFrameId: 1,
    dashboardFrameIndex: 0,
    gameController: null,
    
    // Video Player variables
    isPlaying: false,
    playTimeout: null,
    currentUtterance: null
};

// Persistence functions (wrapped in try/catch to avoid SecurityExceptions if localStorage is disabled)
function saveToLocalStorage() {
    try {
        if (window.localStorage) {
            localStorage.setItem('craig_pales_storyboard_v8', JSON.stringify(state.storyboard));
            localStorage.setItem('craig_pales_storyboard_version', state.version.toString());
        }
    } catch(e) {
        console.warn("Storage warning: LocalStorage is write-restricted.", e);
    }
}

function loadFromLocalStorage() {
    try {
        if (window.localStorage) {
            const savedVersion = localStorage.getItem('craig_pales_storyboard_version');
            if (savedVersion && parseInt(savedVersion, 10) === state.version) {
                const saved = localStorage.getItem('craig_pales_storyboard_v8');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        state.storyboard = parsed;
                        state.selectedFrameId = parsed[0].id;
                        state.dashboardFrameIndex = 0;
                    }
                }
            } else {
                localStorage.removeItem('craig_pales_storyboard_v6');
                localStorage.removeItem('craig_pales_storyboard_v7');
                localStorage.removeItem('craig_pales_storyboard_v8');
                localStorage.removeItem('craig_pales_storyboard_version');
            }
        }
    } catch(e) {
        console.warn("Storage warning: LocalStorage is read-restricted.", e);
    }
}

// Text wrapping utility for SVG speech balloon
function wrapSvgText(text, maxCharsPerLine = 35) {
    if (!text) return '';
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        if ((currentLine + word).length > maxCharsPerLine) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    if (currentLine) {
        lines.push(currentLine.trim());
    }
    
    // Generate tspans
    const lineSpacing = 16;
    const startY = 55 - ((lines.length - 1) * lineSpacing) / 2;
    return lines.map((line, idx) => {
        return `<tspan x="200" y="${startY + idx * lineSpacing}">${line}</tspan>`;
    }).join('');
}

function getSpriteSrc(path) {
    if (window.spriteCache && window.spriteCache[path] && window.spriteCache[path].loaded && window.spriteCache[path].dataUrl) {
        return window.spriteCache[path].dataUrl;
    }
    return path;
}

// SVG Assets Generator
function generateCraigSVG(config, width = "100%", height = "100%") {
    const { outfit, expression, aura, pose, bg, dialogue, specialEffect } = config;
    
    // 1. Backgrounds mapping
    let bgPath = 'assets/bg_new_york.png';
    if (bg === 'shaolin' || bg === 'dojo') {
        bgPath = 'assets/bg_dojo.png';
    } else if (bg === 'subway') {
        bgPath = 'assets/bg_subway.png';
    } else if (bg === 'rooftop') {
        bgPath = 'assets/bg_rooftop.png';
    }

    // 2. Craig Pose mapping
    let craigPath = 'assets/craig_idle.png';
    if (pose === 'fighting') {
        craigPath = 'assets/craig_punch.png';
    } else if (pose === 'victory') {
        craigPath = 'assets/craig_victory.png';
    }

    // 3. Special Effects layers
    let extraSvg = '';
    
    // Training slide: show Sensei next to young Craig
    if (specialEffect === 'training') {
        extraSvg += `<image href="${getSpriteSrc('assets/boss_sensei.png')}" x="50" y="180" width="160" height="160" preserveAspectRatio="xMidYMax meet" />`;
    }
    
    // Ambush slide: show leather jacket thug next to Craig
    if (specialEffect === 'ambush') {
        extraSvg += `<image href="${getSpriteSrc('assets/thug_leather.png')}" x="40" y="180" width="160" height="160" preserveAspectRatio="xMidYMax meet" />`;
    }
    
    // Blood slide: show blood overlay & split thug
    if (specialEffect === 'blood') {
        extraSvg += `
            <!-- Blood splatters -->
            <path d="M 50 120 Q 30 90 20 60 Q 60 40 80 80 Q 120 70 100 110 Z" fill="#800000" opacity="0.8"/>
            <circle cx="130" cy="140" r="10" fill="#b30000" opacity="0.9"/>
            <circle cx="40" cy="150" r="6" fill="#800000" opacity="0.8"/>
            <!-- Dismembered thug in background -->
            <g opacity="0.85">
                <image href="${getSpriteSrc('assets/thug_afro.png')}" x="220" y="190" width="150" height="150" preserveAspectRatio="xMidYMax meet" transform="rotate(35 295 215)"/>
            </g>
        `;
    }

    // Chains slide: show broken chains overlay
    if (specialEffect === 'chains') {
        extraSvg += `
            <!-- Broken Chains -->
            <path d="M 40 230 C 60 210 90 210 110 230" stroke="#7f8c8d" stroke-width="6" fill="none" stroke-dasharray="10, 5"/>
            <path d="M 290 230 C 310 210 340 210 360 230" stroke="#7f8c8d" stroke-width="6" fill="none" stroke-dasharray="10, 5"/>
        `;
    }

    // Craig position and scale
    let craigX = 140;
    let craigY = 120;
    let craigW = 220;
    let craigH = 220;

    // Young Craig is scaled down
    if (outfit === 'young-robe') {
        craigX = 180;
        craigY = 180;
        craigW = 160;
        craigH = 160;
    }

    // Dark arts purple aura filter overlay
    let auraOverlay = '';
    if (outfit !== 'young-robe') {
        auraOverlay = `
            <!-- Purple Dark Arts Aura behind Craig -->
            <circle cx="${craigX + craigW/2}" cy="${craigY + craigH/2}" r="90" fill="rgba(128, 0, 255, 0.22)" filter="blur(25px)"/>
        `;
    }

    const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${width}" height="${height}">
            <!-- Background Scenery -->
            <image href="${bgPath}" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice"/>

            <!-- Aura behind character -->
            ${auraOverlay}

            <!-- Extra scene assets/characters -->
            ${extraSvg}

            <!-- Craig Character -->
            <image href="${getSpriteSrc(craigPath)}" x="${craigX}" y="${craigY}" width="${craigW}" height="${craigH}" preserveAspectRatio="xMidYMax meet"/>

            <!-- Speech Bubble overlay if dialogue exists -->
            ${dialogue ? `
                <g id="speech-bubble" transform="translate(0, 10)">
                    <path d="M 50 20 L 350 20 A 15 15 0 0 1 365 35 L 365 75 A 15 15 0 0 1 350 90 L 220 90 L 200 105 L 180 90 L 50 90 A 15 15 0 0 1 35 75 L 35 35 A 15 15 0 0 1 50 20 Z" fill="#ffffff" stroke="#000000" stroke-width="3" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"/>
                    <text x="200" font-family="'Outfit', sans-serif" font-size="12" font-weight="700" fill="#111827" text-anchor="middle" width="300">
                        ${wrapSvgText(dialogue)}
                    </text>
                </g>
            ` : ''}
        </svg>
    `;

    return svgContent;
}

// Dashboard Cartoon Slideshow
function updateDashboardPreview() {
    window.updateDashboardPreview = updateDashboardPreview;
    const previewContainer = document.getElementById('dashboard-cartoon-preview');
    if (!previewContainer) return;

    if (!state.storyboard || state.storyboard.length === 0) {
        previewContainer.innerHTML = '<p style="color: var(--text-secondary);">No storyboard scenes defined.</p>';
        return;
    }

    if (state.dashboardFrameIndex === undefined || state.dashboardFrameIndex < 0) {
        state.dashboardFrameIndex = 0;
    } else if (state.dashboardFrameIndex >= state.storyboard.length) {
        state.dashboardFrameIndex = state.storyboard.length - 1;
    }

    const frame = state.storyboard[state.dashboardFrameIndex];
    if (!frame) return;

    // Render Craig SVG
    previewContainer.innerHTML = generateCraigSVG({
        outfit: frame.outfit,
        expression: frame.expression,
        aura: frame.expression === 'fury' ? 'on' : 'off',
        pose: frame.pose,
        bg: frame.bg,
        dialogue: frame.dialogue,
        specialEffect: frame.specialEffect
    }, "100%", "100%");

    // Update text labels
    const titleEl = document.getElementById('dash-frame-title');
    const counterEl = document.getElementById('dash-frame-counter');
    const descEl = document.getElementById('dash-frame-desc');

    if (titleEl) titleEl.textContent = frame.title;
    if (counterEl) counterEl.textContent = `${state.dashboardFrameIndex + 1} / ${state.storyboard.length}`;
    if (descEl) descEl.textContent = frame.desc;

    // Synchronize the video scrubber progress segments
    renderVideoScrubber();
}

// Render progress scrubber segments
function renderVideoScrubber() {
    const scrubber = document.getElementById('video-scrubber');
    if (!scrubber) return;

    scrubber.innerHTML = '';
    state.storyboard.forEach((frame, idx) => {
        const seg = document.createElement('div');
        seg.style.flex = '1';
        seg.style.height = '6px';
        seg.style.borderRadius = '3px';
        seg.style.cursor = 'pointer';
        seg.style.transition = 'background-color 0.2s';
        
        // Highlight active and watched segments
        if (idx === state.dashboardFrameIndex) {
            seg.style.backgroundColor = 'var(--accent-orange)';
            seg.style.boxShadow = '0 0 8px var(--accent-orange)';
        } else if (idx < state.dashboardFrameIndex) {
            seg.style.backgroundColor = 'rgba(255, 106, 0, 0.45)';
        } else {
            seg.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }

        // Click a segment to jump directly to that scene (scrubbing)
        seg.addEventListener('click', () => {
            const wasPlaying = state.isPlaying;
            if (state.isPlaying) pauseCartoon();
            
            state.dashboardFrameIndex = idx;
            state.selectedFrameId = frame.id;
            selectStoryboardFrame(state.selectedFrameId);
            
            // Resume play if it was playing
            if (wasPlaying) {
                playCartoon();
            }
        });

        scrubber.appendChild(seg);
    });
}

// Play/Pause cartoon player loop
function togglePlayPause() {
    if (state.isPlaying) {
        pauseCartoon();
    } else {
        playCartoon();
    }
}

function playCartoon() {
    state.isPlaying = true;
    
    // Update Play Button UI
    const playBtnText = document.getElementById('play-pause-text');
    const playBtnIcon = document.getElementById('play-pause-icon');
    const statusEl = document.getElementById('player-status');
    
    if (playBtnText) playBtnText.textContent = "Pause Cartoon";
    if (playBtnIcon) {
        // Pause icon SVG
        playBtnIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
    }
    if (statusEl) {
        statusEl.textContent = "Playing";
        statusEl.style.color = "var(--accent-blue)";
        statusEl.style.backgroundColor = "rgba(0, 180, 216, 0.15)";
    }

    playNextSceneStep();
}

function pauseCartoon() {
    state.isPlaying = false;
    if (state.playTimeout) {
        clearTimeout(state.playTimeout);
        state.playTimeout = null;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    // Update Button UI to Play
    const playBtnText = document.getElementById('play-pause-text');
    const playBtnIcon = document.getElementById('play-pause-icon');
    const statusEl = document.getElementById('player-status');
    
    if (playBtnText) playBtnText.textContent = "Play Cartoon";
    if (playBtnIcon) {
        // Play icon SVG
        playBtnIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
    }
    if (statusEl) {
        statusEl.textContent = "Paused";
        statusEl.style.color = "var(--accent-red)";
        statusEl.style.backgroundColor = "rgba(230, 57, 70, 0.15)";
    }
}

// Speak Dialogue Aloud using Web Speech API
function readDialogueAloud(onEndCallback = null) {
    if (!window.speechSynthesis) {
        if (onEndCallback) onEndCallback();
        return;
    }
    
    window.speechSynthesis.cancel(); // stop current speech
    
    const frame = state.storyboard[state.dashboardFrameIndex];
    if (frame && frame.dialogue) {
        const utterance = new SpeechSynthesisUtterance(frame.dialogue);
        utterance.rate = 0.95; // slightly slower wise pacing
        utterance.pitch = 0.85; // slightly deeper voice for Craig
        
        if (onEndCallback) {
            utterance.onend = () => {
                // Check if we are still playing before calling callback
                if (state.isPlaying) onEndCallback();
            };
            utterance.onerror = () => {
                if (state.isPlaying) onEndCallback();
            };
        }
        
        state.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    } else {
        if (onEndCallback) onEndCallback();
    }
}

// Main Playback Loop Step
function playNextSceneStep() {
    if (!state.isPlaying) return;

    // Render current frame
    updateDashboardPreview();

    const frame = state.storyboard[state.dashboardFrameIndex];
    const autoVoiceChecked = document.getElementById('auto-voice-toggle')?.checked;

    const advanceNext = () => {
        if (!state.isPlaying) return;
        
        // Loop back to start if end is reached, else increment
        if (state.dashboardFrameIndex >= state.storyboard.length - 1) {
            state.dashboardFrameIndex = 0;
        } else {
            state.dashboardFrameIndex++;
        }
        
        state.selectedFrameId = state.storyboard[state.dashboardFrameIndex].id;
        
        // Play next step after a tiny slide transition delay
        state.playTimeout = setTimeout(() => {
            playNextSceneStep();
        }, 1200);
    };

    if (autoVoiceChecked && frame.dialogue) {
        // Speak first. When speech finishes, advance to next scene
        readDialogueAloud(() => {
            advanceNext();
        });
    } else {
        // Voice disabled or no dialogue: wait 4.5 seconds and advance
        state.playTimeout = setTimeout(() => {
            advanceNext();
        }, 4500);
    }
}

function initDashboardSlideshow() {
    const prevBtn = document.getElementById('dash-prev-btn');
    const nextBtn = document.getElementById('dash-next-btn');
    const speakBtn = document.getElementById('speak-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            pauseCartoon();
            if (state.storyboard.length > 0) {
                state.dashboardFrameIndex = (state.dashboardFrameIndex - 1 + state.storyboard.length) % state.storyboard.length;
                state.selectedFrameId = state.storyboard[state.dashboardFrameIndex].id;
                selectStoryboardFrame(state.selectedFrameId);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            pauseCartoon();
            if (state.storyboard.length > 0) {
                state.dashboardFrameIndex = (state.dashboardFrameIndex + 1) % state.storyboard.length;
                state.selectedFrameId = state.storyboard[state.dashboardFrameIndex].id;
                selectStoryboardFrame(state.selectedFrameId);
            }
        });
    }

    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            // Trigger manual speak without auto-advancing
            readDialogueAloud();
        });
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            togglePlayPause();
        });
    }

    updateDashboardPreview();
}

// Router Controller
function initRouter() {
    const navButtons = document.querySelectorAll('.nav-item button');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            pauseCartoon(); // Stop playing cartoon if user moves tabs
            
            const targetTab = btn.getAttribute('data-tab');
            
            // Update Active states in sidebar
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            btn.parentElement.classList.add('active');

            // Swap active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-tab`) {
                    content.classList.add('active');
                }
            });

            state.activeTab = targetTab;
            handleTabChange(targetTab);
        });
    });
}

function handleTabChange(tabName) {
    // If Retro Game Tab is active, initialize Game Controller
    if (tabName === 'game') {
        if (state.gameController) {
            state.gameController.destroy();
        }
        state.gameController = new window.RetroGameController('game-canvas');
    } else {
        // Stop game loops if user leaves tab
        if (state.gameController) {
            state.gameController.destroy();
            state.gameController = null;
        }
    }
}

function selectStoryboardFrame(id) {
    state.selectedFrameId = id;
    const frame = state.storyboard.find(f => f.id === id);
    if (!frame) return;
    updateDashboardPreview();
}

// Global Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initRouter();
    initDashboardSlideshow();
    handleTabChange(state.activeTab); // Initialize game loop immediately on load
});
