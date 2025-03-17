function getChordKeys(rootKey, currentMode, jankoLayout, keyElements) {
    const row = parseInt(rootKey.dataset.row);
    const col = parseInt(rootKey.dataset.col);
    const isEvenRow = row % 2 === 0;
    const chordKeys = [rootKey];

    if (currentMode === "octave") {
        const octave1Col = col + 6; // 6 semitones
        if (octave1Col < jankoLayout[row].length) {
            const octave1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === octave1Col
            );
            if (octave1Key) chordKeys.push(octave1Key);
        }
        const octave2Col = col + 12; // 12 semitones
        if (octave2Col < jankoLayout[row].length) {
            const octave2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === octave2Col
            );
            if (octave2Key) chordKeys.push(octave2Key);
        }
    } else if (currentMode === "major") {
        const maj1Col = col + 2; // Major third: 4 semitones
        if (maj1Col < jankoLayout[row].length) {
            const maj1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === maj1Col
            );
            if (maj1Key) chordKeys.push(maj1Key);
        }
        const maj2Row = row==0 ? row + 1 : row -1; // Perfect fifth: 7 semitones
        const maj2Col = isEvenRow ? col + 3 : col + 4;
        if (maj2Row >= 0 && maj2Col < jankoLayout[maj2Row].length) {
            const maj2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === maj2Row && parseInt(k.dataset.col) === maj2Col
            );
            if (maj2Key) chordKeys.push(maj2Key);
        }
    } else if (currentMode === "minor") {
        const min1Row = row==0 ? row + 1 : row -1; // Minor third: 3 semitones
        const min1Col = isEvenRow ? col + 1 : col + 2;
        if (min1Row >= 0 && min1Col < jankoLayout[min1Row].length) {
            const min1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === min1Row && parseInt(k.dataset.col) === min1Col
            );
            if (min1Key) chordKeys.push(min1Key);
        }
        const min2Row = row==0 ? row + 1 : row -1; // Perfect fifth: 7 semitones
        const min2Col = isEvenRow ? col + 3 : col + 4;
        if (min2Row >= 0 && min2Col < jankoLayout[min2Row].length) {
            const min2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === min2Row && parseInt(k.dataset.col) === min2Col
            );
            if (min2Key) chordKeys.push(min2Key);
        }
    } else if (currentMode === "diminished") {
        const dim1Row = row==0 ? row + 1 : row -1; // Minor third: 3 semitones
        const dim1Col = isEvenRow ? col + 1 : col + 2;
        if (dim1Row >= 0 && dim1Col < jankoLayout[dim1Row].length) {
            const dim1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === dim1Row && parseInt(k.dataset.col) === dim1Col
            );
            if (dim1Key) chordKeys.push(dim1Key);
        }
        const dim2Col = col + 3 
        if (row >= 0 && dim2Col < jankoLayout[row].length) {
            const dim2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === dim2Col
            );
            if (dim2Key) chordKeys.push(dim2Key);
        }
    } else if (currentMode === "augmented") {
        const aug1Col = col + 2;
        if (row >= 0 && aug1Col < jankoLayout[row].length) {
            const aug1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === aug1Col
            );
            if (aug1Key) chordKeys.push(aug1Key);
        }
        const aug2Col = col + 4;
        if (row >= 0 && aug2Col < jankoLayout[row].length) {
            const aug2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === aug2Col
            );
            if (aug2Key) chordKeys.push(aug2Key);
        }
    } else if (currentMode === "domSeven") {
        const domSeven1Col = col + 2; // Major third: 4 semitones
        if (domSeven1Col < jankoLayout[row].length) {
            const domSeven1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === domSeven1Col
            );
            if (domSeven1Key) chordKeys.push(domSeven1Key);
        }
        const domSeven2Row = row==0 ? row + 1 : row -1; // Perfect fifth: 7 semitones
        const domSeven2Col = isEvenRow ? col + 3 : col + 4;
        if (domSeven2Row >= 0 && domSeven2Col < jankoLayout[domSeven2Row].length) {
            const domSeven2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === domSeven2Row && parseInt(k.dataset.col) === domSeven2Col
            );
            if (domSeven2Key) chordKeys.push(domSeven2Key);
        }
        const domSeven3Col = col + 5; // Major third: 4 semitones
        if (domSeven3Col < jankoLayout[row].length) {
            const domSeven3Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === domSeven3Col
            );
            if (domSeven3Key) chordKeys.push(domSeven3Key);
        }
    } else if (currentMode === "majSeven") {
        const majSeven1Col = col + 2; // Major third: 4 semitones
        if (majSeven1Col < jankoLayout[row].length) {
            const majSeven1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === majSeven1Col
            );
            if (majSeven1Key) chordKeys.push(majSeven1Key);
        }
        const majSeven2Row = row==0 ? row + 1 : row -1; // Perfect fifth: 7 semitones
        const majSeven2Col = isEvenRow ? col + 3 : col + 4;
        if (majSeven2Row >= 0 && majSeven2Col < jankoLayout[majSeven2Row].length) {
            const majSeven2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === majSeven2Row && parseInt(k.dataset.col) === majSeven2Col
            );
            if (majSeven2Key) chordKeys.push(majSeven2Key);
        }
        const majSeven3Row = row==0 ? row + 1 : row -1; // Perfect fifth: 7 semitones
        const majSeven3Col = isEvenRow ? col + 5 : col + 6;
        if (majSeven3Row >= 0 && majSeven3Col < jankoLayout[majSeven3Row].length) {
            const majSeven3Key = keyElements.find(k => 
                parseInt(k.dataset.row) === majSeven3Row && parseInt(k.dataset.col) === majSeven3Col
            );
            if (majSeven3Key) chordKeys.push(majSeven3Key);
        }
    } else if (currentMode === "minSeven") {
        const minSeven1Row = row==0 ? row + 1 : row -1; // minor third: 3 semitones
        const minSeven1Col = isEvenRow ? col + 1 : col + 2;
        if (minSeven1Row >= 0 && minSeven1Col < jankoLayout[minSeven1Row].length) {
            const minSeven1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === minSeven1Row && parseInt(k.dataset.col) === minSeven1Col
            );
            if (minSeven1Key) chordKeys.push(minSeven1Key);
        }
        const majSeven2Row = row==0 ? row + 1 : row -1; // Perfect fifth: 7 semitones
        const majSeven2Col = isEvenRow ? col + 3 : col + 4;
        if (majSeven2Row >= 0 && majSeven2Col < jankoLayout[majSeven2Row].length) {
            const majSeven2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === majSeven2Row && parseInt(k.dataset.col) === majSeven2Col
            );
            if (majSeven2Key) chordKeys.push(majSeven2Key);
        }
        const majSeven3Row = row==0 ? row + 1 : row -1; // Perfect fifth: 7 semitones
        const majSeven3Col = isEvenRow ? col + 5 : col + 6;
        if (majSeven3Row >= 0 && majSeven3Col < jankoLayout[majSeven3Row].length) {
            const majSeven3Key = keyElements.find(k => 
                parseInt(k.dataset.row) === majSeven3Row && parseInt(k.dataset.col) === majSeven3Col
            );
            if (majSeven3Key) chordKeys.push(majSeven3Key);
        }
    } else if (currentMode === "susSeven") {
        const susSeven1Row = row==0 ? row + 1 : row -1; // susor third: 3 semitones
        const susSeven1Col = isEvenRow ? col + 2 : col + 3;
        if (susSeven1Row >= 0 && susSeven1Col < jankoLayout[susSeven1Row].length) {
            const susSeven1Key = keyElements.find(k => 
                parseInt(k.dataset.row) === susSeven1Row && parseInt(k.dataset.col) === susSeven1Col
            );
            if (susSeven1Key) chordKeys.push(susSeven1Key);
        }
        const susSeven2Row = row==0 ? row + 1 : row -1; // Perfect fifth: 7 semitones
        const susSeven2Col = isEvenRow ? col + 3 : col + 4;
        if (susSeven2Row >= 0 && susSeven2Col < jankoLayout[susSeven2Row].length) {
            const susSeven2Key = keyElements.find(k => 
                parseInt(k.dataset.row) === susSeven2Row && parseInt(k.dataset.col) === susSeven2Col
            );
            if (susSeven2Key) chordKeys.push(susSeven2Key);
        }
        const susSeven3Col = col + 5; // Major third: 4 semitones
        if (susSeven3Col < jankoLayout[row].length) {
            const susSeven3Key = keyElements.find(k => 
                parseInt(k.dataset.row) === row && parseInt(k.dataset.col) === susSeven3Col
            );
            if (susSeven3Key) chordKeys.push(susSeven3Key);
        }
    }
    return chordKeys;
}

// some testing workß
// Expose the function globally
window.getChordKeys = getChordKeys;