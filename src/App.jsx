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

  const [isPriorityAudioLoaded, setIsPriorityAudioLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // New: Track progress

  const preloadAudioFiles = async () => {
    const cache = audioCacheRef.current;
    const allNotes = Object.keys(noteToFileNumber);
    const priorityNotes = chromaticScale.slice(
      chromaticScale.indexOf('F2'),
      chromaticScale.indexOf('F5') + 1
    );
    const otherNotes = allNotes.filter(note => !priorityNotes.includes(note));
    const totalPriorityNotes = priorityNotes.length;
  
    console.log('Starting preload, priority notes:', priorityNotes);
  
    // Load priority notes first (F2 to F5)
    let loadedCount = 0;
    const priorityPromises = priorityNotes.map(async (note) => {
      const fileNumber = noteToFileNumber[note];
      const audioUrl = `public/audio/${fileNumber}.mp3`; 
      console.log(`Fetching ${note} from ${audioUrl}`);
      try {
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${audioUrl}: ${response.status} ${response.statusText}`);
        }
        const audioBlob = await response.blob();
        cache[note] = audioBlob;
        console.log(`Successfully cached ${note}`);
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / totalPriorityNotes) * 100));
      } catch (error) {
        console.error(`Error caching ${note}: ${error.message}`);
        cache[note] = null;
      }
    });
  
    await Promise.all(priorityPromises);
    const priorityLoaded = priorityNotes.every(note => cache[note] !== null && cache[note] !== undefined);
    setIsPriorityAudioLoaded(priorityLoaded);
    console.log('Priority notes (F2 to F5) completed, all loaded:', priorityLoaded, 'Cached count:', Object.keys(cache).length);
  
    // Load remaining notes in the background
    if (priorityLoaded) {
      otherNotes.forEach(async (note) => {
        const fileNumber = noteToFileNumber[note];
        const audioUrl = `/audio/${fileNumber}.mp3`;
        try {
          const response = await fetch(audioUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${audioUrl}: ${response.status} ${response.statusText}`);
          }
          const audioBlob = await response.blob();
          cache[note] = audioBlob;
          console.log(`Background cached ${note}`);
        } catch (error) {
          console.error(`Background error caching ${note}: ${error.message}`);
          cache[note] = null;
        }
      });
      // Note: We don’t await here, so it runs asynchronously
      setTimeout(() => setIsAudioLoaded(true), 1000); // Set isAudioLoaded after a delay to ensure UI updates
    }
  };
  
const playNote = (note) => {
  if (!isPriorityAudioLoaded) {
    console.log(`Playback disabled until F2-F5 are loaded, attempted note: ${note}`);
    return;
  }
  const audioBlob = audioCacheRef.current[note];
  if (audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error(`Error playing ${note}:`, err));
    audio.onended = () => URL.revokeObjectURL(audioUrl);
  } else {
    console.warn(`Audio not cached for ${note}, skipping playback`);
  }
};

return (
  <div className="app">
    <h1>Isomorphic Piano Simulator</h1>
    {!isPriorityAudioLoaded && (
      <p>Loading audio files: {loadingProgress}%</p>
    )}
    {isPriorityAudioLoaded && (
      <>
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
      </>
    )}
  </div>
);
}

export default App;