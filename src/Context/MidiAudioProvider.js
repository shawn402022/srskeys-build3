import { useState, useEffect, createContext, useContext } from 'react'
import{ Midi, Chord } from "tonal"

export const MidiAudioCtx = createContext(null)
const oscillators ={}
export const MidiAudioProvider = function(props) {
    const[notes, setNotes] = useState([])
    const[command, setCommand] = useState([])
    const[velocity, setVelocity] = useState([])
    const[midiNote, setMidiNote] = useState([])

    window.AudioContext = window.AudioContext || window.webkitAudioContext

    const ctx = new AudioContext()
    

    function midiToFreq(number) {
        const a = 440
        return(a/32)*(2 **((number-9) / 12))
        
      }
     
    //console.log(ctx)

    if(navigator.requestMIDIAccess){
        navigator.requestMIDIAccess().then(success, failure)
        }

    function success(midiAccess) {
        //console.log(midiAccess)
        midiAccess.onstatechange = updateDevices

        const inputs = midiAccess.inputs
        //console.log(inputs)

        inputs.forEach((input) => {
            //console.log(input)
            input.onmidimessage = handleInput
        })
    }

    function handleInput(input) {
        //console.log(input.data)
        const command = input.data[0]
        const note = input.data[1]
        const velocity = input.data[2]
        const midiNote = Midi.midiToNoteName(note, {sharps:true})
        const midiChord = []
        midiChord.push(midiNote)

        //const chord = Chord.detect([midiNote.toString()])
        //console.log(chord)
        
        setNotes((prevNotes) =>{
            const newNotes = prevNotes.filter(x => x !== midiNote)
            if(command === 144 && velocity > 0) {
                noteOn(note, velocity)
                return [...newNotes, midiNote]
            } else {
                noteOff(note)
                return newNotes
            }
           

        })
        
       
    }

    function noteOn(note, velocity) {
        //console.log(note, velocity)
        const osc = ctx.createOscillator()
        
        
        const oscGain = ctx.createGain()

        oscGain.gain.value = 0.33
        const velocityGainAmount = (1 / 127 *velocity)
        const velocityGain = ctx.createGain()

        velocityGain.gain.value = velocityGainAmount
        osc.type = 'sine'
        osc.frequency.value = Midi.midiToFreq(note)


        
        osc.connect(oscGain)
        oscGain.connect(velocityGain)
        velocityGain.connect(ctx.destination)

        osc.gain = oscGain
        //console.log(oscGain)
        oscillators[note.toString()] = osc
        console.log(oscillators)


        osc.start()
       

        //console.log(osc)
    }

    function noteOff(note) {
        const osc = oscillators[note.toString()]
        if(!osc){
            return 
        }
        const oscGain = osc.gain

        oscGain.gain.setValueAtTime(oscGain.gain.value, ctx.currentTime)
        oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03)
        
        setTimeout(()=>{
            osc.stop()
            osc.disconnect()
        }, 20)
        
        delete oscillators[note.toString()]
        //console.log(oscillators)
        //console.log(note)
    }

    function updateDevices(event) {
        //console.log(event)
        //console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State, ${event.port.state}, Type: ${event.port.type}` )
    }

    function failure(){
        console.log('could not connect midi')
    }

    const value = {
        notes,
        command,
        velocity,
        midiNote
    }

    return (
        <MidiAudioCtx.Provider value = {value}>
            {props.children}
        </MidiAudioCtx.Provider>

    )
}
