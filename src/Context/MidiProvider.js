import { useState, useEffect, createContext, useContext } from 'react'

export const MidiCtx = createContext(null)

export const MidiProvider = function(props) {
    const[note, setNote] = useState([])
    const[command, setCommand] = useState([])
    const[velocity, setVelocity] = useState([])

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
        console.log(note, velocity)
    }

    function noteOff(note) {
        console.log(note)
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
        velocity
    }

    return (
        <MidiCtx.Provider value = {value}>
            {props.children}
        </MidiCtx.Provider>

    )
}
