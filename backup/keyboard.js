const chordIntervals = {
    "octave": [0, 12], "major": [0, 4, 7], "minor": [0, 3, 7], "diminished": [0, 3, 6],
    "augmented": [0, 4, 8], "domSeven": [0, 4, 7, 10], "majSeven": [0, 4, 7, 11],
    "minSeven": [0, 3, 7, 10], "susSeven": [0, 5, 7, 10], "domNine": [0, 4, 7, 10, 14],
    "majNine": [0, 4, 7, 11, 14], "minNine": [0, 3, 7, 10, 14], "susNine": [0, 5, 7, 10, 14]
};

function buildKeyboard(layout) {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";
    appState.keyElements = [];
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
                appState.lastClickedPosition = { row: rowIndex, colIndex };
                clearHoverHighlights();
                if (appState.currentMode === "single") {
                    playNote(note, rowIndex, colIndex);
                } else {
                    const chordKeys = getChordKeys(note, rowIndex, colIndex);
                    if (appState.arpeggiatorOn) {
                        playArpeggio(chordKeys, rowIndex, colIndex);
                    } else {
                        // Prepare all audio elements for the chord
                        const audioElements = chordKeys.map(chordKey => {
                            const note = chordKey.dataset.note;
                            const originalAudio = appState.audioMap[note];
                            if (!originalAudio) {
                                console.error(`Audio for note ${note} not found in audioMap`);
                                return null;
                            }
                            // Clone the audio element for independent playback
                            const audio = new Audio(originalAudio.src);
                            audio.currentTime = 0; // Reset position (optional for new instance)
                            return audio;
                        }).filter(Boolean);
            
                        // Trigger all audio playbacks together
                        audioElements.forEach(audio => {
                            audio.play().catch(error => console.error(`Error playing audio:`, error));
                        });
            
                        // Handle key highlighting for all chord keys
                        chordKeys.forEach(chordKey => {
                            const closestKey = findClosestKey(chordKey.dataset.note, rowIndex, colIndex);
                            if (closestKey) {
                                const highlightColor = modeColors[appState.currentMode] || "#d3d3d3";
                                closestKey.classList.add("active-highlight");
                                closestKey.style.backgroundColor = highlightColor;
                                setTimeout(() => {
                                    closestKey.classList.remove("active-highlight");
                                    if (!closestKey.classList.contains("hover-highlight")) {
                                        closestKey.style.backgroundColor = closestKey.classList.contains("dark") ? "#555" : "#fff";
                                    }
                                }, 300);
                            }
                        });
                    }
                }
            });
            
            key.addEventListener("mouseover", () => {
                if (appState.currentMode !== "single") {
                    clearHoverHighlights();
                    const chordKeys = getChordKeys(note, rowIndex, colIndex);
                    const highlightColor = modeColors[appState.currentMode] || "#d3d3d3";
                    chordKeys.forEach(chordKey => {
                        chordKey.classList.add("hover-highlight");
                        chordKey.style.backgroundColor = highlightColor;
                    });
                }
            });

            key.addEventListener("mouseout", () => {
                if (appState.currentMode !== "single") {
                    const chordKeys = getChordKeys(note, rowIndex, colIndex);
                    chordKeys.forEach(chordKey => {
                        if (!chordKey.classList.contains("active-highlight")) {
                            chordKey.classList.remove("hover-highlight");
                            chordKey.style.backgroundColor = chordKey.classList.contains("dark") ? "#555" : "#fff";
                        }
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
        if (!key.classList.contains("active-highlight")) {
            key.style.backgroundColor = key.classList.contains("dark") ? "#555" : "#fff";
        }
    });
}

function findClosestKey(note, referenceRow, referenceCol) {
    const matchingKeys = appState.keyElements.filter(key => key.dataset.note === note);
    if (matchingKeys.length === 0) return null;

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
    return closestKey;
}

function getChordKeys(note, row, col) {
    const intervals = chordIntervals[appState.currentMode] || appState.userChordIntervals[appState.currentMode] || [0];
    const baseIndex = noteToChromaticIndex[note];
    const chordNotes = intervals.map(interval => {
        const targetIndex = baseIndex + interval;
        return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : note;
    });

    return chordNotes
        .map(chordNote => findClosestKey(chordNote, row, col))
        .filter(key => key !== null);
}

function playNote(note, referenceRow, referenceCol) {
    const audio = appState.audioMap[note];
    if (!audio) {
        console.error(`Audio for note ${note} not found in audioMap`);
        return;
    }

    audio.currentTime = 0;
    audio.play().catch(error => console.error(`Error playing note ${note}:`, error));

    const closestKey = findClosestKey(note, referenceRow, referenceCol);
    if (closestKey) {
        const highlightColor = modeColors[appState.currentMode] || "#d3d3d3";
        closestKey.classList.add("active-highlight");
        closestKey.style.backgroundColor = highlightColor;
        setTimeout(() => {
            closestKey.classList.remove("active-highlight");
            if (!closestKey.classList.contains("hover-highlight")) {
                closestKey.style.backgroundColor = closestKey.classList.contains("dark") ? "#555" : "#fff";
            }
        }, 300);
    }
}