import React, {useEffect, useState} from "react";
import {MonthWorkItem} from "../../models/workItem";
import workItemApis from "../../api/workItemApis";
import {User} from "../../models/user";
import {Col, Row, Table} from "react-bootstrap";
import "./MonthlyWorkedHoursTables.css";
import {compareUsers} from "../../functions";
import GlossyButton from "../../buttons/GlossyButton";
import {FileEarmarkSpreadsheet} from "react-bootstrap-icons";
import {exportMonthlyWorkedHoursExcel} from "./exportMonthlyWorkedHoursExcel";

interface MonthlyWorkedHoursTablesProps {
    readonly month: number
    readonly year: number
}

function MonthlyWorkedHoursTables(props: MonthlyWorkedHoursTablesProps) {
    const [monthWorkItems, setMonthWorkItems] = useState<MonthWorkItem[]>([]);
    const users = monthWorkItems.map(monthWorkItem => monthWorkItem.user)
        .filter((user, index, users) =>
            users.map(u => u.id).indexOf(user.id) === index)    // distinct
        .sort(compareUsers);

    useEffect(() => {
        workItemApis.getAllWorkItems(`${props.year}-${props.month}`)
            .then(workItems => setMonthWorkItems(workItems))
            .catch(err => console.error(err))
    }, [props.month, props.year]);

    return (
        <>
            {users.map(user => {
                const userMonthWorkItems = monthWorkItems.filter(monthWorkItem =>
                    monthWorkItem.user.id === user.id);

                return (
                    <MonthWorkItemsTable key={`table-${user.id}`} workItemsUser={user} monthWorkItems={userMonthWorkItems}/>
                );
            })}

            <Row className="mt-5">
                <Col className="d-flex justify-content-center">
                    <GlossyButton
                        icon={FileEarmarkSpreadsheet}
                        onClick={() => exportMonthlyWorkedHoursExcel(props.month, props.year, monthWorkItems, users)}>
                        Esporta Excel
                    </GlossyButton>
                </Col>
            </Row>
        </>
    );
}

interface MonthWorkItemsTableProps {
    readonly workItemsUser: User
    readonly monthWorkItems: MonthWorkItem[]
}

function MonthWorkItemsTable(props: MonthWorkItemsTableProps) {
    let totalHours = 0;

    return (
        <>
            <h4 className="mt-5 mb-3">{props.workItemsUser.surname} {props.workItemsUser.name}</h4>
            <Table responsive className="month-work-items-table">
                <thead>
                <tr>
                    <th>Commessa</th>
                    <th>Descrizione</th>
                    <th>Ore mensili</th>
                </tr>
                </thead>
                <tbody>
                {props.monthWorkItems.map(monthWorkItem => {
                    totalHours += monthWorkItem.totalHours;

                    return (
                        <tr key={`user-${props.workItemsUser.id}-job-${monthWorkItem.job.id}`} className="unhoverable">
                            <td>{monthWorkItem.job.id}</td>
                            <td><i>{monthWorkItem.job.client}</i> - {monthWorkItem.job.subject}</td>
                            <td>{monthWorkItem.totalHours}</td>
                        </tr>
                    );
                })}
                <tr className="unhoverable">
                    <td><strong>Totale</strong></td>
                    <td/>
                    <td><strong>{totalHours}</strong></td>
                </tr>
                </tbody>
            </Table>
        </>
    );
}

export default MonthlyWorkedHoursTables;