export default function Startbtn() {



    const clickHandler = () => console.log('clicked')

    return(
      <button onClick={clickHandler}>
          Start
          {}
      </button>
    )
}

