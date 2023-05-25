import logo from './logo.svg';
import './App.css';
import Startbtn from './Components/Startbtn';
import {useContext} from 'react'
import { MidiAudioCtx } from './Context/MidiAudioProvider';
import { detect } from "@tonaljs/chord-detect"


function App() {
  const {notes} = useContext(MidiAudioCtx)
  //const chord = detect(notes.map(note => note.replace(/[0-9]/g,""))).join(",")
  const chord = detect(notes).join(",")
  console.log(chord)
  return (
    <div className="App">
      <Startbtn />
      <div>
        {notes.join(' - ')}
      </div>
      <div>
        chord: {chord}
      </div>
    </div>
  );
}

export default App;
