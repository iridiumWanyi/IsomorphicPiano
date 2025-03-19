// Mode colors
const modeColors = {
    "single": "#e3e1de",
    "octave": "#ebe3cd",
    "major": "#ecd6da",
    "minor": "#dce5d2",
    "diminished": "#cedfdf",
    "augmented": "#ebd3d3",
    "domSeven": "#c9d5d3", 
    "majSeven": "#e4d7d2", 
    "minSeven": "#c0ccd5",
    "susSeven": "#d6d1cb", 
    "domNine": "#c6ccba", 
    "majNine": "#ded2d8", 
    "minNine": "#c0ccc9", 
    "susNine": "#d4c9ba", 
    "arpeggiatorToggle": "#e3e1de"
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

// Function to find the closest key element to a given position
function findClosestKey(note, referenceRow, referenceCol) {
    const matchingKeys = keyElements.filter(k => k.dataset.note === note);
    if (matchingKeys.length === 0) return null;

    let closestKey = matchingKeys[0];
    let minDistance = Infinity;

    matchingKeys.forEach(key => {
        const row = parseInt(key.dataset.row);
        const col = parseInt(key.dataset.col);
        // Use Manhattan distance: |row1 - row2| + |col1 - col2|
        const distance = Math.abs(row - referenceRow) + Math.abs(col - referenceCol);
        if (distance < minDistance) {
            minDistance = distance;
            closestKey = key;
        }
    });

    return closestKey;
}

// Arpeggiator state
let arpeggiatorOn = false;
let arpeggiatorTimeoutId = null;
let currentArpeggioNotes = [];
let arpeggiatorSpeed = 300; // Default speed in ms
let arpeggiatorPattern = "12345345"; // Default pattern
let lastClickedPosition = { row: 0, col: 0 }; // Store the position of the last clicked key

// Arpeggiator toggle
const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
arpeggiatorToggleBtn.addEventListener("click", () => {
    arpeggiatorOn = !arpeggiatorOn;
    arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (${arpeggiatorOn ? "On" : "Off"})`;
    if (!arpeggiatorOn && arpeggiatorTimeoutId) {
        clearTimeout(arpeggiatorTimeoutId);
        arpeggiatorTimeoutId = null;
        currentArpeggioNotes = [];
    }
});

// Arpeggiator speed control (slider)
const arpeggiatorSpeedInput = document.getElementById("arpeggiatorSpeed");
const arpeggiatorSpeedValue = document.getElementById("arpeggiatorSpeedValue");
arpeggiatorSpeedInput.addEventListener("input", () => {
    arpeggiatorSpeed = parseInt(arpeggiatorSpeedInput.value);
    arpeggiatorSpeedValue.textContent = arpeggiatorSpeed;
});

// Arpeggiator pattern control
const arpeggiatorPatternInput = document.getElementById("arpeggiatorPattern");
arpeggiatorPatternInput.addEventListener("input", () => {
    arpeggiatorPattern = arpeggiatorPatternInput.value.trim();
    // Stop the current arpeggio if the pattern changes
    if (arpeggiatorTimeoutId) {
        clearTimeout(arpeggiatorTimeoutId);
        arpeggiatorTimeoutId = null;
        currentArpeggioNotes = [];
    }
});

// Mode button listeners
const modes = ["single", "octave", "major", "minor", "diminished", 
    "augmented", "domSeven", "majSeven", "minSeven", "susSeven",
    "domNine", "majNine", "minNine", "susNine"];
modes.forEach(mode => {
    const btn = document.getElementById(mode);
    btn.addEventListener("click", () => {
        currentMode = mode;
        setActiveButton(btn);
        clearHoverHighlights();
        // Stop arpeggiator if switching to single mode
        if (currentMode === "single" && arpeggiatorOn) {
            arpeggiatorOn = false;
            arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (Off)`;
            if (arpeggiatorTimeoutId) {
                clearTimeout(arpeggiatorTimeoutId);
                arpeggiatorTimeoutId = null;
                currentArpeggioNotes = [];
            }
        }
    });
});

// Audio playback
function playNote(note, referenceRow, referenceCol) {
    const sound = noteSounds[note];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.error(`Audio play failed for ${note}:`, error));
        // Highlight the closest key to the reference position
        const keyElement = findClosestKey(note, referenceRow, referenceCol);
        if (keyElement) {
            keyElement.classList.add("active");
            keyElement.style.backgroundColor = modeColors[currentMode];
            setTimeout(() => {
                keyElement.classList.remove("active");
                keyElement.style.backgroundColor = "";
            }, 200);
        }
    } else {
        console.error(`No sound file loaded for ${note}`);
    }
}

function clearHoverHighlights() {
    document.querySelectorAll(".key.hover-highlight").forEach(key => {
        key.classList.remove("hover-highlight");
    });
}

// Arpeggiator function with custom pattern
function playArpeggio(chordKeys, referenceRow, referenceCol) {
    if (!arpeggiatorOn || chordKeys.length === 0) return;

    // Get the original notes
    const originalNotes = chordKeys.map(key => key.dataset.note);
    
    // Calculate the higher octave notes
    const higherOctaveNotes = originalNotes.map(note => {
        const originalIndex = noteToChromaticIndex[note];
        const higherIndex = originalIndex + 12; // Shift up one octave (12 semitones)
        // Check if the higher index is within the chromatic scale range
        if (higherIndex < chromaticScale.length) {
            return chromaticScale[higherIndex];
        }
        return null; // Skip if the note is out of range
    }).filter(note => note !== null); // Remove any null entries

    // Combine original and higher octave notes
    const allNotes = [...originalNotes, ...higherOctaveNotes];
    if (allNotes.length === 0) return; // No valid notes to play

    // Parse the arpeggiator pattern (e.g., "12345345")
    const pattern = arpeggiatorPattern.split("").map(num => parseInt(num) - 1).filter(num => !isNaN(num) && num >= 0 && num < allNotes.length);
    if (pattern.length === 0) return; // Invalid pattern

    // Map the pattern indices to notes
    currentArpeggioNotes = pattern.map(index => allNotes[index]);
    if (currentArpeggioNotes.length === 0) return; // No valid notes to play

    let index = 0;

    function playNextArpeggioNote() {
        if (!arpeggiatorOn || currentArpeggioNotes.length === 0) {
            arpeggiatorTimeoutId = null;
            return;
        }
        const note = currentArpeggioNotes[index];
        playNote(note, referenceRow, referenceCol); // Highlight the closest key
        index = (index + 1) % currentArpeggioNotes.length;
        arpeggiatorTimeoutId = setTimeout(playNextArpeggioNote, arpeggiatorSpeed);
    }

    playNextArpeggioNote();
}

// Key interactions
keyElements.forEach(key => {
    key.addEventListener("mouseover", () => {
        if (currentMode !== "single") {
            clearHoverHighlights();
            const referenceRow = parseInt(key.dataset.row);
            const referenceCol = parseInt(key.dataset.col);
            const chordKeys = getChordKeys(key, currentMode, jankoLayout, keyElements);
            // Highlight the closest instance of each note
            const uniqueNotes = [...new Set(chordKeys.map(k => k.dataset.note))];
            uniqueNotes.forEach(note => {
                const closestKey = findClosestKey(note, referenceRow, referenceCol);
                if (closestKey) closestKey.classList.add("hover-highlight");
            });
        }
    });

    key.addEventListener("mouseout", () => {
        if (currentMode !== "single") {
            clearHoverHighlights();
        }
    });

    key.addEventListener("click", () => {
        const note = key.dataset.note;
        const referenceRow = parseInt(key.dataset.row);
        const referenceCol = parseInt(key.dataset.col);
        // Store the last clicked position
        lastClickedPosition = { row: referenceRow, col: referenceCol };
        const activeColor = modeColors[currentMode];
        if (currentMode === "single") {
            // Stop arpeggiator if it was running
            if (arpeggiatorOn && arpeggiatorTimeoutId) {
                clearTimeout(arpeggiatorTimeoutId);
                arpeggiatorTimeoutId = null;
                currentArpeggioNotes = [];
            }
            playNote(note, referenceRow, referenceCol);
        } else {
            const chordKeys = getChordKeys(key, currentMode, jankoLayout, keyElements);
            if (arpeggiatorOn) {
                // Stop any existing arpeggio
                if (arpeggiatorTimeoutId) {
                    clearTimeout(arpeggiatorTimeoutId);
                    arpeggiatorTimeoutId = null;
                }
                playArpeggio(chordKeys, referenceRow, referenceCol);
            } else {
                // Stop arpeggiator if it was running
                if (arpeggiatorTimeoutId) {
                    clearTimeout(arpeggiatorTimeoutId);
                    arpeggiatorTimeoutId = null;
                    currentArpeggioNotes = [];
                }
                chordKeys.forEach(k => {
                    playNote(k.dataset.note, referenceRow, referenceCol);
                });
            }
        }
    });
});

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
            // Stop arpeggiator if switching to single mode
            if (currentMode === "single" && arpeggiatorOn) {
                arpeggiatorOn = false;
                arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (Off)`;
                if (arpeggiatorTimeoutId) {
                    clearTimeout(arpeggiatorTimeoutId);
                    arpeggiatorTimeoutId = null;
                    currentArpeggioNotes = [];
                }
            }
        }
    }
});