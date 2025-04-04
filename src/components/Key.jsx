import React from 'react';
import './Key.css';

function Key({ note, onNotePress, onNoteRelease, isActive, highlightColor }) {
  const isDark = note.includes('#');

  const handleMouseDown = () => {
    onNotePress(note);
  };

  const handleMouseUp = () => {
    onNoteRelease(note);
  };

  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    onNotePress(note);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    onNoteRelease(note);
  };

  return (
    <div
      className={`key ${isDark ? 'dark' : 'white'} ${isActive ? 'active' : ''}`}
      style={{ backgroundColor: isActive ? highlightColor : '' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {note}
    </div>
  );
}

export default Key;