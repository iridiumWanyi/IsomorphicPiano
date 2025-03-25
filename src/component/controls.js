


import React, { useState } from 'react';
import './controls.css';

const Controls = () => {
  // 状态管理
  const [arpeggiatorSpeed, setArpeggiatorSpeed] = useState(120); // BPM
  const [arpeggiatorPattern, setArpeggiatorPattern] = useState('1,2,3,4,5,3,4,5');
  const [arpeggiatorOn, setArpeggiatorOn] = useState(false);
  const [userChordIntervals, setUserChordIntervals] = useState({
    chord1: '0,2,4,7',
    chord2: '0,3,6,9',
    chord3: '0,4,8',
    chord4: '0,5,7',
  });

  // 处理输入框变化
  const handleArpeggiatorSpeedChange = (e) => {
    setArpeggiatorSpeed(e.target.value);
  };

  const handleArpeggiatorPatternChange = (e) => {
    setArpeggiatorPattern(e.target.value);
  };

  const handleChordIntervalChange = (chordKey) => (e) => {
    setUserChordIntervals((prev) => ({
      ...prev,
      [chordKey]: e.target.value,
    }));
  };

  // 模式切换
  const handleModeClick = (mode) => {
    console.log(`Selected mode: ${mode}`);
    // 这里可以添加切换模式的逻辑，例如与 Keyboard 组件联动
  };

  const toggleArpeggiator = () => {
    setArpeggiatorOn((prev) => !prev);
  };

  return (
    <div className="controls-container">
      <h1>Isomorphic Piano Simulator</h1>
      <div className="controls">
        <div className="main-controls">
          <div className="control-row">
            <button
              id="single"
              className="active"
              onClick={() => handleModeClick('single')}
            >
              <span className="text">♪ Single</span>
              <div style={{ color: '#666', fontSize: '0.8em' }}>keyboard (`)</div>
            </button>
            <button id="octave" onClick={() => handleModeClick('octave')}>
              <span className="text">♪♪ Octave</span>
              <div style={{ color: '#666', fontSize: '0.8em' }}>keyboard (1)</div>
            </button>
            <button id="major" onClick={() => handleModeClick('major')}>
              <span className="text">△ Major</span>
              <div style={{ color: '#666', fontSize: '0.8em' }}>keyboard (2)</div>
            </button>
            <button id="minor" onClick={() => handleModeClick('minor')}>
              <span className="text">- Minor</span>
              <div style={{ color: '#666', fontSize: '0.8em' }}>keyboard (3)</div>
            </button>
            <button id="diminished" onClick={() => handleModeClick('diminished')}>
              <span className="text">○ Diminished</span>
              <div style={{ color: '#666', fontSize: '0.8em' }}>keyboard (4)</div>
            </button>
            <button id="augmented" onClick={() => handleModeClick('augmented')}>
              <span className="text">+ Augmented</span>
              <div style={{ color: '#666', fontSize: '0.8em' }}>keyboard (5)</div>
            </button>
          </div>
          <div className="control-row">
            <button id="domSeven" onClick={() => handleModeClick('domSeven')}>
              <span className="text">Dom 7</span>
            </button>
            <button id="majSeven" onClick={() => handleModeClick('majSeven')}>
              <span className="text">Maj 7</span>
            </button>
            <button id="minSeven" onClick={() => handleModeClick('minSeven')}>
              <span className="text">Min 7</span>
            </button>
            <button id="susSeven" onClick={() => handleModeClick('susSeven')}>
              <span className="text">Sus 7</span>
            </button>
            <button id="domNine" onClick={() => handleModeClick('domNine')}>
              <span className="text">Dom 9</span>
            </button>
            <button id="majNine" onClick={() => handleModeClick('majNine')}>
              <span className="text">Maj 9</span>
            </button>
            <button id="minNine" onClick={() => handleModeClick('minNine')}>
              <span className="text">Min 9</span>
            </button>
            <button id="susNine" onClick={() => handleModeClick('susNine')}>
              <span className="text">Sus 9</span>
            </button>
          </div>
          <div className="control-row">
            <button id="arpeggiatorToggle" onClick={toggleArpeggiator}>
              <span className="text">
                Toggle Arpeggiator ({arpeggiatorOn ? 'On' : 'Off'})
              </span>
              <div style={{ color: '#666', fontSize: '0.8em' }}>keyboard (a)</div>
            </button>
            <label>
              Arpeggiator BPM:{' '}
              <input
                type="range"
                id="arpeggiatorSpeed"
                min="40"
                max="200"
                value={arpeggiatorSpeed}
                onChange={handleArpeggiatorSpeedChange}
              />
            </label>
            <span id="bpmDisplay">{arpeggiatorSpeed} BPM</span>
          </div>
          <div className="control-row">
            <label>Arpeggiator Pattern:</label>
            <button className="direction-button" id="arpeggiatorDirection">
              ↑
            </button>
            <input
              type="text"
              id="arpeggiatorPattern"
              value={arpeggiatorPattern}
              onChange={handleArpeggiatorPatternChange}
            />
            <button className="help-button" id="arpeggiatorHelp">
              ?
            </button>
          </div>
        </div>
        <div className="custom-controls">
          <div className="control-row">
            <button id="userChord1" onClick={() => handleModeClick('userChord1')}>
              <span className="text">Custom Chord 1</span>
            </button>
            <label>
              Intervals:{' '}
              <input
                type="text"
                id="userChord1Intervals"
                value={userChordIntervals.chord1}
                onChange={handleChordIntervalChange('chord1')}
                placeholder="e.g., 0,2,4,7"
              />
            </label>
            <button className="help-button" id="customChordHelp">
              ?
            </button>
          </div>
          <div className="control-row">
            <button id="userChord2" onClick={() => handleModeClick('userChord2')}>
              <span className="text">Custom Chord 2</span>
            </button>
            <label>
              Intervals:{' '}
              <input
                type="text"
                id="userChord2Intervals"
                value={userChordIntervals.chord2}
                onChange={handleChordIntervalChange('chord2')}
                placeholder="e.g., 0,3,6,9"
              />
            </label>
          </div>
          <div className="control-row">
            <button id="userChord3" onClick={() => handleModeClick('userChord3')}>
              <span className="text">Custom Chord 3</span>
            </button>
            <label>
              Intervals:{' '}
              <input
                type="text"
                id="userChord3Intervals"
                value={userChordIntervals.chord3}
                onChange={handleChordIntervalChange('chord3')}
                placeholder="e.g., 0,4,8"
              />
            </label>
          </div>
          <div className="control-row">
            <button id="userChord4" onClick={() => handleModeClick('userChord4')}>
              <span className="text">Custom Chord 4</span>
            </button>
            <label>
              Intervals:{' '}
              <input
                type="text"
                id="userChord4Intervals"
                value={userChordIntervals.chord4}
                onChange={handleChordIntervalChange('chord4')}
                placeholder="e.g., 0,5,7"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;