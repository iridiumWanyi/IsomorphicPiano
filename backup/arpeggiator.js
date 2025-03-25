function stopArpeggiator() {
    appState.arpeggiatorOn = false;
    const arpeggiatorToggleBtn = document.getElementById("arpeggiatorToggle");
    if (arpeggiatorToggleBtn) {
        const textSpan = arpeggiatorToggleBtn.querySelector('.text');
        if (textSpan) {
            textSpan.textContent = `Toggle Arpeggiator (Off)`;
        }
        arpeggiatorToggleBtn.style.backgroundColor = modeColors["arpeggiatorToggle"];
    }
    if (appState.arpeggiatorTimeoutId) {
        clearTimeout(appState.arpeggiatorTimeoutId);
        appState.arpeggiatorTimeoutId = null;
        appState.currentArpeggioNotes = [];
    }
}

function playArpeggio(chordKeys, referenceRow, referenceCol) {
    console.log("playArpeggio called with chordKeys:", chordKeys.map(k => k.dataset.note));
    console.log("Arpeggiator speed (ms per note):", appState.arpeggiatorSpeed);
    if (chordKeys.length === 0) {
        console.warn("No chord keys to play in arpeggio");
        return;
    }

    const sortedKeys = chordKeys.slice().sort((a, b) => {
        const indexA = noteToChromaticIndex[a.dataset.note];
        const indexB = noteToChromaticIndex[b.dataset.note];
        return indexA - indexB;
    });

    const pattern = appState.arpeggiatorPattern.split(",").filter(x => x !== "").map(Number);
    const maxPatternIndex = Math.max(...pattern);
    const baseNotes = sortedKeys.map(k => k.dataset.note);
    const extendedNotes = [];

    for (let i = 0; i < maxPatternIndex; i++) {
        const noteIndex = i % baseNotes.length;
        const octaveShift = Math.floor(i / baseNotes.length);
        const baseNote = baseNotes[noteIndex];
        let targetIndex = noteToChromaticIndex[baseNote] + (octaveShift * 12);

        if (targetIndex < chromaticScale.length) {
            extendedNotes[i] = chromaticScale[targetIndex];
        } else {
            targetIndex = targetIndex % chromaticScale.length;
            extendedNotes[i] = chromaticScale[targetIndex];
        }
    }

    let noteIndices = pattern.map(p => p - 1);
    // Reverse the pattern if direction is "down"
    if (appState.arpeggiatorDirection === "down") {
        noteIndices = noteIndices.reverse();
    }

    appState.currentArpeggioNotes = noteIndices.map(index => {
        const note = extendedNotes[index];
        const closestKey = findClosestKey(note, referenceRow, referenceCol);
        return closestKey || sortedKeys[sortedKeys.length - 1];
    });

    console.log("Arpeggio notes:", appState.currentArpeggioNotes.map(k => k.dataset.note));

    let currentStep = 0;

    function playNextNote() {
        if (!appState.arpeggiatorOn || currentStep >= appState.currentArpeggioNotes.length) {
            appState.arpeggiatorTimeoutId = null;
            appState.currentArpeggioNotes = [];
            return;
        }

        const key = appState.currentArpeggioNotes[currentStep];
        playNote(key.dataset.note, referenceRow, referenceCol);

        currentStep++;
        appState.arpeggiatorTimeoutId = setTimeout(playNextNote, appState.arpeggiatorSpeed);
    }

    playNextNote();
}