import React, { useState, useEffect, useRef } from 'react';
import Keyboard from './components/Keyboard';
import { ChordControls, ArpeggiatorControls, KeyboardToggle } from './components/Controls';
import ChordProgression from './components/ChordProgression'; // New component
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
  const [keyColorScheme, setKeyColorScheme] = useState('blackWhite');
  const [highlightNotes, setHighlightNotes] = useState(['C']);
  const [isPriorityAudioLoaded, setIsPriorityAudioLoaded] = useState(false);
  const [arpeggio1AsChord, setArpeggio1AsChord] = useState(false);
  const [arpeggio2AsChord, setArpeggio2AsChord] = useState(false);
  // New state for recording
  const [isRecording, setIsRecording] = useState(false);
  const [chordProgression, setChordProgression] = useState([]);
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);

  const audioCacheRef = useRef({});
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());

  useEffect(() => {
    preloadAudioFiles();
  }, []);

  const preloadAudioFiles = async () => {
    // ... (unchanged preload logic)
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

  const playChord = (chordNotes) => {
    if (!isPriorityAudioLoaded) {
      console.log(`Playback disabled until F2-F5 loaded, attempted: ${chordNotes}`);
      return;
    }

    chordNotes.forEach((note) => {
      const cached = audioCacheRef.current[note];
      if (cached && cached.blob) {
        cached.blob.arrayBuffer().then((arrayBuffer) => {
          audioContextRef.current.decodeAudioData(arrayBuffer, (buffer) => {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(audioContextRef.current.currentTime);
          }).catch(err => console.error(`Error decoding ${note}:`, err));
        }).catch(err => console.error(`Error converting blob for ${note}:`, err));
      } else {
        console.warn(`Audio not cached for ${note}`);
      }
    });
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setChordProgression([]); // Clear previous progression
    }
  };

  const playProgression = () => {
    if (isPlayingProgression || chordProgression.length === 0) return;
    setIsPlayingProgression(true);

    const bpm = arpeggiator1On ? arpeggiator1Bpm : arpeggiator2On ? arpeggiator2Bpm : 240; // Default to 240 if no arpeggiator
    const duration = (60000 / bpm) * 4; // Assume quarter note per chord

    let index = 0;
    const playNextChord = () => {
      if (index >= chordProgression.length) {
        setIsPlayingProgression(false);
        return;
      }

      const chord = chordProgression[index];
      if (chord.arpeggioPattern && !chord.arpeggioAsChord) {
        // Play as arpeggio
        const arpeggioNotes = getArpeggioNotes(chord);
        const noteDuration = 60000 / bpm;
        let step = 0;
        const playArpeggioNote = () => {
          if (step >= arpeggioNotes.length) return;
          playNote(arpeggioNotes[step]);
          step++;
          if (step < arpeggioNotes.length) {
            setTimeout(playArpeggioNote, noteDuration);
          }
        };
        playArpeggioNote();
        setTimeout(() => {
          index++;
          playNextChord();
        }, arpeggioNotes.length * noteDuration);
      } else {
        // Play as chord
        const chordNotes = getChordNotes(chord);
        playChord(chordNotes);
        setTimeout(() => {
          index++;
          playNextChord();
        }, duration);
      }
    };

    playNextChord();
  };

  // Helper to compute arpeggio notes for playback
  const getArpeggioNotes = ({ rootNote, chordType, arpeggioPattern, arpeggioDirection }) => {
    const baseIndex = chromaticScale.indexOf(rootNote);
    if (baseIndex === -1) return [];

    // Get chord notes based on chordType
    let chordNotes = [];
    switch (chordType) {
      case 'major':
        chordNotes = [0, 4, 7];
        break;
      case 'minor':
        chordNotes = [0, 3, 7];
        break;
      case 'diminished':
        chordNotes = [0, 3, 6];
        break;
      case 'augmented':
        chordNotes = [0, 4, 8];
        break;
      case 'domSeven':
        chordNotes = [0, 4, 7, 10];
        break;
      case 'majSeven':
        chordNotes = [0, 4, 7, 11];
        break;
      case 'minSeven':
        chordNotes = [0, 3, 7, 10];
        break;
      case 'susFour':
        chordNotes = [0, 5, 7];
        break;
      case 'domNine':
        chordNotes = [0, 4, 7, 10, 14];
        break;
      case 'majNine':
        chordNotes = [0, 4, 7, 11, 14];
        break;
      case 'minNine':
        chordNotes = [0, 3, 7, 10, 14];
        break;
      case 'susNine':
        chordNotes = [0, 5, 7, 14];
        break;
      case 'octave':
        chordNotes = [0, 12];
        break;
      case 'single':
        chordNotes = [0];
        break;
      case 'custom1':
      case 'custom2':
      case 'custom3':
        chordNotes = customChords[chordType] || [0];
        break;
      default:
        chordNotes = [0];
    }

    chordNotes = chordNotes.map(interval => {
      const targetIndex = baseIndex + interval;
      return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
    }).filter(n => n);

    // Apply arpeggio pattern
    const patternArray = arpeggioPattern.split(',').filter(x => x !== '').map(Number);
    const maxPatternIndex = Math.max(...patternArray);
    const extendedNotes = Array(maxPatternIndex).fill(null).map((_, i) => {
      const noteIndex = i % chordNotes.length;
      const octaveShift = Math.floor(i / chordNotes.length);
      const baseNoteIndex = chromaticScale.indexOf(chordNotes[noteIndex]);
      const targetIndex = baseNoteIndex + (octaveShift * 12);
      return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
    });

    let arpeggioNotes = patternArray.map(p => extendedNotes[p - 1]).filter(n => n);
    if (arpeggioDirection === 'down') arpeggioNotes.reverse();
    return arpeggioNotes;
  };

  // Helper to compute chord notes for playback
  const getChordNotes = ({ rootNote, chordType }) => {
    const baseIndex = chromaticScale.indexOf(rootNote);
    if (baseIndex === -1) return [rootNote];

    let intervals = [];
    switch (chordType) {
      case 'major':
        intervals = [0, 4, 7];
        break;
      case 'minor':
        intervals = [0, 3, 7];
        break;
      case 'diminished':
        intervals = [0, 3, 6];
        break;
      case 'augmented':
        intervals = [0, 4, 8];
        break;
      case 'domSeven':
        intervals = [0, 4, 7, 10];
        break;
      case 'majSeven':
        intervals = [0, 4, 7, 11];
        break;
      case 'minSeven':
        intervals = [0, 3, 7, 10];
        break;
      case 'susFour':
        intervals = [0, 5, 7];
        break;
      case 'domNine':
        intervals = [0, 4, 7, 10, 14];
        break;
      case 'majNine':
        intervals = [0, 4, 7, 11, 14];
        break;
      case 'minNine':
        intervals = [0, 3, 7, 10, 14];
        break;
      case 'susNine':
        intervals = [0, 5, 7, 14];
        break;
      case 'octave':
        intervals = [0, 12];
        break;
      case 'single':
        intervals = [0];
        break;
      case 'custom1':
      case 'custom2':
      case 'custom3':
        intervals = customChords[chordType] || [0];
        break;
      default:
        intervals = [0];
    }

    return intervals.map(interval => {
      const targetIndex = baseIndex + interval;
      return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
    }).filter(n => n);
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
            arpeggio1AsChord={arpeggio1AsChord}
            setArpeggio1AsChord={setArpeggio1AsChord}
            arpeggio2AsChord={arpeggio2AsChord}
            setArpeggio2AsChord={setArpeggio2AsChord}
          />
          <div className="progression-controls">
            <button
              className={isRecording ? 'active' : ''}
              onClick={toggleRecording}
              disabled={isPlayingProgression}
            >
              {isRecording ? 'Stop Recording' : 'Record Chord Progression'}
            </button>
            <ChordProgression progression={chordProgression} />
            <button
              onClick={playProgression}
              disabled={isRecording || isPlayingProgression || chordProgression.length === 0}
            >
              Play
            </button>
          </div>
          
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
            keyShape={keyShape}
            keyColorScheme={keyColorScheme}
            highlightNotes={highlightNotes}
            arpeggio1AsChord={arpeggio1AsChord}
            arpeggio2AsChord={arpeggio2AsChord}
            isRecording={isRecording}
            setChordProgression={setChordProgression}
          />
          <KeyboardToggle
            keyboardMode={keyboardMode}
            setKeyboardMode={setKeyboardMode}
            keyShape={keyShape}
            setKeyShape={setKeyShape}
            keyColorScheme={keyColorScheme}
            setKeyColorScheme={setKeyColorScheme}
            highlightNotes={highlightNotes}
            setHighlightNotes={setHighlightNotes}
          />
        </>
      )}
    </div>
  );
}

export default App;