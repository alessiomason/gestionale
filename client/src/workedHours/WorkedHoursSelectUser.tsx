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
    const [machines, setMachines] = useState<User[]>([]);

    useEffect(() => {
        userApis.getAllMachineUsers()
            .then(machines => {
                setMachines(machines);
            })
            .catch(err => console.error(err))
    }, []);

    function selectUser(event: React.ChangeEvent<HTMLSelectElement>) {
        const id = parseInt(event.target.value);

        if (id === props.user.id) {
            props.setSelectedUser(props.user);
        } else {
            const machine = machines.find(machine => machine.id === id);
            if (machine) props.setSelectedUser(machine);
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
                                value={props.user.id}>{`${props.user.name} ${props.user.surname}`}</option>
                        {machines.map(machine => {
                            return (
                                <option key={machine.id}
                                        value={machine.id}>{`${machine.name} ${machine.surname}`}</option>
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