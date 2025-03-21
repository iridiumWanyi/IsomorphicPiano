Isomorphic Piano Simulator
A web-based isomorphic keyboard simulator that allows users to play notes, chords, and arpeggios with customizable layouts and user-defined chords. 

Features
Isomorphic(Janko) Keyboard Layout
Chord Modes: Play predefined chords (e.g., Major, Minor, Dominant 7, Major 9) with a single key press.
Custom Chords: Define up to four custom chords with user-specified intervals (e.g., "0,4,7" is the major chord).
Arpeggiator: Toggle an arpeggiator with adjustable BPM and pattern (e.g., "12345345" inspired by BWV 846).

## Prerequisites
- A modern web browser (e.g., Chrome, Firefox).
- A local server (e.g., VS Code’s Live Server) to avoid CORS issues with audio file loading.

## Setup
**Clone or Download**: Get the project files to your local machine.

## Usage
 **Launch**: Open `index.html` via your local server.

## Customization
- **Add Chords**: Edit `chords.js`’s `getChordKeys` function to define new chord patterns.
- **Styling**: Modify `styles.css` for colors, key sizes, or layout tweaks.
- **Audio**: Replace `audio/` files with your own, ensuring filenames match `noteToFileNumber`.

## Notes
- The Isomorphic (Janko) layout’s unique geometry affects chord calculations—verify intervals in `chords.js` if chords sound off.
- Audio files must be present and correctly named, or playback will fail silently (check console for errors).

## Contributing
Feel free to fork, tweak, or submit pull requests! Ideas:
- More chord types (e.g., ninth).
- Adjustable tempo for music samples.
- Visual chord diagrams on hover.

## License
This project is open-source under the MIT License—use it freely, just credit Ivanium where appropriate.

---
Built with ♥ by Ivanium, with assistance from Grok (xAI), March 2025.