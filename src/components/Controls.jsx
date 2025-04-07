import React from 'react';
import { modeColors } from '../constants';
import './Controls.css';

const row1Modes = [
  { id: 'single', label: 'Single' },
  { id: 'octave', label: 'Octave' },
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

const MiniKeyboard = ({ chord, onNoteToggle, id, setMode }) => {
  const row1 = [1, 3, 5, 7, 9, 11]; // C#, D#, F, G, A, B indices
  const row2 = [0, 2, 4, 6, 8, 10]; // C, D, E, F#, G#, A# indices

  const handleKeyClick = (index) => {
    onNoteToggle(index);
    setMode(id);
  };

  const adjustedChord = chord && chord.length > 0 ? chord : [0];

  return (
    <div className="mini-keyboard janko">
      <div className="mini-row top-row">
        {row1.map((index) => (
          <div
            key={index}
            className={`mini-key ${adjustedChord.includes(index) ? 'active' : ''}`}
            onClick={() => handleKeyClick(index)}
          />
        ))}
      </div>
      <div className="mini-row">
        {row2.map((index) => (
          <div
            key={index}
            className={`mini-key ${adjustedChord.includes(index) ? 'active' : ''}`}
            onClick={() => handleKeyClick(index)}
          />
        ))}
      </div>
    </div>
  );
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

  const handleCustomChordChange = (id, value) => {
    if (/^(\d+,)*\d*$/.test(value) || value === '') {
      setCustomChords(prev => ({
        ...prev,
        [id]: value === '' ? [] : value.split(',').map(Number)
      }));
    }
  };

  const handleNoteToggle = (id, note) => {
    setCustomChords(prev => {
      const currentChord = prev[id] && prev[id].length > 0 ? prev[id] : [0]; // Ensure 0 is always present
      if (note === 0) {
        return { ...prev, [id]: currentChord }; // Do nothing if clicking the first key
      }
      if (currentChord.includes(note)) {
        return {
          ...prev,
          [id]: currentChord.filter(n => n !== note) // Remove other notes, keep 0
        };
      } else {
        return {
          ...prev,
          [id]: [...currentChord, note].sort((a, b) => a - b) // Add new note, keep 0
        };
      }
    });
  };

  return (
    <div className="controls">
      <div className="control-row">
        {row1Modes.map(m => (
          <button
            key={m.id}
            className={mode === m.id ? 'active' : ''}
            onClick={() => setMode(m.id)}
            style={{ backgroundColor: modeColors[m.id] }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="control-row">
        {row2Modes.map(m => (
          <button
            key={m.id}
            className={mode === m.id ? 'active' : ''}
            onClick={() => setMode(m.id)}
            style={{ backgroundColor: modeColors[m.id] }}
          >
            {m.label}
          </button>
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
        id={id} // Pass the custom chord ID
        setMode={setMode} // Pass setMode prop
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