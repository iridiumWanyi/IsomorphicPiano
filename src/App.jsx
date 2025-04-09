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
  const [arpeggiator1On, setArpeggiator1On] = useState(false);
  const [arpeggiator1Pattern, setArpeggiator1Pattern] = useState('1,2,3,4,5,3,4,5');
  const [arpeggiator1Bpm, setArpeggiator1Bpm] = useState(240);
  const [arpeggiator1Direction, setArpeggiator1Direction] = useState('up');
  const [arpeggiator2On, setArpeggiator2On] = useState(false);
  const [arpeggiator2Pattern, setArpeggiator2Pattern] = useState('1,3,5,6,4,2');
  const [arpeggiator2Bpm, setArpeggiator2Bpm] = useState(180);
  const [arpeggiator2Direction, setArpeggiator2Direction] = useState('down');
  const [customChords, setCustomChords] = useState({
    custom1: [0, 4, 7],
    custom2: [0, 3, 7],
    custom3: [0, 3, 6, 9],
  });
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState('partial');
  const [keyShape, setKeyShape] = useState('rectangle');
  const [keyColorScheme, setKeyColorScheme] = useState('blackWhite'); // Reintroduced
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
      try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${audioUrl}: ${response.status}`);
        const audioBlob = await response.blob();
        const audioUrlObj = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrlObj);
        cache[note] = { audio, blob: audioBlob };
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
      try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${audioUrl}: ${response.status}`);
        const audioBlob = await response.blob();
        const audioUrlObj = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrlObj);
        cache[note] = { audio, blob: audioBlob };
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
    const cached = audioCacheRef.current[note];
    if (cached && cached.audio) {
      const audio = new Audio(cached.audio.src);
      audio.play().catch(err => console.error(`Error playing ${note}:`, err));
    } else {
      console.warn(`Audio not cached for ${note}`);
    }
  };

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const playChord = (chordNotes) => {
    if (!isPriorityAudioLoaded) {
      console.log(`Playback disabled until F2-F5 loaded, attempted: ${chordNotes}`);
      return;
    }

    chordNotes.forEach((note) => {
      const cached = audioCacheRef.current[note];
      if (cached && cached.blob) {
        cached.blob.arrayBuffer().then((arrayBuffer) => {
          audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(audioContext.currentTime);
          }).catch(err => console.error(`Error decoding ${note}:`, err));
        }).catch(err => console.error(`Error converting blob for ${note}:`, err));
      } else {
        console.warn(`Audio not cached for ${note}`);
      }
    });
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
            arpeggiator1On={arpeggiator1On}
            setArpeggiator1On={setArpeggiator1On}
            arpeggiator1Pattern={arpeggiator1Pattern}
            setArpeggiator1Pattern={setArpeggiator1Pattern}
            arpeggiator1Bpm={arpeggiator1Bpm}
            setArpeggiator1Bpm={setArpeggiator1Bpm}
            arpeggiator1Direction={arpeggiator1Direction}
            setArpeggiator1Direction={setArpeggiator1Direction}
            arpeggiator2On={arpeggiator2On}
            setArpeggiator2On={setArpeggiator2On}
            arpeggiator2Pattern={arpeggiator2Pattern}
            setArpeggiator2Pattern={setArpeggiator2Pattern}
            arpeggiator2Bpm={arpeggiator2Bpm}
            setArpeggiator2Bpm={setArpeggiator2Bpm}
            arpeggiator2Direction={arpeggiator2Direction}
            setArpeggiator2Direction={setArpeggiator2Direction}
          />
          <Keyboard
            mode={mode}
            playNote={playNote}
            playChord={playChord}
            arpeggiator1On={arpeggiator1On}
            arpeggiator1Pattern={arpeggiator1Pattern}
            arpeggiator1Bpm={arpeggiator1Bpm}
            arpeggiator1Direction={arpeggiator1Direction}
            arpeggiator2On={arpeggiator2On}
            arpeggiator2Pattern={arpeggiator2Pattern}
            arpeggiator2Bpm={arpeggiator2Bpm}
            arpeggiator2Direction={arpeggiator2Direction}
            customChords={customChords}
            keyboardMode={keyboardMode}
            keyShape={keyShape} // Pass keyShape to Keyboard
          />
          <KeyboardToggle
            keyboardMode={keyboardMode}
            setKeyboardMode={setKeyboardMode}
            keyShape={keyShape}
            setKeyShape={setKeyShape} // Pass keyShape controls
          />
        </>
      )}
    </div>
  );
}

export default App;