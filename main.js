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
    "domNine", "majNine", "minNine", "susNine",
    "userChord1", "userChord2", "userChord3", "userChord4"];

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
}

const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
if (arpeggiatorToggleBtn) {
    arpeggiatorToggleBtn.addEventListener("click", () => {
        appState.arpeggiatorOn = !appState.arpeggiatorOn;
        const textSpan = arpeggiatorToggleBtn.querySelector('.text');
        if (textSpan) {
            textSpan.textContent = `Toggle Arpeggiator (${appState.arpeggiatorOn ? "On" : "Off"})`;
        }
        arpeggiatorToggleBtn.style.backgroundColor = appState.arpeggiatorOn ? "#e8d0d4" : modeColors["arpeggiatorToggle"];
        if (!appState.arpeggiatorOn && appState.arpeggiatorTimeoutId) {
            stopArpeggiator();
        }
    });
}

const arpeggiatorSpeedSlider = document.getElementById("arpeggiatorSpeed");
const bpmDisplay = document.getElementById("bpmDisplay");
if (arpeggiatorSpeedSlider && bpmDisplay) {
    function updateArpeggiatorSpeed(bpm) {
        const delayPerNote = 60000 / (bpm * 2);
        appState.arpeggiatorSpeed = delayPerNote;
        bpmDisplay.textContent = `${bpm} BPM`;
    }
    updateArpeggiatorSpeed(parseInt(arpeggiatorSpeedSlider.value));
    arpeggiatorSpeedSlider.addEventListener("input", () => {
        updateArpeggiatorSpeed(parseInt(arpeggiatorSpeedSlider.value));
    });
}

const arpeggiatorPatternInput = document.getElementById("arpeggiatorPattern");
if (arpeggiatorPatternInput) {
    arpeggiatorPatternInput.addEventListener("input", () => {
        const pattern = arpeggiatorPatternInput.value;
        // Updated regex: numbers from 1 to 88, optional trailing comma
        if (/^([1-9]|[1-7][0-9]|8[0-8])(,([1-9]|[1-7][0-9]|8[0-8]))*,?$/.test(pattern)) {
            appState.arpeggiatorPattern = pattern;
        } else {
            arpeggiatorPatternInput.value = appState.arpeggiatorPattern;
        }
    });
}

const arpeggiatorDirectionBtn = document.getElementById("arpeggiatorDirection");
if (arpeggiatorDirectionBtn) {
    appState.arpeggiatorDirection = "up"; // Default direction
    arpeggiatorDirectionBtn.addEventListener("click", () => {
        appState.arpeggiatorDirection = appState.arpeggiatorDirection === "up" ? "down" : "up";
        arpeggiatorDirectionBtn.textContent = appState.arpeggiatorDirection === "up" ? "↑" : "↓";
        if (appState.arpeggiatorOn && appState.arpeggiatorTimeoutId) {
            stopArpeggiator(); // Stop current arpeggio to restart with new direction
        }
    });
}

// Custom Chord Interval Inputs
for (let i = 1; i <= 4; i++) {
    const input = document.getElementById(`userChord${i}Intervals`);
    if (input) {
        input.addEventListener("input", () => {
            const value = input.value;
            // Ensure this regex allows 0-12 and optional trailing comma
            if (/^(1[0-2]|[0-9])(,(1[0-2]|[0-9]))*,?$/.test(value)) {
                const intervals = value.split(",").filter(x => x !== "").map(Number);
                appState.userChordIntervals[`userChord${i}`] = intervals;
            } else {
                input.value = appState.userChordIntervals[`userChord${i}`].join(",");
            }
        });
    }
}

// Arpeggiator Pattern Help Button
const arpeggiatorHelpBtn = document.getElementById("arpeggiatorHelp");
if (arpeggiatorHelpBtn) {
    let popup = null;
    arpeggiatorHelpBtn.addEventListener("mouseover", () => {
        if (!popup) {
            popup = document.createElement("div");
            popup.className = "popup";
            popup.textContent = "Enter a sequence of numbers separated by commas to specify the order in which chord notes should be played. Numbers exceeding the count of notes in the chord will trigger the corresponding notes in higher octaves. The default pattern reflects that of BWV 846.";
            document.body.appendChild(popup);
            
            const rect = arpeggiatorHelpBtn.getBoundingClientRect();
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 5}px`;
            
            popup.style.display = "block";
        }
    });
    arpeggiatorHelpBtn.addEventListener("mouseout", () => {
        if (popup) {
            popup.style.display = "none";
            document.body.removeChild(popup);
            popup = null;
        }
    });
}

// Custom Chord Help Button
const customChordHelpBtn = document.getElementById("customChordHelp");
if (customChordHelpBtn) {
    let popup = null;
    customChordHelpBtn.addEventListener("mouseover", () => {
        if (!popup) {
            popup = document.createElement("div");
            popup.className = "popup";
            popup.textContent = "Enter a sequence of numbers from 0 to 11, separated by commas, to define the intervals of your custom chord relative to the root note (0). For example, '0,4,7' creates a major triad.";
            document.body.appendChild(popup);
            
            const rect = customChordHelpBtn.getBoundingClientRect();
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 5}px`;
            
            popup.style.display = "block";
        }
    });
    customChordHelpBtn.addEventListener("mouseout", () => {
        if (popup) {
            popup.style.display = "none";
            document.body.removeChild(popup);
            popup = null;
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (document.activeElement.tagName === "INPUT") return;

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
        "r": "susNine",
        "a": "arpeggiatorToggle",
        "w": "arpeggiatorUp",   // Added for up direction
        "s": "arpeggiatorDown"  // Added for down direction
    };
    const mode = keyMap[event.key.toLowerCase()];
    if (mode) {
        if (mode === "arpeggiatorToggle") {
            appState.arpeggiatorOn = !appState.arpeggiatorOn;
            const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
            if (arpeggiatorToggleBtn) {
                const textSpan = arpeggiatorToggleBtn.querySelector('.text');
                if (textSpan) textSpan.textContent = `Toggle Arpeggiator (${appState.arpeggiatorOn ? "On" : "Off"})`;
                arpeggiatorToggleBtn.style.backgroundColor = appState.arpeggiatorOn ? "#e8d0d4" : modeColors["arpeggiatorToggle"];
            }
            if (!appState.arpeggiatorOn && appState.arpeggiatorTimeoutId) stopArpeggiator();
        } else if (mode === "arpeggiatorUp") {
            appState.arpeggiatorDirection = "up";
            arpeggiatorDirectionBtn.textContent = "↑";
            if (appState.arpeggiatorOn && appState.arpeggiatorTimeoutId) stopArpeggiator();
        } else if (mode === "arpeggiatorDown") {
            appState.arpeggiatorDirection = "down";
            arpeggiatorDirectionBtn.textContent = "↓";
            if (appState.arpeggiatorOn && appState.arpeggiatorTimeoutId) stopArpeggiator();
        } else {
            appState.currentMode = mode;
            const btn = document.getElementById(mode);
            if (btn) {
                setActiveButton(btn);
                clearHoverHighlights();
                if (appState.currentMode === "single" && appState.arpeggiatorOn) stopArpeggiator();
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