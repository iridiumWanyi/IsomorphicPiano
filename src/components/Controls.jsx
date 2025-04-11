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
              {id.replace('custom', 'Chord')}
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
  arpeggiator2Direction, setArpeggiator2Direction,
  arpeggio1AsChord, setArpeggio1AsChord, // New props
  arpeggio2AsChord, setArpeggio2AsChord  // New props
}) => {
  const handlePatternChange = (setter) => (e) => {
    const value = e.target.value;
    if (/^(\d+,)*\d*$/.test(value) || value === '') {
      setter(value);
    }
  };

  const handleTouchToggle = (setter, current) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setter(!current);
    e.target.dataset.touched = 'true';
  };

  const handleClickToggle = (setter, current) => (e) => {
    if (e.target.dataset.touched) {
      delete e.target.dataset.touched;
      return;
    }
    setter(!current);
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
          style={{ backgroundColor: arpeggiator1On ? '#dab3b3' : modeColors['arpeggiatorToggle'] }}
        >
          Arpeggio {arpeggiator1On ? 'On' : 'Off'}
        </button>
        <label>
          Pattern:
          <input
            type="text"
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
        <button
          className={arpeggio1AsChord ? 'active' : ''}
          onClick={handleClickToggle(setArpeggio1AsChord, arpeggio1AsChord)}
          onTouchStart={handleTouchToggle(setArpeggio1AsChord, arpeggio1AsChord)}
          style={{ backgroundColor: arpeggio1AsChord ? '#dab3b3' : modeColors['arpeggiatorToggle'] }}
        >
          ∞
        </button>
        <span className="help-infty">?</span>
      </div>
      
    </div>
  );
};

export const KeyboardToggle = ({ keyboardMode, setKeyboardMode, keyShape, setKeyShape, keyColorScheme, setKeyColorScheme, highlightNotes, setHighlightNotes }) => {
  const toggleKeyShape = () => {
    if (keyShape === 'rectangle') setKeyShape('hexagon');
    else if (keyShape === 'hexagon') setKeyShape('circle');
    else setKeyShape('rectangle');
  };

  const toggleColorScheme = () => {
    if (keyColorScheme === 'blackWhite') setKeyColorScheme('uniformWhite');
    else if (keyColorScheme === 'uniformWhite') setKeyColorScheme('customhighlight');
    else setKeyColorScheme('blackWhite');
  };

  const handleHighlightToggle = (note) => {
    setHighlightNotes(prev => 
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  };

  const noteList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div className="keyboard-toggle-container">
      <div className="control-row">
        <button
          onClick={() => setKeyboardMode(keyboardMode === 'partial' ? 'whole' : 'partial')}
          className="keyboard-toggle"
        >
          {keyboardMode === 'partial' ? 'Partial Keyboard' : 'Whole Keyboard'}
        </button>
        <button
          onClick={toggleKeyShape}
          className="key-shape-toggle"
        >
          {keyShape === 'rectangle' ? 'Quasi-Piano Keys' :
           keyShape === 'hexagon' ? 'Hexagon Keys' :
           'Quasi-Accordion Keys'}
        </button>
        <button
          onClick={toggleColorScheme}
          className="key-color-toggle"
        >
          {keyColorScheme === 'blackWhite' ? 'Black/White Coloring' :
           keyColorScheme === 'uniformWhite' ? 'Uniform Coloring' :
           'Custom Highlighted Keys'}
        </button>
      </div>
      {keyColorScheme === 'customhighlight' && (
        <div className="highlight-selector-row">
          <span className="highlight-label">Select Notes:</span>
          <div className="note-list">
            {noteList.map(note => (
              <button
                key={note}
                className={`note-button ${highlightNotes.includes(note) ? 'active' : ''}`}
                onClick={() => handleHighlightToggle(note)}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};