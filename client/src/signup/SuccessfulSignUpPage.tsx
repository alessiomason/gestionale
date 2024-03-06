import logo from "../images/logos/logo.png";
import {Button, Col, Container, Row} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

function SuccessfulSignUpPage() {
    const navigate = useNavigate();

    return (
        <Container>
            <img src={logo} alt="The logo of the company" className="login-logo"/>

            <Row>
                <div className="d-flex flex-column justify-content-center successful-signup-container">
                    <Row>
                        <Col/>
                        <Col sm={6} className="glossy-background">
                            <Row>
                                <Col>
                                    <h2 className="text-center">Registrazione avvenuta con successo</h2>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <p className="text-center">La registrazione è avvenuta con successo! Puoi ora procedere al login.</p>
                                </Col>
                            </Row>
                        </Col>
                        <Col />
                    </Row>

                    <Row className="mt-2">
                        <Col className="d-flex justify-content-center">
                            <Button className="glossy-button" onClick={() => navigate("/login")}>Login</Button>
                        </Col>
                    </Row>
                </div>
            </Row>
        </Container>
    );
}

export default SuccessfulSignUpPage;