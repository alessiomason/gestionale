import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Badge, Button, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import './SignUpPage.css';
import roundLogo from "../images/logos/round_logo.png";
import signUpApis from "../api/signUpApis";
import {User} from "../models/user";

function SignUpPage(props: any) {
    const {registrationToken} = useParams();
    const [password, setPassword] = useState("password");

    return (
        <Container>
            <Row className="d-flex justify-content-center">
                <img src={roundLogo} alt="The logo of the company" className="signup-logo"/>
            </Row>

            <Row className="mt-4">
                <Form>
                    <Row>
                        <Col>
                            <h2 className="text-center">Registrazione</h2>
                        </Col>
                    </Row>

                    <Row>
                        <Col/>
                        <Col sm={6} className="glossy-background">
                            {registrationToken === undefined ?
                                <p>L'URL per la registrazione non è valido!</p> :
                                <SignUpPane password={password} setPassword={setPassword}
                                            registrationToken={registrationToken}/>}
                        </Col>
                        <Col/>
                    </Row>

                    <Row>
                        <Col className="d-flex justify-content-center">
                            <Button type="submit" className="glossy-button mb-5"
                                    onClick={ev => props.doLogin(ev)}>Registrati</Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
        </Container>
    );
}

function SignUpPane(props: any) {
    const [user, setUser] = useState<User>();
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [car, setCar] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        signUpApis.getUserFromRegistrationToken(props.registrationToken)
            .then(user => setUser(user))
            .catch(err => console.error(err))
    }, [])

    return (
        <Row>
            <Col>
                <h3>Dati inseriti dall'amministratore</h3>
                <div className="glossy-background">
                    <p>Nome: {user?.name}</p>
                    <p>Cognome: {user?.surname}</p>
                    <Row>
                        <Col className="d-flex align-items-center">
                            <span>Username: {user?.username}</span>
                            <Badge bg="secondary" className="mx-2">Ti verrà richiesto al login</Badge>
                        </Col>
                    </Row>
                    {user?.role === User.Role.admin && <p>Accesso: {User.roleName(user.role)}</p>}
                </div>

                <h3 className="mt-4">Inserisci i dati mancanti</h3>
                <h6 className="mt-2">I seguenti dati sono facoltativi; potrai comunque modificarli in seguito</h6>
                <FloatingLabel controlId="floatingInput" label="Email" className="padded-form-input">
                    <Form.Control type='email' placeholder="Email" value={email}
                                  onChange={ev => setEmail(ev.target.value)}/>
                </FloatingLabel>
                <FloatingLabel controlId="floatingInput" label="Numero di telefono" className="padded-form-input">
                    <Form.Control type='tel' placeholder="Numero di telefono" value={phone}
                                  onChange={ev => setPhone(ev.target.value)}/>
                </FloatingLabel>
                <FloatingLabel controlId="floatingInput" label="Vettura" className="padded-form-input">
                    <Form.Control type='text' placeholder="Vettura" value={car}
                                  onChange={ev => setCar(ev.target.value)}/>
                </FloatingLabel>

                <h6 className="mt-4">Scegli la password</h6>
                <FloatingLabel controlId="floatingInput" label="Password" className="padded-form-input">
                    <Form.Control type='password' placeholder="Password" value={password}
                                  onChange={ev => setPassword(ev.target.value)}/>
                </FloatingLabel>
                <FloatingLabel controlId="floatingInput" label="Conferma password" className="padded-form-input">
                    <Form.Control type='password' placeholder="Conferma password" value={confirmPassword}
                                  onChange={ev => setConfirmPassword(ev.target.value)}/>
                </FloatingLabel>
            </Col>
        </Row>
    );
}

export default SignUpPage;