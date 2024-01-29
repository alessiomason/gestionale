import {Button, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import {useState} from "react";
import './LoginPage.css';
import {Credentials} from "../api/loginApis";

function LoginPage(props: any) {
    const [username, setUsername] = useState("alessiomason");
    const [password, setPassword] = useState("password");

    return (
        <Container className="login-container">
            <Row>
                <Form className="d-flex flex-column justify-content-center">
                    <Row>
                        <Col>
                            <h3 className="text-center">Login</h3>
                        </Col>
                    </Row>

                    <Row>
                        <Col />
                        <Col sm={6} className="glossy-background">
                            <Row>
                                <Col>
                                    <FloatingLabel controlId="floatingInput" label="Username" className="padded-form-input">
                                        <Form.Control type='text' value={username}
                                                      onChange={ev => setUsername(ev.target.value)}/>
                                    </FloatingLabel>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <FloatingLabel controlId="floatingInput" label="Password" className="padded-form-input">
                                        <Form.Control type='text' value={password}
                                                      onChange={ev => setPassword(ev.target.value)}/>
                                    </FloatingLabel>
                                </Col>
                            </Row>
                        </Col>
                        <Col />
                    </Row>

                    <Row>
                        <Col className="d-flex justify-content-center">
                            <Button type="submit" className="login-button glossy-button"
                                    onClick={ev => props.doLogin(ev, new Credentials(username, password))}>Login</Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
        </Container>
    );
}

export default LoginPage;