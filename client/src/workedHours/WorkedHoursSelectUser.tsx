import {useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {FloatingLabel, Form, InputGroup} from "react-bootstrap";
import {PersonFill} from "react-bootstrap-icons";
import {Role, Type, User} from "../models/user";
import userApis from "../api/userApis";
import {compareUsers} from "../functions";

interface WorkedHoursSelectUserProps {
    readonly user: User
    readonly selectedUser: User
    readonly setSelectedUser: React.Dispatch<React.SetStateAction<User>>
}

function WorkedHoursSelectUser(props: WorkedHoursSelectUserProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (props.user.role !== Role.user) {
            userApis.getAllUsers()
                .then(users => setUsers(users))
                .catch(err => console.error(err))
        } else if (props.user.type === Type.mechanic) {
            userApis.getAllMachineUsers()
                .then(machines => setUsers(machines))
                .catch(err => console.error(err))
        }
    }, []);

    // after loading, select user from query parameters
    useEffect(() => {
        if (users.length) {
            const selectedUserId = parseInt(searchParams.get("u") ?? "-1");
            const selectedUser = users.find(user => user.id === selectedUserId);
            if (selectedUser) {
                props.setSelectedUser(selectedUser);
            }
        }
    }, [users.length, searchParams]);

    function setSearchUser(userId: number) {
        let newSearchParams: any = {};
        for (const [key, value] of searchParams.entries()) {
            newSearchParams[key] = value;
        }

        if (userId === props.user.id) {
            delete newSearchParams["u"];
        } else {
            newSearchParams["u"] = userId.toString();
        }

        setSearchParams(newSearchParams);
    }

    function selectUser(event: React.ChangeEvent<HTMLSelectElement>) {
        const id = parseInt(event.target.value);

        if (id === props.user.id) {
            props.setSelectedUser(props.user);
        } else {
            const user = users.find(user => user.id === id);
            if (user) {
                props.setSelectedUser(user);
            }
        }

        setSearchUser(id);
    }

    // only administrators or mechanic users can edit machines' hours
    if (props.user.role !== Role.user || props.user.type === Type.mechanic) {
        return (
            <InputGroup>
                <InputGroup.Text><PersonFill/></InputGroup.Text>
                <FloatingLabel controlId="floatingInput" label="Utente">
                    <Form.Select value={props.selectedUser.id} onChange={selectUser}>
                        <option key={props.user.id}
                                value={props.user.id}>{`${props.user.surname} ${props.user.name}`}</option>
                        {users
                            .filter(user => user.id !== props.user.id && user.active)
                            .sort(compareUsers)
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