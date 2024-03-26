import {useNavigate} from 'react-router-dom';
import {Col, Navbar, Row} from 'react-bootstrap';
import {useMediaQuery} from "react-responsive";
import './MyNavbar.css';
import horizontalWhiteLogo from '../images/logos/horizontal_white_logo.png';
import {Role, User} from "../models/user";
import LightGlossyButton from "../buttons/LightGlossyButton";
import {CalendarEvent, JournalBookmarkFill, PersonBadge, PersonVcard, TicketPerforated} from "react-bootstrap-icons";

interface NavbarProps {
    readonly user: User
}

function MyNavbar(props: NavbarProps) {
    const navigate = useNavigate();
    const isMobile = useMediaQuery({maxWidth: 767});
    const isAdministrator = props.user.role !== Role.user;

    return (
        <Navbar className="navbar fixed-top navbar-padding">
            <Row className="navbar-row">
                <Col className={isMobile ? "d-flex justify-content-center" : undefined}>
                    <Navbar.Brand className='text' onClick={() => navigate("/")}>
                        <img src={horizontalWhiteLogo} className="brand-image" alt="Logo di Technomake"/>
                    </Navbar.Brand>
                </Col>

                {!isMobile && <Col className="d-flex justify-content-end align-items-center">
                    <LightGlossyButton icon={TicketPerforated} className="me-3" onClick={() => navigate("/tickets")}>
                        Assistenza
                    </LightGlossyButton>
                    <LightGlossyButton icon={JournalBookmarkFill} className="me-3" onClick={() => navigate("/jobs")}>
                        Commesse
                    </LightGlossyButton>
                    <LightGlossyButton icon={CalendarEvent} className="me-3" onClick={() => navigate("/workedHours")}>
                        Ore
                    </LightGlossyButton>
                    {isAdministrator &&
                        <LightGlossyButton icon={PersonVcard} className="me-3" onClick={() => navigate("/users")}>
                            Gestione utenti
                        </LightGlossyButton>}
                    <LightGlossyButton icon={PersonBadge} onClick={() => navigate("/profile")}>
                        {`${props.user.name} ${props.user.surname}`}
                    </LightGlossyButton>
                </Col>}
            </Row>
        </Navbar>
    );
}

export default MyNavbar;