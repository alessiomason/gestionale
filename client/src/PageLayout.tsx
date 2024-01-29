import {Outlet} from "react-router-dom";
import {Container, Row} from "react-bootstrap";
import MyNavbar from "./navbar/MyNavbar";
import './PageLayout.css';

function PageLayout() {
    return (
        <Container fluid>
            <Row>
                <MyNavbar />
            </Row>
            <Row>
                <div className="main-content">
                    <Outlet />
                </div>
            </Row>
        </Container>
    );
}

export default PageLayout;