import React, {useEffect, useState} from "react";
import {Role, Type, User} from "../models/user";
import userApis from "../api/userApis";
import {Col, FloatingLabel, Form, InputGroup, Row, Table} from "react-bootstrap";
import {
    CarFront,
    CheckCircle,
    Clock,
    Coin,
    EnvelopeAt,
    Floppy,
    Person,
    PersonAdd,
    PersonBadge,
    PersonVcard,
    Telephone,
    XCircle
} from "react-bootstrap-icons";
import SwitchToggle from "./SwitchToggle";
import "./UsersListPage.css";
import NewUserPane from "./NewUserPane";
import GlossyButton from "../buttons/GlossyButton";
import {RegisteredSection, NoRegistrationSection} from "./UsersListSections";
import {checkValidEmail} from "../functions";
import Loading from "../Loading";

function compareUsers(a: User, b: User) {
    // sort active first
    if (!a.active && b.active) {
        return 1
    } else if (a.active && !b.active) {
        return -1
    }

    // sort by surname and name
    const surnameComparison = a.surname.localeCompare(b.surname);
    if (surnameComparison !== 0) {
        return surnameComparison;
    } else {
        return a.name.localeCompare(b.name);
    }
}

interface UsersListPageProps {
    readonly user: User
    readonly setDirtyUser: React.Dispatch<React.SetStateAction<boolean>>
}

function UsersListPage(props: UsersListPageProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [dirty, setDirty] = useState(true);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User>();
    const [savedUser, setSavedUser] = useState(false);
    const [showingNewUser, setShowingNewUser] = useState(false);

    const [active, setActive] = useState(false);
    const [managesTickets, setManagesTickets] = useState(false);
    const [role, setRole] = useState<"user" | "admin" | "dev" | "">("");
    const [type, setType] = useState<"office" | "workshop" | "machine" | "">("");
    const [email, setEmail] = useState<string>("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [phone, setPhone] = useState<string>("");
    const [hoursPerDay, setHoursPerDay] = useState(0);
    const [costPerHour, setCostPerHour] = useState(0);
    const [car, setCar] = useState<string>("");
    const [costPerKm, setCostPerKm] = useState(0);

    useEffect(() => {
        if (dirty) {
            userApis.getAllUsers()
                .then(users => {
                    setUsers(users);
                    setDirty(false);
                    setLoading(false);
                })
                .catch(err => console.error(err))
        }
    }, [dirty]);

    function selectUser(user: User) {
        setSelectedUser(user);
        setSavedUser(false);
        setShowingNewUser(false);

        setActive(user.active);
        setManagesTickets(user.managesTickets);
        setRole(user.role.toString() as "user" | "admin" | "dev");
        setType(user.type.toString() as "office" | "workshop");
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
        setHoursPerDay(user.hoursPerDay);
        setCostPerHour(user.costPerHour);
        setCar(user.car ?? "");
        setCostPerKm(user.costPerKm ?? 0);
    }

    function showNewUser() {
        setSelectedUser(undefined);
        setShowingNewUser(true);
    }

    function handleEmailCheck() {
        setInvalidEmail(false);

        // empty email is allowed
        if (email && !checkValidEmail(email)) {
            setInvalidEmail(true);
        }
    }

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        if (selectedUser === undefined || role === "" || type === "") return

        handleEmailCheck();

        let user = selectedUser;
        user.active = active;
        user.managesTickets = managesTickets;
        user.role = Role[role];
        user.type = Type[type];
        user.email = email === "" ? undefined : email;
        user.phone = phone;
        user.hoursPerDay = hoursPerDay;
        user.costPerHour = costPerHour;
        user.car = car;
        user.costPerKm = costPerKm;

        userApis.updateUser(user)
            .then(_ => {
                setDirty(true);
                setSavedUser(true);

                // if own user changed, refresh it
                if (user.id === props.user.id) {
                    props.setDirtyUser(true);
                }
            })
            .catch(err => console.error(err))
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Gestione utenti</h1>
            </Row>

            <Row>
                <Col md={4}>
                    <GlossyButton icon={PersonAdd} onClick={showNewUser} className="new-user-button">
                        Nuovo utente
                    </GlossyButton>

                    {loading ?
                        <Loading/> :
                        <Row className="glossy-background w-100">
                            <Table hover responsive>
                                <thead>
                                <tr>
                                    <th>Cognome</th>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Mansione</th>
                                    <th>Attivo</th>
                                </tr>
                                </thead>

                                <tbody>
                                {users.sort(compareUsers).map(user => {
                                    return (
                                        <tr key={user.id} onClick={() => selectUser(user)}
                                            className={user === selectedUser ? "table-selected-row" : ""}>
                                            <td>{user.surname}</td>
                                            <td>{user.name}</td>
                                            <td>{User.typeName(user.type)}</td>
                                            <td>{User.roleName(user.role)}</td>
                                            <td>{user.active ? <CheckCircle/> : <XCircle/>}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </Table>
                        </Row>}
                </Col>

                <Col>
                    {showingNewUser && <NewUserPane setDirty={setDirty} selectUser={selectUser}/>}
                    {!showingNewUser && selectedUser !== undefined &&
                        <Form>
                            <Row className="glossy-background">
                                <Row>
                                    <h3>{selectedUser.name} {selectedUser.surname}</h3>
                                </Row>

                                <Row className="d-flex align-items-center">
                                    <Col sm={3}
                                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                                        <Person className="me-1"/> Username
                                    </Col>
                                    <Col>{selectedUser.username}</Col>
                                </Row>
                                <Row className="d-flex align-items-center">
                                    <Col sm={3}
                                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                                        {active ? <CheckCircle className="me-2"/> :
                                            <XCircle className="me-2"/>} {active ? "Attivo" : "Non attivo"}
                                    </Col>
                                    <Col className="d-flex align-items-center">
                                        <SwitchToggle id="active-toggle" isOn={active}
                                                      handleToggle={() => setActive(!active)}/>
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

                                <Row>
                                    <InputGroup className="mt-2">
                                        <InputGroup.Text><PersonVcard/></InputGroup.Text>
                                        <FloatingLabel controlId="floatingInput" label="Tipo">
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
                                        <InputGroup.Text><PersonBadge/></InputGroup.Text>
                                        <FloatingLabel controlId="floatingInput" label="Mansione">
                                            <Form.Select value={role}
                                                         onChange={ev => setRole(ev.target.value as "user" | "admin")}>
                                                {User.allRoles.map(role => {
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
                                            <Form.Control type="email" placeholder="Email" value={email}
                                                          isInvalid={invalidEmail}
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
                                            <Form.Control type="number" step={0.5} min={0}
                                                          placeholder="Costo all'ora (euro)"
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

                                {selectedUser.registrationDate ?
                                    <RegisteredSection user={selectedUser}/> :
                                    <NoRegistrationSection user={selectedUser}/>}
                            </Row>

                            <Row className="d-flex justify-content-center my-4">
                                <Col sm={4} className="d-flex justify-content-center">
                                    <GlossyButton icon={Floppy} onClick={handleSubmit}>
                                        {savedUser ? "Salvato" : "Salva"}
                                    </GlossyButton>
                                </Col>
                            </Row>
                        </Form>
                    }
                </Col>
            </Row>
        </>
    );
}

export default UsersListPage;