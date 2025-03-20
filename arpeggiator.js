function playArpeggio(chordKeys, referenceRow, referenceCol) {
    console.log("playArpeggio called with chordKeys:", chordKeys.map(k => k.dataset.note)); // Debug log
    console.log("Arpeggiator speed (ms per note):", appState.arpeggiatorSpeed); // Debug log
    if (chordKeys.length === 0) {
        console.warn("No chord keys to play in arpeggio");
        return;
    }

    // Sort chord keys by chromatic index (lowest to highest)
    const sortedKeys = chordKeys.slice().sort((a, b) => {
        const indexA = noteToChromaticIndex[a.dataset.note];
        const indexB = noteToChromaticIndex[b.dataset.note];
        return indexA - indexB;
    });

    // Map pattern to notes, extending to higher octaves if needed
    const pattern = appState.arpeggiatorPattern.split("").map(Number);
    const maxPatternIndex = Math.max(...pattern); // Highest note index in the pattern
    const baseNotes = sortedKeys.map(k => k.dataset.note);
    const extendedNotes = [];

    // Extend the chord notes to higher octaves to cover the pattern
    for (let i = 0; i < maxPatternIndex; i++) {
        const noteIndex = i % baseNotes.length; // Cycle through the base notes
        const octaveShift = Math.floor(i / baseNotes.length); // Number of octaves to shift up
        const baseNote = baseNotes[noteIndex];
        let targetIndex = noteToChromaticIndex[baseNote] + (octaveShift * 12); // Shift up by octaves (12 semitones)

        // Ensure the target index is within the chromatic scale
        if (targetIndex < chromaticScale.length) {
            extendedNotes[i] = chromaticScale[targetIndex];
        } else {
            // If we exceed the chromatic scale, wrap around (optional, or we can cap it)
            targetIndex = targetIndex % chromaticScale.length;
            extendedNotes[i] = chromaticScale[targetIndex];
        }
    }

    // Map the pattern to the extended notes
    const noteIndices = pattern.map(p => p - 1); // Convert 1-based pattern to 0-based index
    appState.currentArpeggioNotes = noteIndices.map(index => {
        const note = extendedNotes[index];
        // Find the closest key element for this note
        const matchingKeys = appState.keyElements.filter(k => k.dataset.note === note);
        if (matchingKeys.length > 0) {
            let closestKey = matchingKeys[0];
            let minDistance = Infinity;
            matchingKeys.forEach(k => {
                const kRow = parseInt(k.dataset.row);
                const kCol = parseInt(k.dataset.col);
                const distance = Math.abs(kRow - referenceRow) + Math.abs(kCol - referenceCol);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestKey = k;
                }
            });
            return closestKey;
        }
        // Fallback to the highest available note if the target note isn't in the layout
        return sortedKeys[sortedKeys.length - 1];
    });

    console.log("Arpeggio notes:", appState.currentArpeggioNotes.map(k => k.dataset.note)); // Debug log

    let currentStep = 0;

    function playNextNote() {
        if (!appState.arpeggiatorOn) {
            appState.arpeggiatorTimeoutId = null;
            appState.currentArpeggioNotes = [];
            return;
        }

        // Play the current note
        const key = appState.currentArpeggioNotes[currentStep];
        playNote(key.dataset.note, referenceRow, referenceCol);

        // Move to the next step, looping back to 0 if at the end
        currentStep++;
        if (currentStep >= appState.currentArpeggioNotes.length) {
            currentStep = 0; // Loop back to the start of the pattern
        }

        // Schedule the next note
        appState.arpeggiatorTimeoutId = setTimeout(playNextNote, appState.arpeggiatorSpeed);
    }

    // Start the arpeggio
    playNextNote();
}