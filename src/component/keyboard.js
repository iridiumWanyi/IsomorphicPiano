import React, { useState, useEffect } from 'react';
import './Keyboard.css';
import * as constants from './constants.js'

const chordIntervals = {
  octave: [0, 12],
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  domSeven: [0, 4, 7, 10],
  majSeven: [0, 4, 7, 11],
  minSeven: [0, 3, 7, 10],
  susSeven: [0, 5, 7, 10],
  domNine: [0, 4, 7, 10, 14],
  majNine: [0, 4, 7, 11, 14],
  minNine: [0, 3, 7, 10, 14],
  susNine: [0, 5, 7, 10, 14],
};

// 模拟 chromaticScale（音符到索引的映射）
const chromaticScale = [
  'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6',
];
const noteToChromaticIndex = chromaticScale.reduce((acc, note, index) => {
  acc[note] = index;
  return acc;
}, {});

const modeColors = {
  single: '#d3d3d3',
  major: '#ff9999',
  minor: '#99ccff',
  // 可根据需要扩展其他模式的颜色
};

const Keyboard = ({ layout }) => {
  // 状态管理
  const [currentMode, setCurrentMode] = useState('single'); // 默认单音模式
  const [keyElements, setKeyElements] = useState([]); // 存储所有键的引用
  const [lastClickedPosition, setLastClickedPosition] = useState(null);
  const [audioMap] = useState(() => {
    const map = {};
    Object.keys(constants.noteToFileNumber).forEach((note) => {
      const fileNumber = constants.noteToFileNumber[note];
      map[note] = new Audio(`/sounds/${fileNumber}.mp3`); // 需要实际音频文件
    });
    return map;
  });

  // 清理悬浮高亮
  const clearHoverHighlights = () => {
    keyElements.forEach((key) => {
      key.classList.remove('hover-highlight');
      if (!key.classList.contains('active-highlight')) {
        key.style.backgroundColor = key.classList.contains('dark') ? '#555' : '#fff';
      }
    });
  };

  // 查找最近的键
  const findClosestKey = (note, referenceRow, referenceCol) => {
    const matchingKeys = keyElements.filter((key) => key.dataset.note === note);
    if (matchingKeys.length === 0) return null;

    let closestKey = matchingKeys[0];
    let minDistance = Infinity;
    matchingKeys.forEach((key) => {
      const keyRow = parseInt(key.dataset.row);
      const keyCol = parseInt(key.dataset.col);
      const distance = Math.abs(keyRow - referenceRow) + Math.abs(keyCol - referenceCol);
      if (distance < minDistance) {
        minDistance = distance;
        closestKey = key;
      }
    });
    return closestKey;
  };

  // 获取和弦的键
  const getChordKeys = (note, row, col) => {
    const intervals = chordIntervals[currentMode] || [0];
    const baseIndex = noteToChromaticIndex[note];
    const chordNotes = intervals.map((interval) => {
      const targetIndex = baseIndex + interval;
      return targetIndex < chromaticScale.length ? chromaticScale[targetIndex] : note;
    });

    return chordNotes
      .map((chordNote) => findClosestKey(chordNote, row, col))
      .filter((key) => key !== null);
  };

  // 播放单音
  const playNote = (note, referenceRow, referenceCol) => {
    const audio = audioMap[note];
    if (!audio) {
      console.error(`Audio for note ${note} not found in audioMap`);
      return;
    }

    audio.currentTime = 0;
    audio.play().catch((error) => console.error(`Error playing note ${note}:`, error));

    const closestKey = findClosestKey(note, referenceRow, referenceCol);
    if (closestKey) {
      const highlightColor = modeColors[currentMode] || '#d3d3d3';
      closestKey.classList.add('active-highlight');
      closestKey.style.backgroundColor = highlightColor;
      setTimeout(() => {
        closestKey.classList.remove('active-highlight');
        if (!closestKey.classList.contains('hover-highlight')) {
          closestKey.style.backgroundColor = closestKey.classList.contains('dark') ? '#555' : '#fff';
        }
      }, 300);
    }
  };

  // 播放和弦（简化为同时播放，未实现琶音）
  const playChord = (note, row, col) => {
    const chordKeys = getChordKeys(note, row, col);
    const audioElements = chordKeys
      .map((chordKey) => {
        const note = chordKey.dataset.note;
        const originalAudio = audioMap[note];
        if (!originalAudio) {
          console.error(`Audio for note ${note} not found in audioMap`);
          return null;
        }
        const audio = new Audio(originalAudio.src);
        audio.currentTime = 0;
        return audio;
      })
      .filter(Boolean);

    audioElements.forEach((audio) => {
      audio.play().catch((error) => console.error(`Error playing audio:`, error));
    });

    chordKeys.forEach((chordKey) => {
      const closestKey = findClosestKey(chordKey.dataset.note, row, col);
      if (closestKey) {
        const highlightColor = modeColors[currentMode] || '#d3d3d3';
        closestKey.classList.add('active-highlight');
        closestKey.style.backgroundColor = highlightColor;
        setTimeout(() => {
          closestKey.classList.remove('active-highlight');
          if (!closestKey.classList.contains('hover-highlight')) {
            closestKey.style.backgroundColor = closestKey.classList.contains('dark') ? '#555' : '#fff';
          }
        }, 300);
      }
    });
  };

  // 处理点击事件
  const handleKeyClick = (note, rowIndex, colIndex) => {
    setLastClickedPosition({ row: rowIndex, col: colIndex });
    clearHoverHighlights();
    if (currentMode === 'single') {
      playNote(note, rowIndex, colIndex);
    } else {
      playChord(note, rowIndex, colIndex);
    }
  };

  // 处理鼠标悬浮
  const handleKeyMouseOver = (note, rowIndex, colIndex) => {
    if (currentMode !== 'single') {
      clearHoverHighlights();
      const chordKeys = getChordKeys(note, rowIndex, colIndex);
      const highlightColor = modeColors[currentMode] || '#d3d3d3';
      chordKeys.forEach((chordKey) => {
        chordKey.classList.add('hover-highlight');
        chordKey.style.backgroundColor = highlightColor;
      });
    }
  };

  const handleKeyMouseOut = (note, rowIndex, colIndex) => {
    if (currentMode !== 'single') {
      const chordKeys = getChordKeys(note, rowIndex, colIndex);
      chordKeys.forEach((chordKey) => {
        if (!chordKey.classList.contains('active-highlight')) {
          chordKey.classList.remove('hover-highlight');
          chordKey.style.backgroundColor = chordKey.classList.contains('dark') ? '#555' : '#fff';
        }
      });
    }
  };

  // 渲染键盘
  const buildKeyboard = (layout) => {

    const keyboardRows = layout.map((row, rowIndex) => (
      <div
        key={rowIndex}
        className={`row ${rowIndex < 2 ? 'lower-section' : 'upper-section'}`}
      >
        {row.map((note, colIndex) => {
          const keyRef = (el) => {
            if (el && !keyElements.includes(el)) {
              setKeyElements((prev) => [...prev, el]);
            }
          };
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              ref={keyRef}
              className={`key ${note.includes('#') ? 'dark' : 'white'}`}
              data-note={note}
              data-row={rowIndex}
              data-col={colIndex}
              onClick={() => handleKeyClick(note, rowIndex, colIndex)}
              onMouseOver={() => handleKeyMouseOver(note, rowIndex, colIndex)}
              onMouseOut={() => handleKeyMouseOut(note, rowIndex, colIndex)}
            >
              {note}
            </div>
          );
        })}
      </div>
    ));
    return keyboardRows;
  };

  return (
    <div className="keyboard partial">
      {buildKeyboard(layout == "partial" ? constants.partialKeyboardLayout : constants.wholeKeyboardLayout)}
    </div>
  );
};

export default Keyboard;