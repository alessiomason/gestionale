import {useNavigate} from 'react-router-dom';
import {Col, Navbar, Row} from 'react-bootstrap';
import './MyNavbar.css';
import logo from '../images/logos/logo.png';
import {User} from "../models/user";
import LightGlossyButton from "../buttons/LightGlossyButton";
import {JournalBookmarkFill, PersonBadge, PersonVcard, TicketPerforated} from "react-bootstrap-icons";

interface NavbarProps {
    readonly user: User
}

function MyNavbar(props: NavbarProps) {
    const navigate = useNavigate();

    return (
        <Navbar className="navbar fixed-top navbar-padding">
            <Row className="navbar-row">
                <Col>
                    <Navbar.Brand className='text' onClick={() => navigate("/")}>
                        <img src={logo} className="brand-image" alt="Logo di Technomake"/>
                    </Navbar.Brand>
                </Col>

                <Col className="d-flex justify-content-end align-items-center">
                    <LightGlossyButton icon={TicketPerforated} className="me-3" onClick={() => navigate("/tickets")}>
                        Assistenza
                    </LightGlossyButton>
                    <LightGlossyButton icon={JournalBookmarkFill} className="me-3" onClick={() => navigate("/jobs")}>
                        Commesse
                    </LightGlossyButton>
                    <LightGlossyButton icon={PersonVcard} className="me-3" onClick={() => navigate("/users")}>
                        Gestione utenti
                    </LightGlossyButton>
                    <LightGlossyButton icon={PersonBadge} onClick={() => navigate("/profile")}>
                        {`${props.user.name} ${props.user.surname}`}
                    </LightGlossyButton>
                </Col>
            </Row>
        </Navbar>
    );
}

export default MyNavbar;