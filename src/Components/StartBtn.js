export default function StartBtn() {



    const clickHandler = () => console.log('clicked')

    return(
      <button onClick={clickHandler}>
          Start
          {}
      </button>
    )
}

