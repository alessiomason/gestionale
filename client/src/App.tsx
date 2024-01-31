import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import PageLayout from "./PageLayout";
import LoginPage from "./login/LoginPage";
import loginApis, {Credentials} from "./api/loginApis";
import './App.css';
import SignUpPage from "./signup/SignUpPage";
import SuccessfulSignUpPage from "./signup/SuccessfulSignUpPage";

function App() {
    return (
        <Router>
            <App2 />
        </Router>
    );
}

function App2() {
    const [text, setText] = useState("initial");
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    function doLogin(credentials: Credentials) {
        loginApis.login(credentials)
            .then(user => {
                setLoggedIn(true);
                setUser(user);
                setMessage('');
                navigate('/');
            })
            .catch(err => {
                console.log(err)
                setMessage(err);
            })
    }

    return (
        <Routes>
            <Route path='/login' element={loggedIn ? <Navigate to='/' /> : <LoginPage loggedIn={loggedIn} doLogin={doLogin} user={user} message={message} />} />
            <Route path='/signup/:registrationToken' element={loggedIn ? <Navigate to='/' /> : <SignUpPage />} />
            <Route path='/successful-signup' element={<SuccessfulSignUpPage />} />
            <Route path='/' element={loggedIn ? <PageLayout /> : <Navigate to='/login' />}>
                <Route index element={<p>ciao</p>} />
            </Route>
        </Routes>
    );
}

export default App;
