import React from 'react';
import './Controls.css';

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