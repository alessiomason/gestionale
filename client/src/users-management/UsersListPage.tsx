import React, {useEffect, useState} from "react";
import {Role, Type, User} from "../models/user";
import userApis from "../api/userApis";
import {Col, FloatingLabel, Form, InputGroup, Row, Table} from "react-bootstrap";
import {
    CarFront,
    Check2,
    CheckCircle,
    Clock,
    Coin,
    EnvelopeAt,
    Icon,
    Key,
    Link45deg,
    Person,
    PersonAdd,
    PersonBadge,
    PersonVcard,
    Telephone,
    XCircle
} from "react-bootstrap-icons";
import Copy from "../new-bootstrap-icons/Copy";
import SwitchToggle from "./SwitchToggle";
import "./UsersListPage.css";
import NewUserPane from "./NewUserPane";
import GlossyButton from "../buttons/GlossyButton";
import Floppy from "../new-bootstrap-icons/Floppy";
import dayjs from "dayjs";
import {publicUrl} from "../api/apisValues";
import LightGlossyButton from "../buttons/LightGlossyButton";

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

function UsersListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [dirty, setDirty] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User>();
    const [savedUser, setSavedUser] = useState(false);
    const [showingNewUser, setShowingNewUser] = useState(false);

    const [active, setActive] = useState(false);
    const [role, setRole] = useState<"user" | "admin" | "dev" | "">("");
    const [type, setType] = useState<"office" | "workshop" | "">("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [hoursPerDay, setHoursPerDay] = useState(0);
    const [costPerHour, setCostPerHour] = useState(0);
    const [car, setCar] = useState<string>("");
    const [costPerKm, setCostPerKm] = useState(0);

    useEffect(() => {
        userApis.getAllUsers()
            .then(users => setUsers(users))
            .catch(err => console.error(err))
    }, [dirty]);

    function selectUser(user: User) {
        setSelectedUser(user);
        setSavedUser(false);
        setShowingNewUser(false);

        setActive(user.active);
        setRole(user.role.toString() as "user" | "admin" | "dev");
        setType(user.type.toString() as "office" | "workshop");
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
        setHoursPerDay(user.hoursPerDay);
        setCostPerHour(user.costPerHour);
        setCar(user.car ?? "");
        setCostPerKm(user.costPerKm ?? 0);
    }

    function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();

        if (selectedUser === undefined || role === "" || type === "") return

        let user = selectedUser;
        user.active = active;
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
            })
            .catch(err => console.error(err))
    }

    function showNewUser() {
        setSelectedUser(undefined);
        setShowingNewUser(true);
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Gestione utenti</h1>
            </Row>

            <Row>
                <Col md={4}>
                    <GlossyButton icon={PersonAdd} onClick={showNewUser} className="new-user-button">Nuovo
                        utente</GlossyButton>

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
                                        className={user === selectedUser ? "selected-user" : ""}>
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
                    </Row>
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
                                    <Col sm={2}
                                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                                        <Person className="me-1"/> Username
                                    </Col>
                                    <Col>{selectedUser.username}</Col>
                                </Row>
                                <Row className="d-flex align-items-center">
                                    <Col sm={2}
                                         className="glossy-background smaller d-flex justify-content-center align-items-center">
                                        {active ? <CheckCircle className="me-2"/> :
                                            <XCircle className="me-2"/>} {active ? "Attivo" : "Non attivo"}
                                    </Col>
                                    <Col className="d-flex align-items-center">
                                        <SwitchToggle isOn={active} handleToggle={() => setActive(!active)}/>
                                    </Col>
                                </Row>

                                <Row>
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
                                                          onChange={ev => setEmail(ev.target.value)}/>
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

                                {selectedUser.registrationDate ?
                                    <RegisteredSection user={selectedUser}/> :
                                    <NoRegistrationSection user={selectedUser}/>}
                            </Row>

                            <Row className="d-flex justify-content-center my-4">
                                <Col sm={4} className="d-flex justify-content-center">
                                    <GlossyButton icon={Floppy as Icon} onClick={handleSubmit}>
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

function RegisteredSection(props: { user: User }) {
    return (
        <>
            <Row className="mt-5">
                <h3>Utente registrato</h3>
            </Row>

            <Row>
                <Col>
                    L'utente si è registrato {dayjs(props.user.registrationDate).format("dddd LL [alle] LT")}.
                </Col>
            </Row>
            <Row className="mt-3">
                <Col/>
                <Col sm={8} className="d-flex justify-content-center">
                    <GlossyButton icon={Key} onClick={() => {
                    }}>Resetta password (non disponibile)</GlossyButton>
                </Col>
                <Col/>
            </Row>
        </>
    );
}

function NoRegistrationSection(props: { user: User }) {
    const registrationLink = `${publicUrl}signup/${props.user.registrationToken}`;
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(registrationLink);
        setCopied(true);
    }

    return (
        <>
            <Row className="mt-4">
                <h3>Registrazione dell'utente</h3>
                <p>Invia questo link all'utente per completare la procedura di registrazione.</p>
                <p>Il link scade 7 giorni dopo la generazione:
                    questo link scadrà {dayjs(props.user.tokenExpiryDate).format("dddd LL [alle] LT")}.</p>
            </Row>

            <Row>
                <InputGroup className="mt-2">
                    <InputGroup.Text><Link45deg/></InputGroup.Text>
                    <FloatingLabel controlId="floatingInput" label="Link di registrazione">
                        <Form.Control type="text"
                                      placeholder="Link di registrazione"
                                      value={registrationLink}
                                      disabled/>
                    </FloatingLabel>
                    <LightGlossyButton icon={copied ? Check2 : (Copy as Icon)} className="input-group-button"
                                       onClick={handleCopy}>
                        {copied ? "Link copiato" : "Copia link"}
                    </LightGlossyButton>
                </InputGroup>
            </Row>
        </>
    );
}

export default UsersListPage;