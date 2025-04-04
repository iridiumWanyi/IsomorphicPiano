import React from 'react';
import { modeColors } from '../constants';
import './Controls.css';

const row1Modes = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' },
  { id: 'diminished', label: 'Diminished' },
  { id: 'augmented', label: 'Augmented' },
];

const row2Modes = [
  { id: 'domSeven', label: 'Dom 7' },
  { id: 'majSeven', label: 'Maj 7' },
  { id: 'minSeven', label: 'Min 7' },
  { id: 'susFour', label: 'Sus 4' },
  { id: 'domNine', label: 'Dom 9' },
  { id: 'majNine', label: 'Maj 9' },
  { id: 'minNine', label: 'Min 9' },
  { id: 'susNine', label: 'Sus 9' },
];

const row3Modes = [
  { id: 'single', label: 'Single' },
  { id: 'octave', label: 'Octave' },
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
      <div className="control-row">
        {row3Modes.map(m => (
          <button
            key={m.id}
            className={mode === m.id ? 'active' : ''}
            onClick={() => setMode(m.id)}
            style={{ backgroundColor: modeColors[m.id] }}
          >
            {m.label}
          </button>
        ))}
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
            type="text"
            value={arpeggiatorPattern}
            onChange={handlePatternChange}
            placeholder="e.g., 1,2,3"
          />
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
            min="40"
            max="240"
            value={arpeggiatorBpm}
            onChange={(e) => setArpeggiatorBpm(Number(e.target.value))}
          />
          <span>{arpeggiatorBpm}</span>
        </label>
        <button
          onClick={() => setKeyboardMode(keyboardMode === 'partial' ? 'whole' : 'partial')}
          className="keyboard-toggle"
        >
          {keyboardMode === 'partial' ? 'Switch to Whole Keyboard' : 'Switch to Partial Keyboard'}
        </button>
      </div>
      {customChordIds.map(id => (
        <div key={id} className="control-row custom-chord-row">
          <button
            className={mode === id ? 'active' : ''}
            onClick={() => setMode(id)}
            style={{ backgroundColor: modeColors[id] }}
          >
            {id.replace('custom', 'Custom ')}
          </button>
          <input
            type="text"
            value={customChords[id].join(',')}
            onChange={(e) => handleCustomChordChange(id, e.target.value)}
            placeholder="e.g., 0,4,7"
          />
        </div>
      ))}
    </div>
  );
}

export default Controls;