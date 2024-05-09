import React, {useEffect, useState} from "react";
import {Col, Row, Table} from "react-bootstrap";
import {CheckCircle, PersonAdd, XCircle} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import userApis from "../api/userApis";
import {User} from "../models/user";
import Loading from "../Loading";
import UserPane from "./UserPane";
import {compareUsers} from "../functions";
import "./UsersListPage.css";

interface UsersListPageProps {
    readonly user: User
    readonly setDirtyUser: React.Dispatch<React.SetStateAction<boolean>>
}

function UsersListPage(props: UsersListPageProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User>();
    const [showingNewUserPane, setShowingNewUserPane] = useState(false);

    function showNewUserPane() {
        setSelectedUser(undefined);
        setShowingNewUserPane(true);
    }

    function selectUser(user: User) {
        setSelectedUser(user);
        setShowingNewUserPane(false);
    }

    function selectNewlyCreatedUser(user: User) {
        setUsers(users => {
            users.push(user);
            return users;
        })
        selectUser(user);
    }

    function updateSelectedUser(user: User) {
        setUsers(users => {
            const index = users.findIndex(u => u.id === user.id);

            if (index === -1) {     // not found, won't happen
                users.push(user);
            } else {
                users[index] = user;
            }

            return [...users];
        });
        selectUser(user);
    }

    useEffect(() => {
        userApis.getAllUsers()
            .then(users => {
                setUsers(users);
                setLoading(false);
            })
            .catch(err => console.error(err))
    }, []);

    return (
        <>
            <Row>
                <h1 className="page-title">Gestione utenti</h1>
            </Row>

            <Row>
                <Col md={4}>
                    <GlossyButton icon={PersonAdd} onClick={showNewUserPane} className="new-user-button">
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
                    {(showingNewUserPane || selectedUser) &&
                        <UserPane selectedUser={selectedUser} user={props.user} setDirtyUser={props.setDirtyUser}
                        afterSubmit={showingNewUserPane ? selectNewlyCreatedUser : updateSelectedUser}/>}
                </Col>
            </Row>
        </>
    );
}

export default UsersListPage;