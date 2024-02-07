import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Routes, Route, useNavigate, Navigate} from 'react-router-dom';
import PageLayout from "./PageLayout";
import LoginPage from "./login/LoginPage";
import loginApis from "./api/loginApis";
import './App.css';
import SignUpPage from "./signup/SignUpPage";
import SuccessfulSignUpPage from "./signup/SuccessfulSignUpPage";
import {User} from "./models/user";
import ProfilePage from "./profile/ProfilePage";
import EditProfilePage from "./profile/EditProfilePage";
import {Credentials} from "./models/credentials";
import profileApis from "./api/profileApis";

function App() {
    return (
        <Router>
            <App2/>
        </Router>
    );
}

function App2() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [dirtyUser, setDirtyUser] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (loggedIn && dirtyUser) {
            profileApis.getUser(user!.id)
                .then(user => {
                    setUser(user);
                    setDirtyUser(false);
                })
                .catch(err => console.error(err))
        }
    }, [dirtyUser]);

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
            <Route path='/login' element={loggedIn ? <Navigate to='/'/> :
                <LoginPage loggedIn={loggedIn} doLogin={doLogin} user={user} message={message}/>}/>
            <Route path='/signup/:registrationToken' element={loggedIn ? <Navigate to='/'/> : <SignUpPage/>}/>
            <Route path='/successful-signup' element={<SuccessfulSignUpPage/>}/>
            <Route path='/' element={loggedIn ? <PageLayout user={user!}/> : <Navigate to='/login'/>}>
                <Route index element={<p>ciao</p>}/>
                <Route path='profile' element={<ProfilePage user={user!} />} />
                <Route path='profile/edit' element={<EditProfilePage user={user!} setDirtyUser={setDirtyUser} />}/>
            </Route>
        </Routes>
    );
}

export default App;
