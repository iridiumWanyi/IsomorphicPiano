import React from 'react';
import './Key.css';

function Key({ note, onNotePress, onNoteRelease, isActive, highlightColor, keyShape, keyColorScheme }) {
  const isDark = note.includes('#');
  const isCNote = note.match(/^C\d+$/); // Matches only "C" followed by digits (e.g., C3, C4), not C#
  
  // Determine base color class based on keyColorScheme
  const colorClass = keyColorScheme === 'uniformWhite' ? 'uniformWhite' :
                    keyColorScheme === 'octavehighlight' ? (isCNote ? 'octavehighlight' : 'white') : // Only natural C notes are red, others white
                    isDark ? 'dark' : 'white';

  const style = {
    backgroundColor: isActive ? highlightColor : ''
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    onNotePress(note);
  };

  const handleMouseUp = () => {
    onNoteRelease(note);
  };

  const handleMouseLeave = () => {
    if (isActive) {
      onNoteRelease(note);
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    onNotePress(note);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    onNoteRelease(note);
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    onNoteRelease(note);
  };

  return (
    <div
      className={`key ${colorClass} ${isActive ? 'active' : ''} ${keyShape}`}
      style={{ backgroundColor: isActive ? highlightColor : '' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {note}
    </div>
  );
}

export default Key;