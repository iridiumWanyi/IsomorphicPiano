import React, { useState, useEffect, useRef } from 'react';
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

  const audioCacheRef = useRef({});

  const preloadAudioFiles = async () => {
    const cache = audioCacheRef.current;
    const preloadPromises = Object.keys(noteToFileNumber).map(async (note) => {
      const fileNumber = noteToFileNumber[note];
      const audioUrl = `${process.env.PUBLIC_URL}/audio/${fileNumber}.mp3`;
      try {
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${audioUrl}: ${response.statusText}`);
        }
        const audioBlob = await response.blob();
        cache[note] = audioBlob;
        console.log(`Cached ${note} (${audioUrl})`);
      } catch (error) {
        console.error(`Failed to cache ${note} (${audioUrl}): ${error.message}`);
        cache[note] = null;
      }
    });
  
    await Promise.all(preloadPromises);
    setIsAudioLoaded(true);
    console.log('All audio files cached:', Object.keys(cache).length);
  };
  
  const playNote = (note) => {
    const audioBlob = audioCacheRef.current[note];
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.error(`Error playing ${note}:`, err);
      });
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } else {
      console.warn(`Audio not cached for ${note}, using oscillator`);
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