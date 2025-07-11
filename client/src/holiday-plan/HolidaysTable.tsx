import React, {createElement, useEffect, useState} from "react";
import {Col, Modal, Row, Table} from "react-bootstrap";
import {CalendarEvent, Check2Circle, Clock, Person, QuestionDiamond, XCircle} from "react-bootstrap-icons";
import WorkedHoursDailyTableCell from "../workedHours/workedHoursTable/WorkedHoursDailyTableCell";
import GlossyButton from "../buttons/GlossyButton";
import Loading from "../Loading";
import {Role, Type, User} from "../models/user";
import {DailyExpense} from "../models/dailyExpense";
import workdayClassName from "../workedHours/workedHoursFunctions";
import dailyExpenseApis from "../api/dailyExpensesApis";
import userApis from "../api/userApis";
import {compareUsers} from "../functions";
import dayjs from "dayjs";
import "../components/DoubleMonthViewTable.css";

interface HolidaysTableProps {
    readonly user: User
    readonly month: number
    readonly year: number
    readonly setSavingStatus: React.Dispatch<React.SetStateAction<"" | "saving" | "saved">>
}

function HolidaysTable(props: HolidaysTableProps) {
    const daysInMonth = dayjs(`${props.year}-${props.month}-01`).daysInMonth();
    let workdays: dayjs.Dayjs[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        workdays.push(dayjs(`${props.year}-${props.month}-${i}`));
    }

    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
    const [loadingDailyExpenses, setLoadingDailyExpenses] = useState(true);
    const loading = loadingUsers || loadingDailyExpenses;
    const [showModal, setShowModal] = useState(false);
    const [editingDailyExpense, setEditingDailyExpense] = useState<DailyExpense>();
    const editingDailyExpenseUser = users.find(u => u.id === editingDailyExpense?.userId);
    let editingDailyExpenseStatus = "";
    let editingDailyExpenseStatusIcon = QuestionDiamond;
    if (editingDailyExpense) {
        if (editingDailyExpense?.holidayApproved === null) {
            editingDailyExpenseStatus = "Da approvare";
        } else if (editingDailyExpense.holidayApproved) {
            editingDailyExpenseStatus = "Approvate";
            editingDailyExpenseStatusIcon = Check2Circle;
        } else {
            editingDailyExpenseStatus = "Rifiutate";
            editingDailyExpenseStatusIcon = XCircle;
        }
    }

    useEffect(() => {
        userApis.getAllUsers()
            .then(users => {
                setUsers(users);
                setLoadingUsers(false);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        setLoadingDailyExpenses(true);

        dailyExpenseApis.getAllDailyExpenses(`${props.year}-${props.month}`)
            .then(dailyExpenses => {
                setDailyExpenses(dailyExpenses!);
                setLoadingDailyExpenses(false);
            })
            .catch(err => console.error(err))
    }, [props.month, props.year]);

    function openModal(dailyExpense?: DailyExpense) {
        if (dailyExpense && dailyExpense.holidayHours !== 0 && props.user.role !== Role.user) {
            setEditingDailyExpense(dailyExpense);
            setShowModal(true);
        }
    }

    function closeModal() {
        setEditingDailyExpense(undefined);
        setShowModal(false);
    }

    function setDailyExpenseStatus(newHolidayApproved: boolean | null) {
        props.setSavingStatus("saving");
        editingDailyExpense!.holidayApproved = newHolidayApproved;
        dailyExpenseApis.createOrUpdateDailyExpense(editingDailyExpense!)
            .then(() => {
                const index = dailyExpenses.findIndex(dailyExpense =>
                    dailyExpense.userId === editingDailyExpense!.userId && dailyExpense.date === editingDailyExpense!.date);
                const newDailyExpenses = [...dailyExpenses];
                newDailyExpenses[index] = editingDailyExpense!;
                setDailyExpenses(newDailyExpenses);
                props.setSavingStatus("saved");
                closeModal();
            })
            .catch(err => {
                props.setSavingStatus("");
                console.error(err);
            });
    }

    function createOrUpdateLocalDailyExpense(newDailyExpense: DailyExpense) {
        setDailyExpenses(dailyExpenses => {
            const newDailyExpenses = dailyExpenses ? Array(...dailyExpenses) : [];

            const existingDailyExpenseIndex = dailyExpenses?.findIndex(dailyExpense =>
                dailyExpense.date === newDailyExpense.date
            ) ?? -1;

            if (existingDailyExpenseIndex !== -1) {
                if (newDailyExpense.isEmpty()) {    // delete
                    newDailyExpenses.splice(existingDailyExpenseIndex, 1);
                } else {                            // update
                    newDailyExpenses[existingDailyExpenseIndex] = newDailyExpense;
                }
            } else {                                // create
                newDailyExpenses.push(newDailyExpense);
            }

            return newDailyExpenses;
        })
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <Row className="mt-2">
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Approva ore ferie</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="d-flex align-items-center">
                        <Col sm={4}
                             className="glossy-background smaller d-flex justify-content-center align-items-center">
                            <Person className="me-1"/> Utente
                        </Col>
                        <Col>{editingDailyExpenseUser?.surname} {editingDailyExpenseUser?.name}</Col>
                    </Row>
                    <Row className="d-flex align-items-center">
                        <Col sm={4}
                             className="glossy-background smaller d-flex justify-content-center align-items-center">
                            <CalendarEvent className="me-1"/> Data
                        </Col>
                        <Col>{dayjs(editingDailyExpense?.date).format("dddd D MMMM YYYY")}</Col>
                    </Row>
                    <Row className="d-flex align-items-center">
                        <Col sm={4}
                             className="glossy-background smaller d-flex justify-content-center align-items-center">
                            <Clock className="me-1"/> Ore richieste
                        </Col>
                        <Col>{editingDailyExpense?.holidayHours}</Col>
                    </Row>
                    <Row className="d-flex align-items-center">
                        <Col sm={4}
                             className="glossy-background smaller d-flex justify-content-center align-items-center">
                            {createElement(editingDailyExpenseStatusIcon, {className: "me-1"})} Stato
                        </Col>
                        <Col>{editingDailyExpenseStatus}</Col>
                    </Row>

                    <Row>
                        <Col className="d-flex flex-column justify-content-center">
                            {editingDailyExpense?.holidayApproved !== null &&
                                <GlossyButton icon={QuestionDiamond} className="mt-3"
                                              onClick={() => setDailyExpenseStatus(null)}>
                                    Segna come da approvare
                                </GlossyButton>}
                            {editingDailyExpense?.holidayApproved !== true &&
                                <GlossyButton icon={Check2Circle} className="mt-3"
                                              onClick={() => setDailyExpenseStatus(true)}>
                                    Approva
                                </GlossyButton>}
                            {editingDailyExpense?.holidayApproved !== false &&
                                <GlossyButton icon={XCircle} className="mt-3"
                                              onClick={() => setDailyExpenseStatus(false)}>
                                    Rifiuta
                                </GlossyButton>}
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <Table responsive className="worked-hours-table company-worked-hours-table double-month-view-table">
                <thead>
                <tr>
                    <th className="left-aligned">Collaboratore</th>
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
                                                    const dailyExpense = dailyExpenses.find(dailyExpense =>
                                                        dailyExpense.userId === user.id && dailyExpense.date === workday.format("YYYY-MM-DD"));

                                                    let className = workdayClassName(workday, true);
                                                    if (dailyExpense && dailyExpense.holidayHours !== 0) {
                                                        if (dailyExpense.holidayApproved === null) {
                                                            className = "holiday-hours-pending";
                                                        } else if (dailyExpense.holidayApproved) {
                                                            className = "holiday-hours-approved";
                                                        } else {
                                                            className = "holiday-hours-rejected";
                                                        }
                                                    }
                                                    if (user.id !== props.user.id &&
                                                        (!dailyExpense || dailyExpense.holidayHours === 0 || props.user.role === Role.user)) {
                                                        className += " unhoverable";
                                                    }
                                                    className += ` ${type}-user`;

                                                    if (user.id === props.user.id &&
                                                        (!dailyExpense || dailyExpense.holidayHours === 0) ||
                                                        props.user.role === Role.user && user.id === props.user.id &&
                                                        dailyExpense && dailyExpense.holidayHours !== 0
                                                    ) {
                                                        return (
                                                            <WorkedHoursDailyTableCell key={workday.format()}
                                                                                       workday={workday}
                                                                                       className={className}
                                                                                       dailyExpense={dailyExpense}
                                                                                       field="holidayHours"
                                                                                       selectedUser={props.user}
                                                                                       setSavingStatus={props.setSavingStatus}
                                                                                       createOrUpdateLocalDailyExpense={createOrUpdateLocalDailyExpense}/>
                                                        )
                                                    }

                                                    // show other people's holiday hours to users (admins already covered
                                                    // by previous return statement) or show other absence hours
                                                    // to administrators
                                                    let dataToShow = "";
                                                    let titleToShow = "";
                                                    if (dailyExpense) {
                                                        if (dailyExpense.holidayHours > 0) {
                                                            dataToShow = dailyExpense.holidayHours.toString();
                                                            titleToShow = `${dailyExpense.holidayHours} ore di ferie`;
                                                        } else if (props.user.role !== Role.user) {
                                                            // only show absence hours to administrators
                                                            // users can only see others' holiday hours
                                                            if (dailyExpense.sickHours > 0) {
                                                                dataToShow = dailyExpense.sickHours.toString();
                                                                titleToShow = `${dailyExpense.sickHours} ore di malattia`;
                                                            } else if (dailyExpense.donationHours > 0) {
                                                                dataToShow = dailyExpense.donationHours.toString();
                                                                titleToShow = `${dailyExpense.donationHours} ore di donazione`;
                                                            } else if (dailyExpense.furloughHours > 0) {
                                                                dataToShow = dailyExpense.furloughHours.toString();
                                                                titleToShow = `${dailyExpense.furloughHours} ore di cassa integrazione`;
                                                            } else if (dailyExpense.bereavementHours > 0) {
                                                                dataToShow = dailyExpense.bereavementHours.toString();
                                                                titleToShow = `${dailyExpense.bereavementHours} ore di lutto`;
                                                            } else if (dailyExpense.paternityHours > 0) {
                                                                dataToShow = dailyExpense.paternityHours.toString();
                                                                titleToShow = `${dailyExpense.paternityHours} ore di paternità/maternità`;
                                                            }
                                                        }
                                                    }

                                                    return (
                                                        <td key={workday.format()}
                                                            onClick={() => openModal(dailyExpense)}
                                                            title={titleToShow}
                                                            className={className}>
                                                            {dataToShow}
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

export default HolidaysTable;