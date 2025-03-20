function buildKeyboard(layout) {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = ""; // Clear existing keyboard
    appState.keyElements = [];

    // Update the keyboard's class based on the current layout
    keyboard.className = "keyboard";
    keyboard.classList.add(appState.currentKeyboardLayout);

    layout.forEach((row, rowIndex) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = `row ${rowIndex < 2 ? "lower-section" : "upper-section"}`;
        row.forEach((note, colIndex) => {
            const key = document.createElement("div");
            key.className = `key ${note.includes("#") ? "dark" : "white"}`;
            key.textContent = note;
            key.dataset.note = note;
            key.dataset.row = rowIndex;
            key.dataset.col = colIndex;

            key.addEventListener("click", () => {
                appState.lastClickedPosition = { row: rowIndex, col: colIndex };
                clearHoverHighlights();
                if (appState.currentMode === "single") {
                    playNote(note, rowIndex, colIndex);
                } else {
                    const chordKeys = getChordKeys(note, rowIndex, colIndex);
                    if (appState.arpeggiatorOn) {
                        playArpeggio(chordKeys, rowIndex, colIndex);
                    } else {
                        chordKeys.forEach(chordKey => {
                            playNote(chordKey.dataset.note, rowIndex, colIndex);
                        });
                    }
                }
            });

            key.addEventListener("mouseover", () => {
                if (appState.currentMode !== "single") {
                    clearHoverHighlights();
                    const chordKeys = getChordKeys(note, rowIndex, colIndex);
                    chordKeys.forEach(chordKey => {
                        chordKey.classList.add("hover-highlight");
                    });
                }
            });

            rowDiv.appendChild(key);
            appState.keyElements.push(key);
        });
        keyboard.appendChild(rowDiv);
    });
}

function clearHoverHighlights() {
    appState.keyElements.forEach(key => {
        key.classList.remove("hover-highlight");
    });
}

function getChordKeys(note, row, col) {
    const chordIntervals = {
        "octave": [0, 12],
        "major": [0, 4, 7],
        "minor": [0, 3, 7],
        "diminished": [0, 3, 6],
        "augmented": [0, 4, 8],
        "domSeven": [0, 4, 7, 10],
        "majSeven": [0, 4, 7, 11],
        "minSeven": [0, 3, 7, 10],
        "susSeven": [0, 5, 7, 10],
        "domNine": [0, 4, 7, 10, 14],
        "majNine": [0, 4, 7, 11, 14],
        "minNine": [0, 3, 7, 10, 14],
        "susNine": [0, 5, 7, 10, 14]
    };

    const intervals = chordIntervals[appState.currentMode] || [0];
    const baseIndex = noteToChromaticIndex[note];
    const chordNotes = intervals.map(interval => {
        const targetIndex = baseIndex + interval;
        return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : note;
    });

    const chordKeys = [];
    chordNotes.forEach(chordNote => {
        const matchingKeys = appState.keyElements.filter(key => key.dataset.note === chordNote);
        if (matchingKeys.length > 0) {
            let closestKey = matchingKeys[0];
            let minDistance = Infinity;
            matchingKeys.forEach(key => {
                const keyRow = parseInt(key.dataset.row);
                const keyCol = parseInt(key.dataset.col);
                const distance = Math.abs(keyRow - row) + Math.abs(keyCol - col);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestKey = key;
                }
            });
            chordKeys.push(closestKey);
        }
    });

    return chordKeys;
}

function playNote(note, referenceRow, referenceCol) {
    const audio = appState.audioMap[note];
    if (audio) {
        // Reset the audio to the beginning and play
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.error(`Error playing note ${note}:`, error);
        });

        // Visual feedback: highlight the key
        const matchingKeys = appState.keyElements.filter(key => key.dataset.note === note);
        if (matchingKeys.length > 0) {
            let closestKey = matchingKeys[0];
            let minDistance = Infinity;
            matchingKeys.forEach(key => {
                const keyRow = parseInt(key.dataset.row);
                const keyCol = parseInt(key.dataset.col);
                const distance = Math.abs(keyRow - referenceRow) + Math.abs(keyCol - referenceCol);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestKey = key;
                }
            });
            closestKey.classList.add("hover-highlight");
        }
    } else {
        console.error(`Audio for note ${note} not found in audioMap`);
    }
}