import React, { useState } from 'react';
import Key from './Key';
import { wholeKeyboardLayout, chromaticScale, modeColors, chordIntervals } from '../constants';
import './Keyboard.css';

function Keyboard({ 
  mode, playNote, playChord, 
  arpeggiator1On, arpeggiator1Pattern, arpeggiator1Bpm, arpeggiator1Direction,
  arpeggiator2On, arpeggiator2Pattern, arpeggiator2Bpm, arpeggiator2Direction,
  customChords, keyboardMode, keyShape, keyColorScheme, highlightNotes,
  BlockChord1, BlockChord2,
  isRecording, setChordProgression,
  lowestKey, highestKey,
  setRangeError,
  inversionState
}) {
  const [activeNotes, setActiveNotes] = useState([]);

  const generatePartialLayout = (lowestKey, highestKey) => {
    let lowIndex = chromaticScale.indexOf(lowestKey);
    let highIndex = chromaticScale.indexOf(highestKey);

    // Validation: Handle invalid inputs or low > high
    if (lowIndex === -1 || highIndex === -1 || lowIndex > highIndex) {
      setRangeError('');
      return [
        ["C#3", "E3", "G3", "A3", "C#4", "F4", "A4"],
        ["C3", "D3", "F#3", "G#3", "C4", "E4", "G4", "C5"],
        ["C#3", "E3", "G3", "A3", "C#4", "F4", "A4"],
        ["C3", "D3", "F#3", "G#3", "C4", "E4", "G4", "C5"]
      ];
    }

    // Swap if lowIndex > highIndex
    if (lowIndex > highIndex) {
      [lowIndex, highIndex] = [highIndex, lowIndex];
      [lowestKey, highestKey] = [highestKey, lowestKey];
    }

    const distance = highIndex - lowIndex;
    const isEven = distance % 2 === 0;
    let row1and3 = [];
    let row2and4 = [];

    // Helper to generate row with two-step spacing
    const generateRow = (startIndex, endIndex) => {
      const row = [];
      for (let i = startIndex; i <= endIndex; i += 2) {
        if (i < chromaticScale.length) {
          row.push(chromaticScale[i]);
        }
      }
      return row;
    };

    if (isEven) {
      row2and4 = generateRow(lowIndex, highIndex);
      row1and3 = generateRow(lowIndex + 1, highIndex + 1);
    } else {
      row1and3 = generateRow(lowIndex + 1, highIndex);
      row2and4 = generateRow(lowIndex, highIndex - 1);
    }

    // Handle small ranges
    if (row2and4.length === 0) {
      row2and4 = [lowestKey];
    }
    if (row1and3.length === 0) {
      row1and3 = highIndex + 1 < chromaticScale.length ? [chromaticScale[lowIndex + 1]] : [lowestKey];
    }

    const maxKeysPerRow = 20;
    const row2and4FullLength = Math.ceil((highIndex - lowIndex + (isEven ? 1 : 0)) / 2);
    const row1and3FullLength = Math.ceil((highIndex - (lowIndex + 1) + (isEven ? 1 : 0)) / 2);
    if (row2and4FullLength > maxKeysPerRow || row1and3FullLength > maxKeysPerRow) {
      setRangeError(`Range from ${lowestKey} to ${highestKey} is too large (exceeds ${maxKeysPerRow} keys per row). Please select a smaller range.`);
    } else {
      setRangeError('');
    }
    row1and3 = row1and3.slice(0, maxKeysPerRow);
    row2and4 = row2and4.slice(0, maxKeysPerRow);

    return [row1and3, row2and4, row1and3, row2and4];
  };

  const layout = keyboardMode === 'partial' ? generatePartialLayout(lowestKey, highestKey) : wholeKeyboardLayout;

  const getChordNotes = (baseNote) => {
    const baseIndex = chromaticScale.indexOf(baseNote);
    if (baseIndex === -1) return [baseNote];

    let intervals;
    if (mode.startsWith('custom') && customChords[mode]) {
      intervals = customChords[mode];
    } else {
      intervals = chordIntervals[mode] || [0];
    }

    // Apply inversion if inversionState > 1
    if (inversionState > 1 && intervals.length > 1) {
      const chordLength = intervals.length;
      const inversionIndex = (inversionState - 1) % chordLength; // 0-based index of new root
      const rootInterval = intervals[inversionIndex];
      intervals = intervals.map(interval => {
        let newInterval = interval - rootInterval;
        if (newInterval < 0) newInterval += 12;
        return newInterval;
      }).sort((a, b) => a - b); // Sort for consistency
    }

    return intervals.map(interval => {
      const targetIndex = baseIndex + interval;
      return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
    }).filter(n => n);
  };

  const getArpeggioNotes = (baseNote, pattern, direction) => {
    const baseChordNotes = getChordNotes(baseNote);
    if (baseChordNotes.length === 0) return [];

    const patternArray = pattern.split(',').filter(x => x !== '').map(Number);
    const chordLength = baseChordNotes.length;

    const arpeggioNotes = patternArray.map(index => {
      if (index === 0) return null;

      const isNegative = index < 0;
      const absIndex = Math.abs(index);
      const notePosition = (absIndex - 1) % chordLength;
      const octaveShift = Math.floor((absIndex - 1) / chordLength);
      
      const chordNoteIndex = isNegative ? (chordLength - 1 - notePosition) : notePosition;
      const baseNoteIndex = chromaticScale.indexOf(baseChordNotes[chordNoteIndex]);
      
      const targetIndex = baseNoteIndex + (isNegative ? -(octaveShift + 1) * 12 : octaveShift * 12);
      
      return targetIndex >= 0 && targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
    }).filter(n => n);

    return direction === 'down' ? arpeggioNotes.reverse() : arpeggioNotes;
  };

  const playArpeggio = (baseNote, arpeggiatorOnRef, pattern, bpm, direction) => {
    const arpeggioNotes = getArpeggioNotes(baseNote, pattern, direction);
    if (arpeggioNotes.length === 0 || !arpeggiatorOnRef.current) return;
    
    const delay = 60000 / bpm;
    
    arpeggioNotes.forEach((note, index) => {
      setTimeout(() => {
        if (arpeggiatorOnRef.current) {
          playNote(note);
          setActiveNotes(prev => [...prev, note]);
        }
      }, index * delay);
      
      setTimeout(() => {
        setActiveNotes(prev => prev.filter(n => n !== note));
      }, (index + 1) * delay);
    });
    
    setTimeout(() => {
      if (arpeggiatorOnRef.current) {
        setActiveNotes([]);
      }
    }, arpeggioNotes.length * delay);
  };

  const handleNotePress = (note) => {
    if (!activeNotes.includes(note)) {
      console.log(`handleNotePress called for ${note} at ${Date.now()}`);
      const chordNotes = getChordNotes(note);
      const arpeggiator1OnRef = { current: arpeggiator1On && !BlockChord1 };
      const arpeggiator2OnRef = { current: arpeggiator2On && !BlockChord2 };

      if (isRecording) {
        setChordProgression(prev => {
          if (prev.length >= 8) return prev;
          const newChord = {
            rootNote: note,
            chordType: mode,
            arpeggioPattern: arpeggiator1On ? arpeggiator1Pattern : arpeggiator2On ? arpeggiator2Pattern : null,
            arpeggioDirection: arpeggiator1On ? arpeggiator1Direction : arpeggiator2On ? arpeggiator2Direction : null,
            BlockChord: arpeggiator1On ? BlockChord1 : arpeggiator2On ? BlockChord2 : false,
            inversionState: inversionState, // Record the current inversion state
          };
          return [...prev, newChord];
        });
      }

      if (arpeggiator1On || arpeggiator2On) {
        if (BlockChord1 && arpeggiator1On) {
          const arpeggioNotes = getArpeggioNotes(note, arpeggiator1Pattern, arpeggiator1Direction);
          setActiveNotes(arpeggioNotes);
          playChord(arpeggioNotes);
        } else if (arpeggiator1On) {
          playArpeggio(note, arpeggiator1OnRef, arpeggiator1Pattern, arpeggiator1Bpm, arpeggiator1Direction);
        }

        if (BlockChord2 && arpeggiator2On) {
          const arpeggioNotes = getArpeggioNotes(note, arpeggiator2Pattern, arpeggiator2Direction);
          setActiveNotes(arpeggioNotes);
          playChord(arpeggioNotes);
        } else if (arpeggiator2On) {
          playArpeggio(note, arpeggiator2OnRef, arpeggiator2Pattern, arpeggiator2Bpm, arpeggiator2Direction);
        }
      } else {
        setActiveNotes(chordNotes);
        playChord(chordNotes);
      }
    }
  };

  const handleNoteRelease = (note) => {
    console.log(`handleNoteRelease called for ${note} at ${Date.now()}`);
    setActiveNotes([]);
  };

  return (
    <div className={`keyboard ${keyboardMode}`}>
      {layout.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`row ${keyShape === 'hexagon' ? 'hexagon-row' : keyShape === 'circle' ? 'circle-row' : ''} ${keyboardMode === 'whole' && rowIndex === 1 ? 'extra-space-below' : ''}`}
        >
          {row.map((note, colIndex) => (
            note ? (
              <Key
                key={`${rowIndex}-${colIndex}`}
                note={note}
                onNotePress={handleNotePress}
                onNoteRelease={handleNoteRelease}
                isActive={activeNotes.includes(note)}
                highlightColor={modeColors[mode] || '#d3d3d3'}
                keyShape={keyShape}
                keyColorScheme={keyColorScheme}
                highlightNotes={highlightNotes}
              />
            ) : (
              <div key={`${rowIndex}-${colIndex}`} className="key-placeholder" />
            )
          ))}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;