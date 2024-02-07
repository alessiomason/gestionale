import {Outlet} from "react-router-dom";
import {Container, Row} from "react-bootstrap";
import MyNavbar from "./navbar/MyNavbar";
import './PageLayout.css';
import {User} from "./models/user";

interface PageLayoutProps {
    readonly user: User
}

function PageLayout(props: PageLayoutProps) {
    return (
        <Container fluid>
            <Row>
                <MyNavbar user={props.user} />
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