// Load audio files
const noteSounds = {};
[...new Set([...partialKeyboardLayout.flat(), ...wholeKeyboardLayout.flat()])].forEach(note => {
    const fileNumber = noteToFileNumber[note];
    console.log(`Loading sound for note ${note}: fileNumber = ${fileNumber}`); // Debug log
    if (typeof fileNumber === "undefined") {
        console.error(`No file number found for note ${note}`);
        return;
    }
    noteSounds[note] = new Audio(`audio/${fileNumber}.mp3`);
});

// Function to find the closest key element to a given position
function findClosestKey(note, referenceRow, referenceCol) {
    const matchingKeys = appState.keyElements.filter(k => k.dataset.note === note);
    if (matchingKeys.length === 0) return null;

    let closestKey = matchingKeys[0];
    let minDistance = Infinity;

    matchingKeys.forEach(key => {
        const row = parseInt(key.dataset.row);
        const col = parseInt(key.dataset.col);
        const distance = Math.abs(row - referenceRow) + Math.abs(col - referenceCol);
        if (distance < minDistance) {
            minDistance = distance;
            closestKey = key;
        }
    });

    return closestKey;
}

// Build keyboard
function buildKeyboard(layout) {
    appState.keyElements = [];
    const keyboard = document.getElementById("keyboard");
    if (!keyboard) {
        console.error("Keyboard element not found!");
        return;
    }
    keyboard.innerHTML = ""; // Clear existing keyboard

    try {
        layout.forEach((row, rowIndex) => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "row";
            if (layout === wholeKeyboardLayout) {
                if (rowIndex <= 1) rowDiv.classList.add("lower-section");
                else rowDiv.classList.add("upper-section");
            }
            row.forEach((note, colIndex) => {
                const key = document.createElement("div");
                key.className = "key";
                key.textContent = note;
                key.dataset.note = note;
                key.dataset.row = rowIndex;
                key.dataset.col = colIndex;
                key.classList.add(note.includes("#") ? "dark" : "white");
                rowDiv.appendChild(key);
                appState.keyElements.push(key);
            });
            keyboard.appendChild(rowDiv);
        });
    } catch (error) {
        console.error("Error building keyboard:", error);
    }

    // Add key event listeners
    appState.keyElements.forEach(key => {
        key.addEventListener("mouseover", () => {
            if (appState.currentMode !== "single") {
                clearHoverHighlights();
                const referenceRow = parseInt(key.dataset.row);
                const referenceCol = parseInt(key.dataset.col);
                const chordKeys = getChordKeys(key, appState.currentMode, layout, appState.keyElements);
                const uniqueNotes = [...new Set(chordKeys.map(k => k.dataset.note))];
                uniqueNotes.forEach(note => {
                    const closestKey = findClosestKey(note, referenceRow, referenceCol);
                    if (closestKey) closestKey.classList.add("hover-highlight");
                });
            }
        });

        key.addEventListener("mouseout", () => {
            if (appState.currentMode !== "single") {
                clearHoverHighlights();
            }
        });

        key.addEventListener("click", () => {
            const note = key.dataset.note;
            const referenceRow = parseInt(key.dataset.row);
            const referenceCol = parseInt(key.dataset.col);
            appState.lastClickedPosition = { row: referenceRow, col: referenceCol };
            if (appState.currentMode === "single") {
                if (appState.arpeggiatorOn && appState.arpeggiatorTimeoutId) {
                    clearTimeout(appState.arpeggiatorTimeoutId);
                    appState.arpeggiatorTimeoutId = null;
                    appState.currentArpeggioNotes = [];
                }
                playNote(note, referenceRow, referenceCol);
            } else {
                const chordKeys = getChordKeys(key, appState.currentMode, layout, appState.keyElements);
                if (appState.arpeggiatorOn) {
                    if (appState.arpeggiatorTimeoutId) {
                        clearTimeout(appState.arpeggiatorTimeoutId);
                        appState.arpeggiatorTimeoutId = null;
                    }
                    playArpeggio(chordKeys, referenceRow, referenceCol);
                } else {
                    if (appState.arpeggiatorTimeoutId) {
                        clearTimeout(appState.arpeggiatorTimeoutId);
                        appState.arpeggiatorTimeoutId = null;
                        appState.currentArpeggioNotes = [];
                    }
                    chordKeys.forEach(k => {
                        playNote(k.dataset.note, referenceRow, referenceCol);
                    });
                }
            }
        });
    });
}

// Audio playback
function playNote(note, referenceRow, referenceCol) {
    const sound = noteSounds[note];
    const fileNumber = noteToFileNumber[note];
    console.log(`Playing note ${note}: fileNumber = ${fileNumber}`); // Debug log
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.error(`Audio play failed for ${note}:`, error));
        const keyElement = findClosestKey(note, referenceRow, referenceCol);
        if (keyElement) {
            keyElement.classList.add("active");
            keyElement.style.backgroundColor = modeColors[appState.currentMode];
            setTimeout(() => {
                keyElement.classList.remove("active");
                keyElement.style.backgroundColor = "";
            }, 200);
        }
    } else {
        console.error(`No sound file loaded for ${note}`);
    }
}

function clearHoverHighlights() {
    document.querySelectorAll(".key.hover-highlight").forEach(key => {
        key.classList.remove("hover-highlight");
    });
}