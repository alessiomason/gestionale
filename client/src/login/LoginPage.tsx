import {Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import React, {useState} from "react";
import loginApis from "../api/loginApis";
import './LoginPage.css';
import roundLogo from "../images/logos/round_logo.png";
import {Lock, Person} from "react-bootstrap-icons";
import {Credentials} from "../models/credentials";

function LoginPage(props: any) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [invalidUsername, setInvalidUsername] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);

    function handleLogin(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        setInvalidUsername(false);
        setInvalidPassword(false);

        if (username === "") {
            setInvalidUsername(true);
            return
        }

        if (password === "") {
            setInvalidPassword(true);
            return
        }

        const credentials = new Credentials(username, password);
        props.doLogin(credentials);
    }

    return (
        <Container className="login-container">
            <img src={roundLogo} alt="The logo of the company" className="login-logo"/>

            <Row>
                <Form className="d-flex flex-column justify-content-center">
                    <Row>
                        <Col>
                            <h2 className="text-center">Login</h2>
                        </Col>
                    </Row>

                    <Row>
                        <Col/>
                        <Col sm={6} className="glossy-background">
                            <Row>
                                <Col>
                                    <InputGroup className="padded-form-input">
                                        <InputGroup.Text><Person /></InputGroup.Text>
                                        <FloatingLabel controlId="floatingInput" label="Username">
                                            <Form.Control type='text' placeholder="Username" isInvalid={invalidUsername}
                                                          value={username}
                                                          onChange={ev => setUsername(ev.target.value)}/>
                                        </FloatingLabel>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <InputGroup className="padded-form-input">
                                        <InputGroup.Text><Lock /></InputGroup.Text>
                                        <FloatingLabel controlId="floatingInput" label="Password">
                                            <Form.Control type='password' placeholder="Password"
                                                          isInvalid={invalidPassword} value={password}
                                                          onChange={ev => setPassword(ev.target.value)}/>
                                        </FloatingLabel>
                                    </InputGroup>
                                </Col>
                            </Row>

                            {props.message !== "" && <Row>
                                <Col>
                                    <h5 className="text-center error mt-3">{props.message}</h5>
                                </Col>
                            </Row>}
                        </Col>
                        <Col/>
                    </Row>

                    <Row>
                        <Col className="d-flex justify-content-center">
                            <Button type="submit" className="glossy-button"
                                    onClick={ev => handleLogin(ev)}>Login</Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
        </Container>
    );
}

export default LoginPage;