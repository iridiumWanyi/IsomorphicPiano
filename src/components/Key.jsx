import React from 'react';
import './Key.css';

function Key({ note, onNotePress, onNoteRelease, isActive, highlightColor, keyShape, keyColorScheme, highlightNotes }) {
  const isDark = note.includes('#');
  const noteBase = note.match(/^[A-G]#?/)?.[0] || ''; // Extract base note (e.g., 'C' or 'C#' from 'C3' or 'C#4')
  const isHighlighted = highlightNotes.includes(noteBase);
  
  const colorClass = keyColorScheme === 'uniformWhite' ? 'uniformWhite' :
                    keyColorScheme === 'octavehighlight' ? (isHighlighted ? 'octavehighlight' : 'white') :
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
      style={style}
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