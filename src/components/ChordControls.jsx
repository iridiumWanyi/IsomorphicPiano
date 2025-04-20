import React from 'react';
import { modeColors } from '../constants';
import { chordNotes } from '../constants';
import './Controls.css';

const row0Modes = [
  { id: 'single', label: '♪ Single' },
  { id: 'octave', label: 'Octave' },
];

const row1Modes = [
  { id: 'major', label: 'Δ Major' },
  { id: 'minor', label: '- Minor' },
  { id: 'diminished', label: 'o Dim' },
  { id: 'augmented', label: '+ Aug' },
];

const row2Modes = [
  { id: 'majSeven', label: 'Maj7' },
  { id: 'minSeven', label: 'Min7' },
  { id: 'domSeven', label: 'Dom7' },
  { id: 'susFour', label: 'Sus4' },
  { id: 'majNine', label: 'Maj9' },
  { id: 'minNine', label: 'Min9' },
  { id: 'domNine', label: 'Dom9' },
  { id: 'susNine', label: 'Sus9' },
];

const customChordIds = ['custom1', 'custom2', 'custom3'];

const MiniKeyboard = ({ chord, onNoteToggle, id, setMode, highlightColor, miniExtend }) => {
  const row1 = miniExtend ? [1, 3, 5, 7, 9, 11, 13, 15] : [1, 3, 5, 7, 9, 11];
  const row2 = miniExtend ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 2, 4, 6, 8, 10];

  const handleKeyClick = (index) => {
    if (id && setMode) {
      onNoteToggle(index);
      setMode(id);
    }
  };

  const adjustedChord = chord && chord.length > 0 
    ? chord.map(index => index) 
    : id ? [0] : [];

  return (
    <div className={`mini-keyboard ${id ? '' : 'static'} ${miniExtend ? 'extended' : ''}`}>
      <div className="mini-row bottom-row">
        {row2.map((index) => (
          <div
            key={index}
            className={`mini-key ${adjustedChord.includes(index) ? 'active' : ''}`}
            onClick={() => handleKeyClick(index)}
            style={adjustedChord.includes(index) && highlightColor ? { backgroundColor: highlightColor } : {}}
          />
        ))}
      </div>
      <div className="mini-row top-row">
        {row1.map((index) => (
          <div
            key={index}
            className={`mini-key ${adjustedChord.includes(index) ? 'active' : ''}`}
            onClick={() => handleKeyClick(index)}
            style={adjustedChord.includes(index) && highlightColor ? { backgroundColor: highlightColor } : {}}
          />
        ))}
      </div>
    </div>
  );
};

export const ChordControls = ({ 
  mode, 
  setMode, 
  customChords, 
  setCustomChords, 
  inversionState, 
  setInversionState 
}) => {
  const handleNoteToggle = (id, note) => {
    setCustomChords(prev => {
      const currentChord = prev[id] && prev[id].length > 0 ? prev[id] : [0];
      if (note === 0) return { ...prev, [id]: currentChord };
      if (currentChord.includes(note)) {
        return { ...prev, [id]: currentChord.filter(n => n !== note) };
      }
      return { ...prev, [id]: [...currentChord, note].sort((a, b) => a - b) };
    });
  };

  const handleInversionToggle = () => {
    setInversionState(prev => (prev % 4) + 1); // Cycle 1 -> 2 -> 3 -> 4 -> 1
  };

  return (
    <div className="chord-controls">
      <div className="control-row basic">
        <span className="row-label">Basic Modes:</span>
        {row0Modes.map(m => (
          <div key={m.id} className="chord-button-container">
            <button
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
              onTouchStart={() => setMode(m.id)}
              style={{ backgroundColor: modeColors[m.id] }}
            >
              {m.label}
            </button>
          </div>
        ))}
        {row1Modes.map(m => (
          <div key={m.id} className="chord-button-container">
            <button
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
              onTouchStart={() => setMode(m.id)}
              style={{ backgroundColor: modeColors[m.id] }}
            >
              {m.label}
            </button>
            <div className="floating-keyboard">
              <MiniKeyboard
                chord={chordNotes[m.id] || []}
                onNoteToggle={() => {}}
                highlightColor={modeColors[m.id]}
                miniExtend={m.id.includes('Nine')}
              />
            </div>
          </div>
        ))}
        <div className="chord-button-container">
        <span className="row-label">Inversion: </span>
          <button
            className="inversion-button"
            onClick={handleInversionToggle}
          >
            {inversionState}
          </button>
        </div>
      </div>
      <div className="control-row-extended">
        <span className="row-label">Extended Chords:</span>
        {row2Modes.map(m => (
          <div key={m.id} className="chord-button-container">
            <button
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
              onTouchStart={() => setMode(m.id)}
              style={{ backgroundColor: modeColors[m.id] }}
            >
              {m.label}
            </button>
            <div className="floating-keyboard">
              <MiniKeyboard
                chord={chordNotes[m.id] || []}
                onNoteToggle={() => {}}
                highlightColor={modeColors[m.id]}
                miniExtend={m.id.includes('Nine')}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="control-row-custom">
        <span className="row-label">Custom Chords:</span>
        {customChordIds.map(id => (
          <div key={id} className="custom-chord-container">
            <button
              className={mode === id ? 'active' : ''}
              onClick={() => setMode(id)}
              onTouchStart={() => setMode(id)}
              style={{ backgroundColor: modeColors[id] }}
            >
              {id.replace('custom', 'Chord')}
            </button>
            <MiniKeyboard
              chord={customChords[id] || []}
              onNoteToggle={(note) => handleNoteToggle(id, note)}
              id={id}
              setMode={setMode}
              miniExtend={false}
            />
          </div>
        ))}
        <span className="help-customChords">?</span>
      </div>
    </div>
  );
};