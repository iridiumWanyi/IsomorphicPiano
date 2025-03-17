// Mode colors
const modeColors = {
    "single": "#e3e1de",
    "octave": "#ebe3cd",
    "major": "#ecd6da",
    "minor": "#dce5d2",
    "diminished": "#cedfdf",
    "augmented": "#ebd3d3",

    "domSeven": "#cfd4e2",
    "majSeven": "#dcd1e2",
    "minSeven": "#cfd4e2",
    "susSeven": "#dcd1e2",
    
    "playMusic": "#e3e1de",
    "playMusic2": "#e3e1de"
};

// Apply colors to buttons
Object.keys(modeColors).forEach(mode => {
    const btn = document.getElementById(mode);
    btn.style.backgroundColor = modeColors[mode];
});

// Button activation logic
function setActiveButton(clickedButton) {
    document.querySelectorAll('.controls button').forEach(button => {
        button.classList.remove('active');
    });
    clickedButton.classList.add('active');
}

// Isomorphic keyboard layout
const jankoLayout = [
    ["G2","A2","B2","C#3", "D#3", "F3", "G3", "A3", "B3", "C#4", "D#4", "F4", "G4", "A4", "B4", "C#5", "D#5", "F5", "G5", "A5", "B5"],
    ["G#2","A#2","C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4", "F#4", "G#4", "A#4", "C5", "D5", "E5", "F#5", "G#5", "A#5","C6"],
    ["G2","A2","B2","C#3", "D#3", "F3", "G3", "A3", "B3", "C#4", "D#4", "F4", "G4", "A4", "B4", "C#5", "D#5", "F5", "G5", "A5", "B5"],
    ["G#2","A#2","C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4", "F#4", "G#4", "A#4", "C5", "D5", "E5", "F#5", "G#5", "A#5","C6"]
];

// Note-to-file mapping
const noteToFileNumber = {
    "G2": 22, "G#2": 23, "A2": 24, "A#2": 25, "B2": 26,
    "C3": 27, "C#3": 28, "D3": 29, "D#3": 30, "E3": 31, "F3": 32,
    "F#3": 33, "G3": 34, "G#3": 35, "A3": 36, "A#3": 37, "B3": 38,
    "C4": 39, "C#4": 40, "D4": 41, "D#4": 42, "E4": 43, "F4": 44,
    "F#4": 45, "G4": 46, "G#4": 47, "A4": 48, "A#4": 49, "B4": 50,
    "C5": 51, "C#5": 52, "D5": 53, "D#5": 54, "E5": 55, "F5": 56,
    "F#5": 57, "G5": 58, "G#5": 59, "A5": 60, "A#5": 61, "B5": 62,
    "C6": 63
};

// Load audio files
const noteSounds = {};
jankoLayout.flat().forEach(note => {
    const fileNumber = noteToFileNumber[note];
    noteSounds[note] = new Audio(`audio/${fileNumber}.mp3`);
});

// Build keyboard
let currentMode = "single";
const keyElements = [];
const keyboard = document.getElementById("keyboard");
jankoLayout.forEach((row, rowIndex) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    row.forEach((note, colIndex) => {
        const key = document.createElement("div");
        key.className = "key";
        key.textContent = note;
        key.dataset.note = note;
        key.dataset.row = rowIndex;
        key.dataset.col = colIndex;
        key.classList.add(note.includes("#") ? "dark" : "white");
        rowDiv.appendChild(key);
        keyElements.push(key);
    });
    keyboard.appendChild(rowDiv);
});

// Mode button listeners
const modes = ["single", "octave", "major", "minor", "diminished", 
    "augmented", "domSeven", "majSeven", "minSeven", "susSeven"];
modes.forEach(mode => {
    const btn = document.getElementById(mode);
    btn.addEventListener("click", () => {
        currentMode = mode;
        setActiveButton(btn);
        clearHoverHighlights();
    });
});

// Audio playback
function playNote(note) {
    const sound = noteSounds[note];
    if (sound) {
        sound.currentTime = 0;
        sound.play();
    } else {
        console.error(`No sound file loaded for ${note}`);
    }
}

function clearHoverHighlights() {
    document.querySelectorAll(".key.hover-highlight").forEach(key => {
        key.classList.remove("hover-highlight");
    });
}

// Key interactions
keyElements.forEach(key => {
    key.addEventListener("mouseover", () => {
        if (currentMode !== "single") {
            clearHoverHighlights();
            const chordKeys = getChordKeys(key, currentMode, jankoLayout, keyElements);
            chordKeys.forEach(k => k.classList.add("hover-highlight"));
        }
    });

    key.addEventListener("mouseout", () => {
        if (currentMode !== "single") {
            clearHoverHighlights();
        }
    });

    key.addEventListener("click", () => {
        const note = key.dataset.note;
        const activeColor = modeColors[currentMode];
        if (currentMode === "single") {
            playNote(note);
            key.classList.add("active");
            key.style.backgroundColor = activeColor;
            setTimeout(() => {
                key.classList.remove("active");
                key.style.backgroundColor = "";
            }, 200);
        } else {
            const chordKeys = getChordKeys(key, currentMode, jankoLayout, keyElements);
            chordKeys.forEach(k => {
                playNote(k.dataset.note);
                k.classList.add("active");
                k.style.backgroundColor = activeColor;
                setTimeout(() => {
                    k.classList.remove("active");
                    k.style.backgroundColor = "";
                }, 200);
            });
        }
    });
});

// Music playback
let isPlaying1 = false, timeoutId1 = null;
let isPlaying2 = false, timeoutId2 = null;

function playMusic1() {
    if (isPlaying1) {
        isPlaying1 = false;
        if (timeoutId1) clearTimeout(timeoutId1);
        return;
    }
    isPlaying1 = true;
    let index = 0;
    function playNextNote() {
        if (!isPlaying1 || index >= preludeNotes.length) {
            isPlaying1 = false;
            return;
        }
        const note = preludeNotes[index];
        const keyElement = keyElements.find(k => k.dataset.note === note);
        if (keyElement) {
            playNote(note);
            keyElement.classList.add("active");
            keyElement.style.backgroundColor = modeColors["playMusic"];
            setTimeout(() => {
                keyElement.classList.remove("active");
                keyElement.style.backgroundColor = "";
            }, 500);
        }
        index++;
        timeoutId1 = setTimeout(playNextNote, 300);
    }
    playNextNote();
}

function playMusic2() {
    if (isPlaying2) {
        isPlaying2 = false;
        if (timeoutId2) clearTimeout(timeoutId2);
        return;
    }
    isPlaying2 = true;
    let index = 0;
    function playNextNote() {
        if (!isPlaying2 || index >= bee.length) {
            isPlaying2 = false;
            return;
        }
        const note = bee[index];
        const keyElement = keyElements.find(k => k.dataset.note === note);
        if (keyElement) {
            playNote(note);
            keyElement.classList.add("active");
            keyElement.style.backgroundColor = modeColors["playMusic2"];
            setTimeout(() => {
                keyElement.classList.remove("active");
                keyElement.style.backgroundColor = "";
            }, 200);
        }
        index++;
        timeoutId2 = setTimeout(playNextNote, 100);
    }
    playNextNote();
}

document.getElementById("playMusic").addEventListener("click", playMusic1);
document.getElementById("playMusic2").addEventListener("click", playMusic2);

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
    const keyMap = {
        "`": "single",
        "1": "octave",
        "2": "major",
        "3": "minor",
        "4": "diminished",
        "5": "augmented",
    };
    const mode = keyMap[event.key];
    if (mode) {
        currentMode = mode;
        const btn = document.getElementById(mode);
        if (btn) {
            setActiveButton(btn);
            clearHoverHighlights();
        }
    }
});