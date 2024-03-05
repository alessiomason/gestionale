import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Badge, Button, Col, Container, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {CarFront, EnvelopeAt, Lock, Telephone} from "react-bootstrap-icons";
import './SignUpPage.css';
import roundLogo from "../images/logos/round_logo.png";
import signUpApis from "../api/signUpApis";
import {User} from "../models/user";
import {checkValidEmail, checkValidPassword} from "../functions";

function SignUpPage() {
    const navigate = useNavigate();

    const {registrationToken} = useParams();
    const [expired, setExpired] = useState(false);
    const [email, setEmail] = useState("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [phone, setPhone] = useState("");
    const [car, setCar] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function handleCheckPassword() {
        setInvalidPassword(false);
        setShowPasswordRequirements(false);

        if (!checkValidPassword(password)) {
            setInvalidPassword(true);
            setShowPasswordRequirements(true);
            return
        }
    }

    function doSignUp(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setInvalidPassword(false);
        setInvalidEmail(false);

        if (!checkValidEmail(email)) {
            setInvalidEmail(true);
            return
        }

        handleCheckPassword();
        if (password !== confirmPassword) {
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
                            {registrationToken === undefined || expired ?
                                <p>Il link di registrazione è scaduto o non è più valido!</p> :
                                <SignUpPane
                                    registrationToken={registrationToken} setExpired={setExpired}
                                    email={email} setEmail={setEmail} invalidEmail={invalidEmail}
                                    phone={phone} setPhone={setPhone}
                                    car={car} setCar={setCar}
                                    password={password} setPassword={setPassword}
                                    confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                                    invalidPassword={invalidPassword} handleCheckPassword={handleCheckPassword}
                                    showPasswordRequirements={showPasswordRequirements} errorMessage={errorMessage}/>}
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
    registrationToken: string
    setExpired: React.Dispatch<React.SetStateAction<boolean>>
    email: string
    setEmail: React.Dispatch<React.SetStateAction<string>>
    invalidEmail: boolean
    phone: string
    setPhone: React.Dispatch<React.SetStateAction<string>>
    car: string
    setCar: React.Dispatch<React.SetStateAction<string>>
    password: string
    setPassword: React.Dispatch<React.SetStateAction<string>>
    confirmPassword: string
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>
    invalidPassword: boolean
    showPasswordRequirements: boolean
    handleCheckPassword: () => void
    errorMessage: string
}

function SignUpPane(props: SignUpPaneProps) {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        signUpApis.getUserFromRegistrationToken(props.registrationToken)
            .then(user => {
                setUser(user);

                if (user.email) {
                    props.setEmail(user.email);
                }
                if (user.phone) {
                    props.setPhone(user.phone);
                }
                if (user.car) {
                    props.setCar(user.car);
                }
            })
            .catch(err => {
                props.setExpired(true);
                console.error(err);
            })
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
                            <Col className="d-flex align-items-center username-field">
                                <span>Username: {user?.username}</span>
                                <Badge bg="secondary" className="mx-2">Ti verrà richiesto al login</Badge>
                            </Col>
                        </Row>
                        {user?.role === User.Role.admin && <p>Accesso: {User.roleName(user.role)}</p>}
                    </div>

                    <h3 className="mt-4">Inserisci o conferma i dati mancanti</h3>
                    <h6 className="mt-2">
                        {(user?.email || user?.phone || user?.car) ?
                            `I seguenti dati sono facoltativi e sono già stati inseriti dall'amministratore,
                            ma puoi comunque modificarli o rimuoverli.` :
                            "I seguenti dati sono facoltativi; potrai comunque modificarli in seguito."}
                    </h6>
                    <InputGroup className="padded-form-input">
                        <InputGroup.Text><EnvelopeAt/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Email">
                            <Form.Control type='email' placeholder="Email" value={props.email}
                                          isInvalid={props.invalidEmail}
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
                                          onChange={ev => props.setPassword(ev.target.value)}
                                          onBlur={props.handleCheckPassword}/>
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

                    {props.showPasswordRequirements &&
                        <p className="text-center mt-3 error">La password deve essere lunga almeno 8 caratteri, deve
                            contenere una lettera maiuscola, una lettera
                            minuscola e un numero.</p>}
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