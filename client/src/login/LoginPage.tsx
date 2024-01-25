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
                <h1>Login</h1>
            </Row>
            <Row>
            <Form className="d-flex flex-column justify-content-evenly">
                <Row>
                    <Col>
                        <FloatingLabel controlId="floatingInput" label="Username">
                            <Form.Control type='text' value={username} onChange={ev => setUsername(ev.target.value)} />
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <FloatingLabel controlId="floatingInput" label="Password">
                            <Form.Control type='text' value={password} onChange={ev => setPassword(ev.target.value)} />
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Button type="submit" className="login-button" onClick={ev => props.doLogin(ev, new Credentials(username, password))}>Login</Button>
                    </Col>
                </Row>
            </Form>
            </Row>
        </Container>
    );
}

export default LoginPage;