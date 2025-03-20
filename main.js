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

// Mode button listeners
const modes = ["single", "octave", "major", "minor", "diminished", 
    "augmented", "domSeven", "majSeven", "minSeven", "susSeven",
    "domNine", "majNine", "minNine", "susNine"];
modes.forEach(mode => {
    const btn = document.getElementById(mode);
    btn.addEventListener("click", () => {
        appState.currentMode = mode;
        setActiveButton(btn);
        clearHoverHighlights();
        if (appState.currentMode === "single" && appState.arpeggiatorOn) {
            appState.arpeggiatorOn = false;
            const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
            if (arpeggiatorToggleBtn) {
                arpeggiatorToggleBtn.textContent = `Toggle Arpeggiator (Off)`;
            }
            if (appState.arpeggiatorTimeoutId) {
                clearTimeout(appState.arpeggiatorTimeoutId);
                appState.arpeggiatorTimeoutId = null;
                appState.currentArpeggioNotes = [];
            }
        }
    });
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

// Initialize the keyboard
try {
    buildKeyboard(partialKeyboardLayout);
} catch (error) {
    console.error("Failed to initialize keyboard:", error);
}