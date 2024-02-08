import React, {useEffect, useState} from "react";
import {User} from "../models/user";
import userApis from "../api/userApis";
import {Button, Col, FloatingLabel, Form, InputGroup, Row, Table} from "react-bootstrap";
import {
    CarFront,
    CheckCircle,
    Clock,
    Coin,
    EnvelopeAt,
    Person,
    PersonBadge,
    PersonVcard,
    Telephone,
    XCircle
} from "react-bootstrap-icons";
import SwitchToggle from "./SwitchToggle";

function UsersListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User>();

    const [active, setActive] = useState(false);
    const [role, setRole] = useState("");
    const [type, setType] = useState("");
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
    }, []);

    function selectUser(user: User) {
        setSelectedUser(user);

        setActive(user.active);
        setRole(user.role.toString());
        setType(user.type.toString());
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
        setCar(user.car ?? "");
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Gestione utenti</h1>
            </Row>

            <Row>
                <Col md={4}>
                    <Row className="glossy-background">
                        <Table hover responsive>
                            <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Cognome</th>
                                <th>Tipo</th>
                                <th>Mansione</th>
                                <th>Attivo</th>
                            </tr>
                            </thead>

                            <tbody>
                            {users.map(user => {
                                return (
                                    <tr key={user.id} onClick={() => selectUser(user)}>
                                        <td>{user.name}</td>
                                        <td>{user.surname}</td>
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
                    {selectedUser !== undefined &&
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
                                                     onChange={ev => setRole(ev.target.value)}>
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
                                                     onChange={ev => setRole(ev.target.value)}>
                                            {User.allRoles.map(role => {
                                                return (
                                                    <option key={role.toString()}
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
                                    <FloatingLabel controlId="floatingInput" label="Costo all'ora">
                                        <Form.Control type="number" step={0.5} min={0} placeholder="Costo all'ora"
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
                                    <FloatingLabel controlId="floatingInput" label="Costo al chilometro">
                                        <Form.Control type="number" step={0.5} min={0} placeholder="Costo al chilometro"
                                                      value={costPerKm}
                                                      onChange={ev => setCostPerKm(parseFloat(ev.target.value))}/>
                                    </FloatingLabel>
                                </InputGroup>
                            </Row>
                            </Row>

                            <Row className="d-flex justify-content-center my-4">
                                <Col sm={4} className="d-flex justify-content-center">
                                    <Button type="submit" className="glossy-button">Salva</Button>
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