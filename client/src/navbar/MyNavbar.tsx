import {Link, useNavigate} from 'react-router-dom';
import {Col, Navbar, Offcanvas, Row} from 'react-bootstrap';
import {useMediaQuery} from "react-responsive";
import './MyNavbar.css';
import horizontalWhiteLogo from '../images/logos/horizontal_white_logo.png';
import {Role, User} from "../models/user";
import LightGlossyButton from "../buttons/LightGlossyButton";
import {
    CalendarEvent,
    CalendarRange,
    CalendarWeek,
    Clipboard,
    JournalBookmarkFill,
    PersonBadge,
    PersonVcard,
    Sun,
    TicketPerforated
} from "react-bootstrap-icons";
import Hamburger from "../components/Hamburger";
import {useState} from "react";

interface NavbarProps {
    readonly user: User
}

function MyNavbar(props: NavbarProps) {
    const navigate = useNavigate();
    const isMobile = useMediaQuery({maxWidth: 767});
    const isTablet = useMediaQuery({minWidth: 768, maxWidth: 1224});
    const isAdministrator = props.user.role !== Role.user;
    const canManageTickets = props.user.managesTickets;
    const canManageOrders = props.user.managesOrders;

    const [showOffcanvas, setShowOffcanvas] = useState(false);

    return (
        <Navbar className="navbar fixed-top navbar-padding">
            <Row className="navbar-row">
                <Col className="d-flex align-items-center">
                    <Navbar.Brand className='text' onClick={() => navigate("/")}>
                        <img src={horizontalWhiteLogo} className="brand-image" alt="Logo di Technomake"/>
                    </Navbar.Brand>
                </Col>

                {(isMobile || isTablet) &&
                    <Col className="d-flex justify-content-end">
                        <Hamburger type="hamburger--minus" isActive={showOffcanvas}
                                   onClick={() => setShowOffcanvas(true)}/>
                    </Col>}
                {(isMobile || isTablet) &&
                    <Offcanvas placement="end" show={showOffcanvas} onHide={() => setShowOffcanvas(false)}>
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>
                                <h3 className="m-0">Gestionale TLF</h3>
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            {canManageTickets && isTablet && <Row>
                                <Col className="my-2 d-flex align-items-center">
                                    <TicketPerforated/>
                                    <Link to="/tickets" onClick={() => setShowOffcanvas(false)}>Assistenza</Link>
                                </Col>
                            </Row>}
                            {canManageTickets && <Row>
                                <Col className="my-2 d-flex align-items-center">
                                    <Clipboard/>
                                    <Link to="/orders" onClick={() => setShowOffcanvas(false)}>Ordini</Link>
                                </Col>
                            </Row>}
                            {isTablet && <Row>
                                <Col className="my-2 d-flex align-items-center">
                                    <JournalBookmarkFill/>
                                    <Link to="/jobs" onClick={() => setShowOffcanvas(false)}>Commesse</Link>
                                </Col>
                            </Row>}
                            {isAdministrator && isTablet && <Row>
                                <Col className="my-2 d-flex align-items-center">
                                    <Sun/>
                                    <Link to="/holidayPlan" onClick={() => setShowOffcanvas(false)}>Piano ferie</Link>
                                </Col>
                            </Row>}
                            {isAdministrator && isTablet && <Row>
                                <Col className="my-2 d-flex align-items-center">
                                    <CalendarRange/>
                                    <Link to="/monthlyWorkedHours" onClick={() => setShowOffcanvas(false)}>Ore mensili</Link>
                                </Col>
                            </Row>}
                            {isAdministrator && isTablet && <Row>
                                <Col className="my-2 d-flex align-items-center">
                                    <CalendarWeek/>
                                    <Link to="/companyWorkedHours" onClick={() => setShowOffcanvas(false)}>Ore azienda</Link>
                                </Col>
                            </Row>}
                            <Row>
                                <Col className="my-2 d-flex align-items-center">
                                    <CalendarEvent/>
                                    <Link to="/workedHours" onClick={() => setShowOffcanvas(false)}>Ore</Link>
                                </Col>
                            </Row>
                            {isTablet && <Row>
                                <Col className="my-2 d-flex align-items-center">
                                    <PersonBadge/>
                                    <Link to="/profile" onClick={() => setShowOffcanvas(false)}>
                                        {props.user.name} {props.user.surname}</Link>
                                </Col>
                            </Row>}
                        </Offcanvas.Body>
                    </Offcanvas>}

                {!isMobile && !isTablet && <Col className="d-flex justify-content-end align-items-center">
                    {canManageTickets && <LightGlossyButton singleLine icon={TicketPerforated} className="me-3"
                                                            onClick={() => navigate("/tickets")}>
                        Assistenza
                    </LightGlossyButton>}
                    {canManageOrders && <LightGlossyButton singleLine icon={Clipboard} className="me-3"
                                                           onClick={() => navigate("/orders")}>
                        Ordini
                    </LightGlossyButton>}
                    <LightGlossyButton singleLine icon={JournalBookmarkFill} className="me-3"
                                       onClick={() => navigate("/jobs")}>
                        Commesse
                    </LightGlossyButton>
                    {isAdministrator && <LightGlossyButton singleLine icon={Sun} className="me-3"
                                                           onClick={() => navigate("/holidayPlan")}>
                        Piano ferie
                    </LightGlossyButton>}
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
                    {isAdministrator &&
                        <LightGlossyButton singleLine icon={PersonVcard} className="me-3"
                                           onClick={() => navigate("/users")}>
                            Gestione utenti
                        </LightGlossyButton>}
                    <LightGlossyButton singleLine icon={PersonBadge} onClick={() => navigate("/profile")}>
                        {`${props.user.name} ${props.user.surname}`}
                    </LightGlossyButton>
                </Col>}
            </Row>
        </Navbar>
    );
}

export default MyNavbar;