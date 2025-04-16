import React, { useState, useEffect, useRef } from 'react';
import Keyboard from './components/Keyboard';
import { ChordControls } from './components/ChordControls';
import { KeyboardToggle } from './components/KeyboardControls';
import { ArpeggiatorControls } from './components/ArpeggiatorControls';
import ChordProgression from './components/ChordProgression';
import { chromaticScale, noteToFileNumber, chordIntervals } from './constants';
import './App.css';

const noteToChromaticIndex = {};
chromaticScale.forEach((note, index) => {
  noteToChromaticIndex[note] = index;
});

function App() {
  const [mode, setMode] = useState('single');
  const [arpeggiator1On, setArpeggiator1On] = useState(false);
  const [arpeggiator1Pattern, setArpeggiator1Pattern] = useState('1,3,4,5');
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
  const [BlockChord1, setBlockChord1] = useState(false);
  const [BlockChord2, setBlockChord2] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chordProgression, setChordProgression] = useState([]);
  const [progressionVolume, setProgressionVolume] = useState(.6);
  const [isButtonStop, setIsButtonStop] = useState(false);

  const audioCacheRef = useRef({});
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());

  useEffect(() => {
    preloadAudioFiles();
  }, []);

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

  const playNote = (note, volume = 1, isSustainPedalOn = false) => {
    if (!isPriorityAudioLoaded) {
      console.log(`Playback disabled until F2-F5 loaded, attempted: ${note}`);
      return;
    }

    console.log(`Attempting to play note: ${note} (index: ${noteToChromaticIndex[note]}, file: ${noteToFileNumber[note]})`);

    const audioContext = audioContextRef.current;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = Math.max(0, Math.min(1, volume));
    gainNode.connect(audioContext.destination);

    const cached = audioCacheRef.current[note];
    if (cached && cached.blob) {
      console.log(`Audio cached for ${note}, proceeding to decode`);
      cached.blob.arrayBuffer()
        .then((arrayBuffer) => {
          audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(gainNode);

            const startTime = audioContext.currentTime;

            if (isSustainPedalOn) {
              gainNode.gain.setValueAtTime(volume, startTime);
              gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 5.0);
            } else {
              gainNode.gain.setValueAtTime(volume, startTime);
              gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.0);
            }

            source.start(startTime);
            console.log(`Playing ${note} at ${startTime}`);

            source.onended = () => {
              source.disconnect();
              gainNode.disconnect();
              console.log(`Playback ended for ${note}`);
            };
          }).catch(err => {
            console.error(`Error decoding audio for ${note}:`, err);
          });
        })
        .catch(err => {
          console.error(`Error converting blob to arrayBuffer for ${note}:`, err);
        });
    } else {
      console.warn(`No audio cached for ${note} (index: ${noteToChromaticIndex[note]})`);
    }
  };

  const playChord = (chordNotes, volume = 1) => {
    if (!isPriorityAudioLoaded) {
      console.log(`Playback disabled until F2-F5 loaded, attempted: ${chordNotes}`);
      return;
    }

    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.value = Math.max(0, Math.min(1, volume));
    gainNode.connect(audioContextRef.current.destination);

    chordNotes.forEach((note) => {
      const cached = audioCacheRef.current[note];
      if (cached && cached.blob) {
        cached.blob.arrayBuffer().then((arrayBuffer) => {
          audioContextRef.current.decodeAudioData(arrayBuffer, (buffer) => {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(gainNode);
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
      setChordProgression([]);
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutIds = useRef([]);

  const playProgression = () => {
    if (chordProgression.length === 0) return;

    const bpm = arpeggiator1Bpm;
    const duration = (60000 / bpm) * 4;

    let index = 0;
    const playNextChord = () => {
      if (index >= chordProgression.length * 5) {
        return;
      }

      const chord = chordProgression[index % chordProgression.length];
      if (chord.arpeggioPattern && !chord.BlockChord) {
        const arpeggioNotes = getArpeggioNotes(chord);
        const noteDuration = 60000 / bpm;
        let step = 0;
        const playArpeggioNote = () => {
          if (step >= arpeggioNotes.length) return;
          playNote(arpeggioNotes[step], progressionVolume);
          step++;
          if (step < arpeggioNotes.length) {
            const timeoutId = setTimeout(playArpeggioNote, noteDuration);
            timeoutIds.current.push(timeoutId);
          }
        };
        playArpeggioNote();
        const timeoutId = setTimeout(() => {
          index++;
          playNextChord();
        }, arpeggioNotes.length * noteDuration);
        timeoutIds.current.push(timeoutId);
      } else {
        const chordNotes = getChordNotes(chord);
        playChord(chordNotes, progressionVolume);
        const timeoutId = setTimeout(() => {
          index++;
          playNextChord();
        }, duration);
        timeoutIds.current.push(timeoutId);
      }
    };

    if (isPlaying) {
      timeoutIds.current.forEach((id) => clearTimeout(id));
      timeoutIds.current = [];
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playNextChord();
    }
  };

  const handlePlayButtonClick = () => {
    setIsButtonStop(!isButtonStop);
    playProgression();
  };

  const getChordNotes = ({ rootNote, chordType }) => {
    const baseIndex = chromaticScale.indexOf(rootNote);
    if (baseIndex === -1) return [rootNote];

    let intervals = chordIntervals[chordType] || [0];
    if (chordType.startsWith('custom') && customChords[chordType]) {
      intervals = customChords[chordType];
    }

    return intervals.map(interval => {
      const targetIndex = baseIndex + interval;
      return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : null;
    }).filter(n => n);
  };

  const getArpeggioNotes = ({ rootNote, chordType, arpeggioPattern, arpeggioDirection }) => {
    const chordNotes = getChordNotes({ rootNote, chordType });
    if (chordNotes.length === 0) return [];

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
            BlockChord1={BlockChord1}
            setBlockChord1={setBlockChord1}
            BlockChord2={BlockChord2}
            setBlockChord2={setBlockChord2}
          />
          <div className="progression-controls">
            <button
              className={isRecording ? 'active' : ''}
              onClick={toggleRecording}
              disabled={false}
            >
              {isRecording ? 'Stop Recording' : 'Record Chord Progression'}
            </button>
            <ChordProgression progression={chordProgression} />
            <button
              onClick={handlePlayButtonClick}
              disabled={isRecording || chordProgression.length === 0}
            >
              {isButtonStop ? 'Stop' : 'Play'}
            </button>
            <span className="help-chordProgression">?</span>
            <div className="volume-control">
              <label>Playback Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={progressionVolume}
                onChange={(e) => setProgressionVolume(parseFloat(e.target.value))}
              />
            </div>
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
            BlockChord1={BlockChord1}
            BlockChord2={BlockChord2}
            isRecording={isRecording}
            setChordProgression={setChordProgression}
            audioContext={audioContextRef.current}
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