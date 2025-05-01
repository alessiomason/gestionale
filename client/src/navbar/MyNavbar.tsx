import {useEffect, useState} from "react";
import {Col, Navbar, Offcanvas, Row} from 'react-bootstrap';
import {Link, useNavigate} from 'react-router-dom';
import {useMediaQuery} from "react-responsive";
import {
    BarChartSteps,
    CalendarEvent,
    CalendarRange,
    CalendarWeek,
    JournalBookmarkFill,
    PersonBadge,
    PersonVcard,
    Sun
} from "react-bootstrap-icons";
import LightGlossyButton from "../buttons/LightGlossyButton";
import Hamburger from "../components/Hamburger";
import {Role, User} from "../models/user";
import dailyExpensesApis from "../api/dailyExpensesApis";
import {numberToIcon} from "../functions";
import dayjs from "dayjs";
import logo from '../images/logos/logo.png';
import './MyNavbar.css';

const appVersion = require("../../package.json").version;

interface NavbarProps {
    readonly user: User
}

function MyNavbar(props: NavbarProps) {
    const navigate = useNavigate();
    const isMobile = useMediaQuery({maxWidth: 767});
    const isTablet = useMediaQuery({minWidth: 768, maxWidth: 1224});
    const isDesktop = useMediaQuery({minWidth: 1225});
    const isAdministrator = props.user.role !== Role.user;

    const [holidayNotifications, setHolidayNotifications] = useState(0);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    useEffect(() => {
        if (isAdministrator) {
            dailyExpensesApis.getPendingHolidayHours()
                .then(nPending => setHolidayNotifications(nPending))
                .catch(err => console.error(err));
        }
    }, []);

    return (
        <Navbar className="navbar fixed-top navbar-padding">
            <Row className="navbar-row">
                <Col className="d-flex align-items-center">
                    <Navbar.Brand className='text' onClick={() => navigate("/")}>
                        <img src={logo} className="brand-image" alt="Logo di Technomake"/>
                    </Navbar.Brand>
                </Col>

                <Col className="d-flex justify-content-end align-items-center">
                    {!isMobile && !isTablet && <>
                        <LightGlossyButton singleLine icon={JournalBookmarkFill} className="me-3"
                                           onClick={() => navigate("/jobs")}>
                            Commesse
                        </LightGlossyButton>
                        <LightGlossyButton singleLine icon={BarChartSteps} className="me-3"
                                           onClick={() => navigate("/planning")}>
                            Pianificazione
                        </LightGlossyButton>
                        <LightGlossyButton singleLine icon={Sun}
                                           secondaryIcon={holidayNotifications === 0 ? undefined : numberToIcon(holidayNotifications)}
                                           className="me-3" onClick={() => navigate("/holidayPlan")}>
                            Piano ferie
                        </LightGlossyButton>
                        {isAdministrator && <LightGlossyButton singleLine icon={CalendarRange} className="me-3"
                                                               onClick={() => navigate("/monthlyWorkedHours")}>
                            Ore mensili
                        </LightGlossyButton>}
                        {isAdministrator && <LightGlossyButton singleLine icon={CalendarWeek} className="me-3"
                                                               onClick={() => navigate("/companyWorkedHours")}>
                            Ore azienda
                        </LightGlossyButton>}
                        <LightGlossyButton singleLine icon={CalendarEvent} className="me-3"
                                           onClick={() => navigate("/workedHours")}>
                            Ore
                        </LightGlossyButton>
                        {!isAdministrator &&
                            <LightGlossyButton singleLine icon={PersonBadge} onClick={() => navigate("/profile")}>
                                {`${props.user.name} ${props.user.surname}`}
                            </LightGlossyButton>}
                    </>}

                    {(isMobile || isTablet || isAdministrator) &&
                        <Hamburger type="hamburger--minus" isActive={showOffcanvas}
                                   onClick={() => setShowOffcanvas(true)}/>}
                </Col>

                <Offcanvas placement="end" show={showOffcanvas} onHide={() => setShowOffcanvas(false)}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>
                            <h3 className="m-0">Gestionale Technomake</h3>
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {isTablet && <Row>
                            <Col>
                                <Link to="/jobs" onClick={() => setShowOffcanvas(false)}
                                      className="my-2 d-flex align-items-center">
                                    <JournalBookmarkFill/>Commesse
                                </Link>
                            </Col>
                        </Row>}
                        {isTablet && <Row>
                            <Col>
                                <Link to="/planning" onClick={() => setShowOffcanvas(false)}
                                      className="my-2 d-flex align-items-center">
                                    <BarChartSteps/>
                                    Pianificazione
                                </Link>
                            </Col>
                        </Row>}
                        {isTablet && <Row>
                            <Col>
                                <Link to="/holidayPlan" onClick={() => setShowOffcanvas(false)}
                                      className="my-2 d-flex align-items-center">
                                    <Sun/>
                                    Piano ferie
                                </Link>
                            </Col>
                        </Row>}
                        {isAdministrator && isTablet && <Row>
                            <Col>
                                <Link to="/monthlyWorkedHours" onClick={() => setShowOffcanvas(false)}
                                      className="my-2 d-flex align-items-center">
                                    <CalendarRange/>
                                    Ore mensili
                                </Link>
                            </Col>
                        </Row>}
                        {isAdministrator && isTablet && <Row>
                            <Col>
                                <Link to="/companyWorkedHours" onClick={() => setShowOffcanvas(false)}
                                      className="my-2 d-flex align-items-center">
                                    <CalendarWeek/>
                                    Ore azienda
                                </Link>
                            </Col>
                        </Row>}
                        {!isDesktop && <Row>
                            <Col>
                                <Link to="/workedHours" onClick={() => setShowOffcanvas(false)}
                                      className="my-2 d-flex align-items-center">
                                    <CalendarEvent/>
                                    Ore
                                </Link>
                            </Col>
                        </Row>}
                        {isDesktop && isAdministrator && <Row>
                            <Col>
                                <Link to="/users" onClick={() => setShowOffcanvas(false)}
                                      className="my-2 d-flex align-items-center">
                                    <PersonVcard/>
                                    Gestione utenti
                                </Link>
                            </Col>
                        </Row>}
                        <Row>
                            <Col>
                                <Link to="/profile" onClick={() => setShowOffcanvas(false)}
                                      className="my-2 d-flex align-items-center">
                                    <PersonBadge/>
                                    {props.user.name} {props.user.surname}
                                </Link>
                            </Col>
                        </Row>

                        <div className="offcanvas-footer w-100 text-center">
                            <p>Gestionale Technomake ({appVersion})</p>
                            <p><a href="https://www.alessiomason.it">© {dayjs().format("YYYY")} Alessio Mason</a></p>
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>
            </Row>
        </Navbar>
    );
}

export default MyNavbar;