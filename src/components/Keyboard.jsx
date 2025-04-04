import React, { useState } from 'react';
import Key from './Key';
import { partialKeyboardLayout, chromaticScale, modeColors } from '../constants';
import './Keyboard.css';

function Keyboard({ mode, playNote, arpeggiatorOn, arpeggiatorPattern, customChords }) {
  const [activeNotes, setActiveNotes] = useState([]);

  const getChordNotes = (baseNote) => {
    const baseIndex = chromaticScale.indexOf(baseNote);
    if (baseIndex === -1) return [baseNote];

    switch (mode) {
      case 'octave':
        return [baseNote, chromaticScale[baseIndex + 12]].filter(n => n);
      case 'major':
        return [baseNote, chromaticScale[baseIndex + 4], chromaticScale[baseIndex + 7]].filter(n => n);
      case 'minor':
        return [baseNote, chromaticScale[baseIndex + 3], chromaticScale[baseIndex + 7]].filter(n => n);
      case 'diminished':
        return [baseNote, chromaticScale[baseIndex + 3], chromaticScale[baseIndex + 6]].filter(n => n);
      case 'augmented':
        return [baseNote, chromaticScale[baseIndex + 4], chromaticScale[baseIndex + 8]].filter(n => n);
      case 'domSeven':
        return [baseNote, chromaticScale[baseIndex + 4], chromaticScale[baseIndex + 7], chromaticScale[baseIndex + 10]].filter(n => n);
      case 'majSeven':
        return [baseNote, chromaticScale[baseIndex + 4], chromaticScale[baseIndex + 7], chromaticScale[baseIndex + 11]].filter(n => n);
      case 'minSeven':
        return [baseNote, chromaticScale[baseIndex + 3], chromaticScale[baseIndex + 7], chromaticScale[baseIndex + 10]].filter(n => n);
      case 'susFour':
        return [baseNote, chromaticScale[baseIndex + 5], chromaticScale[baseIndex + 7]].filter(n => n);
      case 'domNine':
        return [baseNote, chromaticScale[baseIndex + 4], chromaticScale[baseIndex + 7], chromaticScale[baseIndex + 10], chromaticScale[baseIndex + 14]].filter(n => n);
      case 'majNine':
        return [baseNote, chromaticScale[baseIndex + 4], chromaticScale[baseIndex + 7], chromaticScale[baseIndex + 11], chromaticScale[baseIndex + 14]].filter(n => n);
      case 'minNine':
        return [baseNote, chromaticScale[baseIndex + 3], chromaticScale[baseIndex + 7], chromaticScale[baseIndex + 10], chromaticScale[baseIndex + 14]].filter(n => n);
      case 'susNine':
        return [baseNote, chromaticScale[baseIndex + 5], chromaticScale[baseIndex + 7], chromaticScale[baseIndex + 14]].filter(n => n);
      case 'single':
        return [baseNote];
      case 'custom1':
      case 'custom2':
      case 'custom3':
      case 'custom4':
        const intervals = customChords[mode] || [];
        return intervals.map(interval => {
          const targetIndex = baseIndex + interval;
          return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
        }).filter(n => n);
      default:
        return [baseNote];
    }
  };

  const playArpeggio = (baseNote) => {
    const baseChordNotes = getChordNotes(baseNote);
    if (baseChordNotes.length === 0) return;

    const pattern = arpeggiatorPattern.split(',').filter(x => x !== '').map(Number);
    const maxPatternIndex = Math.max(...pattern);
    const extendedNotes = [];

    for (let i = 0; i < maxPatternIndex; i++) {
      const noteIndex = i % baseChordNotes.length;
      const octaveShift = Math.floor(i / baseChordNotes.length);
      const baseNoteIndex = chromaticScale.indexOf(baseChordNotes[noteIndex]);
      const targetIndex = baseNoteIndex + (octaveShift * 12);
      extendedNotes[i] = targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
    }

    const arpeggioNotes = pattern.map(p => extendedNotes[p - 1]).filter(n => n);
    let step = 0;

    const playNextNote = () => {
      if (step >= arpeggioNotes.length || !arpeggiatorOn) {
        setActiveNotes([]);
        return;
      }
      const note = arpeggioNotes[step];
      setActiveNotes([note]);
      playNote(note);
      step++;
      setTimeout(playNextNote, 250);
    };

    playNextNote();
  };

  const handlePlayNotes = (baseNote) => {
    const chordNotes = getChordNotes(baseNote);
    if (chordNotes.length === 0) return;

    if (arpeggiatorOn) {
      playArpeggio(baseNote);
    } else {
      setActiveNotes(chordNotes);
      chordNotes.forEach(playNote);
      setTimeout(() => setActiveNotes([]), 300);
    }
  };

  return (
    <div className="keyboard">
      {partialKeyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((note, colIndex) => (
            <Key
              key={`${rowIndex}-${colIndex}`}
              note={note}
              playNotes={() => handlePlayNotes(note)}
              isActive={activeNotes.includes(note)}
              highlightColor={modeColors[mode] || '#d3d3d3'} // Pass highlight color
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;