import {FloatingLabel, Form, InputGroup} from "react-bootstrap";
import {PersonFill} from "react-bootstrap-icons";
import React, {useEffect, useState} from "react";
import {Role, Type, User} from "../models/user";
import userApis from "../api/userApis";

interface WorkedHoursSelectUserProps {
    readonly user: User
    readonly selectedUser: User
    readonly setSelectedUser: React.Dispatch<React.SetStateAction<User>>
}

function WorkedHoursSelectUser(props: WorkedHoursSelectUserProps) {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (props.user.role !== Role.user) {
            userApis.getAllUsers()
                .then(users => {
                    setUsers(users);
                })
                .catch(err => console.error(err))
        } else if (props.user.type === Type.workshop) {
            userApis.getAllMachineUsers()
                .then(machines => {
                    setUsers(machines);
                })
                .catch(err => console.error(err))
        }
    }, []);

    function selectUser(event: React.ChangeEvent<HTMLSelectElement>) {
        const id = parseInt(event.target.value);

        if (id === props.user.id) {
            props.setSelectedUser(props.user);
        } else {
            const user = users.find(machine => machine.id === id);
            if (user) props.setSelectedUser(user);
        }
    }

    // only administrators or workshop users can edit machines' hours
    if (props.user.role !== Role.user || props.user.type === Type.workshop) {
        return (
            <InputGroup>
                <InputGroup.Text><PersonFill/></InputGroup.Text>
                <FloatingLabel controlId="floatingInput" label="Utente">
                    <Form.Select value={props.selectedUser.id} onChange={selectUser}>
                        <option key={props.user.id}
                                value={props.user.id}>{`${props.user.surname} ${props.user.name}`}</option>
                        {users
                            .filter(user => user.id !== props.user.id && user.active)
                            .sort((a, b) => {
                                if (a.type === Type.machine && b.type !== Type.machine) return 1;
                                if (a.type !== Type.machine && b.type === Type.machine) return -1;

                                const aFullName = `${a.surname} ${a.name}`;
                                const bFullName = `${b.surname} ${b.name}`;
                                return aFullName.localeCompare(bFullName);
                            })
                            .map(user => {
                            return (
                                <option key={user.id}
                                        value={user.id}>{`${user.surname} ${user.name}`}</option>
                            );
                        })}
                    </Form.Select>
                </FloatingLabel>
            </InputGroup>
        );
    } else return (
        <></>
    );
}

export default WorkedHoursSelectUser;