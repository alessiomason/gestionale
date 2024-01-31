import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Badge, Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {CarFront, EnvelopeAt, Lock, Telephone} from "react-bootstrap-icons";
import './SignUpPage.css';
import roundLogo from "../images/logos/round_logo.png";
import signUpApis from "../api/signUpApis";
import {User} from "../models/user";

function SignUpPage(props: any) {
    const navigate = useNavigate();

    const {registrationToken} = useParams();
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [car, setCar] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function doSignUp(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setInvalidPassword(false);

        if (password === "" || password !== confirmPassword) {
            setInvalidPassword(true);
            return
        }

        signUpApis.signUp(
            registrationToken!,
            password,
            email !== "" ? email : undefined,
            phone !== "" ? phone : undefined,
            car !== "" ? car : undefined
        ).then(_res => {
            navigate("/successful-signup");
        }).catch(err => {
            setErrorMessage(err);
        })
    }

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
                                <SignUpPane
                                    registrationToken={registrationToken}
                                    email={email} setEmail={setEmail}
                                    phone={phone} setPhone={setPhone}
                                    car={car} setCar={setCar}
                                    password={password} setPassword={setPassword}
                                    confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                                    invalidPassword={invalidPassword} setInvalidPassword={setInvalidPassword}
                                    errorMessage={errorMessage} />}
                        </Col>
                        <Col/>
                    </Row>

                    {registrationToken !== undefined && <Row>
                        <Col className="d-flex justify-content-center">
                            <Button type="submit" className="glossy-button mb-5"
                                    onClick={ev => doSignUp(ev)}>Registrati</Button>
                        </Col>
                    </Row>}
                </Form>
            </Row>
        </Container>
    );
}

interface SignUpPaneProps {
    registrationToken: string,
    email: string,
    setEmail: React.Dispatch<React.SetStateAction<string>>,
    phone: string,
    setPhone: React.Dispatch<React.SetStateAction<string>>,
    car: string,
    setCar: React.Dispatch<React.SetStateAction<string>>,
    password: string,
    setPassword: React.Dispatch<React.SetStateAction<string>>,
    confirmPassword: string,
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>,
    invalidPassword: boolean,
    setInvalidPassword: React.Dispatch<React.SetStateAction<boolean>>,
    errorMessage: string
}

function SignUpPane(props: SignUpPaneProps) {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        signUpApis.getUserFromRegistrationToken(props.registrationToken)
            .then(user => setUser(user))
            .catch(err => console.error(err))
    }, [])

    return (
        <>
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
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><EnvelopeAt/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Email">
                            <Form.Control type='email' placeholder="Email" value={props.email}
                                          onChange={ev => props.setEmail(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><Telephone/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Numero di telefono">
                            <Form.Control type='tel' placeholder="Numero di telefono" value={props.phone}
                                          onChange={ev => props.setPhone(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><CarFront/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Vettura">
                            <Form.Control type='text' placeholder="Vettura" value={props.car}
                                          onChange={ev => props.setCar(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>

                    <h6 className="mt-4">Scegli la password</h6>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><Lock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Password">
                            <Form.Control type='password' placeholder="Password" isInvalid={props.invalidPassword}
                                          value={props.password}
                                          onChange={ev => props.setPassword(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><Lock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Conferma password">
                            <Form.Control type='password' placeholder="Conferma password"
                                          isInvalid={props.invalidPassword}
                                          value={props.confirmPassword}
                                          onChange={ev => props.setConfirmPassword(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                </Col>
            </Row>

            {props.errorMessage !== "" && <Row className="mt-2">
                <Col>
                    <h5 className="text-center error">{props.errorMessage}</h5>
                </Col>
            </Row>}
        </>
    )
        ;
}

export default SignUpPage;