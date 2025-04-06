import React, { useState, useEffect, useRef } from 'react';
import Keyboard from './components/Keyboard';
import Controls from './components/Controls';
import { chromaticScale, noteToFileNumber } from './constants';
import './App.css';
import * as Tone from 'tone';

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
    const startAudioContext = async () => {
      await Tone.start(); // Starts the AudioContext
      console.log('AudioContext started');
      preloadAudioFiles(); // Load samples after context is started
    };
  
    // Call this on first interaction (e.g., a button click or app load)
    startAudioContext();
  }, []);

  const audioCacheRef = useRef({});

  const preloadAudioFiles = async () => {
    // Create the feedback delay effect
    const echo = new Tone.FeedbackDelay({
      delayTime: '2n', // Delay time (e.g., eighth note at current BPM)
      feedback: 0.4,   // Amount of delayed signal fed back (0 to 1)
      wet: 0.4        // Mix of dry (original) vs. wet (effected) signal (0 to 1)
    });
  
    // Define the sampler
    const sampler = new Tone.Sampler({
      urls: Object.keys(noteToFileNumber).reduce((acc, note) => {
        const fileNumber = noteToFileNumber[note];
        acc[note] = `${process.env.PUBLIC_URL}/audio/${fileNumber}.mp3`;
        return acc;
      }, {}),
      onload: () => {
        setIsAudioLoaded(true);
        console.log('All audio files loaded into sampler');
      },
      onerror: (error) => {
        console.error('Error loading sampler:', error);
      },
    });
  
    // Connect sampler -> echo -> destination
    sampler.connect(echo);
    echo.toDestination();
  
    audioCacheRef.current = sampler;
  };
  
  const playNote = (note) => {
    const sampler = audioCacheRef.current;
    if (sampler && sampler.loaded) {
      // Trigger the note with a short duration (e.g., 0.3 seconds)
      sampler.triggerAttackRelease(note, '0.3');
    } else {
      console.warn(`Sampler not ready or note ${note} not loaded`);
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