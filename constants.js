// Mode colors with lightened Morandi colors for 7th and 9th chords
const modeColors = {
    "single": "#e3e1de",
    "octave": "#ebe3cd",
    "major": "#ecd6da",
    "minor": "#dce5d2",
    "diminished": "#cedfdf",
    "augmented": "#ebd3d3",
    "domSeven": "#c9d5d3", // Lightened Morandi: muted teal
    "majSeven": "#e4d7d2", // Lightened Morandi: soft peach
    "minSeven": "#c0ccd5", // Lightened Morandi: pale blue-gray
    "susSeven": "#d6d1cb", // Lightened Morandi: light taupe
    "domNine": "#c6ccba", // Lightened Morandi: muted sage
    "majNine": "#ded2d8", // Lightened Morandi: dusty rose
    "minNine": "#c0ccc9", // Lightened Morandi: soft slate
    "susNine": "#d4c9ba", // Lightened Morandi: warm beige
    "arpeggiatorToggle": "#e3e1de"
};

// Note-to-file mapping (A0 to C8 maps to 0.mp3 to 87.mp3)
const noteToFileNumber = {
    "A0": 0, "A#0": 1, "B0": 2,
    "C1": 3, "C#1": 4, "D1": 5, "D#1": 6, "E1": 7, "F1": 8, "F#1": 9, "G1": 10, "G#1": 11, "A1": 12, "A#1": 13, "B1": 14,
    "C2": 15, "C#2": 16, "D2": 17, "D#2": 18, "E2": 19, "F2": 20, "F#2": 21, "G2": 22, "G#2": 23, "A2": 24, "A#2": 25, "B2": 26,
    "C3": 27, "C#3": 28, "D3": 29, "D#3": 30, "E3": 31, "F3": 32, "F#3": 33, "G3": 34, "G#3": 35, "A3": 36, "A#3": 37, "B3": 38,
    "C4": 39, "C#4": 40, "D4": 41, "D#4": 42, "E4": 43, "F4": 44, "F#4": 45, "G4": 46, "G#4": 47, "A4": 48, "A#4": 49, "B4": 50,
    "C5": 51, "C#5": 52, "D5": 53, "D#5": 54, "E5": 55, "F5": 56, "F#5": 57, "G5": 58, "G#5": 59, "A5": 60, "A#5": 61, "B5": 62,
    "C6": 63, "C#6": 64, "D6": 65, "D#6": 66, "E6": 67, "F6": 68, "F#6": 69, "G6": 70, "G#6": 71, "A6": 72, "A#6": 73, "B6": 74,
    "C7": 75, "C#7": 76, "D7": 77, "D#7": 78, "E7": 79, "F7": 80, "F#7": 81, "G7": 82, "G#7": 83, "A7": 84, "A#7": 85, "B7": 86,
    "C8": 87
};

// Keyboard layouts
const partialKeyboardLayout = [
    ["F2", "G2", "A2", "B2", "C#3", "D#3", "F3", "G3", "A3", "B3", "C#4", "D#4", "F4", "G4", "A4", "B4", "C#5", "D#5", "F5", "G5", "A5", "B5"],
    ["F#2", "G#2", "A#2", "C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4", "F#4", "G#4", "A#4", "C5", "D5", "E5", "F#5", "G#5", "A#5", "C6"],
    ["F2", "G2", "A2", "B2", "C#3", "D#3", "F3", "G3", "A3", "B3", "C#4", "D#4", "F4", "G4", "A4", "B4", "C#5", "D#5", "F5", "G5", "A5", "B5"],
    ["F#2", "G#2", "A#2", "C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4", "F#4", "G#4", "A#4", "C5", "D5", "E5", "F#5", "G#5", "A#5", "C6"]
];

const wholeKeyboardLayout = [
    ["A#0", "C1", "D1", "E1", "F#1", "G#1", "A#1", "C2", "D2", "E2", "F#2", "G#2", "A#2", "C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4"], // A#0 to E4
    ["A0", "B0", "C#1", "D#1", "F1", "G1", "A1", "B1", "C#2", "D#2", "F2", "G2", "A2", "B2", "C#3", "D#3", "F3", "G3", "A3", "B3", "C#4", "D#4"], // A0 to D#4
    ["F#4", "G#4", "A#4", "C5", "D5", "E5", "F#5", "G#5", "A#5", "C6", "D6", "E6", "F#6", "G#6", "A#6", "C7", "D7", "E7", "F#7", "G#7", "A#7", "C8"], // F#4 to C8
    ["F4", "G4", "A4", "B4", "C#5", "D#5", "F5", "G5", "A5", "B5", "C#6", "D#6", "F6", "G6", "A6", "B6", "C#7", "D#7", "F7", "G7", "A7", "B7"] // F4 to B7
];

// Shared state
const appState = {
    currentMode: "single",
    keyElements: [],
    lastClickedPosition: { row: 0, col: 0 },
    currentKeyboardLayout: "partial",
    arpeggiatorOn: false,
    arpeggiatorTimeoutId: null,
    currentArpeggioNotes: [],
    arpeggiatorSpeed: 250, // Default to 120 BPM (60,000 / (120 * 2) = 250 ms for eighth notes)
    arpeggiatorPattern: "12345345",
    audioMap: {} // Map of note to preloaded Audio objects
};