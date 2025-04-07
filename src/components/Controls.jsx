import React from 'react';
import { modeColors } from '../constants';
import './Controls.css';

const row0Modes = [
  { id: 'single', label: 'Single' },
  { id: 'octave', label: 'Octave' },
];

const row1Modes = [
  { id: 'major', label: 'Δ Major' },
  { id: 'minor', label: '- Minor' },
  { id: 'diminished', label: 'o Diminished' },
  { id: 'augmented', label: '+ Augmented' },
];

const row2Modes = [
  { id: 'domSeven', label: 'Dom7' },
  { id: 'majSeven', label: 'Maj7' },
  { id: 'minSeven', label: 'Min7' },
  { id: 'susFour', label: 'Sus4' },
  { id: 'domNine', label: 'Dom9' },
  { id: 'majNine', label: 'Maj9' },
  { id: 'minNine', label: 'Min9' },
  { id: 'susNine', label: 'Sus9' },
];

const customChordIds = ['custom1', 'custom2', 'custom3'];

const chordNotes = {
  'single': [0],
  'octave': [0, 12],
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
  'domSeven': [0, 4, 7, 10],
  'majSeven': [0, 4, 7, 11],
  'minSeven': [0, 3, 7, 10],
  'susFour': [0, 5, 7],
  'domNine': [0, 4, 7, 10, 14],
  'majNine': [0, 4, 7, 11, 14],
  'minNine': [0, 3, 7, 10, 14],
  'susNine': [0, 5, 7, 14]
};

function Controls({ 
  mode, setMode, 
  arpeggiatorOn, setArpeggiatorOn, 
  arpeggiatorPattern, setArpeggiatorPattern, 
  arpeggiatorBpm, setArpeggiatorBpm,
  arpeggiatorDirection, setArpeggiatorDirection,
  customChords, setCustomChords,
  keyboardMode, setKeyboardMode
}) {
  const handlePatternChange = (e) => {
    const value = e.target.value;
    if (/^(\d+,)*\d*$/.test(value) || value === '') {
      setArpeggiatorPattern(value);
    }
  };

  const handleNoteToggle = (id, note) => {
    setCustomChords(prev => {
      const currentChord = prev[id] && prev[id].length > 0 ? prev[id] : [0];
      if (note === 0) {
        return { ...prev, [id]: currentChord };
      }
      if (currentChord.includes(note)) {
        return {
          ...prev,
          [id]: currentChord.filter(n => n !== note)
        };
      } else {
        return {
          ...prev,
          [id]: [...currentChord, note].sort((a, b) => a - b)
        };
      }
    });
  };

  const MiniKeyboard = ({ chord, onNoteToggle, id, setMode, highlightColor }) => {
    const row1 = [1, 3, 5, 7, 9, 11]; // C#, D#, F, G, A, B
    const row2 = [0, 2, 4, 6, 8, 10]; // C, D, E, F#, G#, A#

    const handleKeyClick = (index) => {
      if (id && setMode) { // Only for custom chords
        onNoteToggle(index);
        setMode(id);
      }
    };

    const adjustedChord = chord && chord.length > 0 ? chord : id ? [0] : [];

    return (
      <div className={`mini-keyboard janko ${id ? '' : 'static'}`}>
        <div className="janko-row top-row">
          {row1.map((index) => (
            <div
              key={index}
              className={`mini-key ${adjustedChord.includes(index) ? 'active' : ''}`}
              onClick={() => handleKeyClick(index)}
              style={adjustedChord.includes(index) && highlightColor ? { backgroundColor: highlightColor } : {}}
            />
          ))}
        </div>
        <div className="janko-row">
          {row2.map((index) => (
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

  return (
    <div className="controls">
      <div className="control-row">
      {row0Modes.map(m => (
          <div key={m.id} className="chord-button-container">
            <button
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
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
              style={{ backgroundColor: modeColors[m.id] }}
            >
              {m.label}
            </button>
            <div className="floating-keyboard">
              <MiniKeyboard
                chord={chordNotes[m.id] || []}
                onNoteToggle={() => {}}
                highlightColor={modeColors[m.id]}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="control-row">
        {row2Modes.map(m => (
          <div key={m.id} className="chord-button-container">
            <button
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
              style={{ backgroundColor: modeColors[m.id] }}
            >
              {m.label}
            </button>
            <div className="floating-keyboard">
              <MiniKeyboard
                chord={chordNotes[m.id] || []}
                onNoteToggle={() => {}}
                highlightColor={modeColors[m.id]}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="control-row custom-chord-row">
        {customChordIds.map(id => (
          <div key={id} className="custom-chord-container">
            <button
              className={mode === id ? 'active' : ''}
              onClick={() => setMode(id)}
              style={{ backgroundColor: modeColors[id] }}
            >
              {id.replace('custom', 'Custom')}
            </button>
            <MiniKeyboard
              chord={customChords[id] || []}
              onNoteToggle={(note) => handleNoteToggle(id, note)}
              id={id}
              setMode={setMode}
            />
          </div>
        ))}
        <span className="help-customChords">?</span>
      </div>
      <div className="control-row">
        <button
          className={arpeggiatorOn ? 'active' : ''}
          onClick={() => setArpeggiatorOn(!arpeggiatorOn)}
          style={{ backgroundColor: arpeggiatorOn ? '#e8d0d4' : modeColors['arpeggiatorToggle'] }}
        >
          Arpeggiator {arpeggiatorOn ? 'On' : 'Off'}
        </button>
        <label>
          Pattern:
          <input
            type="text_long"
            value={arpeggiatorPattern}
            onChange={handlePatternChange}
            placeholder="e.g., 1,2,3"
          />
          <span className="help-arpeggiatorPattern">?</span>
        </label>
        <button
          onClick={() => setArpeggiatorDirection(arpeggiatorDirection === 'up' ? 'down' : 'up')}
          className={`direction-button ${arpeggiatorDirection}`}
        >
          {arpeggiatorDirection === 'up' ? '↑' : '↓'}
        </button>
        <label>
          BPM:
          <input
            type="range"
            min="60"
            max="480"
            value={arpeggiatorBpm}
            onChange={(e) => setArpeggiatorBpm(Number(e.target.value))}
          />
          <span>{arpeggiatorBpm}</span>
        </label>
      </div>
      <div className="control-row">
        <button
          onClick={() => setKeyboardMode(keyboardMode === 'partial' ? 'whole' : 'partial')}
          className="keyboard-toggle"
        >
          {keyboardMode === 'partial' ? 'Switch to Whole Keyboard' : 'Switch to Partial Keyboard'}
        </button>
      </div>
    </div>
  );
}

export default Controls;