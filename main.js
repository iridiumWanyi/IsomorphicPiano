// Apply colors to buttons
Object.keys(modeColors).forEach(mode => {
    const btn = document.getElementById(mode);
    if (btn) {
        btn.style.backgroundColor = modeColors[mode];
    }
});

// Button activation logic
function setActiveButton(clickedButton) {
    document.querySelectorAll('.controls button').forEach(button => {
        button.classList.remove('active');
    });
    clickedButton.classList.add('active');
}

// Preload audio files
appState.audioMap = {};
function preloadAudioFiles() {
    Object.keys(noteToFileNumber).forEach(note => {
        const fileNumber = noteToFileNumber[note];
        const audio = new Audio(`audio/${fileNumber}.mp3`);
        appState.audioMap[note] = audio;
        // Preload the audio by setting the source (browser will fetch it)
        audio.preload = "auto";
        audio.load();
    });
    console.log("Audio files preloaded:", Object.keys(appState.audioMap).length);
}

// Mode button listeners
const modes = ["single", "octave", "major", "minor", "diminished", 
    "augmented", "domSeven", "majSeven", "minSeven", "susSeven",
    "domNine", "majNine", "minNine", "susNine"];
modes.forEach(mode => {
    const btn = document.getElementById(mode);
    if (btn) {
        btn.addEventListener("click", () => {
            appState.currentMode = mode;
            setActiveButton(btn);
            clearHoverHighlights();
            if (appState.currentMode === "single" && appState.arpeggiatorOn) {
                appState.arpeggiatorOn = false;
                const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
                if (arpeggiatorToggleBtn) {
                    arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (Off)`;
                    arpeggiatorToggleBtn.style.backgroundColor = modeColors["arpeggiatorToggle"]; // Revert to default color
                }
                if (appState.arpeggiatorTimeoutId) {
                    clearTimeout(appState.arpeggiatorTimeoutId);
                    appState.arpeggiatorTimeoutId = null;
                    appState.currentArpeggioNotes = [];
                }
            }
        });
    }
});

// Keyboard toggle button
const keyboardToggleBtn = document.getElementById("keyboardToggle");
if (keyboardToggleBtn) {
    keyboardToggleBtn.addEventListener("click", () => {
        try {
            appState.currentKeyboardLayout = appState.currentKeyboardLayout === "partial" ? "whole" : "partial";
            keyboardToggleBtn.textContent = appState.currentKeyboardLayout === "partial" ? "Switch to Whole Keyboard" : "Switch to Partial Keyboard";
            buildKeyboard(appState.currentKeyboardLayout === "partial" ? partialKeyboardLayout : wholeKeyboardLayout);
            // Stop arpeggiator when switching layouts
            if (appState.arpeggiatorOn) {
                appState.arpeggiatorOn = false;
                const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
                if (arpeggiatorToggleBtn) {
                    arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (Off)`;
                    arpeggiatorToggleBtn.style.backgroundColor = modeColors["arpeggiatorToggle"]; // Revert to default color
                }
                if (appState.arpeggiatorTimeoutId) {
                    clearTimeout(appState.arpeggiatorTimeoutId);
                    appState.arpeggiatorTimeoutId = null;
                    appState.currentArpeggioNotes = [];
                }
            }
        } catch (error) {
            console.error("Error switching keyboard layout:", error);
        }
    });
} else {
    console.error("Keyboard toggle button not found!");
}

// Arpeggiator toggle button
const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
if (arpeggiatorToggleBtn) {
    arpeggiatorToggleBtn.addEventListener("click", () => {
        appState.arpeggiatorOn = !appState.arpeggiatorOn;
        arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (${appState.arpeggiatorOn ? "On" : "Off"})`;
        // Change the button color based on toggle state
        arpeggiatorToggleBtn.style.backgroundColor = appState.arpeggiatorOn 
            ? "#ffdab9" // Light orange when on
            : modeColors["arpeggiatorToggle"]; // Revert to default color when off
        if (!appState.arpeggiatorOn && appState.arpeggiatorTimeoutId) {
            clearTimeout(appState.arpeggiatorTimeoutId);
            appState.arpeggiatorTimeoutId = null;
            appState.currentArpeggioNotes = [];
        }
        console.log("Arpeggiator toggled:", appState.arpeggiatorOn); // Debug log
    });
}

// Arpeggiator speed slider (BPM)
const arpeggiatorSpeedSlider = document.getElementById("arpeggiatorSpeed");
const bpmDisplay = document.getElementById("bpmDisplay");
if (arpeggiatorSpeedSlider && bpmDisplay) {
    function updateArpeggiatorSpeed(bpm) {
        // Convert BPM to milliseconds per note (assuming eighth notes, 2 notes per beat)
        const delayPerNote = 60000 / (bpm * 2); // 60,000 ms per minute / (BPM * notes per beat)
        appState.arpeggiatorSpeed = delayPerNote;
        bpmDisplay.textContent = `${bpm} BPM`;
        console.log(`Arpeggiator BPM: ${bpm}, Delay per note: ${delayPerNote} ms`); // Debug log
    }

    // Initialize with default BPM
    updateArpeggiatorSpeed(parseInt(arpeggiatorSpeedSlider.value));

    arpeggiatorSpeedSlider.addEventListener("input", () => {
        const bpm = parseInt(arpeggiatorSpeedSlider.value);
        updateArpeggiatorSpeed(bpm);
    });
} else {
    console.error("Arpeggiator speed slider or BPM display not found!");
}

// Arpeggiator pattern input
const arpeggiatorPatternInput = document.getElementById("arpeggiatorPattern");
if (arpeggiatorPatternInput) {
    arpeggiatorPatternInput.addEventListener("input", () => {
        const pattern = arpeggiatorPatternInput.value;
        // Validate pattern: should only contain digits 1-9
        if (/^[1-9]+$/.test(pattern)) {
            appState.arpeggiatorPattern = pattern;
            console.log("Arpeggiator pattern updated:", appState.arpeggiatorPattern); // Debug log
        } else {
            console.warn("Invalid arpeggiator pattern. Use digits 1-9 only.");
            arpeggiatorPatternInput.value = appState.arpeggiatorPattern; // Revert to last valid pattern
        }
    });
} else {
    console.error("Arpeggiator pattern input not found!");
}

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
    const keyMap = {
        "`": "single",
        "1": "octave",
        "2": "major",
        "3": "minor",
        "4": "diminished",
        "5": "augmented",
        "6": "domSeven",
        "7": "majSeven",
        "8": "minSeven",
        "9": "susSeven",
        "q": "domNine",
        "w": "majNine",
        "e": "minNine",
        "r": "susNine"
    };
    const mode = keyMap[event.key.toLowerCase()];
    if (mode) {
        appState.currentMode = mode;
        const btn = document.getElementById(mode);
        if (btn) {
            setActiveButton(btn);
            clearHoverHighlights();
            if (appState.currentMode === "single" && appState.arpeggiatorOn) {
                appState.arpeggiatorOn = false;
                const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
                if (arpeggiatorToggleBtn) {
                    arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (Off)`;
                    arpeggiatorToggleBtn.style.backgroundColor = modeColors["arpeggiatorToggle"]; // Revert to default color
                }
                if (appState.arpeggiatorTimeoutId) {
                    clearTimeout(appState.arpeggiatorTimeoutId);
                    appState.arpeggiatorTimeoutId = null;
                    appState.currentArpeggioNotes = [];
                }
            }
        }
    }
});

// Initialize the keyboard and preload audio
try {
    preloadAudioFiles(); // Preload audio files before building the keyboard
    buildKeyboard(partialKeyboardLayout);
} catch (error) {
    console.error("Failed to initialize keyboard:", error);
}