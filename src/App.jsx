import React, { useState, useEffect } from 'react';
import Keyboard from './components/Keyboard';
import Controls from './components/Controls';
import { chromaticScale, noteToFileNumber } from './constants';
import './App.css';

const noteToChromaticIndex = {};
chromaticScale.forEach((note, index) => {
  noteToChromaticIndex[note] = index;
});

function App() {
  const [mode, setMode] = useState('single');
  const [audioMap, setAudioMap] = useState({});
  const [arpeggiatorOn, setArpeggiatorOn] = useState(false);
  const [arpeggiatorPattern, setArpeggiatorPattern] = useState('1,2,3');
  const [customChords, setCustomChords] = useState({
    custom1: [0, 4, 7], // Default: Major triad
    custom2: [0, 3, 7], // Default: Minor triad
    custom3: [0, 3, 6], // Default: Diminished triad
    custom4: [0, 4, 8], // Default: Augmented triad
  });

  useEffect(() => {
    preloadAudioFiles();
  }, []);

  const preloadAudioFiles = () => {
    const map = {};
    Object.keys(noteToFileNumber).forEach(note => {
      const fileNumber = noteToFileNumber[note];
      const audio = new Audio(`audio/${fileNumber}.mp3`);
      audio.preload = 'auto';
      audio.load();
      map[note] = audio;
    });
    setAudioMap(map);
  };

  const playNote = (note) => {
    const audio = audioMap[note];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error(`Error playing ${note}:`, err));
    } else {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(noteToChromaticIndex[note] * 10 + 220, audioContext.currentTime);
      oscillator.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  return (
    <div className="app">
      <h1>Isomorphic Piano Simulator</h1>
      <Controls 
        mode={mode} 
        setMode={setMode} 
        arpeggiatorOn={arpeggiatorOn} 
        setArpeggiatorOn={setArpeggiatorOn}
        arpeggiatorPattern={arpeggiatorPattern}
        setArpeggiatorPattern={setArpeggiatorPattern}
        customChords={customChords}
        setCustomChords={setCustomChords}
      />
      <Keyboard 
        mode={mode} 
        playNote={playNote} 
        arpeggiatorOn={arpeggiatorOn} 
        arpeggiatorPattern={arpeggiatorPattern}
        customChords={customChords}
      />
    </div>
  );
}

export default App;