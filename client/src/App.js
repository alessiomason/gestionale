import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";

async function get() {
  const port = process.env.PORT || 3001;
  let res =  await fetch(new URL(`http://localhost:${port}/ping`))
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
