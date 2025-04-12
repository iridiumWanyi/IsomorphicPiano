import React from 'react';
import './ChordProgression.css';

function ChordProgression({ progression }) {
  const getChordShorthand = (chordType) => {
    switch (chordType) {
      case 'major':
        return 'Δ';
      case 'minor':
        return 'm';
      case 'diminished':
        return 'dim';
      case 'augmented':
        return 'aug';
      case 'domSeven':
        return '7';
      case 'majSeven':
        return 'M7';
      case 'minSeven':
        return 'm7';
      case 'susFour':
        return 'sus4';
      case 'domNine':
        return '9';
      case 'majNine':
        return 'M9';
      case 'minNine':
        return 'm9';
      case 'susNine':
        return 'sus9';
      case 'octave':
        return '8va';
      case 'single':
        return '';
      case 'custom1':
        return 'C1';
      case 'custom2':
        return 'C2';
      case 'custom3':
        return 'C3';
      default:
        return chordType;
    }
  };

  const formatChord = (chord) => {
    const chordName = getChordShorthand(chord.chordType);
    const arpeggioPattern = chord.arpeggioPattern && !chord.arpeggioAsChord
      ? chord.arpeggioPattern.split(',').map((num, index) => (
          <span key={index}>
            {num}
            {index < chord.arpeggioPattern.split(',').length - 1 && (
              <span className="arpeggio-comma"></span>
            )}
          </span>
        ))
      : null;

    return (
      <>
        {chord.rootNote}
        {(chordName || arpeggioPattern) && (
          <span className="notation-container">
            {arpeggioPattern && <sub>{arpeggioPattern}</sub>}
            {chordName && <sup>{chordName}</sup>}
          </span>
        )}
      </>
    );
  };

  return (
    <div className="chord-progression-display">
      {progression.length === 0 ? (
        <p>No chords recorded.</p>
      ) : (
        <div className="progression-list">
          {progression.map((chord, index) => (
            <span key={index} className="chord-item">
              {formatChord(chord)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChordProgression;