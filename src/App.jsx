import React, { useState, useEffect, useRef } from 'react';
import Keyboard from './components/Keyboard';
import { ChordControls, ArpeggiatorControls, KeyboardToggle } from './components/Controls';
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
  });
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState('partial');
  const [isPriorityAudioLoaded, setIsPriorityAudioLoaded] = useState(false);

  useEffect(() => {
    preloadAudioFiles();
  }, []);

  const audioCacheRef = useRef({});

  const preloadAudioFiles = async () => {
    const cache = audioCacheRef.current;
    const allNotes = Object.keys(noteToFileNumber);
    const priorityNotes = chromaticScale.slice(
      chromaticScale.indexOf('F2'),
      chromaticScale.indexOf('F5') + 1
    );
    const otherNotes = allNotes.filter(note => !priorityNotes.includes(note));

    console.log('Starting preload, priority notes:', priorityNotes);

    const priorityPromises = priorityNotes.map(async (note) => {
      const fileNumber = noteToFileNumber[note];
      const audioUrl = `/audio/${fileNumber}.mp3`;
      console.log(`Fetching ${note} from ${audioUrl}`);
      try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${audioUrl}: ${response.status}`);
        const audioBlob = await response.blob();
        cache[note] = audioBlob;
        console.log(`Successfully cached ${note}`);
      } catch (error) {
        console.error(`Error caching ${note}:`, error.message);
        cache[note] = null;
      }
    });

    await Promise.all(priorityPromises);
    const priorityLoaded = priorityNotes.every(note => cache[note] !== null && cache[note] !== undefined);
    setIsPriorityAudioLoaded(priorityLoaded);
    console.log('Priority notes completed, all loaded:', priorityLoaded);

    const remainingPromises = otherNotes.map(async (note) => {
      const fileNumber = noteToFileNumber[note];
      const audioUrl = `/audio/${fileNumber}.mp3`;
      console.log(`Fetching ${note} from ${audioUrl}`);
      try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${audioUrl}: ${response.status}`);
        const audioBlob = await response.blob();
        cache[note] = audioBlob;
        console.log(`Successfully cached ${note}`);
      } catch (error) {
        console.error(`Error caching ${note}:`, error.message);
        cache[note] = null;
      }
    });

    await Promise.all(remainingPromises);
    console.log('All notes completed, total cached:', Object.keys(cache).length);
    setIsAudioLoaded(true);
  };

  const playNote = (note) => {
    if (!isPriorityAudioLoaded) {
      console.log(`Playback disabled until F2-F5 loaded, attempted: ${note}`);
      return;
    }
    const audioBlob = audioCacheRef.current[note];
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error(`Error playing ${note}:`, err));
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } else {
      console.warn(`Audio not cached for ${note}`);
    }
  };

  return (
    <div className="app">
      <h1>Isomorphic Piano Simulator</h1>
      {!isPriorityAudioLoaded && <p>Loading audio files, please wait...</p>}
      {isPriorityAudioLoaded && (
        <>
          <ChordControls
            mode={mode}
            setMode={setMode}
            customChords={customChords}
            setCustomChords={setCustomChords}
          />
          <ArpeggiatorControls
            arpeggiatorOn={arpeggiatorOn}
            setArpeggiatorOn={setArpeggiatorOn}
            arpeggiatorPattern={arpeggiatorPattern}
            setArpeggiatorPattern={setArpeggiatorPattern}
            arpeggiatorBpm={arpeggiatorBpm}
            setArpeggiatorBpm={setArpeggiatorBpm}
            arpeggiatorDirection={arpeggiatorDirection}
            setArpeggiatorDirection={setArpeggiatorDirection}
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
          <KeyboardToggle
            keyboardMode={keyboardMode}
            setKeyboardMode={setKeyboardMode}
          />
        </>
      )}
    </div>
  );
}

export default App;