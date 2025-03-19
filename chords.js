// Define the chromatic scale from G2 to C6 (42 notes)
const chromaticScale = [
    "G2", "G#2", "A2", "A#2", "B2",
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3",
    "G3", "G#3", "A3", "A#3", "B3",
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4",
    "G4", "G#4", "A4", "A#4", "B4",
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5",
    "G5", "G#5", "A5", "A#5", "B5",
    "C6"
];

// Map each note to its chromatic index (0 to 41)
const noteToChromaticIndex = {};
chromaticScale.forEach((note, index) => {
    noteToChromaticIndex[note] = index;
});

// Define chord intervals in semitones
const chordIntervals = {
    "single": [0],
    "octave": [0, 12], // Octave: 12 semitones
    "major": [0, 4, 7], // Major: root, major third, perfect fifth
    "minor": [0, 3, 7], // Minor: root, minor third, perfect fifth
    "diminished": [0, 3, 6], // Diminished: root, minor third, diminished fifth
    "augmented": [0, 4, 8], // Augmented: root, major third, augmented fifth
    "domSeven": [0, 4, 7, 10], // Dominant 7th: root, major third, perfect fifth, minor seventh
    "majSeven": [0, 4, 7, 11], // Major 7th: root, major third, perfect fifth, major seventh
    "minSeven": [0, 3, 7, 11], // Minor Major 7th: root, minor third, perfect fifth, major seventh
    "susSeven": [0, 5, 7, 10], // Suspended 7th: root, perfect fourth, perfect fifth, minor seventh
    "domNine": [0, 4, 7, 10, 14], // Dominant 9th: root, major third, perfect fifth, minor seventh, major ninth
    "majNine": [0, 4, 7, 11, 14], // Major 9th: root, major third, perfect fifth, major seventh, major ninth
    "minNine": [0, 3, 7, 11, 14], // Minor Major 9th: root, minor third, perfect fifth, major seventh, major ninth
    "susNine": [0, 5, 7, 10, 14] // Suspended 9th: root, perfect fourth, perfect fifth, minor seventh, major ninth
};

function getChordKeys(rootKey, currentMode, jankoLayout, keyElements) {
    const rootNote = rootKey.dataset.note;
    const rootIndex = noteToChromaticIndex[rootNote]; // Get the chromatic index of the root note

    // Calculate the chromatic indices of the chord notes
    const chordIndices = chordIntervals[currentMode].map(interval => {
        let newIndex = (rootIndex + interval) % chromaticScale.length; // Wrap around the scale
        if (newIndex < 0) newIndex += chromaticScale.length; // Handle negative indices
        return newIndex;
    });

    // Map the chromatic indices back to note names
    const chordNotes = chordIndices.map(index => chromaticScale[index]);

    // Find the corresponding key elements for the chord notes
    const chordKeys = [];
    chordNotes.forEach(note => {
        const key = keyElements.find(k => k.dataset.note === note);
        if (key) chordKeys.push(key);
    });

    return chordKeys;
}

// Expose the function globally
window.getChordKeys = getChordKeys;