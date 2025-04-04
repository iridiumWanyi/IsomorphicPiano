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
  const [arpeggiatorPattern, setArpeggiatorPattern] = useState('1,2,3,4,5,3,4,5');
  const [arpeggiatorBpm, setArpeggiatorBpm] = useState(240);
  const [arpeggiatorDirection, setArpeggiatorDirection] = useState('up');
  const [customChords, setCustomChords] = useState({
    custom1: [0, 4, 7],
    custom2: [0, 3, 7],
    custom3: [0, 3, 6, 9],
    custom4: [0, 4, 8, 10],
  });
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState('partial'); // New state: 'partial' or 'whole'

  useEffect(() => {
    preloadAudioFiles();
  }, []);

  const preloadAudioFiles = async () => {
    const map = {};
    const preloadPromises = Object.keys(noteToFileNumber).map(note => {
      const fileNumber = noteToFileNumber[note];
      const audioUrl = `${process.env.PUBLIC_URL}/audio/${fileNumber}.mp3`;
      return new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        audio.oncanplaythrough = () => {
          console.log(`Loaded ${note} (${audioUrl})`);
          map[note] = audio;
          resolve();
        };
        audio.onerror = () => {
          console.error(`Failed to load ${note} (${audioUrl})`);
          map[note] = null;
          resolve();
        };
        audio.load();
      });
    });

    await Promise.all(preloadPromises);
    setAudioMap(map);
    setIsAudioLoaded(true);
    console.log('All audio files preloaded:', Object.keys(map).length);
  };

  const playNote = (note) => {
    const audio = audioMap[note];
    if (audio && audio.readyState >= 2) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error(`Error playing ${note}:`, err));
    } else {
      console.warn(`Audio not ready for ${note}, using oscillator`);
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
      {!isAudioLoaded && <p>Loading audio files, please wait...</p>}
      <Controls 
        mode={mode} 
        setMode={setMode} 
        arpeggiatorOn={arpeggiatorOn} 
        setArpeggiatorOn={setArpeggiatorOn}
        arpeggiatorPattern={arpeggiatorPattern}
        setArpeggiatorPattern={setArpeggiatorPattern}
        arpeggiatorBpm={arpeggiatorBpm}
        setArpeggiatorBpm={setArpeggiatorBpm}
        arpeggiatorDirection={arpeggiatorDirection}
        setArpeggiatorDirection={setArpeggiatorDirection}
        customChords={customChords}
        setCustomChords={setCustomChords}
        keyboardMode={keyboardMode}
        setKeyboardMode={setKeyboardMode}
      />
      <Keyboard 
        mode={mode} 
        playNote={playNote} 
        arpeggiatorOn={arpeggiatorOn} 
        arpeggiatorPattern={arpeggiatorPattern}
        arpeggiatorBpm={arpeggiatorBpm}
        arpeggiatorDirection={arpeggiatorDirection}
        customChords={customChords}
        keyboardMode={keyboardMode}
      />
    </div>
  );
}

export default App;