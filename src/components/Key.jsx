import React from 'react';
import './Key.css';

function Key({ note, playNotes, isActive, highlightColor }) {
  const handleClick = () => {
    playNotes();
  };

  return (
    <div
      className={`key ${note.includes('#') ? 'dark' : 'white'} ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      style={isActive ? { backgroundColor: highlightColor } : {}}
    >
      {note}
    </div>
  );
}

export default Key;