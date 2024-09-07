import React, {useEffect, useState} from "react";
import {Col, Modal, Row, Table} from "react-bootstrap";
import {CalendarEvent, Floppy, JournalBookmarkFill, Person, Trash} from "react-bootstrap-icons";
import GlossyButton from "../buttons/GlossyButton";
import WorkedHoursNewJobModal from "../workedHours/WorkedHoursNewJobModal";
import {Role, Type, User} from "../models/user";
import {Job} from "../models/job";
import {PlannedDay} from "../models/plannedDay";
import userApis from "../api/userApis";
import plannedDayApis from "../api/plannedDayApis";
import workdayClassName from "../workedHours/workedHoursFunctions";
import {compareUsers} from "../functions";
import dayjs, {Dayjs} from "dayjs";
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
    const [plannedDays, setPlannedDays] = useState<PlannedDay[]>([]);
    const [showPlannedDayModal, setShowPlannedDayModal] = useState(false);
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [modalUser, setModalUser] = useState<User | undefined>(undefined);
    const [modalWorkday, setModalWorkday] = useState<Dayjs | undefined>(undefined);
    const [modalJob, setModalJob] = useState<Job | undefined>(undefined);

    useEffect(() => {
        userApis.getAllUsers()
            .then(users => setUsers(users))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        plannedDayApis.getAllPlannedDays(`${props.year}-${props.month}`)
            .then(plannedDays => setPlannedDays(plannedDays!))
            .catch(err => console.error(err));
    }, [props.month, props.year]);

    function handleDayClick(user: User, workday: Dayjs, job: Job | undefined) {
        if (user.id === props.user.id || props.user.role !== Role.user) {
            setModalUser(user);
            setModalWorkday(workday);
            setModalJob(job);
            setShowPlannedDayModal(true);
        }
    }

    function closePlannedDayModal() {
        setShowPlannedDayModal(false);
        setModalUser(undefined);
        setModalWorkday(undefined);
        setModalJob(undefined);
    }

    function handleModalSubmit() {
        if (!modalUser || !modalWorkday || !modalJob) {
            closePlannedDayModal();
            return
        }

        props.setSavingStatus("saving");
        const newPlannedDay = new PlannedDay(modalUser, modalWorkday?.format("YYYY-MM-DD"), modalJob);

        plannedDayApis.createOrUpdatePlannedDay(newPlannedDay)
            .then(_ => {
                setPlannedDays(plannedDays => {
                    const oldPlannedDayIndex = plannedDays.findIndex(plannedDay =>
                        plannedDay.user.id === newPlannedDay.user.id && plannedDay.date === newPlannedDay.date);

                    if (oldPlannedDayIndex === -1) {
                        plannedDays.push(newPlannedDay);
                    } else {    // update
                        plannedDays[oldPlannedDayIndex] = newPlannedDay;
                    }

                    return plannedDays;
                })

                props.setSavingStatus("saved");
                closePlannedDayModal();
            })
            .catch(err => {
                props.setSavingStatus("");
                console.error(err);
            });
    }

    function handleModalDelete() {
        if (!modalUser || !modalWorkday || !modalJob) {
            closePlannedDayModal();
            return
        }

        props.setSavingStatus("saved");
        const deletingPlannedDay = new PlannedDay(modalUser, modalWorkday.format("YYYY-MM-DD"), modalJob);

        plannedDayApis.deletePlannedDay(deletingPlannedDay)
            .then(_ => {
                setPlannedDays(plannedDays => {
                    const deletingPlannedDayIndex = plannedDays.findIndex(plannedDay =>
                        plannedDay.user.id === deletingPlannedDay.user.id && plannedDay.date === deletingPlannedDay.date);

                    plannedDays.splice(deletingPlannedDayIndex, 1);
                    return plannedDays;
                })

                props.setSavingStatus("saved");
                closePlannedDayModal();
            })
            .catch(err => {
                props.setSavingStatus("");
                console.error(err);
            });
    }

    return (
        <Row className="mt-2">
            <Modal size="lg" show={showPlannedDayModal} onHide={closePlannedDayModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Pianifica giornata lavorativa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="d-flex align-items-center">
                        <Col sm={4}>
                            <div
                                className="glossy-background smaller d-flex justify-content-center align-items-center mx-0">
                                <Person className="me-1"/> Dipendente
                            </div>
                        </Col>
                        <Col>{modalUser?.name} {modalUser?.surname}</Col>
                    </Row>
                    <Row className="d-flex align-items-center">
                        <Col sm={4}>
                            <div
                                className="glossy-background smaller d-flex justify-content-center align-items-center mx-0">
                                <CalendarEvent className="me-2"/> Giorno
                            </div>
                        </Col>
                        <Col>{modalWorkday?.format("DD/MM/YYYY")}</Col>
                    </Row>

                    <Row className="mt-3">
                        <Col sm={4} className="d-flex align-items-center">
                            <GlossyButton icon={JournalBookmarkFill} onClick={() => setShowNewJobModal(true)}>
                                Seleziona commessa</GlossyButton>
                            <WorkedHoursNewJobModal show={showNewJobModal} setShow={setShowNewJobModal}
                                                    selectJob={job => setModalJob(job)}/>
                        </Col>
                        <Col className={modalJob ? "" : "d-flex align-items-center"}>
                            {modalJob ? <>
                                    <p className="m-0"><strong>{modalJob.id}</strong></p>
                                    <p className="m-0"><i>{modalJob.client}</i></p>
                                    {modalJob.finalClient && <p className="m-0"><i>{modalJob.finalClient}</i></p>}
                                    <p className="m-0">{modalJob.subject}</p>
                                </> :
                                <p className="m-0">Nessuna commessa selezionata</p>}
                        </Col>
                    </Row>

                    <Row>
                        <Col className="d-flex justify-content-center mt-4">
                            <GlossyButton icon={Trash} className="me-4"
                                          onClick={handleModalDelete}>Elimina</GlossyButton>
                            <GlossyButton icon={Floppy} className="ms-4"
                                          onClick={handleModalSubmit}>Conferma</GlossyButton>
                        </Col>
                    </Row>
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
                                                    const plannedDay = plannedDays.find(plannedDay =>
                                                        plannedDay.user.id === user.id && plannedDay.date === workday.format("YYYY-MM-DD"));

                                                    return (
                                                        <td key={`${user.id}-${workday.format()}`}
                                                            className={`${workdayClassName(workday, props.user.role !== Role.user || props.user.id == user.id)} ${type}-user`}
                                                            onClick={() => handleDayClick(user, workday, plannedDay?.job)}>
                                                            {plannedDay?.job.client.substring(0, 2).toUpperCase() ?? ""}
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