import {useNavigate} from 'react-router-dom';
import {Button, Col, Container, Navbar, Row} from 'react-bootstrap';
import './MyNavbar.css';
import horizontalWhiteLogo from '../images/logos/horizontal_white_logo.png';

function MyNavbar() {
    const navigate = useNavigate();

    return (
        <Navbar className="navbar fixed-top navbar-padding">
            <Container fluid>
                <Row className="navbar-row">
                    <Col>
                        <Navbar.Brand className='text' onClick={() => navigate("/")}>
                            <img src={horizontalWhiteLogo} className="brand-image" alt="Logo di Technomake"/>
                        </Navbar.Brand>
                    </Col>

                    <Col className="d-flex justify-content-end align-items-center">
                        <Button className="light-glossy-button">Scheda personale</Button>
                    </Col>
                </Row>
            </Container>
        </Navbar>
    );
}

export default MyNavbar;