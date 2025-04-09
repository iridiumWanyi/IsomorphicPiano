import React, { useState } from 'react';
import Key from './Key';
import { partialKeyboardLayout, wholeKeyboardLayout, chromaticScale, modeColors } from '../constants';
import './Keyboard.css';

function Keyboard({ 
  mode, playNote, playChord, 
  arpeggiator1On, arpeggiator1Pattern, arpeggiator1Bpm, arpeggiator1Direction,
  arpeggiator2On, arpeggiator2Pattern, arpeggiator2Bpm, arpeggiator2Direction,
  customChords, keyboardMode, keyShape // Added keyShape prop
}) {
  const [activeNotes, setActiveNotes] = useState([]);
  const layout = keyboardMode === 'partial' ? partialKeyboardLayout : wholeKeyboardLayout;

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

  const playArpeggio = (baseNote, arpeggiatorOnRef, pattern, bpm, direction) => {
    const baseChordNotes = getChordNotes(baseNote);
    if (baseChordNotes.length === 0 || !arpeggiatorOnRef.current) return;

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

    const delay = 60000 / bpm;
    let step = 0;
    let timeoutId = null;

    const playNextNote = () => {
      if (!arpeggiatorOnRef.current || step >= arpeggioNotes.length) {
        setActiveNotes(prev => prev.filter(n => !arpeggioNotes.includes(n)));
        clearTimeout(timeoutId);
        return;
      }
      const note = arpeggioNotes[step];
      setActiveNotes(prev => [...prev.filter(n => !arpeggioNotes.includes(n)), note]);
      playNote(note);
      step++;
      if (step < arpeggioNotes.length) {
        timeoutId = setTimeout(playNextNote, delay);
      } else {
        setTimeout(() => setActiveNotes(prev => prev.filter(n => !arpeggioNotes.includes(n))), delay);
      }
    };

    if (arpeggioNotes.length > 0) {
      const firstNote = arpeggioNotes[0];
      setActiveNotes(prev => [...prev.filter(n => !arpeggioNotes.includes(n)), firstNote]);
      playNote(firstNote);
      step = 1;
      if (step < arpeggioNotes.length) {
        timeoutId = setTimeout(playNextNote, delay);
      } else {
        setTimeout(() => setActiveNotes(prev => prev.filter(n => !arpeggioNotes.includes(n))), delay);
      }
    }
  };

  const handleNotePress = (note) => {
    if (!activeNotes.includes(note)) {
      const chordNotes = getChordNotes(note);
      setActiveNotes(prev => [...prev, ...chordNotes.filter(n => !prev.includes(n))]);
      
      const arpeggiator1OnRef = { current: arpeggiator1On };
      const arpeggiator2OnRef = { current: arpeggiator2On };

      if (arpeggiator1On || arpeggiator2On) {
        if (arpeggiator1On) playArpeggio(note, arpeggiator1OnRef, arpeggiator1Pattern, arpeggiator1Bpm, arpeggiator1Direction);
        if (arpeggiator2On) playArpeggio(note, arpeggiator2OnRef, arpeggiator2Pattern, arpeggiator2Bpm, arpeggiator2Direction);
      } else {
        playChord(chordNotes);
      }
    }
  };

  const handleNoteRelease = (note) => {
    const chordNotes = getChordNotes(note);
    setActiveNotes(prev => prev.filter(n => !chordNotes.includes(n)));
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