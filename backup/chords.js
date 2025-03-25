// Chromatic scale for note indexing (A0 = 0, ..., C8 = 87)
const chromaticScale = [
    "A0", "A#0", "B0",
    "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
    "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
    "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
    "C8"
];

// Map notes to their chromatic index (A0 = 0, ..., C8 = 87)
const noteToChromaticIndex = {};
chromaticScale.forEach((note, index) => {
    noteToChromaticIndex[note] = index;
});

// Function to get chord keys based on mode
function getChordKeys(key, mode, layout, keyElements) {
    const note = key.dataset.note;
    const row = parseInt(key.dataset.row);
    const col = parseInt(key.dataset.col);
    const noteIndex = noteToChromaticIndex[note];
    let intervals = [];

    switch (mode) {
        case "octave":
            intervals = [0, 12];
            break;
        case "major":
            intervals = [0, 4, 7];
            break;
        case "minor":
            intervals = [0, 3, 7];
            break;
        case "diminished":
            intervals = [0, 3, 6];
            break;
        case "augmented":
            intervals = [0, 4, 8];
            break;
        case "domSeven":
            intervals = [0, 4, 7, 10];
            break;
        case "majSeven":
            intervals = [0, 4, 7, 11];
            break;
        case "minSeven":
            intervals = [0, 3, 7, 11];
            break;
        case "susSeven":
            intervals = [0, 5, 7, 10];
            break;
        case "domNine":
            intervals = [0, 4, 7, 10, 14];
            break;
        case "majNine":
            intervals = [0, 4, 7, 11, 14];
            break;
        case "minNine":
            intervals = [0, 3, 7, 11, 14];
            break;
        case "susNine":
            intervals = [0, 5, 7, 10, 14];
            break;
        default:
            return [key];
    }

    const chordNotes = intervals.map(interval => {
        const targetIndex = noteIndex + interval;
        if (targetIndex < chromaticScale.length) {
            return chromaticScale[targetIndex];
        }
        return null;
    }).filter(note => note !== null);

    const chordKeys = [];
    chordNotes.forEach(targetNote => {
        const matchingKeys = keyElements.filter(k => k.dataset.note === targetNote);
        if (matchingKeys.length > 0) {
            let closestKey = matchingKeys[0];
            let minDistance = Infinity;
            matchingKeys.forEach(k => {
                const kRow = parseInt(k.dataset.row);
                const kCol = parseInt(k.dataset.col);
                const distance = Math.abs(kRow - row) + Math.abs(kCol - col);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestKey = k;
                }
            });
            chordKeys.push(closestKey);
        }
    });

    return chordKeys;
}