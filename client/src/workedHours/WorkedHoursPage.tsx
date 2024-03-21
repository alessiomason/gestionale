import React, {useEffect, useState} from "react";
import {Col, FloatingLabel, Form, InputGroup, Row} from "react-bootstrap";
import dayjs from "dayjs";
import {upperCaseFirst} from "../functions";
import {
    ArrowLeftSquare,
    ArrowRightSquare,
    CalendarEvent,
    CalendarRange,
    CalendarX,
    Check2Circle,
    ExclamationCircle,
    ThreeDots
} from "react-bootstrap-icons";
import TextButton from "../buttons/TextButton";
import WorkedHoursTable from "./WorkedHoursTable";
import {Type, User} from "../models/user";
import WorkedHoursSelectUser from "./WorkedHoursSelectUser";

interface WorkedHoursPageProps {
    readonly user: User
}

function WorkedHoursPage(props: WorkedHoursPageProps) {
    const currentMonth = parseInt(dayjs().format("M"));
    const currentYear = parseInt(dayjs().format("YYYY"));
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [selectingMonth, setSelectingMonth] = useState(false);
    const [selectedUser, setSelectedUser] = useState(props.user);
    const [savingStatus, setSavingStatus] = useState<"" | "saving" | "saved">("");

    useEffect(() => {
        // clear savingStatus after 3 seconds
        if (savingStatus === "saved") {
            setTimeout(() => setSavingStatus(""), 3000);
        }
    }, [savingStatus]);

    function decreaseMonth() {
        if (month === 1) {
            setMonth(12);
            setYear(selectedYear => selectedYear - 1);
        } else {
            setMonth(selectedMonth => selectedMonth - 1);
        }
    }

    function increaseMonth() {
        if (month === 12) {
            setMonth(1);
            setYear(selectedYear => selectedYear + 1);
        } else {
            setMonth(selectedMonth => selectedMonth + 1);
        }
    }

    return (
        <>
            <Row>
                <h1 className="page-title">Ore</h1>
            </Row>

            <Row className="glossy-background">
                <Row className="mb-3">
                    <Col>
                        <WorkedHoursSelectUser user={props.user} selectedUser={selectedUser}
                                               setSelectedUser={setSelectedUser}/>
                    </Col>

                    <Col className="d-flex flex-column justify-content-center">
                        {selectingMonth ?
                            <MonthSelector month={month} setMonth={setMonth} year={year} setYear={setYear}/> :
                            <h3 className="text-center mb-0">
                                {upperCaseFirst(dayjs(`${year}-${month}-01`).format("MMMM YYYY"))}
                            </h3>
                        }
                    </Col>

                    <Col/>
                </Row>

                <Row>
                    <Col>
                        {selectedUser.id !== props.user.id && <p className="warning d-flex align-items-center">
                            <ExclamationCircle className="mx-1"/>
                            Attenzione! Stai modificando le ore di
                            {selectedUser.type === Type.machine ? " una macchina" : " un altro utente"}, non le tue!
                        </p>}
                    </Col>

                    <Col>
                        {/* this forces the whole Row to always the same height, so that it does not change every time savingStatus is empty */}
                        {savingStatus === "" && <p>&nbsp;</p>}

                        {savingStatus !== "" && <p className="success d-flex justify-content-end align-items-center">
                            {savingStatus === "saving" ?
                                <><ThreeDots className="mx-1"/>Salvataggio in corso...</> :
                                <><Check2Circle className="mx-1"/>Salvato</>}
                        </p>}
                    </Col>
                </Row>

                <Row>
                    <Col className="d-flex justify-content-between align-items-center">
                        <ArrowLeftSquare className="hoverable" onClick={decreaseMonth}/>

                        <div className="d-flex">
                            <TextButton icon={selectingMonth ? CalendarX : CalendarRange}
                                        onClick={() => setSelectingMonth(prevState => !prevState)}>
                                {selectingMonth ? "Chiudi" : "Seleziona un mese"}
                            </TextButton>
                            <TextButton icon={CalendarEvent} onClick={() => {
                                setMonth(currentMonth);
                                setYear(currentYear);
                            }}>
                                Oggi
                            </TextButton>
                        </div>

                        <ArrowRightSquare className="hoverable" onClick={increaseMonth}/>
                    </Col>
                </Row>

                <Row className="mt-2">
                    <WorkedHoursTable user={props.user} selectedUser={selectedUser} month={month} year={year}
                                      setSavingStatus={setSavingStatus}/>
                </Row>
            </Row>
        </>
    );
}

interface MonthSelectorProps {
    readonly month: number
    readonly setMonth: React.Dispatch<React.SetStateAction<number>>
    readonly year: number
    readonly setYear: React.Dispatch<React.SetStateAction<number>>
}

function MonthSelector(props: MonthSelectorProps) {
    const currentYear = parseInt(dayjs().format("YYYY"));
    let years: number[] = [];
    for (let i = currentYear; i >= 2019; i--) {     // show data up to 2019
        years.push(i);
    }

    return (
        <Row>
            <Col>
                <InputGroup>
                    <FloatingLabel controlId="floatingInput" label="Mese">
                        <Form.Select value={props.month}
                                     onChange={ev => props.setMonth(parseInt(ev.target.value))}>
                            {[...Array(12)].map((_, i) => {
                                return (
                                    <option key={`month-${i + 1}`} value={i + 1}>
                                        {dayjs(`${props.year}-${i + 1}-01`).format("MMMM")}
                                    </option>
                                );
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </InputGroup>
            </Col>

            <Col>
                <InputGroup>
                    <FloatingLabel controlId="floatingInput" label="Anno">
                        <Form.Select value={props.year}
                                     onChange={ev => props.setYear(parseInt(ev.target.value))}>
                            {years.map(year => {
                                return (
                                    <option key={`year-${year}`} value={year}>{year}</option>
                                );
                            })}
                        </Form.Select>
                    </FloatingLabel>
                </InputGroup>
            </Col>
        </Row>
    );
}

export default WorkedHoursPage;