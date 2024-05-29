import React, {useEffect, useState} from "react";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import {
    CarFront,
    Check,
    CheckCircle,
    Clock, Coin,
    EnvelopeAt,
    Floppy,
    Person,
    PersonAdd,
    PersonBadge,
    PersonVcard,
    Telephone,
    XCircle
} from "react-bootstrap-icons";
import {NoRegistrationSection, RegisteredSection} from "./UsersListSections";
import SwitchToggle from "./SwitchToggle";
import GlossyButton from "../buttons/GlossyButton";
import {checkValidEmail} from "../functions";
import {Role, Type, User} from "../models/user";
import signUpApis from "../api/signUpApis";
import userApis from "../api/userApis";

interface UserPaneProps {
    readonly user: User
    readonly selectedUser: User | undefined
    readonly setDirtyUser: React.Dispatch<React.SetStateAction<boolean>>
    readonly afterSubmit: (user: User) => void
}

function UserPane(props: UserPaneProps) {
    const [active, setActive] = useState(props.selectedUser?.active ?? true);
    const [managesTickets, setManagesTickets] = useState(props.selectedUser?.managesTickets ?? false);
    const [managesOrders, setManagesOrders] = useState(props.selectedUser?.managesOrders ?? false);
    const [name, setName] = useState(props.selectedUser?.name ?? "");
    const [invalidName, setInvalidName] = useState(false);
    const [surname, setSurname] = useState(props.selectedUser?.surname ?? "");
    const [invalidSurname, setInvalidSurname] = useState(false);
    const [username, setUsername] = useState(props.selectedUser?.username ?? "");
    const [role, setRole] = useState<"user" | "admin" | "dev">(props.selectedUser?.role ?? "user");
    const [type, setType] = useState<"office" | "workshop" | "machine">(props.selectedUser?.type ?? "office");
    const [email, setEmail] = useState<string>(props.selectedUser?.email ?? "");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [phone, setPhone] = useState<string>(props.selectedUser?.phone ?? "");
    const [hoursPerDay, setHoursPerDay] = useState(props.selectedUser?.hoursPerDay ?? 0);
    const [costPerHour, setCostPerHour] = useState(props.selectedUser?.costPerHour ?? 0);
    const [car, setCar] = useState<string>(props.selectedUser?.car ?? "");
    const [costPerKm, setCostPerKm] = useState(props.selectedUser?.costPerKm ?? 0);

    const [savedUser, setSavedUser] = useState(false);

    let submitButtonTitle = "Crea utente";
    let submitButtonIcon = PersonAdd;
    if (props.selectedUser) {
        if (savedUser) {
            submitButtonTitle = "Salvato";
            submitButtonIcon = Check;
        } else {
            submitButtonTitle = "Salva";
            submitButtonIcon = Floppy;
        }
    }

    useEffect(() => {
        setActive(props.selectedUser?.active ?? true);
        setManagesTickets(props.selectedUser?.managesTickets ?? false);
        setManagesOrders(props.selectedUser?.managesOrders ?? false);
        setName(props.selectedUser?.name ?? "");
        setSurname(props.selectedUser?.surname ?? "");
        setUsername(props.selectedUser?.username ?? "");
        setRole(props.selectedUser?.role ?? "user");
        setType(props.selectedUser?.type ?? "office");
        setEmail(props.selectedUser?.email ?? "");
        setPhone(props.selectedUser?.phone ?? "");
        setHoursPerDay(props.selectedUser?.hoursPerDay ?? 0);
        setCostPerHour(props.selectedUser?.costPerHour ?? 0);
        setCar(props.selectedUser?.car ?? "");
        setCostPerKm(props.selectedUser?.costPerKm ?? 0);
    }, [props.selectedUser?.id]);

    function handleEmailCheck() {
        setInvalidEmail(false);

        // empty email is allowed
        if (email && !checkValidEmail(email)) {
            setInvalidEmail(true);
            return false;
        }

        return true;
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

        if (!handleEmailCheck()) return;

        const user = new User(
            props.selectedUser?.id ?? 0,
            Role[role],
            Type[type],
            name,
            surname,
            username,
            props.selectedUser?.registrationToken,
            props.selectedUser?.tokenExpiryDate,
            props.selectedUser?.registrationDate,
            hoursPerDay,
            costPerHour,
            active,
            managesTickets,
            managesOrders,
            email === "" ? undefined : email,
            phone,
            car,
            costPerKm
        );

        if (props.selectedUser) {
            userApis.updateUser(user)
                .then(_ => {
                    setSavedUser(true);
                    props.afterSubmit(user);

                    // if own user changed, refresh it
                    if (user.id === props.user.id) {
                        props.setDirtyUser(true);
                    }
                })
                .catch(err => console.error(err));
        } else {
            signUpApis.createUser(user)
                .then(user => props.afterSubmit(user))
                .catch(err => console.error(err));
        }
    }

    function resetPassword(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        userApis.resetPassword(props.selectedUser!.id)
            .then(user => {
                setSavedUser(true);
                props.afterSubmit(user);

                // if own user changed, refresh it
                if (user.id === props.user.id) {
                    props.setDirtyUser(true);
                }
            })
            .catch(err => console.error(err));
    }

    return (
        <Form>
            <Row className="glossy-background">
                <Row>
                    <h3>{props.selectedUser ? `${props.selectedUser.name} ${props.selectedUser.surname}` : "Nuovo utente"}</h3>
                </Row>

                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        <Person className="me-1"/> Username
                    </Col>
                    <Col>{username}</Col>
                </Row>
                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        {active ? <CheckCircle className="me-2"/> :
                            <XCircle className="me-2"/>} {active ? "Attivo" : "Non attivo"}
                    </Col>
                    <Col className="d-flex align-items-center">
                        <SwitchToggle id="active-toggle" isOn={active}
                                      handleToggle={() => setActive(prevActive => !prevActive)}/>
                    </Col>
                </Row>
                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        {managesTickets ? <CheckCircle className="me-2"/> :
                            <XCircle className="me-2"/>} Accesso ai ticket
                    </Col>
                    <Col className="d-flex align-items-center">
                        <SwitchToggle id="manages-tickets-toggle" isOn={managesTickets}
                                      handleToggle={() => setManagesTickets(prevState => !prevState)}/>
                    </Col>
                </Row>
                <Row className="d-flex align-items-center">
                    <Col sm={3}
                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                        {managesOrders ? <CheckCircle className="me-2"/> :
                            <XCircle className="me-2"/>} Accesso agli ordini
                    </Col>
                    <Col className="d-flex align-items-center">
                        <SwitchToggle id="manages-orders-toggle" isOn={managesOrders}
                                      handleToggle={() => setManagesOrders(prevState => !prevState)}/>
                    </Col>
                </Row>

                <Row>
                    {/* Cannot update a user's name or surname */}
                    {!props.selectedUser && <InputGroup className="mt-2">
                        <InputGroup.Text><Person/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Nome">
                            <Form.Control type="text" placeholder="Nome" isInvalid={invalidName} value={name}
                                          onChange={ev => {
                                              const newName = ev.target.value;
                                              setName(newName);
                                              setUsername(User.usernameFromName(newName, surname));
                                          }}/>
                        </FloatingLabel>
                    </InputGroup>}
                    {!props.selectedUser && <InputGroup className="mt-2">
                        <InputGroup.Text><Person/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Cognome">
                            <Form.Control type="text" placeholder="Cognome" isInvalid={invalidSurname} value={surname}
                                          onChange={ev => {
                                              const newSurname = ev.target.value;
                                              setSurname(newSurname);
                                              setUsername(User.usernameFromName(name, newSurname));
                                          }}/>
                        </FloatingLabel>
                    </InputGroup>}

                    <InputGroup className="mt-2">
                        <InputGroup.Text><PersonBadge/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Accesso">
                            <Form.Select value={role}
                                         onChange={ev => setRole(ev.target.value as "user" | "admin")}>
                                {User.allRoles.filter(role => props.selectedUser?.role === Role.dev ? true : role !== Role.dev).map(role => {
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
                        <InputGroup.Text><PersonVcard/></InputGroup.Text>
                        <FloatingLabel controlId="floatingInput" label="Mansione">
                            <Form.Select value={type}
                                         onChange={ev => setType(ev.target.value as "office" | "workshop" | "machine")}>
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

                {props.selectedUser?.registrationDate &&
                    <RegisteredSection user={props.user} selectedUser={props.selectedUser} resetPassword={resetPassword}/>}
                {props.selectedUser && !props.selectedUser.registrationDate &&
                    <NoRegistrationSection selectedUser={props.selectedUser} resetPassword={resetPassword}/>}

            </Row>
            <Row className="d-flex justify-content-center my-4">
                <Col sm={4} className="d-flex justify-content-center">
                    <GlossyButton icon={submitButtonIcon} onClick={handleSubmit}>{submitButtonTitle}</GlossyButton>
                </Col>
            </Row>
        </Form>
    );
}

export default UserPane;