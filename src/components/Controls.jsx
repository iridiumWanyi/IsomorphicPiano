import React from 'react';
import { modeColors } from '../constants';
import { chordNotes } from '../constants';
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

const MiniKeyboard = ({ chord, onNoteToggle, id, setMode, highlightColor }) => {
  const row1 = [1, 3, 5, 7, 9, 11];
  const row2 = [0, 2, 4, 6, 8, 10];

  const handleKeyClick = (index) => {
    if (id && setMode) {
      onNoteToggle(index);
      setMode(id);
    }
  };

  const adjustedChord = chord && chord.length > 0 ? chord : id ? [0] : [];

  return (
    <div className={`mini-keyboard ${id ? '' : 'static'}`}>
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

export const ChordControls = ({ mode, setMode, customChords, setCustomChords }) => {
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

  return (
    <div className="chord-controls">
      <div className="control-row">
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
              />
            </div>
          </div>
        ))}
      </div>
      <div className="control-row">
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
              />
            </div>
          </div>
        ))}
      </div>
      <div className="control-row custom-chord-row">
        <span className="row-label">Custom Chords:</span>
        {customChordIds.map(id => (
          <div key={id} className="custom-chord-container">
            <button
              className={mode === id ? 'active' : ''}
              onClick={() => setMode(id)}
              onTouchStart={() => setMode(id)}
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
    </div>
  );
};

export const ArpeggiatorControls = ({
  arpeggiator1On, setArpeggiator1On,
  arpeggiator1Pattern, setArpeggiator1Pattern,
  arpeggiator1Bpm, setArpeggiator1Bpm,
  arpeggiator1Direction, setArpeggiator1Direction,
  arpeggiator2On, setArpeggiator2On,
  arpeggiator2Pattern, setArpeggiator2Pattern,
  arpeggiator2Bpm, setArpeggiator2Bpm,
  arpeggiator2Direction, setArpeggiator2Direction
}) => {
  const handlePatternChange = (setter) => (e) => {
    const value = e.target.value;
    if (/^(\d+,)*\d*$/.test(value) || value === '') {
      setter(value);
    }
  };

  const handleTouchToggle = (setter, current) => (e) => {
    e.preventDefault(); // Prevent default touch behavior
    e.stopPropagation(); // Stop event from bubbling up
    setter(!current); // Toggle immediately
    e.target.dataset.touched = 'true'; // Mark as touched to block onClick
  };

  const handleClickToggle = (setter, current) => (e) => {
    if (e.target.dataset.touched) {
      // If touched, reset flag and skip click to avoid double-toggle
      delete e.target.dataset.touched;
      return;
    }
    setter(!current); // Normal click behavior for non-touch devices
  };

  const handleTouchDirection = (setter, current) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setter(current === 'up' ? 'down' : 'up');
    e.target.dataset.touched = 'true';
  };

  const handleClickDirection = (setter, current) => (e) => {
    if (e.target.dataset.touched) {
      delete e.target.dataset.touched;
      return;
    }
    setter(current === 'up' ? 'down' : 'up');
  };

  return (
    <div className="arpeggiator-controls">
      <div className="control-row">
        <button
          className={arpeggiator1On ? 'active' : ''}
          onClick={handleClickToggle(setArpeggiator1On, arpeggiator1On)}
          onTouchStart={handleTouchToggle(setArpeggiator1On, arpeggiator1On)}
          style={{ backgroundColor: arpeggiator1On ? '#e8d0d4' : modeColors['arpeggiatorToggle'] }}
        >
          Arpeggiator 1 {arpeggiator1On ? 'On' : 'Off'}
        </button>
        <label>
          Pattern:
          <input
            type="text_long"
            value={arpeggiator1Pattern}
            onChange={handlePatternChange(setArpeggiator1Pattern)}
            placeholder="e.g., 1,2,3"
          />
          <span className="help-arpeggiatorPattern">?</span>
        </label>
        <button
          onClick={handleClickDirection(setArpeggiator1Direction, arpeggiator1Direction)}
          onTouchStart={handleTouchDirection(setArpeggiator1Direction, arpeggiator1Direction)}
          className={`direction-button ${arpeggiator1Direction}`}
        >
          {arpeggiator1Direction === 'up' ? '↑' : '↓'}
        </button>
        <label>
          BPM:
          <input
            type="range"
            min="60"
            max="480"
            value={arpeggiator1Bpm}
            onChange={(e) => setArpeggiator1Bpm(Number(e.target.value))}
          />
          <span>{arpeggiator1Bpm}</span>
        </label>
      </div>
      <div className="control-row">
        <button
          className={arpeggiator2On ? 'active' : ''}
          onClick={handleClickToggle(setArpeggiator2On, arpeggiator2On)}
          onTouchStart={handleTouchToggle(setArpeggiator2On, arpeggiator2On)}
          style={{ backgroundColor: arpeggiator2On ? '#e8d0d4' : modeColors['arpeggiatorToggle'] }}
        >
          Arpeggiator 2 {arpeggiator2On ? 'On' : 'Off'}
        </button>
        <label>
          Pattern:
          <input
            type="text_long"
            value={arpeggiator2Pattern}
            onChange={handlePatternChange(setArpeggiator2Pattern)}
            placeholder="e.g., 1,2,3"
          />
          <span className="help-arpeggiatorPattern">?</span>
        </label>
        <button
          onClick={handleClickDirection(setArpeggiator2Direction, arpeggiator2Direction)}
          onTouchStart={handleTouchDirection(setArpeggiator2Direction, arpeggiator2Direction)}
          className={`direction-button ${arpeggiator2Direction}`}
        >
          {arpeggiator2Direction === 'up' ? '↑' : '↓'}
        </button>
        <label>
          BPM:
          <input
            type="range"
            min="60"
            max="480"
            value={arpeggiator2Bpm}
            onChange={(e) => setArpeggiator2Bpm(Number(e.target.value))}
          />
          <span>{arpeggiator2Bpm}</span>
        </label>
      </div>
    </div>
  );
};

export const KeyboardToggle = ({ keyboardMode, setKeyboardMode }) => (
  <div className="keyboard-toggle-container">
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