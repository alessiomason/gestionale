import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";

async function get() {
  let res =  await fetch(new URL("http://localhost:3001/ping"))
  return res.json()
}

function App() {
  const [text, setText] = useState("initial");

  useEffect(() => {
    get()
        .then(res => setText(res))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {text}
        </p>
      </header>
    </div>
  );
}

export default App;
