import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';

async function get() {
  const base_url = process.env.NODE_ENV === "production" ? "https://tm-gestionale-d0730417ec44.herokuapp.com" : "http://localhost";
  const port = process.env.NODE_ENV === "production" ? 443 : 3001;
  let res =  await fetch(new URL(`${base_url}:${port}/api/system/pingDB`))
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
        <p>DB: {text}</p>
      </header>
    </div>
  );
}

export default App;
