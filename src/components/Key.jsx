import React from 'react';
import './Key.css';

function Key({ note, onNotePress, onNoteRelease, isActive, highlightColor }) {
  const isDark = note.includes('#');

  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent focus issues
    onNotePress(note);
  };

  const handleMouseUp = () => {
    onNoteRelease(note);
  };

  const handleMouseLeave = () => {
    if (isActive) {
      onNoteRelease(note); // Release if mouse leaves while pressed
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
    onNoteRelease(note); // Release if touch is interrupted
  };

  return (
    <div
      className={`key ${isDark ? 'dark' : 'white'} ${isActive ? 'active' : ''}`}
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