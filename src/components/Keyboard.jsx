import React, { useState } from 'react';
import Key from './Key';
import { partialKeyboardLayout, wholeKeyboardLayout, chromaticScale, modeColors, chordIntervals } from '../constants';
import './Keyboard.css';

function Keyboard({ 
  mode, playNote, playChord, 
  arpeggiator1On, arpeggiator1Pattern, arpeggiator1Bpm, arpeggiator1Direction,
  arpeggiator2On, arpeggiator2Pattern, arpeggiator2Bpm, arpeggiator2Direction,
  customChords, keyboardMode, keyShape, keyColorScheme, highlightNotes,
  BlockChord1, BlockChord2,
  isRecording, setChordProgression
}) {
  const [activeNotes, setActiveNotes] = useState([]);
  const layout = keyboardMode === 'partial' ? partialKeyboardLayout : wholeKeyboardLayout;

  const getChordNotes = (baseNote) => {
    const baseIndex = chromaticScale.indexOf(baseNote);
    if (baseIndex === -1) return [baseNote];

    let intervals;
    if (mode.startsWith('custom') && customChords[mode]) {
      intervals = customChords[mode];
    } else {
      intervals = chordIntervals[mode] || [0];
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
    const maxPatternIndex = Math.max(...patternArray);
    const extendedNotes = Array(maxPatternIndex).fill(null).map((_, i) => {
      const noteIndex = i % baseChordNotes.length;
      const octaveShift = Math.floor(i / baseChordNotes.length);
      const baseNoteIndex = chromaticScale.indexOf(baseChordNotes[noteIndex]);
      const targetIndex = baseNoteIndex + (octaveShift * 12);
      return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
    });

    let arpeggioNotes = patternArray.map(p => extendedNotes[p - 1]).filter(n => n);
    if (direction === 'down') arpeggioNotes.reverse();
    return arpeggioNotes;
  };

  const playArpeggio = (baseNote, arpeggiatorOnRef, pattern, bpm, direction) => {
    const arpeggioNotes = getArpeggioNotes(baseNote, pattern, direction);
    if (arpeggioNotes.length === 0 || !arpeggiatorOnRef.current) return;
    
    const delay = 60000 / bpm;
    
    arpeggioNotes.forEach((note, index) => {
    // Schedule note playback and highlight
    setTimeout(() => {
    if (arpeggiatorOnRef.current) {
    playNote(note);
    setActiveNotes(prev => [...prev, note]); // Highlight note
    }
    }, index * delay);
    
    // Clear highlight after note duration
    setTimeout(() => {
    setActiveNotes(prev => prev.filter(n => n !== note));
    }, (index + 1) * delay);
    });
    
    // Clear all highlights after pattern completes
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

      // Record the chord if recording is active and progression < 8
      if (isRecording) {
        setChordProgression(prev => {
          if (prev.length >= 8) return prev;
          const newChord = {
            rootNote: note,
            chordType: mode,
            arpeggioPattern: arpeggiator1On ? arpeggiator1Pattern : arpeggiator2On ? arpeggiator2Pattern : null,
            arpeggioDirection: arpeggiator1On ? arpeggiator1Direction : arpeggiator2On ? arpeggiator2Direction : null,
            arpeggioAsChord: arpeggiator1On ? BlockChord1 : arpeggiator2On ? BlockChord2 : false,
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