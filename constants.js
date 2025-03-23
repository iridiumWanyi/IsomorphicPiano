// Mode colors with lightened Morandi colors
const modeColors = {
    "single": "#e3e1de",
    "octave": "#ebe3cd",
    "major": "#ebd3d3",
    "minor": "#dce5d2",
    "diminished": "#cedfdf",
    "augmented": "#d7cfdd",
    "domSeven": "#c9d5d3",
    "majSeven": "#e4d7d2",
    "minSeven": "#c0ccd5",
    "susSeven": "#d6d1cb",
    "domNine": "#c6ccba",
    "majNine": "#ded2d8",
    "minNine": "#c0ccc9",
    "susNine": "#d4c9ba",
    "arpeggiatorToggle": "#e3e1de",
    "userChord1": "#eeeae6",
    "userChord2": "#eeeae6",
    "userChord3": "#eeeae6",
    "userChord4": "#eeeae6"
};

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

const partialKeyboardLayout = [
    ["F2", "G2", "A2", "B2", "C#3", "D#3", "F3", "G3", "A3", "B3", "C#4", "D#4", "F4", "G4", "A4", "B4", "C#5", "D#5", "F5", "G5", "A5", "B5"],
    ["F#2", "G#2", "A#2", "C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4", "F#4", "G#4", "A#4", "C5", "D5", "E5", "F#5", "G#5", "A#5", "C6"],
    ["F2", "G2", "A2", "B2", "C#3", "D#3", "F3", "G3", "A3", "B3", "C#4", "D#4", "F4", "G4", "A4", "B4", "C#5", "D#5", "F5", "G5", "A5", "B5"],
    ["F#2", "G#2", "A#2", "C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4", "F#4", "G#4", "A#4", "C5", "D5", "E5", "F#5", "G#5", "A#5", "C6"]
];

const wholeKeyboardLayout = [
    ["A#0", "C1", "D1", "E1", "F#1", "G#1", "A#1", "C2", "D2", "E2", "F#2", "G#2", "A#2", "C3", "D3", "E3", "F#3", "G#3", "A#3", "C4", "D4", "E4"],
    ["A0", "B0", "C#1", "D#1", "F1", "G1", "A1", "B1", "C#2", "D#2", "F2", "G2", "A2", "B2", "C#3", "D#3", "F3", "G3", "A3", "B3", "C#4", "D#4"],
    ["F#4", "G#4", "A#4", "C5", "D5", "E5", "F#5", "G#5", "A#5", "C6", "D6", "E6", "F#6", "G#6", "A#6", "C7", "D7", "E7", "F#7", "G#7", "A#7", "C8"],
    ["F4", "G4", "A4", "B4", "C#5", "D#5", "F5", "G5", "A5", "B5", "C#6", "D#6", "F6", "G6", "A6", "B6", "C#7", "D#7", "F7", "G7", "A7", "B7"]
];

const appState = {
    currentMode: "single",
    keyElements: [],
    lastClickedPosition: { row: 0, col: 0 },
    currentKeyboardLayout: "partial",
    arpeggiatorOn: false,
    arpeggiatorTimeoutId: null,
    currentArpeggioNotes: [],
    arpeggiatorSpeed: 250,
    arpeggiatorPattern: "1,2,3,4,5,3,4,5",  // Changed from "12345345"
    audioMap: {},
    userChordIntervals: {
        "userChord1": [0, 2, 4, 7],
        "userChord2": [0, 3, 6, 9],
        "userChord3": [0, 4, 8],
        "userChord4": [0, 5, 7]
    }
};

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

const noteToChromaticIndex = {};
chromaticScale.forEach((note, index) => {
    noteToChromaticIndex[note] = index;
});