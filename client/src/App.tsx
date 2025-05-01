import "bootstrap/dist/css/bootstrap.min.css";
import React, {useEffect, useState} from "react";
import {BrowserRouter as Router, Navigate, Route, Routes, useNavigate} from "react-router-dom";
import {useMediaQuery} from "react-responsive";
import {Container} from "react-bootstrap";
import Loading from "./Loading";
import PageLayout from "./PageLayout";
import LoginPage from "./login/LoginPage";
import SignUpPage from "./signup/SignUpPage";
import SuccessfulSignUpPage from "./signup/SuccessfulSignUpPage";
import ProfilePage from "./profile/ProfilePage";
import EditProfilePage from "./profile/EditProfilePage";
import EditPasswordPage from "./profile/EditPasswordPage";
import UsersListPage from "./users-management/UsersListPage";
import JobsPage from "./jobs/JobsPage";
import TicketsPage from "./tickets/TicketsPage";
import JobPage from "./jobs/JobPage";
import WorkedHoursPage from "./workedHours/WorkedHoursPage";
import WorkedHoursEditMobile from "./workedHours/workedHoursMobile/WorkedHoursEditMobile";
import MonthlyWorkedHoursPage from "./workedHours/monthlyWorkedHours/MonthlyWorkedHoursPage";
import CompanyWorkedHoursPage from "./workedHours/companyWorkedHours/CompanyWorkedHoursPage";
import OrdersPage from "./orders/OrdersPage";
import OrderPDFViewer from "./orders/order-pdf-viewer/OrderPDFViewer";
import DoubleMonthViewPage from "./components/DoubleMonthViewPage";
import {Role, User} from "./models/user";
import {Credentials} from "./models/credentials";
import loginApis from "./api/loginApis";
import userApis from "./api/userApis";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/it";
import dayjsBusinessDays from 'dayjs-business-days2';
import {dayjsBusinessDaysOptions} from "./dayjsBusinessDaysOptions";
import "./App.css";

// set up dayjs with localization, durations and business days plugins
dayjs.extend(dayjsBusinessDays, dayjsBusinessDaysOptions);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale("it");

function App() {
    return (
        <Router>
            <App2/>
        </Router>
    );
}

function App2() {
    // user is initially read from local storage to maintain login state between page refreshes,
    // but is then always checked by the checkAuth() function (that checks with the server)
    const initialUserJson = localStorage.getItem("user");
    const initialUser = initialUserJson ? JSON.parse(initialUserJson) as User : undefined;
    const [user, setUser] = useState(initialUser);
    const [dirtyUser, setDirtyUser] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const loggedIn = user !== undefined;
    const isAdministrator = user ? (user.role !== Role.user) : false;
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const isMobile = useMediaQuery({maxWidth: 767});

    useEffect(() => {
        if (loggedIn && dirtyUser) {
            userApis.getUser(user.id)
                .then(user => {
                    setUser(user);
                    setDirtyUser(false);
                })
                .catch(err => console.error(err))
        }
    }, [dirtyUser]);

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    // run once, at app load
    useEffect(() => {
        // check if already logged in
        void checkAuth();
    }, []);

    async function checkAuth() {
        setCheckingAuth(true);

        try {
            const user = await loginApis.getUserInfo();
            setUser(user);
        } catch (_err) {
            // do not log it, otherwise error logged before every login
        }

        setCheckingAuth(false);
    }

    function doLogin(credentials: Credentials) {
        loginApis.login(credentials)
            .then(user => {
                setUser(user);
                setMessage("");
                navigate("/");
            })
            .catch(err => {
                console.log(err)
                setMessage(err);
            })
    }

    function doLogout() {
        loginApis.logout()
            .then(() => {
                setUser(undefined);
                setMessage("");
                navigate("/login");
            })
            .catch(err => console.error(err))
    }

    if (checkingAuth) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Loading/>
            </Container>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={loggedIn ? <Navigate to="/"/> :
                <LoginPage loggedIn={loggedIn} doLogin={doLogin} user={user} message={message}/>}/>
            <Route path="/signup/:registrationToken" element={loggedIn ? <Navigate to="/"/> : <SignUpPage/>}/>
            <Route path="/successful-signup" element={loggedIn ? <Navigate to="/"/> : <SuccessfulSignUpPage/>}/>
            <Route path="/order/:orderName/pdf" element={loggedIn ? <OrderPDFViewer/> : <Navigate to="/login"/>}/>
            <Route path="/" element={loggedIn ? <PageLayout user={user}/> : <Navigate to="/login"/>}>
                <Route index element={<Navigate to="/workedHours" replace={true}/>}/>
                <Route path="profile" element={<ProfilePage user={user!} doLogout={doLogout}/>}/>
                <Route path="profile/edit" element={<EditProfilePage user={user!} setDirtyUser={setDirtyUser}/>}/>
                <Route path="profile/password" element={<EditPasswordPage/>}/>
                <Route path="users"
                       element={isAdministrator ? <UsersListPage user={user!} setDirtyUser={setDirtyUser}/> :
                           <Navigate to="/"/>}/>
                <Route path="jobs" element={<JobsPage isAdministrator={isAdministrator}/>}/>
                <Route path="jobs/:jobId" element={isAdministrator ? <JobPage/> : <Navigate to="/"/>}/>
                <Route path="planning" element={<DoubleMonthViewPage page="planning" user={user!}/>}/>
                <Route path="holidayPlan" element={<DoubleMonthViewPage page="holidayPlan" user={user!}/>}/>
                <Route path="workedHours" element={<WorkedHoursPage user={user!}/>}/>
                <Route path="editWorkedHours"
                       element={isMobile ? <WorkedHoursEditMobile user={user!}/> : <Navigate to="/workedHours"/>}/>
                <Route path="monthlyWorkedHours" element={<MonthlyWorkedHoursPage/>}/>
                <Route path="companyWorkedHours" element={<CompanyWorkedHoursPage/>}/>
            </Route>
        </Routes>
    );
}

export default App;
