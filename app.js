// Craig Pales Cartoon Studio - Application Logic (Simplified)

// Global State
const state = {
    version: 5,
    activeTab: 'storyboard',
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
        }
    ],
    selectedFrameId: 1,
    dashboardFrameIndex: 0,
    gameController: null
};

// Persistence functions (wrapped in try/catch to avoid SecurityExceptions if localStorage is disabled)
function saveToLocalStorage() {
    try {
        if (window.localStorage) {
            localStorage.setItem('craig_pales_storyboard_v5', JSON.stringify(state.storyboard));
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
                const saved = localStorage.getItem('craig_pales_storyboard_v5');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        state.storyboard = parsed;
                        state.selectedFrameId = parsed[0].id;
                        state.dashboardFrameIndex = 0;
                    }
                }
            } else {
                localStorage.removeItem('craig_pales_storyboard');
                localStorage.removeItem('craig_pales_storyboard_v5');
                localStorage.removeItem('craig_pales_storyboard_version');
            }
        }
    } catch(e) {
        console.warn("Storage warning: LocalStorage is read-restricted.", e);
    }
}

// SVG Assets Generator
function generateCraigSVG(config, width = "100%", height = "100%") {
    const { outfit, expression, aura, pose, bg, dialogue, specialEffect } = config;
    
    // Backgrounds definition
    let bgSvg = '';
    if (bg === 'shaolin') {
        bgSvg = `
            <rect width="400" height="400" fill="#f89e54"/>
            <circle cx="200" cy="220" r="140" fill="#ffb703" opacity="0.6"/>
            <!-- Mountains/Pagoda Silhouette -->
            <path d="M 0 400 L 120 280 L 220 350 L 320 260 L 400 340 L 400 400 Z" fill="#b56576"/>
            <path d="M 160 300 L 160 270 L 190 270 L 190 300 Z M 150 300 L 200 300 L 200 310 L 150 310 Z M 140 330 L 210 330 L 175 305 Z" fill="#6d597a"/>
            <rect x="0" y="340" width="400" height="60" fill="#6d597a"/>
        `;
    } else if (bg === 'dojo') {
        bgSvg = `
            <rect width="400" height="400" fill="#5c3d24"/>
            <!-- Shoji Screen sliding doors -->
            <rect x="40" y="50" width="140" height="270" fill="#f4f1de" stroke="#3d2516" stroke-width="6"/>
            <rect x="220" y="50" width="140" height="270" fill="#f4f1de" stroke="#3d2516" stroke-width="6"/>
            <path d="M 40 120 L 180 120 M 40 190 L 180 190 M 40 260 L 180 260" stroke="#3d2516" stroke-width="2"/>
            <path d="M 86 50 L 86 320 M 133 50 L 133 320" stroke="#3d2516" stroke-width="2"/>
            <path d="M 220 120 L 360 120 M 220 190 L 360 190 M 220 260 L 360 260" stroke="#3d2516" stroke-width="2"/>
            <path d="M 266 50 L 266 320 M 313 50 L 313 320" stroke="#3d2516" stroke-width="2"/>
            <rect x="0" y="320" width="400" height="80" fill="#d4c59f"/>
            <path d="M 0 320 L 400 320" stroke="#3d2516" stroke-width="4"/>
            <path d="M 100 320 L 100 400 M 300 320 L 300 400" stroke="#a6946d" stroke-width="3"/>
            <rect x="185" y="60" width="30" height="150" fill="#e63946"/>
            <rect x="190" y="70" width="20" height="130" fill="#fff"/>
            <text x="200" y="100" font-family="serif" font-size="20" fill="#000" text-anchor="middle" font-weight="bold">武</text>
            <text x="200" y="140" font-family="serif" font-size="20" fill="#000" text-anchor="middle" font-weight="bold">道</text>
        `;
    } else if (bg === 'new-york') {
        bgSvg = `
            <rect width="400" height="400" fill="#141a29"/>
            <!-- City Skyline -->
            <rect x="30" y="150" width="70" height="250" fill="#243049" />
            <rect x="130" y="100" width="90" height="300" fill="#1b2436" />
            <rect x="250" y="180" width="80" height="220" fill="#243049" />
            <!-- Windows -->
            <rect x="50" y="180" width="10" height="15" fill="#f4a261" opacity="0.4"/>
            <rect x="150" y="130" width="15" height="20" fill="#f4a261" opacity="0.6"/>
            <rect x="190" y="180" width="15" height="20" fill="#f4a261" opacity="0.2"/>
            <rect x="290" y="210" width="10" height="15" fill="#f4a261" opacity="0.5"/>
            <!-- Ground -->
            <rect x="0" y="330" width="400" height="70" fill="#2d3748"/>
            <line x1="0" y1="330" x2="400" y2="330" stroke="#4a5568" stroke-width="4"/>
            <!-- Lamp post -->
            <path d="M 350 330 L 350 150 L 330 150 L 330 170" fill="none" stroke="#4a5568" stroke-width="6" stroke-linecap="round"/>
            <circle cx="330" cy="175" r="12" fill="#ffe3a8" filter="drop-shadow(0 0 8px #ffb703)"/>
        `;
    } else if (bg === 'subway') {
        bgSvg = `
            <rect width="400" height="400" fill="#2b2d42"/>
            <!-- Subway tiles grid pattern -->
            <path d="M 0 100 L 400 100 M 0 200 L 400 200 M 0 300 L 400 300" stroke="#1d1e2c" stroke-width="4"/>
            <path d="M 80 0 L 80 400 M 180 0 L 180 400 M 280 0 L 280 400" stroke="#1d1e2c" stroke-width="4"/>
            <!-- Subway Pillars -->
            <rect x="50" y="0" width="30" height="400" fill="#e63946" opacity="0.9"/>
            <rect x="320" y="0" width="30" height="400" fill="#e63946" opacity="0.9"/>
            <!-- Floor -->
            <rect x="0" y="320" width="400" height="80" fill="#1b2436"/>
            <!-- Graffiti -->
            <text x="220" y="150" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="#ffb703" transform="rotate(-15 220 150)" opacity="0.4">BROOKLYN</text>
        `;
    } else if (bg === 'rooftop') {
        bgSvg = `
            <rect width="400" height="400" fill="#080c14"/>
            <!-- Moon -->
            <circle cx="320" cy="80" r="30" fill="#f4f1de" opacity="0.9"/>
            <circle cx="320" cy="80" r="45" fill="#f4f1de" opacity="0.05"/>
            <!-- Stars -->
            <circle cx="60" cy="50" r="1.5" fill="#fff" opacity="0.8"/>
            <circle cx="150" cy="90" r="1" fill="#fff" opacity="0.5"/>
            <circle cx="220" cy="40" r="1.5" fill="#fff" opacity="0.8"/>
            <!-- Water tower silhouette -->
            <path d="M 50 250 L 50 180 L 80 180 L 80 250" fill="none" stroke="#1b2436" stroke-width="4"/>
            <rect x="40" y="140" width="50" height="45" fill="#1b2436"/>
            <polygon points="40 140 65 110 90 140" fill="#151b26"/>
            <!-- Distance Skyline -->
            <rect x="120" y="200" width="80" height="200" fill="#141a29"/>
            <rect x="220" y="160" width="90" height="240" fill="#101520"/>
            <rect x="240" y="180" width="12" height="15" fill="#ffb703" opacity="0.2"/>
            <rect x="270" y="210" width="12" height="15" fill="#ffb703" opacity="0.3"/>
            <!-- Rooftop Wall foreground -->
            <rect x="0" y="320" width="400" height="80" fill="#2d1d18"/>
            <!-- Bricks pattern on Wall -->
            <path d="M 0 340 L 400 340 M 0 360 L 400 360 M 0 380 L 400 380" stroke="#1e1310" stroke-width="2"/>
            <path d="M 40 320 L 40 340 M 120 320 L 120 340 M 200 320 L 200 340 M 280 320 L 280 340 M 360 320 L 360 340" stroke="#1e1310" stroke-width="2"/>
            <path d="M 80 340 L 80 360 M 160 340 L 160 360 M 240 340 L 240 360 M 320 340 L 320 360 M 400 340 L 400 360" stroke="#1e1310" stroke-width="2"/>
            <!-- Ledge border -->
            <rect x="0" y="315" width="400" height="10" fill="#4e3d30" stroke="#000" stroke-width="2"/>
        `;
    } else {
        // Plain studio grey circle
        bgSvg = `
            <rect width="400" height="400" fill="#161a25"/>
            <circle cx="200" cy="200" r="160" fill="#1e2433"/>
        `;
    }

    // Special Visual Effects
    let effectSvg = '';
    if (specialEffect === 'blood') {
        effectSvg = `
            <!-- Blood Splatter on Wall (Forbidden Fist) -->
            <path d="M 60 160 Q 30 120 40 80 Q 70 70 90 100 Q 130 90 115 140 Q 140 180 95 200 Z" fill="#800000" opacity="0.85"/>
            <path d="M 75 120 Q 95 130 85 155 Q 60 145 75 120 Z" fill="#b30000" opacity="0.9"/>
            <circle cx="50" cy="210" r="5" fill="#800000"/>
            <circle cx="130" cy="90" r="4" fill="#800000"/>
            <circle cx="140" cy="150" r="6" fill="#b30000"/>
            <circle cx="35" cy="140" r="3" fill="#800000"/>
            
            <!-- Sliced gang member outline in the background -->
            <g transform="translate(180, 60) scale(0.7)" opacity="0.9">
                <!-- Top half falling -->
                <g transform="translate(-40, -30) rotate(-25)">
                    <rect x="0" y="0" width="60" height="70" fill="#1c1c1e" rx="10" stroke="#000" stroke-width="5"/>
                    <circle cx="30" cy="-25" r="22" fill="#ffe3a8" stroke="#000" stroke-width="5"/>
                    <!-- Leather jacket collar -->
                    <polygon points="10 0 30 20 20 40" fill="#2d3748"/>
                    <polygon points="50 0 30 20 40 40" fill="#2d3748"/>
                </g>
                <!-- Bottom half sliding -->
                <g transform="translate(50, 40) rotate(15)">
                    <rect x="0" y="0" width="50" height="60" fill="#2d3748" stroke="#000" stroke-width="5"/>
                    <rect x="5" y="60" width="16" height="30" fill="#ffe3a8" stroke="#000" stroke-width="5"/>
                    <rect x="29" y="60" width="16" height="30" fill="#ffe3a8" stroke="#000" stroke-width="5"/>
                    <!-- red bloody meaty bone section at split -->
                    <ellipse cx="25" cy="0" rx="25" ry="12" fill="#c31432" stroke="#000" stroke-width="4"/>
                    <circle cx="25" cy="0" r="5" fill="#fff"/>
                </g>
            </g>
        `;
    } else if (specialEffect === 'chains') {
        effectSvg = `
            <!-- Broken Steel Chains on Wall/Hands -->
            <g stroke="#000" stroke-width="3" fill="none" stroke-linecap="round">
                <path d="M 10 200 L 25 195 A 8 12 0 0 1 35 208 L 20 213 A 8 12 0 0 1 10 200 Z" fill="#95a5a6"/>
                <path d="M 28 205 L 43 200 A 8 12 0 0 1 53 213 L 38 218 A 8 12 0 0 1 28 205 Z" fill="#7f8c8d" transform="rotate(20 38 205)"/>
                <path d="M 65 220 L 75 210 A 5 8 0 0 1 85 220 L 75 230 A 5 8 0 0 1 65 220 Z" fill="#bdc3c7" transform="rotate(-45 75 220)"/>
                <path d="M 390 200 L 375 195 A 8 12 0 0 0 365 208 L 380 213 A 8 12 0 0 0 390 200 Z" fill="#95a5a6"/>
                <path d="M 372 205 L 357 200 A 8 12 0 0 0 347 213 L 362 218 A 8 12 0 0 0 372 205 Z" fill="#7f8c8d" transform="rotate(-20 362 205)"/>
                <path d="M 335 220 L 325 210 A 5 8 0 0 0 315 220 L 325 230 A 5 8 0 0 0 335 220 Z" fill="#bdc3c7" transform="rotate(45 325 220)"/>
            </g>
        `;
    } else if (specialEffect === 'ambush') {
        effectSvg = `
            <!-- Syndicate kidnapper silhouette in the background -->
            <g transform="translate(60, 150) scale(0.85)">
                <path d="M 20 180 L 80 180 L 75 70 L 65 70 L 60 40 L 40 40 L 35 70 L 25 70 Z" fill="#111" stroke="#000" stroke-width="4"/>
                <circle cx="50" cy="20" r="16" fill="#111" stroke="#000" stroke-width="4"/>
                <path d="M 40 18 L 48 18 L 47 22 L 41 22 Z" fill="#ffb703"/>
                <path d="M 52 18 L 60 18 L 59 22 L 53 22 Z" fill="#ffb703"/>
                <line x1="48" y1="18" x2="52" y2="18" stroke="#ffb703" stroke-width="2"/>
                <rect x="70" y="70" width="30" height="15" fill="#222" stroke="#000" stroke-width="3" transform="rotate(-10 70 70)"/>
                <rect x="70" y="75" width="8" height="15" fill="#222" stroke="#000" stroke-width="3" transform="rotate(-10 70 70)"/>
            </g>
        `;
    } else if (specialEffect === 'cuffs') {
        effectSvg = `
            <!-- Handcuffs still locked to wrists but broken in the middle -->
            <g stroke="#000" stroke-width="2.5" fill="none">
                <ellipse cx="95" cy="265" rx="14" ry="7" fill="none" stroke="#7f8c8d" stroke-width="4"/>
                <path d="M 95 272 L 95 285" stroke="#7f8c8d" stroke-width="3"/>
                <ellipse cx="290" cy="115" rx="14" ry="7" fill="none" stroke="#7f8c8d" stroke-width="4" transform="rotate(-15 290 115)"/>
                <path d="M 290 122 L 290 135" stroke="#7f8c8d" stroke-width="3"/>
            </g>
        `;
    } else if (specialEffect === 'rooftop-fury') {
        effectSvg = `
            <!-- Full Moon energy rays or dramatic aura -->
            <circle cx="320" cy="80" r="120" fill="url(#moon-glow)" opacity="0.15" pointer-events="none"/>
            <defs>
                <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#ffb703"/>
                    <stop offset="100%" stop-color="transparent"/>
                </radialGradient>
            </defs>
        `;
    } else if (specialEffect === 'training') {
        effectSvg = `
            <!-- Shaolin Temple Elder Teacher -->
            <g id="temple-elder" transform="translate(180, 30) scale(0.85)">
                <!-- Elder Torso (robe) -->
                <path d="M 120 200 L 220 200 L 230 320 L 110 320 Z" fill="#b56576" stroke="#000" stroke-width="4.5" />
                <path d="M 170 200 L 170 320" stroke="#ffb703" stroke-width="8"/>
                <!-- Elder Legs & Shoes -->
                <rect x="135" y="320" width="25" height="50" fill="#ffe3a8" stroke="#000" stroke-width="4"/>
                <rect x="210" y="320" width="25" height="50" fill="#ffe3a8" stroke="#000" stroke-width="4"/>
                <path d="M 125 370 L 165 370 C 165 370 165 355 145 355 C 125 355 125 370 125 370 Z" fill="#2b2d42" stroke="#000" stroke-width="4"/>
                <path d="M 210 370 L 250 370 C 250 370 250 355 230 355 C 210 355 210 370 210 370 Z" fill="#2b2d42" stroke="#000" stroke-width="4"/>
                <!-- Arms pointing/admonishing -->
                <path d="M 120 220 L 80 230 L 70 240" stroke="#b56576" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="70" cy="240" r="10" fill="#ffe3a8" stroke="#000" stroke-width="3"/>
                <!-- Head (Old man with long white beard) -->
                <circle cx="170" cy="130" r="40" fill="#ffe3a8" stroke="#000" stroke-width="4.5" />
                <!-- Long white beard -->
                <path d="M 145 150 Q 170 220 195 150 Z" fill="#ffffff" stroke="#000" stroke-width="3"/>
                <!-- White eyebrows -->
                <path d="M 145 105 Q 155 90 165 105" stroke="#000" stroke-width="3" fill="none"/>
                <path d="M 175 105 Q 185 90 195 105" stroke="#000" stroke-width="3" fill="none"/>
                <path d="M 145 105 Q 155 90 165 105" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/>
                <path d="M 175 105 Q 185 90 195 105" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/>
                <!-- Closed eyes -->
                <path d="M 150 120 Q 160 125 165 120" stroke="#000" stroke-width="3" fill="none"/>
                <path d="M 175 120 Q 180 125 190 120" stroke="#000" stroke-width="3" fill="none"/>
                <!-- Wise mouth -->
                <path d="M 162 142 Q 170 146 178 142" stroke="#000" stroke-width="2.5" fill="none"/>
            </g>
        `;
    }

    // Outfit Colors
    let robeColor = '#f37021'; // orange
    let robeSecondary = '#e65c00';
    let legColor = '#ffe3a8'; // bare legs
    let sleeveColor = '#f37021';
    let cuffColor = '#ffb703';

    if (outfit === 'vigilante-outfit') {
        robeColor = '#2f3e46'; // dark teal/grey hoodie
        robeSecondary = '#1f292e';
        legColor = '#354f52'; // dark trousers
        sleeveColor = '#2f3e46';
        cuffColor = '#52796f';
    } else if (outfit === 'young-robe') {
        robeColor = '#ffb703'; // lighter saffron orange for youth
        robeSecondary = '#ff9f1c';
        legColor = '#ffe3a8'; // bare legs
        sleeveColor = '#ffb703';
        cuffColor = '#ff9f1c';
    }

    // Aura Glow Filter
    let auraFilter = '';
    let fistGlow = '';
    if (aura === 'on') {
        auraFilter = `filter="drop-shadow(0 0 10px #ff6a00) drop-shadow(0 0 20px #e63946)"`;
        fistGlow = `
            <!-- Energy Sparks -->
            <path d="M 100 240 L 90 220 L 105 225 Z" fill="#ffb703" />
            <path d="M 300 240 L 310 220 L 295 225 Z" fill="#ffb703" />
            <circle cx="95" cy="255" r="15" fill="rgba(255, 106, 0, 0.4)" filter="blur(4px)"/>
            <circle cx="305" cy="255" r="15" fill="rgba(255, 106, 0, 0.4)" filter="blur(4px)"/>
        `;
    }

    // Pose Parts
    let leftArmSvg = `<path d="M 130 220 L 100 250 L 95 265" stroke="${sleeveColor}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
                      <circle cx="95" cy="265" r="15" fill="#f5cac3" stroke="#000" stroke-width="3" ${auraFilter}/>`;
    
    let rightArmSvg = `<path d="M 270 220 L 300 250 L 305 265" stroke="${sleeveColor}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
                       <circle cx="305" cy="265" r="15" fill="#f5cac3" stroke="#000" stroke-width="3" ${auraFilter}/>`;
    
    let torsoSvg = `<path d="M 130 200 L 270 200 L 280 320 L 120 320 Z" fill="${robeColor}" stroke="#000" stroke-width="4.5" />
                    <!-- Monk sash / Hoodie zip -->
                    ${outfit === 'monk-robe' ? 
                      `<path d="M 200 200 L 200 320" stroke="#ffb703" stroke-width="12"/>` : 
                      `<path d="M 200 200 L 200 320" stroke="#1f292e" stroke-width="6"/>`}`;

    let legsSvg = `
        <!-- Legs (Family Guy thick stubby legs) -->
        <rect x="145" y="320" width="30" height="50" fill="${legColor}" stroke="#000" stroke-width="4"/>
        <rect x="225" y="320" width="30" height="50" fill="${legColor}" stroke="#000" stroke-width="4"/>
        <!-- Shoes -->
        <path d="M 135 370 L 175 370 C 175 370 175 355 155 355 C 135 355 135 370 135 370 Z" fill="#2b2d42" stroke="#000" stroke-width="4"/>
        <path d="M 225 370 L 265 370 C 265 370 265 355 245 355 C 225 355 225 370 225 370 Z" fill="#2b2d42" stroke="#000" stroke-width="4"/>
    `;

    // Apply pose adjustments
    if (pose === 'fighting') {
        leftArmSvg = `
            <!-- Left Guard arm -->
            <path d="M 135 220 L 105 210 L 95 190" fill="none" stroke="${sleeveColor}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="95" cy="190" r="16" fill="#f5cac3" stroke="#000" stroke-width="3" ${auraFilter}/>
        `;
        rightArmSvg = `
            <!-- Right punching arm -->
            <path d="M 265 220 L 310 215 L 340 220" fill="none" stroke="${sleeveColor}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="340" cy="220" r="16" fill="#f5cac3" stroke="#000" stroke-width="3" ${auraFilter}/>
        `;
    } else if (pose === 'victory') {
        leftArmSvg = `
            <path d="M 130 220 L 100 250 L 95 265" stroke="${sleeveColor}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="95" cy="265" r="15" fill="#f5cac3" stroke="#000" stroke-width="3"/>
        `;
        rightArmSvg = `
            <!-- Hand high up in the air -->
            <path d="M 270 220 L 290 160 L 290 120" fill="none" stroke="${sleeveColor}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="290" cy="115" r="16" fill="#f5cac3" stroke="#000" stroke-width="3" ${auraFilter}/>
        `;
    }

    // Expressions components
    let mouthSvg = `<path d="M 185 140 Q 200 150 215 140" fill="none" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>`; // Calm smile
    let eyesSvg = `
        <circle cx="180" cy="115" r="6" fill="#000"/>
        <circle cx="220" cy="115" r="6" fill="#000"/>
    `;
    let eyebrowsSvg = `
        <path d="M 170 102 L 190 104" stroke="#000" stroke-width="3" stroke-linecap="round"/>
        <path d="M 210 104 L 230 102" stroke="#000" stroke-width="3" stroke-linecap="round"/>
    `;

    if (expression === 'determined') {
        mouthSvg = `<line x1="185" y1="140" x2="215" y2="140" stroke="#000" stroke-width="4" stroke-linecap="round"/>`; // Grim straight line
        eyebrowsSvg = `
            <!-- Angled angry eyebrows -->
            <path d="M 168 100 L 192 110" stroke="#000" stroke-width="4.5" stroke-linecap="round"/>
            <path d="M 208 110 L 232 100" stroke="#000" stroke-width="4.5" stroke-linecap="round"/>
        `;
    } else if (expression === 'fury') {
        mouthSvg = `
            <!-- Open screaming mouth with teeth -->
            <path d="M 182 135 Q 200 165 218 135 Z" fill="#990000" stroke="#000" stroke-width="3"/>
            <path d="M 186 138 Q 200 144 214 138" stroke="#fff" stroke-width="3" fill="none"/>
        `;
        eyesSvg = `
            <!-- White glowing eyes with red outline -->
            <circle cx="178" cy="115" r="9" fill="#fff" stroke="#e63946" stroke-width="3.5" ${auraFilter}/>
            <circle cx="222" cy="115" r="9" fill="#fff" stroke="#e63946" stroke-width="3.5" ${auraFilter}/>
        `;
        eyebrowsSvg = `
            <path d="M 166 96 L 194 114" stroke="#000" stroke-width="5" stroke-linecap="round"/>
            <path d="M 206 114 L 234 96" stroke="#000" stroke-width="5" stroke-linecap="round"/>
        `;
    }

    // Hood overlay for Vigilante Outfit
    let hoodSvg = '';
    if (outfit === 'vigilante-outfit') {
        hoodSvg = `
            <!-- Hood base behind head -->
            <path d="M 140 160 C 130 100 270 100 260 160 C 275 180 270 205 260 210 L 140 210 C 130 205 125 180 140 160 Z" fill="${robeSecondary}" stroke="#000" stroke-width="4" />
        `;
    }

    // Assemble dynamic SVG
    const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${width}" height="${height}">
            <defs>
                <style>
                    .black-outline { stroke: #000; stroke-width: 4.5; stroke-linejoin: round; }
                </style>
            </defs>
            
            <!-- Background Scenery -->
            ${bgSvg}

            <!-- Special Visual Effects -->
            ${effectSvg}

            <!-- Craig Character Structure -->
            <g id="craig-character" ${outfit === 'young-robe' ? 'transform="translate(80, 148) scale(0.6)"' : ''}>
                ${hoodSvg}
                ${legsSvg}
                ${leftArmSvg}
                ${rightArmSvg}
                ${torsoSvg}
                
                <!-- Head group -->
                <g id="head-group">
                    <!-- Family Guy Style big round head -->
                    <circle cx="200" cy="130" r="45" fill="#f5cac3" stroke="#000" stroke-width="4.5" />
                    <!-- Ears (simple circles) -->
                    <circle cx="152" cy="130" r="10" fill="#f5cac3" stroke="#000" stroke-width="4.5" />
                    <circle cx="248" cy="130" r="10" fill="#f5cac3" stroke="#000" stroke-width="4.5" />
                    <!-- Ear inner detail -->
                    <path d="M 152 126 A 4 4 0 0 0 152 134" stroke="#000" stroke-width="2.5" fill="none"/>
                    <path d="M 248 126 A 4 4 0 0 1 248 134" stroke="#000" stroke-width="2.5" fill="none"/>
                    
                    <!-- Facial Features -->
                    ${eyesSvg}
                    ${eyebrowsSvg}
                    ${mouthSvg}
                    <!-- Nose (classic L-shape) -->
                    <path d="M 200 120 L 204 130 L 198 132" fill="none" stroke="#000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                </g>

                <!-- Energy Sparks overlay -->
                ${fistGlow}
            </g>

            <!-- Speech Bubble overlay if dialogue exists -->
            ${dialogue ? `
                <g id="speech-bubble" transform="translate(0, 10)">
                    <!-- Bubble path -->
                    <path d="M 50 20 L 350 20 A 15 15 0 0 1 365 35 L 365 75 A 15 15 0 0 1 350 90 L 220 90 L 200 105 L 180 90 L 50 90 A 15 15 0 0 1 35 75 L 35 35 A 15 15 0 0 1 50 20 Z" fill="#ffffff" stroke="#000000" stroke-width="3" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"/>
                    <!-- Bubble Dialogue text -->
                    <text x="200" y="55" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#111827" text-anchor="middle" width="300">
                        ${dialogue.length > 45 ? `<tspan x="200" dy="-8">${dialogue.substring(0, 42)}...</tspan><tspan x="200" dy="18">${dialogue.substring(42)}</tspan>` : dialogue}
                    </text>
                </g>
            ` : ''}
        </svg>
    `;

    return svgContent;
}

// Dashboard Cartoon Slideshow
function updateDashboardPreview() {
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
}

function initDashboardSlideshow() {
    const prevBtn = document.getElementById('dash-prev-btn');
    const nextBtn = document.getElementById('dash-next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (state.storyboard.length > 0) {
                state.dashboardFrameIndex = (state.dashboardFrameIndex - 1 + state.storyboard.length) % state.storyboard.length;
                state.selectedFrameId = state.storyboard[state.dashboardFrameIndex].id;
                selectStoryboardFrame(state.selectedFrameId);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (state.storyboard.length > 0) {
                state.dashboardFrameIndex = (state.dashboardFrameIndex + 1) % state.storyboard.length;
                state.selectedFrameId = state.storyboard[state.dashboardFrameIndex].id;
                selectStoryboardFrame(state.selectedFrameId);
            }
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

// Storyboard Timeline & Editor Binder
function renderStoryboardTimeline() {
    const timeline = document.getElementById('timeline-container');
    if (!timeline) return;

    timeline.innerHTML = '';
    
    state.storyboard.forEach((frame, index) => {
        const frameEl = document.createElement('div');
        frameEl.className = `storyboard-frame ${state.selectedFrameId === frame.id ? 'active' : ''}`;
        frameEl.setAttribute('data-frame-id', frame.id);

        const svgMarkup = generateCraigSVG({
            outfit: frame.outfit,
            expression: frame.expression,
            aura: frame.expression === 'fury' ? 'on' : 'off',
            pose: frame.pose,
            bg: frame.bg,
            dialogue: null, // no bubble in tiny thumbnails
            specialEffect: frame.specialEffect
        }, "100%", "100%");

        frameEl.innerHTML = `
            <div class="frame-preview">
                ${svgMarkup}
            </div>
            <div class="frame-info">
                <div class="frame-title">${frame.title}</div>
                <div class="frame-desc">${frame.desc}</div>
            </div>
        `;

        frameEl.addEventListener('click', () => {
            state.dashboardFrameIndex = index;
            selectStoryboardFrame(frame.id);
        });

        timeline.appendChild(frameEl);
    });
}

function selectStoryboardFrame(id) {
    state.selectedFrameId = id;
    
    // Update active visual frame class
    document.querySelectorAll('.storyboard-frame').forEach(el => {
        el.classList.remove('active');
        if (el.getAttribute('data-frame-id') === id.toString()) {
            el.classList.add('active');
        }
    });

    const frame = state.storyboard.find(f => f.id === id);
    if (!frame) return;

    // Load values into editor inputs
    const setVal = (elId, val) => {
        const el = document.getElementById(elId);
        if (el) el.value = val;
    };
    
    setVal('frame-title-input', frame.title || '');
    setVal('frame-desc-input', frame.desc || '');
    setVal('frame-bg-select', frame.bg || 'new-york');
    setVal('frame-outfit-select', frame.outfit || 'monk-robe');
    setVal('frame-expr-select', frame.expression || 'determined');
    setVal('frame-pose-select', frame.pose || 'standing-calm');
    setVal('frame-dialogue-input', frame.dialogue || '');
    setVal('frame-effect-select', frame.specialEffect || '');

    // Update Storyboard Scene Preview
    updateDashboardPreview();
}

function initStoryboardEditor() {
    const updateCurrentFrameField = (field, value) => {
        const frame = state.storyboard.find(f => f.id === state.selectedFrameId);
        if (frame) {
            frame[field] = value;
            updateDashboardPreview();
            renderStoryboardTimeline();
            saveToLocalStorage();
        }
    };

    const bindSafeListener = (id, event, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
    };

    bindSafeListener('frame-title-input', 'input', (e) => {
        updateCurrentFrameField('title', e.target.value);
    });
    
    bindSafeListener('frame-desc-input', 'input', (e) => {
        updateCurrentFrameField('desc', e.target.value);
    });

    bindSafeListener('frame-dialogue-input', 'input', (e) => {
        updateCurrentFrameField('dialogue', e.target.value);
    });

    bindSafeListener('frame-bg-select', 'change', (e) => {
        updateCurrentFrameField('bg', e.target.value);
    });

    bindSafeListener('frame-outfit-select', 'change', (e) => {
        updateCurrentFrameField('outfit', e.target.value);
    });

    bindSafeListener('frame-expr-select', 'change', (e) => {
        updateCurrentFrameField('expression', e.target.value);
    });

    bindSafeListener('frame-pose-select', 'change', (e) => {
        updateCurrentFrameField('pose', e.target.value);
    });

    bindSafeListener('frame-effect-select', 'change', (e) => {
        updateCurrentFrameField('specialEffect', e.target.value);
    });

    // Add Frame Button
    bindSafeListener('add-frame-btn', 'click', () => {
        const newId = state.storyboard.length > 0 ? Math.max(...state.storyboard.map(f => f.id)) + 1 : 1;
        const newFrame = {
            id: newId,
            title: `New Scene Frame ${newId}`,
            desc: "Describe the action context",
            bg: 'new-york',
            outfit: 'monk-robe',
            expression: 'determined',
            pose: 'standing-calm',
            dialogue: "New dialogue here.",
            specialEffect: ''
        };
        state.storyboard.push(newFrame);
        state.selectedFrameId = newId;
        state.dashboardFrameIndex = state.storyboard.length - 1;
        renderStoryboardTimeline();
        selectStoryboardFrame(newId);
        saveToLocalStorage();
    });

    // Delete Frame Button
    bindSafeListener('delete-frame-btn', 'click', () => {
        if (state.storyboard.length <= 1) {
            alert("Cannot delete the last frame!");
            return;
        }
        state.storyboard = state.storyboard.filter(f => f.id !== state.selectedFrameId);
        state.selectedFrameId = state.storyboard[0].id;
        state.dashboardFrameIndex = 0;
        
        renderStoryboardTimeline();
        selectStoryboardFrame(state.selectedFrameId);
        saveToLocalStorage();
    });

    // Import / Export Buttons Binding
    bindSafeListener('export-episode-btn', 'click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.storyboard, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `craig_pales_episode_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    const importFileInput = document.getElementById('import-episode-file');
    bindSafeListener('import-episode-btn', 'click', () => {
        if (importFileInput) importFileInput.click();
    });

    if (importFileInput) {
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        state.storyboard = parsed;
                        state.selectedFrameId = parsed[0].id;
                        state.dashboardFrameIndex = 0;
                        saveToLocalStorage();
                        renderStoryboardTimeline();
                        selectStoryboardFrame(state.selectedFrameId);
                        alert("Episode Storyboard imported successfully!");
                    } else {
                        alert("Invalid JSON format. Must be an array of scenes.");
                    }
                } catch(err) {
                    alert("Error reading JSON file.");
                    console.error(err);
                }
            };
            reader.readAsText(file);
            importFileInput.value = '';
        });
    }

    renderStoryboardTimeline();
    selectStoryboardFrame(state.selectedFrameId);
}

// Global Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initRouter();
    initStoryboardEditor();
    initDashboardSlideshow();
});
