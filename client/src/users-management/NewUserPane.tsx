import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {
    CarFront,
    CheckCircle,
    Clock,
    Coin,
    EnvelopeAt,
    Person,
    PersonAdd,
    PersonBadge,
    PersonVcard,
    Telephone,
    XCircle
} from "react-bootstrap-icons";
import SwitchToggle from "./SwitchToggle";
import {Role, Type, User} from "../models/user";
import React, {useState} from "react";
import signUpApis from "../api/signUpApis";
import GlossyButton from "../buttons/GlossyButton";
import {checkValidEmail} from "../functions";

interface NewUserPaneProps {
    readonly setDirty: React.Dispatch<React.SetStateAction<boolean>>
    readonly selectUser: (user: User) => void
}

function NewUserPane(props: NewUserPaneProps) {
    const [active, setActive] = useState(true);
    const [name, setName] = useState("");
    const [invalidName, setInvalidName] = useState(false);
    const [surname, setSurname] = useState("");
    const [invalidSurname, setInvalidSurname] = useState(false);
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<"user" | "admin" | "dev">("user");
    const [type, setType] = useState<"office" | "workshop">("office");
    const [email, setEmail] = useState<string>("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [phone, setPhone] = useState<string>("");
    const [hoursPerDay, setHoursPerDay] = useState(0);
    const [costPerHour, setCostPerHour] = useState(0);
    const [car, setCar] = useState<string>("");
    const [costPerKm, setCostPerKm] = useState(0);

    function handleEmailCheck() {
        setInvalidEmail(false);

        // empty email is allowed
        if (email && !checkValidEmail(email)) {
            setInvalidEmail(true);
        }
    }

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setInvalidName(false);
        setInvalidSurname(false);

        if (name === "") {
            setInvalidName(true);
            return
        }
        if (surname === "") {
            setInvalidSurname(true);
            return
        }

        handleEmailCheck();

        const newUser = new User(
            0,
            Role[role],
            Type[type],
            name,
            surname,
            username,
            undefined,
            undefined,
            undefined,
            hoursPerDay,
            costPerHour,
            active,
            email,
            phone,
            car,
            costPerKm
        )

        signUpApis.createUser(newUser)
            .then(user => {
                props.setDirty(true);
                props.selectUser(user);
            })
            .catch(err => console.error(err))
    }

    return (
        <Form>
            <Row className="glossy-background">
                <Row>
                    <h3>Nuovo utente</h3>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col sm={2}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Username
                    </Col>
                    <Col>{username}</Col>
                </Row>
                <Row className="d-flex align-items-center">
                    <Col sm={2}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        {active ? <CheckCircle className="me-2"/> :
                            <XCircle className="me-2"/>} {active ? "Attivo" : "Non attivo"}
                    </Col>
                    <Col className="d-flex align-items-center">
                        <SwitchToggle id="active-toggle" isOn={active}
                                      handleToggle={() => setActive(prevActive => !prevActive)}/>
                    </Col>
                </Row>

                <Row>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Person/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Nome">
                            <Form.Control type="text" placeholder="Nome" isInvalid={invalidName} value={name}
                                          onChange={ev => {
                                              const newName = ev.target.value;
                                              setName(newName);
                                              setUsername(User.usernameFromName(newName, surname));
                                          }}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Person/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Cognome">
                            <Form.Control type="text" placeholder="Cognome" isInvalid={invalidSurname} value={surname}
                                          onChange={ev => {
                                              const newSurname = ev.target.value;
                                              setSurname(newSurname);
                                              setUsername(User.usernameFromName(name, newSurname));
                                          }}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><PersonVcard/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Tipo">
                            <Form.Select value={type}
                                         onChange={ev => setType(ev.target.value as "office" | "workshop")}>
                                {User.allTypes.map(type => {
                                    return (
                                        <option key={type.toString()}
                                                value={type.toString()}>{User.typeName(type)}</option>
                                    );
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><PersonBadge/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Mansione">
                            <Form.Select value={role}
                                         onChange={ev => setRole(ev.target.value as "user" | "admin")}>
                                {User.allRoles.filter(role => role !== Role.dev).map(role => {
                                    return (
                                        <option key={role.toString()}
                                                disabled={role === Role.dev}
                                                value={role.toString()}>{User.roleName(role)}</option>
                                    );
                                })}
                            </Form.Select>
                        </FloatingLabel>
                    </InputGroup>

                    <InputGroup className="mt-2">
                        <InputGroup.Text><EnvelopeAt/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Email">
                            <Form.Control type="email" placeholder="Email" value={email} isInvalid={invalidEmail}
                                          onChange={ev => setEmail(ev.target.value)}
                                          onBlur={handleEmailCheck}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Telephone/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Numero di telefono">
                            <Form.Control type="tel" placeholder="Numero di telefono" value={phone}
                                          onChange={ev => setPhone(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Clock/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Ore contratto">
                            <Form.Control type="number" step={0.5} min={0} max={8}
                                          placeholder="Ore contratto"
                                          value={hoursPerDay}
                                          onChange={ev => setHoursPerDay(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Coin/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Costo all'ora (euro)">
                            <Form.Control type="number" step={0.5} min={0} placeholder="Costo all'ora (euro)"
                                          value={costPerHour}
                                          onChange={ev => setCostPerHour(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><CarFront/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Vettura">
                            <Form.Control type="text" placeholder="Vettura" value={car}
                                          onChange={ev => setCar(ev.target.value)}/>
                        </FloatingLabel>
                    </InputGroup>
                    <InputGroup className="mt-2">
                        <InputGroup.Text><Coin/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Costo al chilometro (euro)">
                            <Form.Control type="number" step={0.5} min={0}
                                          placeholder="Costo al chilometro (euro)"
                                          value={costPerKm}
                                          onChange={ev => setCostPerKm(parseFloat(ev.target.value))}/>
                        </FloatingLabel>
                    </InputGroup>
                </Row>
            </Row>

            <Row className="d-flex justify-content-center my-4">
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton icon={PersonAdd} onClick={handleSubmit}>Crea utente</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default NewUserPane;