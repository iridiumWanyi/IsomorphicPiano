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

 const preloadAudioFiles = async () => {
  const cache = audioCacheRef.current;
  const allNotes = Object.keys(noteToFileNumber);

  // Priority range: F2 (20) to F5 (56)
  const priorityNotes = chromaticScale.slice(
    chromaticScale.indexOf('F2'),
    chromaticScale.indexOf('F5') + 1
  );
  const otherNotes = allNotes.filter(note => !priorityNotes.includes(note));

  console.log('Starting preload, priority notes:', priorityNotes);

  // Load priority notes first (F2 to F5)
  const priorityPromises = priorityNotes.map(async (note) => {
    const fileNumber = noteToFileNumber[note];
    const audioUrl = `/audio/${fileNumber}.mp3`; // Adjust to your actual path
    console.log(`Fetching ${note} from ${audioUrl}`);
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${audioUrl}: ${response.status} ${response.statusText}`);
      }
      const audioBlob = await response.blob();
      cache[note] = audioBlob;
      console.log(`Successfully cached ${note}`);
    } catch (error) {
      console.error(`Error caching ${note}: ${error.message}`);
      cache[note] = null;
    }
  });

  await Promise.all(priorityPromises);
  // Check if all priority notes loaded successfully
  const priorityLoaded = priorityNotes.every(note => cache[note] !== null && cache[note] !== undefined);
  setIsPriorityAudioLoaded(priorityLoaded);
  console.log('Priority notes (F2 to F5) completed, all loaded:', priorityLoaded, 'Cached count:', Object.keys(cache).length);

  // Load remaining notes
  const remainingPromises = otherNotes.map(async (note) => {
    const fileNumber = noteToFileNumber[note];
    const audioUrl = `/audio/${fileNumber}.mp3`; // Adjust to your actual path
    console.log(`Fetching ${note} from ${audioUrl}`);
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${audioUrl}: ${response.status} ${response.statusText}`);
      }
      const audioBlob = await response.blob();
      cache[note] = audioBlob;
      console.log(`Successfully cached ${note}`);
    } catch (error) {
      console.error(`Error caching ${note}: ${error.message}`);
      cache[note] = null;
    }
  });

  await Promise.all(remainingPromises);
  console.log('All notes completed, total cached:', Object.keys(cache).length);
  setIsAudioLoaded(true);
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
    {!isPriorityAudioLoaded && <p>Loading audio files, please wait...</p>}
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