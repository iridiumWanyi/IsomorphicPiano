import React, { useState, useEffect } from 'react';
import './Piano.css'; // 样式文件
import Keyboard from './component/keyboard';
import Controls from './component/controls';

const Piano = () => {

  const [currentKeyboardLayout, setCurrentKeyboardLayout] = useState("partial"); // 键盘样式

  return (
    <div id="piano-container">
      <Controls />
      <Keyboard layout={currentKeyboardLayout} />
      <div class="keyboard-toggle-container">
        <button onClick={() => setCurrentKeyboardLayout(currentKeyboardLayout === 'partial' ? 'whole' : 'partial')}>Switch Keyboard</button>
      </div>
    </div>
  );
};

export default Piano;