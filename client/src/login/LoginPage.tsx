import {Button, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import {useState} from "react";
import {Credentials} from "../api/loginApis";
import './LoginPage.css';
import roundLogo from "../images/logos/round_logo.png";

function LoginPage(props: any) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <Container className="login-container">
            <img src={roundLogo} alt="The logo of the company" className="login-logo" />

            <Row>
                <Form className="d-flex flex-column justify-content-center">
                    <Row>
                        <Col>
                            <h2 className="text-center">Login</h2>
                        </Col>
                    </Row>

                    <Row>
                        <Col />
                        <Col sm={6} className="glossy-background">
                            <Row>
                                <Col>
                                    <FloatingLabel controlId="floatingInput" label="Username" className="padded-form-input">
                                        <Form.Control type='text' placeholder="Username" value={username}
                                                      onChange={ev => setUsername(ev.target.value)}/>
                                    </FloatingLabel>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <FloatingLabel controlId="floatingInput" label="Password" className="padded-form-input">
                                        <Form.Control type='password' placeholder="Password" value={password}
                                                      onChange={ev => setPassword(ev.target.value)}/>
                                    </FloatingLabel>
                                </Col>
                            </Row>
                        </Col>
                        <Col />
                    </Row>

                    <Row>
                        <Col className="d-flex justify-content-center">
                            <Button type="submit" className="glossy-button"
                                    onClick={ev => props.doLogin(ev, new Credentials(username, password))}>Login</Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
        </Container>
    );
}

export default LoginPage;