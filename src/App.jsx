import React, { useState, useEffect, useRef } from 'react';
import Keyboard from './components/Keyboard';
import { ChordControls } from './components/ChordControls';
import { KeyboardToggle } from './components/KeyboardControls';
import { ArpeggiatorControls } from './components/ArpeggiatorControls';
import ChordProgression from './components/ChordProgression';
import { chromaticScale, noteToFileNumber, computeChordNotes } from './constants';
import './App.css';

const noteToChromaticIndex = {};
chromaticScale.forEach((note, index) => {
  noteToChromaticIndex[note] = index;
});

function App() {
  console.log('IsomorphicPiano v0215132 loaded — custom domain path fix active');
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
  const [progressionVolume, setProgressionVolume] = useState(0.6);
  const [isButtonStop, setIsButtonStop] = useState(false);
  const [repeatCount, setRepeatCount] = useState(4);
  const [lowestKey, setLowestKey] = useState('C3');
  const [highestKey, setHighestKey] = useState('C5');
  const [rangeError, setRangeError] = useState('');
  const [inversionState, setInversionState] = useState(1);

  const audioCacheRef = useRef({});
  const audioContextRef = useRef(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

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
      const audioUrl = `${process.env.PUBLIC_URL}/audio/${fileNumber}.mp3`;
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
      const audioUrl = `${process.env.PUBLIC_URL}/audio/${fileNumber}.mp3`;
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
      console.log(`Playback disabled until audio files loaded, attempted: ${note}`);
      return;
    }

    const audioContext = getAudioContext();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = Math.max(0, Math.min(1, volume));
    gainNode.connect(audioContext.destination);

    const cached = audioCacheRef.current[note];
    if (!cached) {
      console.warn(`No audio cached for ${note}`);
      return;
    }

    const play = (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      const startTime = audioContext.currentTime;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + (isSustainPedalOn ? 5.0 : 3.0));
      source.start(startTime);
      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
      };
    };

    if (cached.buffer) {
      play(cached.buffer);
    } else if (cached.blob) {
      cached.blob.arrayBuffer()
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(buffer => {
          cached.buffer = buffer;
          play(buffer);
        })
        .catch(err => console.error(`Error playing ${note}:`, err));
    }
  };

  const playChord = (chordNotes, volume = 1) => {
    if (!isPriorityAudioLoaded) {
      console.log(`Playback disabled until audio files loaded, attempted: ${chordNotes}`);
      return;
    }

    const audioContext = getAudioContext();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = Math.max(0, Math.min(1, volume));
    gainNode.connect(audioContext.destination);

    chordNotes.forEach((note) => {
      const cached = audioCacheRef.current[note];
      if (!cached) {
        console.warn(`Audio not cached for ${note}`);
        return;
      }
      const play = (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNode);
        source.start(audioContext.currentTime);
      };
      if (cached.buffer) {
        play(cached.buffer);
      } else if (cached.blob) {
        cached.blob.arrayBuffer()
          .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
          .then(buffer => {
            cached.buffer = buffer;
            play(buffer);
          })
          .catch(err => console.error(`Error playing ${note}:`, err));
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
    const countdownInterval = (60000 / bpm) * 2; // Interval for countdown notes

    let index = 0;
    const playNextChord = () => {
      if (index >= chordProgression.length * repeatCount) {
        timeoutIds.current.forEach((id) => clearTimeout(id));
        timeoutIds.current = [];
        setIsPlaying(false);
        setIsButtonStop(false); // Reset to "Play" when finished
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
        const chordNotes = computeChordNotes(chord.rootNote, chord.chordType, customChords, chord.inversionState);
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
      setIsButtonStop(false);
    } else {
      setIsPlaying(true);
      setIsButtonStop(true);
      // Determine countdown note based on first chord
      let countdownNote = 'E4'; // Fallback
      if (chordProgression.length > 0) {
        const firstChord = chordProgression[0];
        let baseNote;
        if (firstChord.arpeggioPattern && !firstChord.BlockChord) {
          const arpeggioNotes = getArpeggioNotes(firstChord);
          baseNote = arpeggioNotes[0] || firstChord.rootNote;
        } else {
          baseNote = firstChord.rootNote;
        }
        const baseIndex = chromaticScale.indexOf(baseNote);
        if (baseIndex !== -1 && baseIndex + 12 < chromaticScale.length) {
          countdownNote = chromaticScale[baseIndex + 12];
        }
      }
      // Play 4 countdown notes with the determined note
      for (let i = 0; i < 4; i++) {
        const timeoutId = setTimeout(() => {
          playNote(countdownNote, progressionVolume);
        }, i * countdownInterval);
        timeoutIds.current.push(timeoutId);
      }
      // Start progression after 4 countdown notes plus one more interval
      const timeoutId = setTimeout(() => {
        playNextChord();
      }, 4 * countdownInterval);
      timeoutIds.current.push(timeoutId);
    }
  };

  const handlePlayButtonClick = () => {
    playProgression();
  };

  const getArpeggioNotes = ({ rootNote, chordType, arpeggioPattern, arpeggioDirection, inversionState: chordInversionState }) => {
    const chordNotes = computeChordNotes(rootNote, chordType, customChords, chordInversionState);
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
      {!isPriorityAudioLoaded && (
        <div className="loading-container">
          <p>Loading priority audio files...</p>
        </div>
      )}
      {isPriorityAudioLoaded && !isAudioLoaded && (
        <div className="loading-container">
          <p>Loading remaining audio files...</p>
        </div>
      )}
      {isPriorityAudioLoaded && (
        <>
          <ChordControls
            mode={mode}
            setMode={setMode}
            customChords={customChords}
            setCustomChords={setCustomChords}
            inversionState={inversionState}
            setInversionState={setInversionState}
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
              className={`play-button ${isButtonStop}`}
            >
              {isButtonStop ? '■' : '▶'}
            </button>            
            <span className="help-chordProgression">?</span>
            <div className="repeat-control">
              <label>Repeat<br /> Count:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={repeatCount}
                onChange={(e) => setRepeatCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div className="volume-control">
              <label>Playback<br /> Volume:</label>
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
          {rangeError && (
            <span className="range-error">{rangeError}</span>
          )}
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
            lowestKey={lowestKey}
            highestKey={highestKey}
            setRangeError={setRangeError}
            inversionState={inversionState}
          />
          <KeyboardToggle
            keyboardMode={keyboardMode}
            setKeyboardMode={setKeyboardMode}
            setLowestKey={setLowestKey}
            setHighestKey={setHighestKey}
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