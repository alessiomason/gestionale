import {useNavigate} from 'react-router-dom';
import {Container, Navbar} from 'react-bootstrap';
import './MyNavbar.css';

function MyNavbar() {
    const navigate = useNavigate();

    return (
        <Navbar className="navbar fixed-top navbar-padding">
            <Container fluid>
                <Navbar.Brand className='purple text' onClick={() => navigate("/")}>
                    Technomake
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
}

export default MyNavbar;