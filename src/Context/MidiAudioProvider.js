import { useState, useEffect, createContext, useContext } from 'react'
import{ Midi, Chord } from "tonal"

export const MidiAudioCtx = createContext(null)

export const MidiAudioProvider = function(props) {
    const[note, setNote] = useState([])
    const[command, setCommand] = useState([])
    const[velocity, setVelocity] = useState([])
    const[midiNote, setMidiNote] = useState([])

    window.AudioContext = window.AudioContext || window.webkitAudioContext

    const ctx = new AudioContext()
    const oscillators ={}

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
        const command = input.data[0]
        const note = input.data[1]
        const velocity = input.data[2]
        const midiNote = Midi.midiToNoteName(note)
        console.log(midiNote)
        //const chord = Chord.detect([midiNote.toString()])
        //console.log(chord)

        
        switch(command) {
            case 144: //note on
            if(velocity > 0) {
              noteOn(note, velocity)
              
            } else {
              noteOff(note)
            }
            break
            case 128: //note off
            noteOff(note)
            break 
        }
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
        note,
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
