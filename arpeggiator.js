// Arpeggiator state
let arpeggiatorOn = false;
let arpeggiatorTimeoutId = null;
let currentArpeggioNotes = [];
let arpeggiatorSpeed = 120; // Default speed in BPM (maps to 500ms delay)
let arpeggiatorPattern = "12345345"; // Default pattern

// Function to convert BPM to delay (in milliseconds)
function bpmToDelay(bpm) {
    const delay = (60 / bpm) * 1000;
    return Math.max(50, Math.min(1500, delay)); // Clamp between 50ms and 1500ms
}

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
    if (arpeggiatorOn && currentArpeggioNotes.length > 0) {
        clearTimeout(arpeggiatorTimeoutId);
        arpeggiatorTimeoutId = null;
        playArpeggio(
            currentArpeggioNotes.map(note => keyElements.find(k => k.dataset.note === note)),
            lastClickedPosition.row,
            lastClickedPosition.col
        );
    }
});

// Arpeggiator pattern control
const arpeggiatorPatternInput = document.getElementById("arpeggiatorPattern");
arpeggiatorPatternInput.addEventListener("input", () => {
    arpeggiatorPattern = arpeggiatorPatternInput.value.trim();
    if (arpeggiatorTimeoutId) {
        clearTimeout(arpeggiatorTimeoutId);
        arpeggiatorTimeoutId = null;
        currentArpeggioNotes = [];
    }
});

// Arpeggiator function with custom pattern
function playArpeggio(chordKeys, referenceRow, referenceCol) {
    if (!arpeggiatorOn || chordKeys.length === 0) return;

    const originalNotes = chordKeys.map(key => key.dataset.note);
    
    const higherOctaveNotes = originalNotes.map(note => {
        const originalIndex = noteToChromaticIndex[note];
        const higherIndex = originalIndex + 12;
        if (higherIndex < chromaticScale.length) {
            return chromaticScale[higherIndex];
        }
        return null;
    }).filter(note => note !== null);

    const allNotes = [...originalNotes, ...higherOctaveNotes];
    if (allNotes.length === 0) return;

    const pattern = arpeggiatorPattern.split("").map(num => parseInt(num) - 1).filter(num => !isNaN(num) && num >= 0 && num < allNotes.length);
    if (pattern.length === 0) return;

    currentArpeggioNotes = pattern.map(index => allNotes[index]);
    if (currentArpeggioNotes.length === 0) return;

    let index = 0;

    function playNextArpeggioNote() {
        if (!arpeggiatorOn || currentArpeggioNotes.length === 0) {
            arpeggiatorTimeoutId = null;
            return;
        }
        const note = currentArpeggioNotes[index];
        playNote(note, referenceRow, referenceCol);
        index = (index + 1) % currentArpeggioNotes.length;
        arpeggiatorTimeoutId = setTimeout(playNextArpeggioNote, bpmToDelay(arpeggiatorSpeed));
    }

    playNextArpeggioNote();
}