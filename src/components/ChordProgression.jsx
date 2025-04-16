import React from 'react';
import './ChordProgression.css';

function ChordProgression({ progression }) {
  const getChordShorthand = (chordType) => {
    switch (chordType) {
      case 'major':
        return 'Δ';
      case 'minor':
        return '-';
      case 'diminished':
        return 'o';
      case 'augmented':
        return '+';
      case 'domSeven':
        return '7';
      case 'majSeven':
        return 'M7';
      case 'minSeven':
        return 'm7';
      case 'susFour':
        return 's4';
      case 'domNine':
        return '9';
      case 'majNine':
        return 'M9';
      case 'minNine':
        return 'm9';
      case 'susNine':
        return 's9';
      case 'octave':
        return 'oc';
      case 'single':
        return '';
      case 'custom1':
        return '1';
      case 'custom2':
        return '2';
      case 'custom3':
        return '3';
      default:
        return chordType;
    }
  };

  const formatChord = (chord) => {
    const chordName = getChordShorthand(chord.chordType);
    const arpeggioPattern = chord.arpeggioPattern && !chord.BlockChord
    ? (() => {
      const patternArray = chord.arpeggioPattern.split(',').filter(x => x !== '');
      if (patternArray.length <= 4) {
        return patternArray.map((num, index) => (
          <span key={index}>
            {num}
            {index < patternArray.length - 1 && (
              <span className="arpeggioPattern-display"></span>
            )}
          </span>
        ));
      } else {
        return (
          <>
            {patternArray.slice(0, 3).map((num, index) => (
              <span key={index}>
                {num}
                {index < 2 && <span className="arpeggioPattern-display"></span>}
              </span>
            ))}
            <span>...</span>
          </>
        );
      }
    })()
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