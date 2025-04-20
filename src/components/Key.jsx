import React, { useState } from 'react';
import './Key.css';

function Key({ note, onNotePress, onNoteRelease, isActive, highlightColor, keyShape, keyColorScheme, highlightNotes }) {
  const isBlack = note.includes('#');
  const noteBase = note.match(/^[A-G]#?/)?.[0] || '';
  const isHighlighted = highlightNotes.includes(noteBase);
  
  const colorClass = keyColorScheme === 'uniform' ? 'uniform' :
                    keyColorScheme === 'customhighlight' ? (isHighlighted ? 'customhighlight' : 'white') :
                    isBlack ? 'Black' : 'white';

  const style = {
    backgroundColor: isActive ? highlightColor : ''
  };

  const [isPressed, setIsPressed] = useState(false); // Track press state to prevent retriggers

  const handleMouseDown = (e) => {
    e.preventDefault();
    console.log(`MouseDown on ${note} at ${Date.now()}`);
    if (!isPressed) {
      setIsPressed(true);
      onNotePress(note);
    }
  };

  const handleMouseUp = () => {
    console.log(`MouseUp on ${note} at ${Date.now()}`);
    if (isPressed) {
      setIsPressed(false);
      onNoteRelease(note);
    }
  };

  const handleMouseLeave = () => {
    console.log(`MouseLeave on ${note} at ${Date.now()}`);
    if (isPressed) {
      setIsPressed(false);
      onNoteRelease(note);
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    console.log(`TouchStart on ${note} at ${Date.now()}`);
    if (!isPressed) {
      setIsPressed(true);
      onNotePress(note);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    console.log(`TouchEnd on ${note} at ${Date.now()}`);
    if (isPressed) {
      setIsPressed(false);
      onNoteRelease(note);
    }
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    console.log(`TouchCancel on ${note} at ${Date.now()}`);
    if (isPressed) {
      setIsPressed(false);
      onNoteRelease(note);
    }
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