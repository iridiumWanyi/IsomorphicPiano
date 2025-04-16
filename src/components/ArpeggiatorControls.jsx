import React from 'react';
import { modeColors } from '../constants';
import './Controls.css';

export const ArpeggiatorControls = ({
  arpeggiator1On, setArpeggiator1On,
  arpeggiator1Pattern, setArpeggiator1Pattern,
  arpeggiator1Bpm, setArpeggiator1Bpm,
  arpeggiator1Direction, setArpeggiator1Direction,
  arpeggiator2On, setArpeggiator2On,
  arpeggiator2Pattern, setArpeggiator2Pattern,
  arpeggiator2Bpm, setArpeggiator2Bpm,
  arpeggiator2Direction, setArpeggiator2Direction,
  BlockChord1, setBlockChord1,
  BlockChord2, setBlockChord2  
}) => {
  const handlePatternChange = (setter) => (e) => {
    const value = e.target.value;
    if (/^(-?\d+,)*-?\d*$/.test(value) || value === '') {
      setter(value);
    }
  };

  const handleTouchToggle = (setter, current) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setter(!current);
    e.target.dataset.touched = 'true';
  };

  const handleClickToggle = (setter, current) => (e) => {
    if (e.target.dataset.touched) {
      delete e.target.dataset.touched;
      return;
    }
    setter(!current);
  };

  const handleTouchDirection = (setter, current) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setter(current === 'up' ? 'down' : 'up');
    e.target.dataset.touched = 'true';
  };

  const handleClickDirection = (setter, current) => (e) => {
    if (e.target.dataset.touched) {
      delete e.target.dataset.touched;
      return;
    }
    setter(current === 'up' ? 'down' : 'up');
  };

  const randomPatterns = [
    '1,3,4,5',
    '1,3,4,3',
    '1,3,2,3',
    '1,3,5,3',
    '1,3,4',
    '1,2,3,4',
    '1,2,3,5',
    '1,3,4,5,6',
    '1,3,4,5,6,5,4,3',
    '1,2,3,4,5,3,4,5',
    '1,-1,1,2',
    '1,-3,-2,-1',
  ];

  const [patternIndex, setPatternIndex] = React.useState(0);

  const cycleNextPattern = (setter) => () => {
    const nextIndex = (patternIndex + 1) % randomPatterns.length;
    setPatternIndex(nextIndex);
    setter(randomPatterns[nextIndex]);
  };

  return (
    <div className="arpeggiator-controls">
      <div className="control-row">
        <button
          className={arpeggiator1On ? 'active' : ''}
          onClick={handleClickToggle(setArpeggiator1On, arpeggiator1On)}
          onTouchStart={handleTouchToggle(setArpeggiator1On, arpeggiator1On)}
          style={{ backgroundColor: arpeggiator1On ? modeColors['buttonToggleOn'] : modeColors['buttonToggleOff'] }}
        >
          Arpeggio {arpeggiator1On ? 'On' : 'Off'}
        </button>
        <label>
          Pattern:
          <input
            type="text"
            value={arpeggiator1Pattern}
            onChange={handlePatternChange(setArpeggiator1Pattern)}
          />
          <span className="help-arpeggiatorPattern">?</span>
        </label>
        <button
          onClick={handleClickDirection(setArpeggiator1Direction, arpeggiator1Direction)}
          onTouchStart={handleTouchDirection(setArpeggiator1Direction, arpeggiator1Direction)}
          className={`direction-button ${arpeggiator1Direction}`}
        >
          {arpeggiator1Direction === 'up' ? '↑' : '↓'}
        </button>
        <button
          onClick={cycleNextPattern(setArpeggiator1Pattern)}
          className="random-pattern-button"
        >
          ⇄
        </button>
        <label>
          BPM:
          <input
            type="range"
            min="60"
            max="480"
            value={arpeggiator1Bpm}
            onChange={(e) => setArpeggiator1Bpm(Number(e.target.value))}
          />
          <span>{arpeggiator1Bpm}</span>
        </label>
        <button
          className={`BlockChord1 ? 'active' : ''`}
          onClick={handleClickToggle(setBlockChord1, BlockChord1)}
          onTouchStart={handleTouchToggle(setBlockChord1, BlockChord1)}
          style={{ backgroundColor: BlockChord1 ? modeColors['buttonToggleOn'] : modeColors['buttonToggleOff']}}
        >∞</button>
        <span className="help-infty">?</span>
      </div> 
      {/* <div className="control-row">
        <button 
          className={arpeggiator2On ? 'active' : ''}
          onClick={handleClickToggle(setArpeggiator2On, arpeggiator2On)}
          onTouchStart={handleTouchToggle(setArpeggiator2On, arpeggiator2On)}
          style={{ backgroundColor: arpeggiator2On ? modeColors['buttonToggleOn'] : modeColors['buttonToggleOff'] }}
        >
          Arpeggio {arpeggiator2On ? 'On' : 'Off'}
        </button>
        <label>
          Pattern:
          <input
            type="text"
            value={arpeggiator2Pattern}
            onChange={handlePatternChange(setArpeggiator2Pattern)}
          />
         <span className="text">......</span>
        </label>
        <button
          onClick={handleClickDirection(setArpeggiator2Direction, arpeggiator2Direction)}
          onTouchStart={handleTouchDirection(setArpeggiator2Direction, arpeggiator2Direction)}
          className={`direction-button ${arpeggiator2Direction}`}
        >
          {arpeggiator2Direction === 'up' ? '↑' : '↓'}
        </button>
        <label>
          BPM:
          <input
            type="range"
            min="60"
            max="480"
            value={arpeggiator2Bpm}
            onChange={(e) => setArpeggiator2Bpm(Number(e.target.value))}
          />
          <span>{arpeggiator2Bpm}</span>
        </label>
        <button
          className={BlockChord2 ? 'active' : ''}
          onClick={handleClickToggle(setBlockChord2, BlockChord2)}
          onTouchStart={handleTouchToggle(setBlockChord2, BlockChord2)}
          style={{ backgroundColor: BlockChord2 ? modeColors['buttonToggleOn'] : modeColors['buttonToggleOff'] }}
        >
          ∞
        </button>
        <span className="text">......</span>
      </div> */}
      
    </div>
  );
};