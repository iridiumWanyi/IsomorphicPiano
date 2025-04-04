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


const customChordIds = ['custom1', 'custom2', 'custom3', 'custom4'];

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
          <button
          className={mode === id ? 'active' : ''}
          onClick={() => setMode(id)}
          style={{ backgroundColor: modeColors[id] }}
        >
          {id.replace('custom', 'Custom')}
          <input
            type="text_short"
            value={customChords[id].join(',')}
            onChange={(e) => handleCustomChordChange(id, e.target.value)}
            placeholder="e.g., 0,4,7"
          />
          </button>

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