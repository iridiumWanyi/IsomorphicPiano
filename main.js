// Apply colors to buttons
Object.keys(modeColors).forEach(mode => {
    const btn = document.getElementById(mode);
    if (btn) {
        btn.style.backgroundColor = modeColors[mode];
    }
});

function setActiveButton(clickedButton) {
    document.querySelectorAll('.controls button').forEach(button => {
        button.classList.remove('active');
    });
    clickedButton.classList.add('active');
}

function preloadAudioFiles() {
    try {
        Object.keys(noteToFileNumber).forEach(note => {
            const fileNumber = noteToFileNumber[note];
            const audio = new Audio(`audio/${fileNumber}.mp3`);
            appState.audioMap[note] = audio;
            audio.preload = "auto";
            audio.load();
        });
        console.log("Audio files preloaded:", Object.keys(appState.audioMap).length);
    } catch (error) {
        console.error("Failed to preload audio files:", error);
    }
}

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
                stopArpeggiator();
            }
        });
    }
});

const keyboardToggleBtn = document.getElementById("keyboardToggle");
if (keyboardToggleBtn) {
    keyboardToggleBtn.addEventListener("click", () => {
        try {
            appState.currentKeyboardLayout = appState.currentKeyboardLayout === "partial" ? "whole" : "partial";
            keyboardToggleBtn.textContent = appState.currentKeyboardLayout === "partial" ? "Switch to Whole Keyboard" : "Switch to Partial Keyboard";
            buildKeyboard(appState.currentKeyboardLayout === "partial" ? partialKeyboardLayout : wholeKeyboardLayout);
            if (appState.arpeggiatorOn) {
                stopArpeggiator();
            }
        } catch (error) {
            console.error("Error switching keyboard layout:", error);
        }
    });
} else {
    console.error("Keyboard toggle button not found!");
}

const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
if (arpeggiatorToggleBtn) {
    arpeggiatorToggleBtn.addEventListener("click", () => {
        appState.arpeggiatorOn = !appState.arpeggiatorOn;
        arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (${appState.arpeggiatorOn ? "On" : "Off"})`;
        arpeggiatorToggleBtn.style.backgroundColor = appState.arpeggiatorOn 
            ? "#ffdab9" 
            : modeColors["arpeggiatorToggle"];
        if (!appState.arpeggiatorOn && appState.arpeggiatorTimeoutId) {
            stopArpeggiator();
        }
        console.log("Arpeggiator toggled:", appState.arpeggiatorOn);
    });
}

const arpeggiatorSpeedSlider = document.getElementById("arpeggiatorSpeed");
const bpmDisplay = document.getElementById("bpmDisplay");
if (arpeggiatorSpeedSlider && bpmDisplay) {
    function updateArpeggiatorSpeed(bpm) {
        const delayPerNote = 60000 / (bpm * 2);
        appState.arpeggiatorSpeed = delayPerNote;
        bpmDisplay.textContent = `${bpm} BPM`;
        console.log(`Arpeggiator BPM: ${bpm}, Delay per note: ${delayPerNote} ms`);
    }

    updateArpeggiatorSpeed(parseInt(arpeggiatorSpeedSlider.value));
    arpeggiatorSpeedSlider.addEventListener("input", () => {
        const bpm = parseInt(arpeggiatorSpeedSlider.value);
        updateArpeggiatorSpeed(bpm);
    });
} else {
    console.error("Arpeggiator speed slider or BPM display not found!");
}

const arpeggiatorPatternInput = document.getElementById("arpeggiatorPattern");
if (arpeggiatorPatternInput) {
    arpeggiatorPatternInput.addEventListener("input", () => {
        const pattern = arpeggiatorPatternInput.value;
        if (/^[1-9]+$/.test(pattern)) {
            appState.arpeggiatorPattern = pattern;
            console.log("Arpeggiator pattern updated:", appState.arpeggiatorPattern);
        } else {
            console.warn("Invalid arpeggiator pattern. Use digits 1-9 only.");
            arpeggiatorPatternInput.value = appState.arpeggiatorPattern;
        }
    });
} else {
    console.error("Arpeggiator pattern input not found!");
}

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
                stopArpeggiator();
            }
        }
    }
});

try {
    preloadAudioFiles();
    buildKeyboard(partialKeyboardLayout);
} catch (error) {
    console.error("Failed to initialize keyboard:", error);
}