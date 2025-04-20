import React, { useState } from 'react';
import './Controls.css';
import { chromaticScale } from '../constants';

export const KeyboardToggle = ({ 
  keyboardMode, setKeyboardMode, 
  keyShape, setKeyShape, 
  keyColorScheme, setKeyColorScheme, 
  highlightNotes, setHighlightNotes, 
  setLowestKey: setParentLowestKey, 
  setHighestKey: setParentHighestKey 
}) => {
  const [lowestKey, setLowestKey] = useState('C3');
  const [highestKey, setHighestKey] = useState('C5');
  const [error, setError] = useState('');

  const toggleKeyShape = () => {
    if (keyShape === 'rectangle') setKeyShape('hexagon');
    else if (keyShape === 'hexagon') setKeyShape('circle');
    else setKeyShape('rectangle');
  };

  const toggleColorScheme = () => {
    if (keyColorScheme === 'blackWhite') setKeyColorScheme('uniform');
    else if (keyColorScheme === 'uniform') setKeyColorScheme('customhighlight');
    else setKeyColorScheme('blackWhite');
  };

  const handleHighlightToggle = (note) => {
    setHighlightNotes(prev => 
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  };

  const handleLowestKeyChange = (e) => {
    const value = e.target.value;
    const lowIndex = chromaticScale.indexOf(value);
    const highIndex = chromaticScale.indexOf(highestKey);
    if (lowIndex <= highIndex || !chromaticScale.includes(highestKey)) {
      setLowestKey(value);
      setParentLowestKey(value);
      setError('');
    } else {
      setError('Lowest key must be at or below highest key');
    }
  };

  const handleHighestKeyChange = (e) => {
    const value = e.target.value;
    const lowIndex = chromaticScale.indexOf(lowestKey);
    const highIndex = chromaticScale.indexOf(value);
    if (highIndex >= lowIndex || !chromaticScale.includes(lowestKey)) {
      setHighestKey(value);
      setParentHighestKey(value);
      setError('');
    } else {
      setError('Highest key must be at or above lowest key');
    }
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
           keyColorScheme === 'uniform' ? 'Uniform Coloring' :
           'Custom Black Keys'}
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
      {(keyboardMode === 'partial' || keyColorScheme === 'customhighlight') && (
        <div className="controls-row">
          {keyboardMode === 'partial' && (
            <div className="key-range-selector">
              <div className="key-input">
                <label>Lowest Key:</label>
                <select
                  value={lowestKey}
                  onChange={handleLowestKeyChange}
                  className={error && lowestKey >= highestKey ? 'input-error' : ''}
                >
                  {chromaticScale.map(note => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </div>
              <div className="key-input">
                <label>Highest Key:</label>
                <select
                  value={highestKey}
                  onChange={handleHighestKeyChange}
                  className={error && highestKey <= lowestKey ? 'input-error' : ''}
                >
                  {chromaticScale.map(note => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </div>
              {error && <span className="error-message">{error}</span>}
            </div>
          )}

        </div>
      )}
    </div>
  );
};