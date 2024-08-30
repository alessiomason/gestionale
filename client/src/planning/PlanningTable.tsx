import React, {useEffect, useState} from "react";
import {Modal, Row, Table} from "react-bootstrap";
import {Role, Type, User} from "../models/user";
import workdayClassName from "../workedHours/workedHoursFunctions";
import userApis from "../api/userApis";
import {compareUsers} from "../functions";
import dayjs from "dayjs";
import "../components/DoubleMonthViewTable.css";

interface PlanningTableProps {
    readonly user: User
    readonly month: number
    readonly year: number
    readonly setSavingStatus: React.Dispatch<React.SetStateAction<"" | "saving" | "saved">>
}

function PlanningTable(props: PlanningTableProps) {
    const daysInMonth = dayjs(`${props.year}-${props.month}-01`).daysInMonth();
    let workdays: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        workdays.push(dayjs(`${props.year}-${props.month}-${i}`));
    }

    const [users, setUsers] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        userApis.getAllUsers()
            .then(users => setUsers(users))
            .catch(err => console.error(err));
    }, []);

    function closeModal() {

    }

    return (
        <Row className="mt-2">
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Approva ore ferie</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                </Modal.Body>
            </Modal>

            <Table responsive className="worked-hours-table company-worked-hours-table double-month-view-table">
                <thead>
                <tr>
                    <th className="left-aligned">Dipendente</th>
                    {workdays.map(workday => {
                        return (
                            <th key={workday.format()} className={workdayClassName(workday, false)}>
                                {workday.format("dd")}<br/>
                                {workday.format("D")}
                            </th>
                        );
                    })}
                </tr>
                </thead>
                <tbody>
                {User.allTypes
                    .filter(type => type !== Type.machine)
                    .map(type => {
                        return (
                            <>
                                <tr key={type} className="unhoverable">
                                    <td/>
                                    <td colSpan={daysInMonth} className={`${type}-user`}>{User.typeName(type)}</td>
                                </tr>

                                {users
                                    .filter(user => user.type === type && user.active && user.role !== Role.dev)
                                    .sort(compareUsers)
                                    .map(user => {
                                        return (
                                            <tr key={user.id}>
                                                <td className={`${type}-user unhoverable`}>{user.surname} {user.name}</td>
                                                {workdays.map(workday => {
                                                    //if (user.id === props.user.id) { }

                                                    return (
                                                        <td key={workday.format()}>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}

                                <tr className="unhoverable">
                                    <td colSpan={daysInMonth + 1}/>
                                </tr>
                            </>
                        );
                    })}
                </tbody>
            </Table>
        </Row>
    );
}

export default PlanningTable;